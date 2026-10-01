export type Phrase = {
  german: string;
  spanish: string;
  blankWord: string;
  explanation: string;
  spanishAlt?: string[];
  germanAlt?: string[];
};

export type SeedExercise = {
  id: string;
  order: number;
  type:
    | "TRANSLATE_DE_ES"
    | "TRANSLATE_ES_DE"
    | "MULTIPLE_CHOICE"
    | "WORD_ORDER"
    | "FILL_BLANK"
    | "MATCH_PAIRS";
  prompt: string;
  data: Record<string, unknown>;
  answer: Record<string, unknown>;
  explanation: string;
};

export type SeedLesson = {
  id: string;
  order: number;
  title: string;
  description: string;
  xpReward: number;
  exercises: SeedExercise[];
};

type LessonDraft = Omit<SeedLesson, "exercises"> & { phrases: Phrase[] };

function hashSeed(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    let value = (state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(values: readonly T[], random: () => number): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}

function uniqueAnswers(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLocaleLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function lowercaseFirst(value: string): string {
  return `${value.charAt(0).toLocaleLowerCase()}${value.slice(1)}`;
}

function normalizedWord(value: string): string {
  return value.replace(/^[.,!?;:¿¡]+|[.,!?;:¿¡]+$/g, "").toLocaleLowerCase();
}

function inferredSpanishAlternative(phrase: Phrase): string[] {
  const explicitSubject = phrase.spanish.match(/^(yo|tú|él|ella|nosotros|nosotras|ellos|ellas)\s+/i);
  if (explicitSubject) {
    return [lowercaseFirst(phrase.spanish.slice(explicitSubject[0].length))];
  }

  if (/^Ich\b/.test(phrase.german)) {
    if (/^Me gusta(n)?\b/i.test(phrase.spanish)) {
      return [`A mí ${lowercaseFirst(phrase.spanish)}`];
    }
    return [`Yo ${lowercaseFirst(phrase.spanish)}`];
  }

  if (/^Wir\b/.test(phrase.german)) {
    return [`Nosotros ${lowercaseFirst(phrase.spanish)}`];
  }

  if (/^Er\b/.test(phrase.german)) {
    return [`Él ${lowercaseFirst(phrase.spanish)}`];
  }

  if (/^Sie (ist|hat|kommt|nimmt|liest|fährt|sieht|trägt|tanzt|spielt|spricht|schläft|arbeitet|besucht|lernt|macht|geht|wohnt|mag|frühstückt)\b/.test(phrase.german)) {
    return [`Ella ${lowercaseFirst(phrase.spanish)}`];
  }

  return [];
}

function acceptedSpanish(phrase: Phrase): string[] {
  return uniqueAnswers([phrase.spanish, ...(phrase.spanishAlt ?? []), ...inferredSpanishAlternative(phrase)]);
}

function acceptedGerman(phrase: Phrase): string[] {
  return uniqueAnswers([phrase.german, ...(phrase.germanAlt ?? [])]);
}

function seededDerangement<T>(values: readonly T[], exerciseId: string): T[] {
  const random = mulberry32(hashSeed(exerciseId));
  const indexed = values.map((value, index) => ({ value, index }));
  let shuffled = seededShuffle(indexed, random);
  while (shuffled.some((item, index) => item.index === index)) {
    shuffled = seededShuffle(indexed, random);
  }
  return shuffled.map(({ value }) => value);
}

export function createExercises(lessonId: string, phrases: Phrase[]): SeedExercise[] {
  const [first, second, multipleChoice, wordOrder, fill, matchThird] = phrases;
  const wordOrderId = `${lessonId}-e4`;
  const wordOrderRandom = mulberry32(hashSeed(wordOrderId));
  const answerTiles = wordOrder.german.split(" ");
  const answerWords = new Set(answerTiles.map(normalizedWord));
  const distractorPool = uniqueAnswers(
    phrases
      .filter((phrase) => phrase !== wordOrder)
      .flatMap((phrase) => phrase.german.split(/\s+/))
      .map((word) => word.replace(/^[.,!?;:]+|[.,!?;:]+$/g, ""))
      .filter((word) => word.length > 0 && !answerWords.has(normalizedWord(word))),
  );
  const distractorCount = Math.min(1 + Math.floor(wordOrderRandom() * 2), distractorPool.length);
  const distractors = seededShuffle(distractorPool, wordOrderRandom).slice(0, distractorCount);
  const wordOrderTiles = [...seededShuffle(answerTiles, wordOrderRandom), ...distractors];
  let shuffledTiles = seededShuffle(wordOrderTiles, wordOrderRandom);
  while (shuffledTiles.join(" ") === wordOrder.german) {
    shuffledTiles = seededShuffle(wordOrderTiles, wordOrderRandom);
  }

  const multipleChoicePhrases = seededShuffle(
    [first, second, multipleChoice],
    mulberry32(hashSeed(`${lessonId}-e3`)),
  );
  const fillRandom = mulberry32(hashSeed(`${lessonId}-e5`));
  const fillDistractors = uniqueAnswers(
    phrases.filter((phrase) => phrase !== fill).map((phrase) => phrase.blankWord),
  ).filter((word) => word.toLocaleLowerCase() !== fill.blankWord.toLocaleLowerCase());
  const fillOptions = seededShuffle(
    [fill.blankWord, ...seededShuffle(fillDistractors, fillRandom).slice(0, 2)],
    fillRandom,
  );
  const matchPhrases = [first, second, multipleChoice];
  const matchRight = seededDerangement(matchPhrases, `${lessonId}-e6`);

  return [
    {
      id: `${lessonId}-e1`,
      order: 1,
      type: "TRANSLATE_DE_ES",
      prompt: "¿Qué significa esta frase?",
      data: { sourceText: first.german },
      answer: { accepted: acceptedSpanish(first) },
      explanation: first.explanation,
    },
    {
      id: `${lessonId}-e2`,
      order: 2,
      type: "TRANSLATE_ES_DE",
      prompt: "Traduce al alemán.",
      data: { sourceText: second.spanish },
      answer: { accepted: acceptedGerman(second) },
      explanation: second.explanation,
    },
    {
      id: `${lessonId}-e3`,
      order: 3,
      type: "MULTIPLE_CHOICE",
      prompt: "Elige la traducción correcta.",
      data: { options: multipleChoicePhrases.map((phrase) => phrase.spanish) },
      answer: { correctIndex: multipleChoicePhrases.indexOf(multipleChoice) },
      explanation: multipleChoice.explanation,
    },
    {
      id: `${lessonId}-e4`,
      order: 4,
      type: "WORD_ORDER",
      prompt: "Ordena las palabras para formar la frase.",
      data: { tiles: shuffledTiles },
      answer: { accepted: [wordOrder.german] },
      explanation: wordOrder.explanation,
    },
    {
      id: `${lessonId}-e5`,
      order: 5,
      type: "FILL_BLANK",
      prompt: "Completa la frase en alemán.",
      data: {
        sentence: fill.german.replace(fill.blankWord, "___"),
        options: fillOptions,
      },
      answer: { accepted: [fill.blankWord] },
      explanation: fill.explanation,
    },
    {
      id: `${lessonId}-e6`,
      order: 6,
      type: "MATCH_PAIRS",
      prompt: "Une cada expresión alemana con su traducción.",
      data: {
        left: matchPhrases.map((phrase) => phrase.german),
        right: matchRight.map((phrase) => phrase.spanish),
      },
      answer: {
        pairs: [...matchPhrases].map((phrase) => [phrase.german, phrase.spanish]),
      },
      explanation: `Recuerda estas expresiones: ${matchThird.german}`,
    },
  ];
}

const lessonDrafts: Array<{
  id: string;
  order: number;
  title: string;
  description: string;
  color: string;
  lessons: LessonDraft[];
}> = [
  {
    id: "u01",
    order: 1,
    title: "Saludos y presentaciones",
    description: "Di hola, preséntate y conoce a otras personas.",
    color: "#58CC02",
    lessons: [
      {
        id: "u01-l1",
        order: 1,
        title: "Hola, ¿cómo te llamas?",
        description: "Saluda y di tu nombre.",
        xpReward: 10,
        phrases: [
          { german: "Ich heiße Anna.", spanish: "Me llamo Anna.", spanishAlt: ["Yo me llamo Anna."], blankWord: "heiße", explanation: "heißen significa «llamarse»; con ich se conjuga heiße." },
          { german: "Guten Morgen, Herr Weber.", spanish: "Buenos días, señor Weber.", spanishAlt: ["Buen día, señor Weber."], blankWord: "Morgen", explanation: "Guten Morgen es el saludo habitual por la mañana." },
          { german: "Wie heißt du?", spanish: "¿Cómo te llamas?", spanishAlt: ["¿Cómo te llamas tú?"], blankWord: "heißt", explanation: "Con du, heißen lleva la terminación -t: du heißt." },
          { german: "Ich komme aus Spanien.", spanish: "Soy de España.", spanishAlt: ["Vengo de España.", "Yo soy de España."], blankWord: "komme", explanation: "El verbo conjugado ocupa la segunda posición: Ich komme." },
          { german: "Ich bin Luis.", spanish: "Soy Luis.", spanishAlt: ["Yo soy Luis."], blankWord: "bin", explanation: "La forma de sein para ich es bin." },
          { german: "Auf Wiedersehen, Frau Klein.", spanish: "Adiós, señora Klein.", blankWord: "Wiedersehen", explanation: "Auf Wiedersehen es una despedida formal." },
        ],
      },
      {
        id: "u01-l2",
        order: 2,
        title: "¿Cómo estás?",
        description: "Pregunta y responde con cortesía.",
        xpReward: 10,
        phrases: [
          { german: "Wie geht es dir?", spanish: "¿Cómo estás?", spanishAlt: ["¿Qué tal estás?"], blankWord: "geht", explanation: "La expresión Wie geht es dir? pregunta cómo se encuentra alguien." },
          { german: "Mir geht es gut, danke.", spanish: "Estoy bien, gracias.", spanishAlt: ["Me encuentro bien, gracias."], blankWord: "gut", explanation: "Mir geht es gut significa literalmente «me va bien»." },
          { german: "Und dir?", spanish: "¿Y tú?", blankWord: "dir", explanation: "dir es el dativo de du y se usa en esta expresión." },
          { german: "Heute geht es mir gut.", spanish: "Hoy estoy bien.", blankWord: "Heute", explanation: "Si Heute va primero, el verbo sigue en segunda posición: geht." },
          { german: "Es geht mir auch gut.", spanish: "Yo también estoy bien.", blankWord: "auch", explanation: "auch significa «también» y modifica la respuesta." },
          { german: "Danke, sehr gut.", spanish: "Gracias, muy bien.", blankWord: "sehr", explanation: "sehr intensifica el adjetivo gut." },
        ],
      },
      {
        id: "u01-l3",
        order: 3,
        title: "Despedidas y cortesía",
        description: "Usa expresiones amables al despedirte.",
        xpReward: 10,
        phrases: [
          { german: "Guten Tag, Frau López.", spanish: "Buenas tardes, señora López.", spanishAlt: ["Buenas, señora López."], blankWord: "Tag", explanation: "Guten Tag es un saludo formal que se usa durante el día." },
          { german: "Tschüss, bis später.", spanish: "Chao, hasta luego.", spanishAlt: ["Adiós, hasta luego."], germanAlt: ["Tschüs, bis später."], blankWord: "später", explanation: "Tschüss y bis später son despedidas informales." },
          { german: "Freut mich, dich kennenzulernen.", spanish: "Encantado de conocerte.", blankWord: "dich", explanation: "dich es el acusativo de du en la expresión dich kennenlernen." },
          { german: "Ich wohne in Madrid.", spanish: "Vivo en Madrid.", blankWord: "wohne", explanation: "wohnen significa «vivir» en el sentido de residir." },
          { german: "Bis bald, María.", spanish: "Hasta pronto, María.", blankWord: "bald", explanation: "Bis bald es una despedida informal: «hasta pronto»." },
          { german: "Bis morgen, Paul.", spanish: "Hasta mañana, Paul.", spanishAlt: ["Nos vemos mañana, Paul."], blankWord: "morgen", explanation: "Bis morgen significa «hasta mañana»." },
        ],
      },
    ],
  },
  {
    id: "u02",
    order: 2,
    title: "Números y edad",
    description: "Cuenta, di tu edad y pregunta cuánto cuesta.",
    color: "#1CB0F6",
    lessons: [
      {
        id: "u02-l1",
        order: 1,
        title: "¿Cuántos años tienes?",
        description: "Habla de la edad y de tu cumpleaños.",
        xpReward: 10,
        phrases: [
          { german: "Ich bin achtzehn Jahre alt.", spanish: "Tengo dieciocho años.", blankWord: "achtzehn", explanation: "En alemán, la edad se expresa con sein: Ich bin ... Jahre alt." },
          { german: "Wann hast du Geburtstag?", spanish: "¿Cuándo es tu cumpleaños?", spanishAlt: ["¿Cuándo cumples años?"], blankWord: "Geburtstag", explanation: "Geburtstag significa «cumpleaños»." },
          { german: "Mein Bruder ist zehn Jahre alt.", spanish: "Mi hermano tiene diez años.", blankWord: "zehn", explanation: "Para expresar la edad se usa ist ... Jahre alt." },
          { german: "Heute werde ich zwanzig Jahre alt.", spanish: "Hoy cumplo veinte años.", blankWord: "Heute", explanation: "El verbo conjugado werde ocupa la segunda posición tras Heute." },
          { german: "Sie hat zwei Kinder.", spanish: "Ella tiene dos hijos.", blankWord: "zwei", explanation: "zwei es el número «dos»." },
          { german: "Ich feiere am Samstag.", spanish: "Lo celebro el sábado.", blankWord: "Samstag", explanation: "am se usa con los días de la semana." },
        ],
      },
      {
        id: "u02-l2",
        order: 2,
        title: "Del uno al cien",
        description: "Reconoce cantidades y números cotidianos.",
        xpReward: 10,
        phrases: [
          { german: "Ich habe drei Bücher.", spanish: "Tengo tres libros.", blankWord: "drei", explanation: "drei significa «tres» y acompaña a Bücher en plural." },
          { german: "Wir sind vier Personen.", spanish: "Somos cuatro personas.", blankWord: "vier", explanation: "vier significa «cuatro»." },
          { german: "Er hat fünf Euro.", spanish: "Él tiene cinco euros.", blankWord: "fünf", explanation: "fünf significa «cinco»." },
          { german: "Heute sind es sechs Kinder.", spanish: "Hoy hay seis niños.", blankWord: "sechs", explanation: "El pronombre es acompaña a la cantidad expresada en esta construcción." },
          { german: "Die Zahl ist sieben.", spanish: "El número es siete.", blankWord: "sieben", explanation: "sieben significa «siete»." },
          { german: "Acht plus zwei ist zehn.", spanish: "Ocho más dos son diez.", blankWord: "zehn", explanation: "En una suma, plus significa «más»." },
        ],
      },
      {
        id: "u02-l3",
        order: 3,
        title: "Precios y cantidades",
        description: "Pregunta por precios y compra cantidades.",
        xpReward: 10,
        phrases: [
          { german: "Wie viel kostet der Kaffee?", spanish: "¿Cuánto cuesta el café?", spanishAlt: ["¿Qué precio tiene el café?"], blankWord: "kostet", explanation: "kosten se conjuga kostet con el sujeto singular der Kaffee." },
          { german: "Das Buch kostet zwölf Euro.", spanish: "El libro cuesta doce euros.", spanishAlt: ["El libro vale doce euros."], blankWord: "zwölf", explanation: "zwölf significa «doce»." },
          { german: "Ich möchte zwei Äpfel.", spanish: "Quiero dos manzanas.", blankWord: "Äpfel", explanation: "El plural de Apfel es Äpfel." },
          { german: "Heute kostet das Ticket acht Euro.", spanish: "Hoy el billete cuesta ocho euros.", blankWord: "Ticket", explanation: "Ticket es neutro: das Ticket." },
          { german: "Das kostet fünf Euro.", spanish: "Eso cuesta cinco euros.", blankWord: "fünf", explanation: "fünf significa «cinco»." },
          { german: "Ein Wasser, bitte.", spanish: "Un agua, por favor.", blankWord: "bitte", explanation: "bitte se usa para pedir algo con cortesía." },
        ],
      },
    ],
  },
  {
    id: "u03",
    order: 3,
    title: "La familia",
    description: "Presenta a tu familia y habla de las personas cercanas.",
    color: "#FFC800",
    lessons: [
      {
        id: "u03-l1",
        order: 1,
        title: "Mi familia",
        description: "Nombra a madres, padres y hermanos.",
        xpReward: 10,
        phrases: [
          { german: "Das ist meine Mutter.", spanish: "Esta es mi madre.", spanishAlt: ["Ella es mi madre."], blankWord: "Mutter", explanation: "Mutter es femenino: die Mutter; el posesivo es meine." },
          { german: "Mein Vater heißt Carlos.", spanish: "Mi padre se llama Carlos.", spanishAlt: ["Mi papá se llama Carlos."], blankWord: "Vater", explanation: "Vater es masculino: der Vater; mein concuerda en masculino." },
          { german: "Meine Schwester wohnt in Berlin.", spanish: "Mi hermana vive en Berlín.", blankWord: "Schwester", explanation: "Schwester es femenino y lleva el posesivo meine." },
          { german: "Heute besucht mein Bruder uns.", spanish: "Hoy mi hermano nos visita.", blankWord: "besucht", explanation: "Heute ocupa la primera posición y besucht queda en segunda." },
          { german: "Ich habe einen Bruder.", spanish: "Tengo un hermano.", blankWord: "einen", explanation: "Bruder es masculino y es objeto directo: einen Bruder." },
          { german: "Wir sind eine große Familie.", spanish: "Somos una familia grande.", blankWord: "große", explanation: "Familie es femenino; tras eine el adjetivo lleva -e." },
        ],
      },
      {
        id: "u03-l2",
        order: 2,
        title: "Hermanos y abuelos",
        description: "Describe quiénes forman parte de tu familia.",
        xpReward: 10,
        phrases: [
          { german: "Meine Eltern wohnen in Sevilla.", spanish: "Mis padres viven en Sevilla.", spanishAlt: ["Mis padres residen en Sevilla."], blankWord: "Eltern", explanation: "Eltern se usa en plural y significa «padres»." },
          { german: "Mein Großvater ist sehr freundlich.", spanish: "Mi abuelo es muy amable.", spanishAlt: ["Mi abuelo es muy simpático."], blankWord: "Großvater", explanation: "Großvater es masculino; mein es el posesivo nominativo." },
          { german: "Die Großmutter liest ein Buch.", spanish: "La abuela lee un libro.", blankWord: "liest", explanation: "lesen cambia la vocal: sie liest." },
          { german: "Am Sonntag besuchen wir die Großeltern.", spanish: "El domingo visitamos a los abuelos.", blankWord: "Sonntag", explanation: "Am Sonntag va primero; el verbo conjugado besuchen ocupa el segundo lugar." },
          { german: "Ich habe zwei Schwestern.", spanish: "Tengo dos hermanas.", blankWord: "zwei", explanation: "zwei significa «dos» y Schwestern es el plural de Schwester." },
          { german: "Meine Cousine heißt Elena.", spanish: "Mi prima se llama Elena.", blankWord: "Cousine", explanation: "Cousine es femenino: die Cousine." },
        ],
      },
      {
        id: "u03-l3",
        order: 3,
        title: "Personas y relaciones",
        description: "Habla de tus amistades y de las personas que conoces.",
        xpReward: 10,
        phrases: [
          { german: "Das ist mein Freund Pablo.", spanish: "Este es mi amigo Pablo.", spanishAlt: ["Él es mi amigo Pablo."], blankWord: "Freund", explanation: "Freund es masculino y lleva mein en nominativo." },
          { german: "Ihre Tochter ist acht Jahre alt.", spanish: "Su hija tiene ocho años.", spanishAlt: ["Su hija tiene 8 años."], blankWord: "Tochter", explanation: "Tochter es femenino; ihre significa «su»." },
          { german: "Der Onkel kommt heute zu Besuch.", spanish: "El tío viene hoy de visita.", blankWord: "Onkel", explanation: "Onkel es masculino: der Onkel." },
          { german: "Morgen trifft mein Cousin seine Freunde.", spanish: "Mañana mi primo se encuentra con sus amigos.", blankWord: "Morgen", explanation: "Morgen va primero y trifft ocupa la segunda posición." },
          { german: "Ich kenne ihre Tante.", spanish: "Conozco a su tía.", blankWord: "Tante", explanation: "Tante es femenino; su forma en acusativo sigue siendo ihre Tante." },
          { german: "Wir besuchen unsere Familie.", spanish: "Visitamos a nuestra familia.", blankWord: "besuchen", explanation: "besuchen lleva un objeto directo en acusativo." },
        ],
      },
    ],
  },
  {
    id: "u04",
    order: 4,
    title: "Comida y bebida",
    description: "Pide algo para comer y habla de tus gustos.",
    color: "#FF4B4B",
    lessons: [
      {
        id: "u04-l1",
        order: 1,
        title: "En la mesa",
        description: "Nombra alimentos y bebidas habituales.",
        xpReward: 10,
        phrases: [
          { german: "Ich esse einen Apfel.", spanish: "Como una manzana.", spanishAlt: ["Me como una manzana."], blankWord: "Apfel", explanation: "Apfel es masculino y objeto directo: einen Apfel." },
          { german: "Sie trinkt Wasser.", spanish: "Ella bebe agua.", blankWord: "trinkt", explanation: "trinken se conjuga trinkt con sie." },
          { german: "Wir essen Brot und Käse.", spanish: "Comemos pan y queso.", blankWord: "Käse", explanation: "Käse es masculino: der Käse." },
          { german: "Am Morgen trinke ich Kaffee.", spanish: "Por la mañana tomo café.", blankWord: "Morgen", explanation: "Am Morgen ocupa el primer lugar; trinke va en segunda posición." },
          { german: "Er möchte einen Tee.", spanish: "Él quiere un té.", blankWord: "Tee", explanation: "Tee es masculino; como objeto directo se usa einen Tee." },
          { german: "Die Suppe ist heiß.", spanish: "La sopa está caliente.", blankWord: "heiß", explanation: "heiß significa «caliente»." },
        ],
      },
      {
        id: "u04-l2",
        order: 2,
        title: "En el restaurante",
        description: "Pide comida y pregunta por la carta.",
        xpReward: 10,
        phrases: [
          { german: "Ich hätte gern eine Suppe.", spanish: "Quisiera una sopa.", blankWord: "Suppe", explanation: "Suppe es femenino: eine Suppe." },
          { german: "Die Rechnung, bitte.", spanish: "La cuenta, por favor.", spanishAlt: ["¿Me trae la cuenta, por favor?"], blankWord: "Rechnung", explanation: "Rechnung es femenino: die Rechnung." },
          { german: "Wir bestellen einen Salat.", spanish: "Pedimos una ensalada.", blankWord: "Salat", explanation: "Salat es masculino; en acusativo se dice einen Salat." },
          { german: "Heute nehme ich das Menü.", spanish: "Hoy pido el menú.", blankWord: "Menü", explanation: "Hoy va primero; nehme ocupa la segunda posición." },
          { german: "Ein Glas Wasser, bitte.", spanish: "Un vaso de agua, por favor.", blankWord: "Glas", explanation: "Glas es neutro: ein Glas." },
          { german: "Das Essen schmeckt sehr gut.", spanish: "La comida está muy rica.", blankWord: "schmeckt", explanation: "schmecken se conjuga schmeckt con el sujeto singular Essen." },
        ],
      },
      {
        id: "u04-l3",
        order: 3,
        title: "Lo que te gusta",
        description: "Expresa tus preferencias y pide algo sencillo.",
        xpReward: 10,
        phrases: [
          { german: "Ich mag frische Erdbeeren.", spanish: "Me gustan las fresas frescas.", blankWord: "Erdbeeren", explanation: "Erdbeeren es plural, por eso el adjetivo termina en -e." },
          { german: "Er trinkt keinen Kaffee.", spanish: "Él no toma café.", blankWord: "keinen", explanation: "Kaffee es masculino en acusativo: keinen Kaffee." },
          { german: "Magst du Schokolade?", spanish: "¿Te gusta el chocolate?", blankWord: "Schokolade", explanation: "Schokolade es femenino: die Schokolade." },
          { german: "Heute esse ich gern Fisch.", spanish: "Hoy me gusta comer pescado.", blankWord: "gern", explanation: "Hoy va primero y esse ocupa la segunda posición." },
          { german: "Ich nehme eine Banane.", spanish: "Tomo un plátano.", blankWord: "Banane", explanation: "Banane es femenino y objeto directo: eine Banane." },
          { german: "Der Saft ist kalt.", spanish: "El zumo está frío.", blankWord: "kalt", explanation: "kalt es el adjetivo «frío»." },
        ],
      },
    ],
  },
  {
    id: "u05",
    order: 5,
    title: "La casa",
    description: "Describe habitaciones, muebles y dónde están las cosas.",
    color: "#A560E8",
    lessons: [
      {
        id: "u05-l1",
        order: 1,
        title: "Habitaciones",
        description: "Nombra los espacios de una casa.",
        xpReward: 10,
        phrases: [
          { german: "Das Haus hat eine Küche.", spanish: "La casa tiene una cocina.", spanishAlt: ["La casa cuenta con una cocina."], blankWord: "Küche", explanation: "Küche es femenino: eine Küche." },
          { german: "Die Wohnung hat zwei Zimmer.", spanish: "El piso tiene dos habitaciones.", spanishAlt: ["El apartamento tiene dos habitaciones."], blankWord: "Wohnung", explanation: "Wohnung es femenino: die Wohnung." },
          { german: "Das Bad ist neben dem Schlafzimmer.", spanish: "El baño está junto al dormitorio.", blankWord: "Schlafzimmer", explanation: "Schlafzimmer es neutro: das Schlafzimmer." },
          { german: "Im Wohnzimmer steht ein Sofa.", spanish: "En el salón hay un sofá.", blankWord: "Wohnzimmer", explanation: "Im significa in dem; el verbo steht va en segunda posición." },
          { german: "Ich wohne in einem Haus.", spanish: "Vivo en una casa.", blankWord: "Haus", explanation: "in expresa ubicación aquí y lleva dativo: in einem Haus." },
          { german: "Unsere Küche ist groß.", spanish: "Nuestra cocina es grande.", blankWord: "groß", explanation: "groß significa «grande»." },
        ],
      },
      {
        id: "u05-l2",
        order: 2,
        title: "Muebles y objetos",
        description: "Di qué muebles hay en una habitación.",
        xpReward: 10,
        phrases: [
          { german: "Das Bett ist sehr bequem.", spanish: "La cama es muy cómoda.", spanishAlt: ["La cama resulta muy cómoda."], blankWord: "Bett", explanation: "Bett es neutro: das Bett." },
          { german: "Der Tisch steht am Fenster.", spanish: "La mesa está junto a la ventana.", spanishAlt: ["La mesa está al lado de la ventana."], blankWord: "Fenster", explanation: "Fenster es neutro; am significa an dem." },
          { german: "Ich habe eine neue Lampe.", spanish: "Tengo una lámpara nueva.", blankWord: "Lampe", explanation: "Lampe es femenino; tras eine el adjetivo lleva -e." },
          { german: "Im Zimmer steht ein Schrank.", spanish: "En la habitación hay un armario.", blankWord: "Schrank", explanation: "La ubicación lleva dativo; stehen va en segunda posición." },
          { german: "Die Tür ist offen.", spanish: "La puerta está abierta.", blankWord: "Tür", explanation: "Tür es femenino: die Tür." },
          { german: "Wir brauchen einen Stuhl.", spanish: "Necesitamos una silla.", blankWord: "Stuhl", explanation: "Stuhl es masculino y objeto directo: einen Stuhl." },
        ],
      },
      {
        id: "u05-l3",
        order: 3,
        title: "¿Dónde está?",
        description: "Indica dónde están los objetos y las personas.",
        xpReward: 10,
        phrases: [
          { german: "Das Buch liegt auf dem Tisch.", spanish: "El libro está sobre la mesa.", spanishAlt: ["El libro está encima de la mesa."], blankWord: "Tisch", explanation: "auf expresa ubicación y lleva dativo: auf dem Tisch." },
          { german: "Die Katze ist unter dem Bett.", spanish: "El gato está debajo de la cama.", spanishAlt: ["El gato está bajo la cama."], blankWord: "unter", explanation: "unter indica ubicación y va con dativo en esta frase." },
          { german: "Der Schlüssel liegt neben der Tür.", spanish: "La llave está junto a la puerta.", blankWord: "Schlüssel", explanation: "Schlüssel es masculino: der Schlüssel." },
          { german: "Heute steht die Lampe auf dem Tisch.", spanish: "Hoy la lámpara está sobre la mesa.", blankWord: "Lampe", explanation: "El verbo steht ocupa la segunda posición después de Heute." },
          { german: "Das Bild hängt an der Wand.", spanish: "El cuadro está colgado en la pared.", blankWord: "Wand", explanation: "an expresa ubicación y lleva dativo: an der Wand." },
          { german: "Im Garten spielen die Kinder.", spanish: "Los niños juegan en el jardín.", blankWord: "Garten", explanation: "En la frase locativa im Garten, Garten está en dativo." },
        ],
      },
    ],
  },
  {
    id: "u06",
    order: 6,
    title: "Ciudad y transporte",
    description: "Pregunta por lugares y muévete por la ciudad.",
    color: "#1CB0F6",
    lessons: [
      {
        id: "u06-l1",
        order: 1,
        title: "Lugares de la ciudad",
        description: "Encuentra tiendas, estaciones y servicios.",
        xpReward: 10,
        phrases: [
          { german: "Der Bahnhof ist in der Stadt.", spanish: "La estación está en la ciudad.", spanishAlt: ["La estación se encuentra en la ciudad."], blankWord: "Bahnhof", explanation: "Bahnhof es masculino: der Bahnhof." },
          { german: "Wo ist die Apotheke?", spanish: "¿Dónde está la farmacia?", spanishAlt: ["¿Dónde queda la farmacia?"], blankWord: "Apotheke", explanation: "Apotheke es femenino: die Apotheke." },
          { german: "Der Supermarkt ist heute geöffnet.", spanish: "El supermercado está abierto hoy.", blankWord: "geöffnet", explanation: "geöffnet significa «abierto»." },
          { german: "Hier ist die Schule.", spanish: "Aquí está la escuela.", blankWord: "Schule", explanation: "Hier va primero y ist ocupa la segunda posición." },
          { german: "Das Museum ist neben dem Park.", spanish: "El museo está junto al parque.", blankWord: "Museum", explanation: "Museum es neutro: das Museum." },
          { german: "Die Bank ist nicht weit.", spanish: "El banco no está lejos.", blankWord: "weit", explanation: "weit significa «lejos»." },
        ],
      },
      {
        id: "u06-l2",
        order: 2,
        title: "Cómo llegar",
        description: "Pregunta por el camino y entiende indicaciones.",
        xpReward: 10,
        phrases: [
          { german: "Gehen Sie geradeaus.", spanish: "Siga todo recto.", spanishAlt: ["Siga en línea recta."], blankWord: "geradeaus", explanation: "geradeaus significa «todo recto»." },
          { german: "Biegen Sie links ab.", spanish: "Gire a la izquierda.", spanishAlt: ["Doble a la izquierda."], blankWord: "links", explanation: "links significa «a la izquierda»; ab va al final del verbo separable." },
          { german: "Die Straße ist hier.", spanish: "La calle está aquí.", blankWord: "Straße", explanation: "Straße es femenino: die Straße." },
          { german: "An der Ecke ist ein Café.", spanish: "En la esquina hay una cafetería.", blankWord: "Ecke", explanation: "An der Ecke es una ubicación en dativo." },
          { german: "Wie komme ich zum Bahnhof?", spanish: "¿Cómo llego a la estación?", blankWord: "Bahnhof", explanation: "zum equivale a zu dem y lleva dativo." },
          { german: "Die Brücke ist rechts.", spanish: "El puente está a la derecha.", blankWord: "rechts", explanation: "rechts significa «a la derecha»." },
        ],
      },
      {
        id: "u06-l3",
        order: 3,
        title: "Bus, tren y bicicleta",
        description: "Habla de los medios de transporte.",
        xpReward: 10,
        phrases: [
          { german: "Ich fahre mit dem Bus.", spanish: "Voy en autobús.", blankWord: "Bus", explanation: "mit siempre lleva dativo: mit dem Bus." },
          { german: "Der Zug kommt um zehn Uhr.", spanish: "El tren llega a las diez.", spanishAlt: ["El tren llega a las diez en punto."], blankWord: "Zug", explanation: "Zug es masculino: der Zug." },
          { german: "Wir fahren mit dem Fahrrad.", spanish: "Vamos en bicicleta.", blankWord: "Fahrrad", explanation: "mit lleva dativo: mit dem Fahrrad." },
          { german: "Um acht Uhr fährt die U-Bahn.", spanish: "A las ocho sale el metro.", blankWord: "U-Bahn", explanation: "La expresión temporal va primero; fährt ocupa la segunda posición." },
          { german: "Das Ticket kostet drei Euro.", spanish: "El billete cuesta tres euros.", blankWord: "Ticket", explanation: "Ticket es neutro: das Ticket." },
          { german: "Ich gehe zu Fuß.", spanish: "Voy a pie.", blankWord: "Fuß", explanation: "zu Fuß es una expresión fija que significa «a pie»." },
        ],
      },
    ],
  },
  {
    id: "u07",
    order: 7,
    title: "La hora y la rutina",
    description: "Cuenta la hora y describe un día normal.",
    color: "#FFC800",
    lessons: [
      {
        id: "u07-l1",
        order: 1,
        title: "¿Qué hora es?",
        description: "Pregunta y responde la hora.",
        xpReward: 10,
        phrases: [
          { german: "Es ist sieben Uhr.", spanish: "Son las siete.", spanishAlt: ["Son las siete en punto."], blankWord: "sieben", explanation: "sieben Uhr expresa las siete en punto." },
          { german: "Wie spät ist es?", spanish: "¿Qué hora es?", spanishAlt: ["¿Qué hora tenemos?"], blankWord: "spät", explanation: "Wie spät ist es? es la pregunta habitual por la hora." },
          { german: "Der Film beginnt um acht Uhr.", spanish: "La película empieza a las ocho.", blankWord: "beginnt", explanation: "beginnen se conjuga beginnt con el sujeto singular Film." },
          { german: "Um halb neun frühstücke ich.", spanish: "Desayuno a las ocho y media.", blankWord: "halb", explanation: "En alemán, halb neun significa las ocho y media." },
          { german: "Der Zug fährt um neun Uhr.", spanish: "El tren sale a las nueve.", blankWord: "neun", explanation: "neun Uhr expresa las nueve en punto." },
          { german: "Es ist Viertel nach zehn.", spanish: "Son las diez y cuarto.", blankWord: "Viertel", explanation: "Viertel nach zehn significa las diez y cuarto." },
        ],
      },
      {
        id: "u07-l2",
        order: 2,
        title: "Un día normal",
        description: "Habla de las actividades de cada día.",
        xpReward: 10,
        phrases: [
          { german: "Ich stehe um sieben Uhr auf.", spanish: "Me levanto a las siete.", blankWord: "stehe", explanation: "aufstehen es separable: stehe ... auf." },
          { german: "Er frühstückt um acht Uhr.", spanish: "Él desayuna a las ocho.", blankWord: "frühstückt", explanation: "frühstücken se conjuga frühstückt con er." },
          { german: "Wir arbeiten am Vormittag.", spanish: "Trabajamos por la mañana.", blankWord: "Vormittag", explanation: "am Vormittag indica la parte de la mañana." },
          { german: "Nach der Arbeit mache ich Sport.", spanish: "Después del trabajo hago deporte.", blankWord: "Arbeit", explanation: "Nach lleva dativo; el verbo mache queda en segunda posición." },
          { german: "Sie kommt um fünf Uhr nach Hause.", spanish: "Ella llega a casa a las cinco.", blankWord: "Hause", explanation: "nach Hause significa «a casa»." },
          { german: "Am Abend lese ich ein Buch.", spanish: "Por la noche leo un libro.", blankWord: "Abend", explanation: "Am Abend va primero y lese ocupa la segunda posición." },
        ],
      },
      {
        id: "u07-l3",
        order: 3,
        title: "Días y planes",
        description: "Organiza actividades durante la semana.",
        xpReward: 10,
        phrases: [
          { german: "Am Montag lerne ich Deutsch.", spanish: "El lunes estudio alemán.", spanishAlt: ["Estudio alemán el lunes."], blankWord: "Montag", explanation: "am se usa con los días; lerne ocupa la segunda posición." },
          { german: "Der Termin ist am Freitag.", spanish: "La cita es el viernes.", spanishAlt: ["La cita está programada para el viernes."], blankWord: "Freitag", explanation: "am Freitag indica el día de la cita." },
          { german: "Wir gehen am Wochenende spazieren.", spanish: "El fin de semana salimos a pasear.", blankWord: "Wochenende", explanation: "am Wochenende significa «el fin de semana»." },
          { german: "Morgen besucht sie ihre Freundin.", spanish: "Mañana visita a su amiga.", blankWord: "Morgen", explanation: "Morgen va primero; besucht ocupa la segunda posición." },
          { german: "Heute habe ich keine Zeit.", spanish: "Hoy no tengo tiempo.", blankWord: "Zeit", explanation: "Zeit es femenino; keine niega un sustantivo." },
          { german: "Bis nächste Woche!", spanish: "¡Hasta la semana que viene!", blankWord: "Woche", explanation: "nächste Woche significa «la semana que viene»." },
        ],
      },
    ],
  },
  {
    id: "u08",
    order: 8,
    title: "Ropa y compras",
    description: "Elige prendas, colores y tallas en una tienda.",
    color: "#FF4B4B",
    lessons: [
      {
        id: "u08-l1",
        order: 1,
        title: "Prendas y colores",
        description: "Describe qué ropa llevas.",
        xpReward: 10,
        phrases: [
          { german: "Die Jacke ist rot.", spanish: "La chaqueta es roja.", spanishAlt: ["La chaqueta es de color rojo."], blankWord: "Jacke", explanation: "Jacke es femenino: die Jacke." },
          { german: "Ich trage ein blaues Hemd.", spanish: "Llevo una camisa azul.", blankWord: "blaues", explanation: "Hemd es neutro; tras ein el adjetivo lleva la terminación -es." },
          { german: "Der Pullover ist warm.", spanish: "El jersey es abrigado.", blankWord: "Pullover", explanation: "Pullover es masculino: der Pullover." },
          { german: "Heute trage ich schwarze Schuhe.", spanish: "Hoy llevo zapatos negros.", blankWord: "schwarze", explanation: "Schuhe está en plural sin artículo; schwarze lleva la terminación -e." },
          { german: "Sie trägt einen grünen Rock.", spanish: "Ella lleva una falda verde.", blankWord: "grünen", explanation: "Rock es masculino en acusativo: einen grünen Rock." },
          { german: "Die Hose ist bequem.", spanish: "El pantalón es cómodo.", blankWord: "bequem", explanation: "bequem significa «cómodo»." },
        ],
      },
      {
        id: "u08-l2",
        order: 2,
        title: "En la tienda",
        description: "Pregunta por prendas y pide ayuda.",
        xpReward: 10,
        phrases: [
          { german: "Ich suche eine neue Tasche.", spanish: "Busco un bolso nuevo.", blankWord: "Tasche", explanation: "Tasche es femenino: eine neue Tasche." },
          { german: "Haben Sie diese Größe?", spanish: "¿Tiene esta talla?", spanishAlt: ["¿Tiene disponible esta talla?"], blankWord: "Größe", explanation: "Größe es femenino: die Größe." },
          { german: "Kann ich das anprobieren?", spanish: "¿Puedo probarme esto?", blankWord: "anprobieren", explanation: "anprobieren es un infinitivo separable que va al final con können." },
          { german: "Ich brauche einen Mantel.", spanish: "Necesito un abrigo.", blankWord: "Mantel", explanation: "Mantel es masculino en acusativo: einen Mantel." },
          { german: "Wo ist die Kasse?", spanish: "¿Dónde está la caja?", blankWord: "Kasse", explanation: "Kasse es femenino: die Kasse." },
          { german: "Die Umkleidekabine ist dort.", spanish: "El probador está allí.", blankWord: "dort", explanation: "dort significa «allí»." },
        ],
      },
      {
        id: "u08-l3",
        order: 3,
        title: "Tallas y precios",
        description: "Compara precios y decide qué comprar.",
        xpReward: 10,
        phrases: [
          { german: "Die Schuhe kosten vierzig Euro.", spanish: "Los zapatos cuestan cuarenta euros.", spanishAlt: ["El precio de los zapatos es de cuarenta euros."], blankWord: "vierzig", explanation: "vierzig significa «cuarenta»." },
          { german: "Der Mantel ist sehr teuer.", spanish: "El abrigo es muy caro.", spanishAlt: ["El abrigo tiene un precio muy alto."], blankWord: "teuer", explanation: "teuer significa «caro»." },
          { german: "Ich nehme den roten Pullover.", spanish: "Me llevo el jersey rojo.", blankWord: "roten", explanation: "Pullover es masculino en acusativo; con den, el adjetivo termina en -en." },
          { german: "Heute kostet die Bluse zwanzig Euro.", spanish: "Hoy la blusa cuesta veinte euros.", blankWord: "Bluse", explanation: "Hoy va primero y kostet queda en segunda posición." },
          { german: "Das Kleid passt mir gut.", spanish: "El vestido me queda bien.", blankWord: "Kleid", explanation: "Kleid es neutro; mir es el dativo de ich." },
          { german: "Die Mütze ist günstig.", spanish: "El gorro es barato.", blankWord: "günstig", explanation: "günstig significa «barato»." },
        ],
      },
    ],
  },
  {
    id: "u09",
    order: 9,
    title: "Trabajo y estudios",
    description: "Habla de tu profesión, tus estudios y tu lugar de trabajo.",
    color: "#A560E8",
    lessons: [
      {
        id: "u09-l1",
        order: 1,
        title: "Profesiones",
        description: "Di a qué te dedicas y dónde trabajas.",
        xpReward: 10,
        phrases: [
          { german: "Ich arbeite in einem Büro.", spanish: "Trabajo en una oficina.", blankWord: "Büro", explanation: "in expresa ubicación y lleva dativo: in einem Büro." },
          { german: "Mein Vater ist Lehrer.", spanish: "Mi padre es profesor.", spanishAlt: ["Mi papá es profesor."], blankWord: "Lehrer", explanation: "Las profesiones suelen ir sin artículo después de sein." },
          { german: "Sie ist Ärztin in Berlin.", spanish: "Ella es médica en Berlín.", blankWord: "Ärztin", explanation: "Ärztin es la forma femenina de Arzt." },
          { german: "Heute arbeitet mein Kollege zu Hause.", spanish: "Hoy mi compañero trabaja desde casa.", blankWord: "Kollege", explanation: "Hoy va primero; arbeitet ocupa la segunda posición." },
          { german: "Wir haben einen neuen Chef.", spanish: "Tenemos un jefe nuevo.", blankWord: "Chef", explanation: "Chef es masculino y objeto directo: einen neuen Chef." },
          { german: "Der Beruf ist interessant.", spanish: "La profesión es interesante.", blankWord: "Beruf", explanation: "Beruf es masculino: der Beruf." },
        ],
      },
      {
        id: "u09-l2",
        order: 2,
        title: "En clase",
        description: "Habla de cursos, libros y tareas.",
        xpReward: 10,
        phrases: [
          { german: "Ich lerne Deutsch an der Universität.", spanish: "Estudio alemán en la universidad.", blankWord: "Deutsch", explanation: "Deutsch es el idioma alemán; lernen se conjuga lerne con ich." },
          { german: "Die Lehrerin erklärt die Aufgabe.", spanish: "La profesora explica la tarea.", spanishAlt: ["La docente explica la tarea."], blankWord: "Aufgabe", explanation: "Aufgabe es femenino: die Aufgabe." },
          { german: "Wir lesen ein interessantes Buch.", spanish: "Leemos un libro interesante.", blankWord: "Buch", explanation: "Buch es neutro: en acusativo, tras ein, el adjetivo lleva la terminación -es: ein interessantes Buch." },
          { german: "Heute schreiben wir eine E-Mail.", spanish: "Hoy escribimos un correo electrónico.", blankWord: "schreiben", explanation: "Hoy va primero; schreiben ocupa la segunda posición." },
          { german: "Der Kurs beginnt um neun Uhr.", spanish: "El curso empieza a las nueve.", blankWord: "Kurs", explanation: "Kurs es masculino: der Kurs." },
          { german: "Die Prüfung ist am Montag.", spanish: "El examen es el lunes.", blankWord: "Prüfung", explanation: "Prüfung es femenino: die Prüfung." },
        ],
      },
      {
        id: "u09-l3",
        order: 3,
        title: "Un día de trabajo",
        description: "Describe tareas y horarios laborales.",
        xpReward: 10,
        phrases: [
          { german: "Meine Kollegin kommt aus Hamburg.", spanish: "Mi compañera es de Hamburgo.", spanishAlt: ["Mi compañera viene de Hamburgo."], blankWord: "Kollegin", explanation: "Kollegin es femenino y lleva el posesivo meine." },
          { german: "Er schreibt heute einen Bericht.", spanish: "Él escribe un informe hoy.", blankWord: "Bericht", explanation: "Bericht es masculino en acusativo: einen Bericht." },
          { german: "Wir sprechen mit dem Chef.", spanish: "Hablamos con el jefe.", blankWord: "Chef", explanation: "mit siempre rige dativo: mit dem Chef." },
          { german: "Um neun Uhr beginnt die Besprechung.", spanish: "La reunión empieza a las nueve.", blankWord: "Besprechung", explanation: "Um neun Uhr ocupa el primer lugar; beginnt va en segunda posición." },
          { german: "Ich mache eine kurze Pause.", spanish: "Hago una pausa corta.", blankWord: "Pause", explanation: "Pause es femenino; tras eine el adjetivo termina en -e." },
          { german: "Die Arbeit macht mir Spaß.", spanish: "El trabajo me resulta divertido.", blankWord: "Spaß", explanation: "Spaß machen es una expresión que significa «divertir»." },
        ],
      },
    ],
  },
  {
    id: "u10",
    order: 10,
    title: "Tiempo libre y aficiones",
    description: "Cuenta qué haces cuando no estás trabajando o estudiando.",
    color: "#58CC02",
    lessons: [
      {
        id: "u10-l1",
        order: 1,
        title: "Aficiones",
        description: "Habla de tus pasatiempos favoritos.",
        xpReward: 10,
        phrases: [
          { german: "Ich spiele gern Fußball.", spanish: "Me gusta jugar al fútbol.", blankWord: "Fußball", explanation: "gern expresa que una actividad gusta o se hace con placer." },
          { german: "Meine Freundin liest gern.", spanish: "A mi amiga le gusta leer.", spanishAlt: ["A mi amiga le encanta leer."], blankWord: "Freundin", explanation: "Freundin es femenino: meine Freundin." },
          { german: "Wir hören Musik.", spanish: "Escuchamos música.", blankWord: "Musik", explanation: "hören se conjuga hören con wir." },
          { german: "Am Wochenende spiele ich Tennis.", spanish: "El fin de semana juego al tenis.", blankWord: "Wochenende", explanation: "Am Wochenende va primero y spiele ocupa la segunda posición." },
          { german: "Er kann gut schwimmen.", spanish: "Él sabe nadar bien.", blankWord: "schwimmen", explanation: "Con el modal können, el infinitivo schwimmen va al final." },
          { german: "Sie tanzt sehr gut.", spanish: "Ella baila muy bien.", blankWord: "tanzt", explanation: "tanzen se conjuga tanzt con sie." },
        ],
      },
      {
        id: "u10-l2",
        order: 2,
        title: "Música, libros y películas",
        description: "Comparte lo que te gusta leer, ver y escuchar.",
        xpReward: 10,
        phrases: [
          { german: "Ich lese ein spannendes Buch.", spanish: "Leo un libro emocionante.", blankWord: "Buch", explanation: "Buch es neutro en acusativo; tras ein, spannendes lleva la terminación -es." },
          { german: "Der Film beginnt um acht Uhr.", spanish: "La película empieza a las ocho.", spanishAlt: ["La película comienza a las ocho."], germanAlt: ["Der Film fängt um acht Uhr an."], blankWord: "Film", explanation: "Film es masculino: der Film." },
          { german: "Meine Schwester hört gern Musik.", spanish: "A mi hermana le gusta escuchar música.", blankWord: "Musik", explanation: "gern expresa gusto por la actividad de escuchar." },
          { german: "Heute sehen wir einen Film.", spanish: "Hoy vemos una película.", blankWord: "Film", explanation: "Hoy va primero; sehen ocupa la segunda posición." },
          { german: "Das Konzert ist am Samstag.", spanish: "El concierto es el sábado.", blankWord: "Konzert", explanation: "Konzert es neutro: das Konzert." },
          { german: "Er spielt Gitarre.", spanish: "Él toca la guitarra.", blankWord: "Gitarre", explanation: "Gitarre es femenino; los instrumentos suelen ir sin artículo tras spielen." },
        ],
      },
      {
        id: "u10-l3",
        order: 3,
        title: "Planes para el fin de semana",
        description: "Invita a alguien a salir y hacer planes.",
        xpReward: 10,
        phrases: [
          { german: "Gehen wir ins Kino?", spanish: "¿Vamos al cine?", spanishAlt: ["¿Nos vamos al cine?"], blankWord: "Kino", explanation: "ins es in das y expresa movimiento hacia el cine." },
          { german: "Ich treffe meine Freunde im Park.", spanish: "Quedo con mis amigos en el parque.", spanishAlt: ["Me reúno con mis amigos en el parque."], blankWord: "Freunde", explanation: "Freunde es el plural de Freund; im Park expresa ubicación." },
          { german: "Wir machen eine Reise.", spanish: "Hacemos un viaje.", blankWord: "Reise", explanation: "Reise es femenino: eine Reise." },
          { german: "Morgen besuchen wir das Schwimmbad.", spanish: "Mañana vamos a la piscina.", blankWord: "Schwimmbad", explanation: "Mañana va primero; besuchen ocupa la segunda posición." },
          { german: "Am Sonntag spiele ich ein Spiel.", spanish: "El domingo juego a un juego.", blankWord: "Sonntag", explanation: "Am Sonntag indica el día; spiele va en segunda posición." },
          { german: "Das Wetter ist heute schön.", spanish: "Hoy hace buen tiempo.", blankWord: "Wetter", explanation: "Wetter es neutro: das Wetter." },
        ],
      },
    ],
  },
];

export const units = lessonDrafts.map((unit) => ({
  id: unit.id,
  order: unit.order,
  title: unit.title,
  description: unit.description,
  color: unit.color,
  cefrLevel: "A1",
  lessons: unit.lessons.map(({ phrases, ...lesson }) => ({
    ...lesson,
    exercises: createExercises(lesson.id, phrases),
  })),
}));

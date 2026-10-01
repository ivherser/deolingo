import { createExercises, type Phrase } from "./units";

const topics = [
  {
    id: "g-articulos",
    slug: "articulos",
    title: "Artículos: der, die y das",
    summary: "Aprende el género de los sustantivos y sus artículos.",
    order: 1,
    explanation: `En alemán, cada sustantivo tiene género: masculino (der), femenino (die) o neutro (das). Memoriza el artículo junto con cada palabra.

## Artículos definidos

| Género | Singular | Plural |
| Masculino | der Mann | die Männer |
| Femenino | die Frau | die Frauen |
| Neutro | das Kind | die Kinder |

- Los sustantivos terminados en -ung y -heit suelen ser femeninos: die Zeitung, die Freiheit.
- Los diminutivos en -chen son neutros: das Mädchen.
- En plural, el artículo definido es die para los tres géneros.`,
    phrases: [
      { german: "Der Mann ist freundlich.", spanish: "El hombre es amable.", spanishAlt: ["El hombre es simpático."], blankWord: "Mann", explanation: "Mann es masculino: der Mann." },
      { german: "Die Frau ist hier.", spanish: "La mujer está aquí.", spanishAlt: ["La mujer se encuentra aquí."], germanAlt: ["Die Frau befindet sich hier."], blankWord: "Frau", explanation: "Frau es femenino: die Frau." },
      { german: "Das Kind spielt.", spanish: "El niño juega.", blankWord: "Kind", explanation: "Kind es neutro: das Kind." },
      { german: "Heute ist der Lehrer im Kurs.", spanish: "Hoy el profesor está en el curso.", blankWord: "Lehrer", explanation: "Lehrer es masculino y el artículo es der." },
      { german: "Wir sehen den Hund.", spanish: "Vemos al perro.", blankWord: "Hund", explanation: "Hund es masculino; en acusativo der cambia a den." },
      { german: "Die Bücher sind neu.", spanish: "Los libros son nuevos.", blankWord: "Bücher", explanation: "El plural de Buch es Bücher y su artículo es die." },
    ] satisfies Phrase[],
  },
  {
    id: "g-casos",
    slug: "casos",
    title: "Nominativo, acusativo y dativo",
    summary: "Reconoce quién hace la acción y a quién afecta.",
    order: 2,
    explanation: `El nominativo marca el sujeto. El acusativo suele marcar el objeto directo y el dativo aparece, entre otros casos, con ciertos verbos y preposiciones.

## Artículos determinados

| Caso | Masculino | Femenino | Neutro | Plural |
| Nominativo | der | die | das | die |
| Acusativo | den | die | das | die |
| Dativo | dem | der | dem | den |

## Artículos indeterminados

| Caso | Masculino | Femenino | Neutro |
| Nominativo | ein | eine | ein |
| Acusativo | einen | eine | ein |
| Dativo | einem | einer | einem |

- helfen y danken rigen dativo: Ich helfe dem Kind.
- En plural dativo, muchos sustantivos añaden -n: mit den Kindern.`,
    phrases: [
      { german: "Der Hund sieht den Mann.", spanish: "El perro ve al hombre.", spanishAlt: ["El perro observa al hombre."], blankWord: "Hund", explanation: "Der Hund es el sujeto en nominativo; den Mann es el objeto en acusativo." },
      { german: "Ich helfe dem Kind.", spanish: "Ayudo al niño.", spanishAlt: ["Le presto ayuda al niño."], blankWord: "helfe", explanation: "helfen rige dativo: dem Kind." },
      { german: "Sie gibt dem Mann ein Buch.", spanish: "Ella le da un libro al hombre.", blankWord: "Mann", explanation: "dem Mann es el destinatario en dativo; ein Buch es el objeto directo." },
      { german: "Heute kauft er einen Apfel.", spanish: "Hoy compra una manzana.", blankWord: "Apfel", explanation: "Apfel es masculino en acusativo: einen Apfel." },
      { german: "Wir fahren mit dem Bus.", spanish: "Vamos en autobús.", blankWord: "Bus", explanation: "mit siempre rige dativo: mit dem Bus." },
      { german: "Die Kinder danken der Lehrerin.", spanish: "Los niños dan las gracias a la profesora.", blankWord: "Lehrerin", explanation: "danken rige dativo: der Lehrerin." },
    ] satisfies Phrase[],
  },
  {
    id: "g-conjugacion",
    slug: "conjugacion",
    title: "Verbos en presente",
    summary: "Conjuga verbos regulares, sein, haben y verbos con cambio vocálico.",
    order: 3,
    explanation: `En presente, los verbos regulares suelen usar las terminaciones -e, -st, -t, -en, -t, -en. sein y haben son irregulares.

## Terminaciones regulares

| Pronombre | lernen | spielen |
| ich | lerne | spiele |
| du | lernst | spielst |
| er, sie, es | lernt | spielt |
| wir, sie, Sie | lernen | spielen |

- sein: ich bin, du bist, er ist, wir sind.
- haben: ich habe, du hast, er hat, wir haben.
- Algunos verbos cambian e a i: sprechen → du sprichst; nehmen → du nimmst.
- Algunos verbos cambian a a ä: fahren → du fährst; er fährt.`,
    phrases: [
      { german: "Ich lerne Deutsch.", spanish: "Aprendo alemán.", blankWord: "lerne", explanation: "Con ich, lernen termina en -e: ich lerne." },
      { german: "Du hast heute Zeit.", spanish: "Hoy tienes tiempo.", spanishAlt: ["Tú tienes tiempo hoy."], blankWord: "hast", explanation: "La forma de haben con du es hast." },
      { german: "Er ist müde.", spanish: "Él está cansado.", blankWord: "ist", explanation: "La forma de sein con er es ist." },
      { german: "Heute fährt Maria nach Berlin.", spanish: "Hoy María viaja a Berlín.", blankWord: "fährt", explanation: "fahren cambia a → ä en la tercera persona: Maria fährt." },
      { german: "Wir sprechen Spanisch.", spanish: "Hablamos español.", blankWord: "sprechen", explanation: "Con wir, sprechen mantiene la forma del infinitivo." },
      { german: "Sie nimmt den Bus.", spanish: "Ella toma el autobús.", blankWord: "nimmt", explanation: "nehmen cambia e → i con sie: sie nimmt." },
    ] satisfies Phrase[],
  },
  {
    id: "g-orden-v2",
    slug: "orden-v2",
    title: "Orden de palabras y verbo en segunda posición",
    summary: "Forma frases principales, preguntas y subordinadas sencillas.",
    order: 4,
    explanation: `En una oración principal, el verbo conjugado ocupa la segunda posición. La primera posición puede ser el sujeto o una expresión de tiempo o lugar.

## El verbo en segunda posición (V2)

| Primera posición | Verbo | Resto |
| Heute | lerne | ich Deutsch. |
| Am Montag | fährt | Anna nach Berlin. |

- En preguntas de sí o no, el verbo va primero: Arbeitest du heute?
- En preguntas con palabra interrogativa, la palabra interrogativa va primero y el verbo después: Wo wohnst du?
- Después de weil o dass, el verbo conjugado va al final: ..., weil ich krank bin.`,
    phrases: [
      { german: "Heute lerne ich Deutsch.", spanish: "Hoy estudio alemán.", spanishAlt: ["Estudio alemán hoy."], blankWord: "lerne", explanation: "Heute es el primer elemento y lerne ocupa la segunda posición." },
      { german: "Am Montag fährt Anna nach Berlin.", spanish: "El lunes Anna viaja a Berlín.", spanishAlt: ["Anna viaja a Berlín el lunes."], blankWord: "Montag", explanation: "Am Montag ocupa la primera posición; fährt va en segunda." },
      { german: "Wo wohnst du?", spanish: "¿Dónde vives?", blankWord: "wohnst", explanation: "En preguntas con wo, el verbo conjugado va después de la palabra interrogativa." },
      { german: "Arbeitest du heute?", spanish: "¿Trabajas hoy?", blankWord: "Arbeitest", explanation: "En preguntas de sí o no, el verbo conjugado va primero." },
      { german: "Ich bleibe zu Hause, weil ich krank bin.", spanish: "Me quedo en casa porque estoy enfermo.", blankWord: "bin", explanation: "En la subordinada con weil, el verbo bin va al final." },
      { german: "Ich glaube, dass er heute kommt.", spanish: "Creo que él viene hoy.", blankWord: "kommt", explanation: "En la subordinada con dass, kommt va al final." },
    ] satisfies Phrase[],
  },
  {
    id: "g-preposiciones",
    slug: "preposiciones",
    title: "Preposiciones y casos",
    summary: "Distingue las preposiciones que rigen acusativo y dativo.",
    order: 5,
    explanation: `Algunas preposiciones siempre rigen acusativo, otras dativo. Las preposiciones de doble caso usan acusativo para movimiento hacia un destino y dativo para ubicación.

## Preposiciones frecuentes

| Caso | Preposiciones |
| Acusativo | durch, für, gegen, ohne, um |
| Dativo | aus, bei, mit, nach, seit, von, zu |
| Doble caso | an, auf, hinter, in, neben, über, unter, vor, zwischen |

- Ich gehe in den Park: movimiento hacia el parque, acusativo.
- Ich bin im Park: ubicación en el parque, dativo.
- mit dem Bus; für meinen Bruder; aus der Stadt.`,
    phrases: [
      { german: "Wir gehen durch den Park.", spanish: "Caminamos por el parque.", blankWord: "durch", explanation: "durch siempre rige acusativo: durch den Park." },
      { german: "Das Geschenk ist für meinen Bruder.", spanish: "El regalo es para mi hermano.", spanishAlt: ["El obsequio es para mi hermano."], blankWord: "für", explanation: "für siempre rige acusativo: für meinen Bruder." },
      { german: "Er fährt ohne seinen Bruder.", spanish: "Él viaja sin su hermano.", blankWord: "ohne", explanation: "ohne rige acusativo: ohne seinen Bruder." },
      { german: "Ich fahre mit dem Bus.", spanish: "Voy en autobús.", blankWord: "mit", explanation: "mit siempre rige dativo: mit dem Bus." },
      { german: "Sie kommt aus der Schweiz.", spanish: "Ella viene de Suiza.", blankWord: "aus", explanation: "aus siempre rige dativo: aus der Schweiz." },
      { german: "Das Buch liegt auf dem Tisch.", spanish: "El libro está sobre la mesa.", blankWord: "liegt", explanation: "auf expresa ubicación y lleva dativo: auf dem Tisch." },
    ] satisfies Phrase[],
  },
  {
    id: "g-adjetivos",
    slug: "adjetivos",
    title: "Adjetivos y terminaciones",
    summary: "Practica adjetivos con artículos definidos, indefinidos y sin artículo.",
    order: 6,
    explanation: `Cuando un adjetivo va delante de un sustantivo, su terminación depende del género, el caso y el artículo. Después de sein, el adjetivo no cambia: Das Kind ist klein.

## Nominativo y acusativo

| Forma | Masculino | Femenino | Neutro |
| Artículo definido, nominativo | der kleine Hund | die kleine Katze | das kleine Kind |
| Artículo definido, acusativo | den kleinen Hund | die kleine Katze | das kleine Kind |
| ein, nominativo | ein kleiner Hund | eine kleine Katze | ein kleines Kind |
| ein, acusativo | einen kleinen Hund | eine kleine Katze | ein kleines Kind |

- Con artículo definido, la terminación es normalmente -e; en acusativo masculino es -en.
- Con ein, el adjetivo indica la terminación que no muestra el artículo.
- Sin artículo: kalter Kaffee, frische Milch, kaltes Wasser.`,
    phrases: [
      { german: "Der kleine Hund schläft.", spanish: "El perro pequeño duerme.", spanishAlt: ["El perro pequeño está durmiendo."], blankWord: "kleine", explanation: "Con artículo definido masculino en nominativo, el adjetivo termina en -e." },
      { german: "Die kleine Katze ist müde.", spanish: "La gata pequeña está cansada.", spanishAlt: ["La pequeña gata está cansada."], blankWord: "kleine", explanation: "Con die en nominativo femenino, el adjetivo termina en -e." },
      { german: "Das kleine Kind spielt.", spanish: "El niño pequeño juega.", blankWord: "kleine", explanation: "Con das en nominativo neutro, el adjetivo termina en -e." },
      { german: "Ich sehe den kleinen Hund.", spanish: "Veo al perro pequeño.", blankWord: "kleinen", explanation: "En acusativo masculino con den, el adjetivo termina en -en." },
      { german: "Ein rotes Auto ist schnell.", spanish: "Un coche rojo es rápido.", blankWord: "rotes", explanation: "Con ein y un sustantivo neutro en nominativo, el adjetivo termina en -es." },
      { german: "Frisches Brot schmeckt gut.", spanish: "El pan fresco está rico.", blankWord: "Frisches", explanation: "Sin artículo, el adjetivo neutro en nominativo lleva la terminación fuerte -es." },
    ] satisfies Phrase[],
  },
];

export const grammarTopics = topics.map(({ phrases, ...topic }) => ({
  ...topic,
  cefrLevel: "A1",
  exercises: createExercises(topic.id, phrases),
}));

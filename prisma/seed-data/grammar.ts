import { createExercises, type Phrase } from "./units";
import type { CefrLevel } from "../../src/lib/levels";

const topics = [
  {
    id: "g-articulos",
    slug: "articulos",
    cefrLevel: "A1",
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
    cefrLevel: "A2",
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
    cefrLevel: "A1",
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
    cefrLevel: "A1",
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
    cefrLevel: "A2",
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
    cefrLevel: "A2",
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
  {
    id: "g-negacion",
    slug: "negacion",
    title: "Negación: nicht y kein",
    summary: "Aprende cuándo negar con nicht y cuándo usar kein o keine.",
    order: 7,
    cefrLevel: "A1",
    explanation: `En alemán, nicht y kein sirven para negar partes distintas de la oración. La posición de nicht depende de qué elemento se niega.

## Nicht y kein

| Forma | Uso | Ejemplo |
| nicht | Niega verbos, adjetivos o información concreta | Ich komme heute nicht. |
| kein | Niega un sustantivo con artículo indefinido o sin artículo | Ich habe keinen Bruder. |

- kein se declina como ein: kein Buch, keine Tasche, keinen Hund.
- nicht suele ir antes del elemento que niega o al final de la oración.`,
    phrases: [
      { german: "Ich komme heute nicht.", spanish: "Hoy no vengo.", blankWord: "nicht", explanation: "nicht niega la acción de venir." },
      { german: "Sie hat keinen Hund.", spanish: "Ella no tiene perro.", blankWord: "keinen", explanation: "kein niega el sustantivo masculino Hund en acusativo." },
      { german: "Das Essen ist nicht warm.", spanish: "La comida no está caliente.", blankWord: "warm", explanation: "nicht aparece antes del adjetivo que niega." },
      { german: "Heute kommt Paul nicht.", spanish: "Hoy Paul no viene.", blankWord: "Paul", explanation: "El verbo conjugado ocupa la segunda posición y nicht queda al final." },
      { german: "Wir haben keine Zeit.", spanish: "No tenemos tiempo.", blankWord: "keine", explanation: "keine niega el sustantivo femenino Zeit." },
      { german: "Er spricht nicht langsam.", spanish: "Él no habla despacio.", blankWord: "langsam", explanation: "nicht niega el adverbio langsam." },
    ] satisfies Phrase[],
  },
  {
    id: "g-verbos-modales",
    slug: "verbos-modales",
    title: "Verbos modales",
    summary: "Expresa capacidad, obligación, deseo, permiso y consejos.",
    order: 8,
    cefrLevel: "A1",
    explanation: `Los verbos modales se conjugan y acompañan a otro verbo en infinitivo. El infinitivo va al final de la oración.

## Modales frecuentes

| Modal | Significado | Ejemplo |
| können | poder, saber hacer | Ich kann schwimmen. |
| müssen, wollen | tener que, querer | Wir müssen lernen. |
| dürfen, sollen, möchten | permiso, recomendación, deseo cortés | Du darfst gehen. |

- El modal conjugado ocupa la segunda posición.
- El verbo principal aparece en infinitivo al final.`,
    phrases: [
      { german: "Ich kann gut schwimmen.", spanish: "Sé nadar bien.", blankWord: "kann", explanation: "können expresa capacidad y se conjuga como kann con ich." },
      { german: "Du musst heute arbeiten.", spanish: "Tienes que trabajar hoy.", blankWord: "musst", explanation: "müssen expresa obligación y se conjuga musst con du." },
      { german: "Wir wollen einen Film sehen.", spanish: "Queremos ver una película.", blankWord: "wollen", explanation: "wollen expresa deseo y acompaña al infinitivo sehen." },
      { german: "Morgen darf ich länger schlafen.", spanish: "Mañana puedo dormir más tiempo.", blankWord: "länger", explanation: "El modal conjugado ocupa la segunda posición y schlafen va al final." },
      { german: "Ihr sollt leise sein.", spanish: "Debéis estar en silencio.", blankWord: "sollt", explanation: "sollen expresa una indicación y va con el infinitivo sein." },
      { german: "Möchten Sie einen Kaffee trinken?", spanish: "¿Le gustaría tomar un café?", blankWord: "Kaffee", explanation: "möchten expresa un deseo cortés y el infinitivo trinken queda al final." },
    ] satisfies Phrase[],
  },
  {
    id: "g-verbos-separables",
    slug: "verbos-separables",
    title: "Verbos separables",
    summary: "Coloca el prefijo separable al final de las oraciones principales.",
    order: 9,
    cefrLevel: "A1",
    explanation: `Algunos verbos alemanes tienen un prefijo que se separa en las oraciones principales. El verbo se conjuga y el prefijo ocupa el final.

## Verbos frecuentes

| Infinitivo | Significado | Oración |
| anrufen | llamar por teléfono | Ich rufe dich an. |
| aufstehen | levantarse | Wir stehen früh auf. |
| einkaufen, mitkommen | hacer la compra, venir con alguien | Er kauft heute ein. |

- En el infinitivo y con un modal, el verbo permanece unido: aufstehen, aufstehen können.
- En una pregunta de sí o no, el prefijo también queda al final.`,
    phrases: [
      { german: "Ich rufe meine Mutter an.", spanish: "Llamo a mi madre.", blankWord: "rufe", explanation: "anrufen se separa: el verbo conjugado rufe y el prefijo an." },
      { german: "Er steht um sieben Uhr auf.", spanish: "Él se levanta a las siete.", blankWord: "steht", explanation: "aufstehen coloca auf al final de la oración principal." },
      { german: "Wir kaufen am Samstag ein.", spanish: "Hacemos la compra el sábado.", blankWord: "kaufen", explanation: "einkaufen se separa en kaufen y el prefijo final ein." },
      { german: "Heute kommt meine Schwester mit.", spanish: "Hoy viene mi hermana con nosotros.", blankWord: "Schwester", explanation: "El verbo conjugado kommt va en segunda posición y mit queda al final." },
      { german: "Rufst du deinen Freund an?", spanish: "¿Llamas a tu amigo?", blankWord: "Freund", explanation: "En esta pregunta, an es el prefijo separable de anrufen." },
      { german: "Sie möchte früh aufstehen.", spanish: "Ella quiere levantarse temprano.", blankWord: "möchte", explanation: "Con el modal möchte, aufstehen permanece unido en infinitivo." },
    ] satisfies Phrase[],
  },
  {
    id: "g-perfekt",
    slug: "perfekt",
    title: "Perfekt: pasado conversacional",
    summary: "Forma el pasado con haben o sein y el Partizip II.",
    order: 10,
    cefrLevel: "A2",
    explanation: `El Perfekt es el pasado más usado en la conversación. Se forma con haben o sein conjugado y el participio al final.

## Formación del participio

| Tipo de verbo | Formación frecuente | Ejemplo |
| Regular | ge- + raíz + -t | gemacht |
| Irregular | forma propia | gesehen |
| Separable | prefijo + ge- + raíz | eingekauft |

- La mayoría de los verbos usan haben; los verbos de movimiento suelen usar sein.
- Con prefijos inseparables como be-, el participio no lleva ge-: besucht.`,
    phrases: [
      { german: "Ich habe gestern gekocht.", spanish: "Ayer cociné.", blankWord: "gekocht", explanation: "kochen forma el participio regular gekocht con haben." },
      { german: "Sie ist nach Hause gefahren.", spanish: "Ella ha ido a casa.", blankWord: "gefahren", explanation: "fahren expresa desplazamiento y suele formar el Perfekt con sein." },
      { german: "Wir haben den Film gesehen.", spanish: "Hemos visto la película.", blankWord: "gesehen", explanation: "sehen tiene el participio irregular gesehen y usa haben." },
      { german: "Am Wochenende hat er seine Freunde besucht.", spanish: "El fin de semana visitó a sus amigos.", blankWord: "Wochenende", explanation: "En Perfekt, hat ocupa la segunda posición y besucht va al final." },
      { german: "Meine Eltern haben im Supermarkt eingekauft.", spanish: "Mis padres han hecho la compra en el supermercado.", blankWord: "eingekauft", explanation: "einkaufen es separable y su participio es eingekauft." },
      { german: "Er hat seine Tante angerufen.", spanish: "Él ha llamado a su tía.", blankWord: "angerufen", explanation: "anrufen forma el participio separable angerufen, con el prefijo antes de ge." },
    ] satisfies Phrase[],
  },
  {
    id: "g-comparativo-superlativo",
    slug: "comparativo-superlativo",
    title: "Comparativo y superlativo",
    summary: "Compara personas y cosas con als, wie y formas irregulares.",
    order: 11,
    cefrLevel: "A2",
    explanation: `El comparativo permite expresar diferencias y el superlativo destaca el grado máximo. Algunas formas frecuentes son irregulares.

## Formas de comparación

| Grado | Forma | Ejemplo |
| Comparativo | adjetivo + -er + als | Der Zug ist schneller als der Bus. |
| Igualdad | so … wie | Sie ist so groß wie ich. |
| Superlativo | am + adjetivo + -sten | Er läuft am schnellsten. |

- gut se convierte en besser y am besten.
- gern expresa gusto; lieber y am liebsten comparan preferencias.`,
    phrases: [
      { german: "Der Zug ist schneller als der Bus.", spanish: "El tren es más rápido que el autobús.", blankWord: "schneller", explanation: "El comparativo schneller se combina con als para marcar diferencia." },
      { german: "Mia ist so groß wie ihre Schwester.", spanish: "Mia es tan alta como su hermana.", blankWord: "groß", explanation: "so … wie expresa igualdad entre Mia y su hermana." },
      { german: "Heute läuft er am schnellsten.", spanish: "Hoy es él quien corre más rápido.", blankWord: "schnellsten", explanation: "am schnellsten es la forma superlativa adverbial." },
      { german: "Mein Bruder spielt besser als ich.", spanish: "Mi hermano juega mejor que yo.", blankWord: "Bruder", explanation: "besser es el comparativo irregular de gut." },
      { german: "Am liebsten esse ich Gemüse.", spanish: "Lo que más me gusta comer son verduras.", blankWord: "Gemüse", explanation: "am liebsten expresa la preferencia máxima." },
      { german: "Ich trinke lieber Tee als Kaffee.", spanish: "Prefiero tomar té antes que café.", blankWord: "lieber", explanation: "lieber compara preferencias y significa «con más gusto»." },
    ] satisfies Phrase[],
  },
  {
    id: "g-verbos-reflexivos",
    slug: "verbos-reflexivos",
    title: "Verbos reflexivos",
    summary: "Usa pronombres reflexivos en acusativo y dativo.",
    order: 12,
    cefrLevel: "A2",
    explanation: `Los verbos reflexivos llevan un pronombre que se refiere al sujeto. El pronombre suele ir en acusativo, pero algunos verbos usan dativo.

## Pronombres reflexivos

| Persona | Acusativo | Dativo |
| ich | mich | mir |
| du | dich | dir |
| er/sie | sich | sich |
| wir/ihr/sie | uns/euch/sich | uns/euch/sich |

- sich waschen suele llevar acusativo: Ich wasche mich.
- Con otra parte del cuerpo como objeto, se usa dativo: Ich wasche mir die Hände.
- sich freuen auf indica ilusión por algo futuro.`,
    phrases: [
      { german: "Ich wasche mich jeden Morgen.", spanish: "Me lavo todas las mañanas.", blankWord: "mich", explanation: "sich waschen lleva el pronombre reflexivo en acusativo: mich." },
      { german: "Du freust dich auf den Urlaub.", spanish: "Te hacen ilusión las vacaciones.", blankWord: "freust", explanation: "sich freuen auf expresa ilusión por algo futuro." },
      { german: "Er zieht sich schnell an.", spanish: "Él se viste rápido.", blankWord: "schnell", explanation: "sich anziehen es un verbo reflexivo separable." },
      { german: "Nach dem Sport duscht sie sich.", spanish: "Después de hacer deporte, ella se ducha.", blankWord: "Sport", explanation: "El pronombre reflexivo sich acompaña a duschen." },
      { german: "Wir putzen uns die Zähne.", spanish: "Nos cepillamos los dientes.", blankWord: "Zähne", explanation: "El pronombre uns es dativo porque die Zähne ya es el objeto directo." },
      { german: "Ihr interessiert euch für Musik.", spanish: "Os interesa la música.", blankWord: "Musik", explanation: "sich interessieren für usa el pronombre euch con ihr." },
    ] satisfies Phrase[],
  },
  {
    id: "g-subordinadas",
    slug: "subordinadas",
    title: "Oraciones subordinadas",
    summary: "Coloca el verbo al final con weil, dass, wenn, obwohl y ob.",
    order: 13,
    cefrLevel: "B1.1",
    explanation: `Las conjunciones subordinantes introducen una oración cuyo verbo conjugado aparece al final. Si la subordinada va primero, la oración principal empieza directamente con el verbo.

## Conjunciones

| Conjunción | Significado | Ejemplo |
| weil | porque | Ich bleibe, weil es regnet. |
| dass, ob | que, si (pregunta indirecta) | Sie sagt, dass sie kommt. |
| wenn, obwohl | cuando/si, aunque | Obwohl er müde ist, arbeitet er. |

- Después de la subordinada inicial, el verbo principal aparece antes del sujeto: Wenn es regnet, bleiben wir zu Hause.`,
    phrases: [
      { german: "Ich bleibe zu Hause, weil ich krank bin.", spanish: "Me quedo en casa porque estoy enfermo.", blankWord: "krank", explanation: "Con weil, el verbo bin va al final de la subordinada." },
      { german: "Sie glaubt, dass der Zug pünktlich kommt.", spanish: "Ella cree que el tren llega puntual.", blankWord: "pünktlich", explanation: "dass introduce una subordinada con kommt al final." },
      { german: "Er fragt, ob du morgen Zeit hast.", spanish: "Él pregunta si tienes tiempo mañana.", blankWord: "morgen", explanation: "ob introduce una pregunta indirecta; hast cierra la subordinada." },
      { german: "Wenn der Unterricht endet, fahren wir nach Hause.", spanish: "Cuando termina la clase, nos vamos a casa.", blankWord: "Unterricht", explanation: "La subordinada inicial termina en endet y el verbo principal fahren va delante del sujeto." },
      { german: "Obwohl sie wenig Zeit hat, hilft sie uns.", spanish: "Aunque tiene poco tiempo, nos ayuda.", blankWord: "wenig", explanation: "obwohl lleva hat al final y provoca inversión en la oración principal." },
      { german: "Wir warten, bis der Bus kommt.", spanish: "Esperamos hasta que llegue el autobús.", blankWord: "Bus", explanation: "En la subordinada introducida por bis, kommt aparece al final." },
    ] satisfies Phrase[],
  },
  {
    id: "g-praeteritum",
    slug: "praeteritum",
    title: "Präteritum",
    summary: "Cuenta hechos pasados con formas frecuentes y verbos modales.",
    order: 14,
    cefrLevel: "B1.1",
    explanation: `El Präteritum es habitual en textos escritos y se usa mucho con sein, haben y los verbos modales. Los regulares suelen añadir -te.

## Formas en pasado

| Infinitivo | Präteritum | Ejemplo |
| sein, haben | war, hatte | Ich war zu Hause. |
| lernen | lernte | Wir lernten Deutsch. |
| können, müssen | konnte, musste | Er konnte nicht kommen. |

- Muchas formas irregulares cambian la vocal: gehen → ging, sehen → sah.
- En conversación, sein y haben también aparecen con frecuencia en Präteritum.`,
    phrases: [
      { german: "Als Kind war ich sehr schüchtern.", spanish: "De niño era muy tímido.", blankWord: "schüchtern", explanation: "war es el Präteritum irregular de sein." },
      { german: "Sie hatte gestern keine Zeit.", spanish: "Ayer no tuvo tiempo.", blankWord: "gestern", explanation: "hatte es el Präteritum de haben." },
      { german: "Wir lernten in der Schule Französisch.", spanish: "Aprendíamos francés en el colegio.", blankWord: "Französisch", explanation: "lernen es regular en Präteritum: ich lernte, wir lernten." },
      { german: "Letzte Woche konnte mein Bruder nicht kommen.", spanish: "La semana pasada mi hermano no pudo venir.", blankWord: "Woche", explanation: "konnte es el Präteritum modal de können; kommen queda en infinitivo al final." },
      { german: "Der Zug fuhr um acht Uhr ab.", spanish: "El tren salió a las ocho.", blankWord: "fuhr", explanation: "fuhr es el Präteritum irregular de fahren." },
      { german: "Ich musste lange auf den Arzt warten.", spanish: "Tuve que esperar mucho al médico.", blankWord: "lange", explanation: "musste es el pasado de müssen y warten permanece en infinitivo." },
    ] satisfies Phrase[],
  },
  {
    id: "g-infinitivo-zu",
    slug: "infinitivo-zu",
    title: "Infinitivo con zu",
    summary: "Expresa propósitos y acciones relacionadas con zu y um…zu.",
    order: 15,
    cefrLevel: "B1.1",
    explanation: `El infinitivo con zu completa ciertas expresiones y verbos. Para indicar un propósito con el mismo sujeto, se usa um … zu.

## Estructuras con zu

| Estructura | Uso | Ejemplo |
| zu + infinitivo | Acción complementaria | Ich hoffe, dich zu sehen. |
| um … zu | Propósito | Sie lernt, um die Prüfung zu bestehen. |
| ohne … zu, statt … zu | Sin hacer, en vez de hacer | Er ging, ohne sich zu verabschieden. |

- En verbos separables, zu se intercala: aufzustehen.
- Tras verbos modales no se usa zu: Ich kann schwimmen.`,
    phrases: [
      { german: "Ich hoffe, dich bald zu sehen.", spanish: "Espero verte pronto.", blankWord: "hoffe", explanation: "hoffen puede ir seguido de zu más infinitivo." },
      { german: "Sie lernt jeden Abend, um die Prüfung zu bestehen.", spanish: "Estudia todas las noches para aprobar el examen.", blankWord: "Prüfung", explanation: "um … zu expresa el propósito de estudiar." },
      { german: "Er ging, ohne sich zu verabschieden.", spanish: "Se fue sin despedirse.", blankWord: "verabschieden", explanation: "ohne … zu expresa una acción que no se realiza." },
      { german: "Um Geld zu sparen, fährt sie mit dem Bus.", spanish: "Para ahorrar dinero, ella va en autobús.", blankWord: "Geld", explanation: "La frase de propósito inicial precede a la oración principal." },
      { german: "Statt lange zu warten, rief ich ein Taxi.", spanish: "En vez de esperar mucho, llamé a un taxi.", blankWord: "warten", explanation: "statt … zu introduce una alternativa a esperar." },
      { german: "Er versucht, früh aufzustehen.", spanish: "Intenta levantarse temprano.", blankWord: "aufzustehen", explanation: "En el verbo separable aufstehen, zu se intercala: aufzustehen." },
    ] satisfies Phrase[],
  },
  {
    id: "g-verbos-preposicion",
    slug: "verbos-preposicion",
    title: "Verbos con preposición",
    summary: "Aprende las preposiciones fijas y sus formas da- y wo-.",
    order: 16,
    cefrLevel: "B1.1",
    explanation: `Muchos verbos alemanes requieren una preposición fija. Para referirse a cosas se forman compuestos con da(r)-; para preguntar por ellas se usa wo(r)-.

## Compuestos frecuentes

| Verbo | Preposición | Ejemplo |
| warten | auf | Ich warte auf den Bus. |
| denken | an | Sie denkt an ihre Reise. |
| sich interessieren | für | Er interessiert sich für Kunst. |

- darauf significa «en ello» y worauf significa «¿en qué?».
- Se usa dar-/war- antes de una preposición que empieza por vocal: daran, woran.`,
    phrases: [
      { german: "Wir warten auf den nächsten Zug.", spanish: "Esperamos al siguiente tren.", blankWord: "nächsten", explanation: "warten requiere la preposición auf." },
      { german: "Denkst du oft an deine Familie?", spanish: "¿Piensas a menudo en tu familia?", blankWord: "Familie", explanation: "denken se construye con an." },
      { german: "Lena interessiert sich für moderne Kunst.", spanish: "A Lena le interesa el arte moderno.", blankWord: "moderne", explanation: "sich interessieren requiere für." },
      { german: "Darauf freue ich mich schon lange.", spanish: "Hace tiempo que tengo ganas de eso.", blankWord: "lange", explanation: "darauf sustituye a auf más una cosa y ocupa el primer lugar." },
      { german: "Worauf wartest du vor dem Kino?", spanish: "¿Qué esperas delante del cine?", blankWord: "Kino", explanation: "worauf pregunta por el complemento de warten auf." },
      { german: "Sie denkt an ihren ersten Schultag.", spanish: "Ella piensa en su primer día de colegio.", blankWord: "ersten", explanation: "an acompaña al verbo denken en esta expresión." },
    ] satisfies Phrase[],
  },
  {
    id: "g-voz-pasiva",
    slug: "voz-pasiva",
    title: "Voz pasiva",
    summary: "Forma el pasivo en presente y Präteritum con werden.",
    order: 17,
    cefrLevel: "B1.2",
    explanation: `La voz pasiva destaca la acción o su resultado, no quién la realiza. Se forma con werden conjugado y el Partizip II.

## Pasiva de proceso

| Tiempo | Formación | Ejemplo |
| Presente | werden + Partizip II | Das Haus wird gebaut. |
| Präteritum | wurde(n) + Partizip II | Die Straße wurde repariert. |
| Agente | von + dativo | Der Brief wird von der Ärztin geschrieben. |

- El participio aparece al final.
- werden se conjuga según el sujeto de la oración pasiva.`,
    phrases: [
      { german: "Das Museum wird renoviert.", spanish: "El museo está siendo renovado.", blankWord: "renoviert", explanation: "La pasiva presente se forma con wird y el participio renoviert." },
      { german: "Die Straße wurde gestern gesperrt.", spanish: "Ayer se cerró la calle.", blankWord: "gesperrt", explanation: "wurde más participio forma el pasivo en Präteritum." },
      { german: "Der Brief wird von der Ärztin geschrieben.", spanish: "La carta es escrita por la médica.", blankWord: "Ärztin", explanation: "El agente se introduce con von más dativo." },
      { german: "In dieser Fabrik werden Fahrräder hergestellt.", spanish: "En esta fábrica se fabrican bicicletas.", blankWord: "Fabrik", explanation: "El sujeto plural Fahrräder requiere werden." },
      { german: "Das alte Rathaus wurde im Jahr 1900 eröffnet.", spanish: "El antiguo ayuntamiento se inauguró en 1900.", blankWord: "eröffnet", explanation: "wurde eröffnet forma el pasivo en pasado." },
      { german: "Die Brücke wird von vielen Touristen fotografiert.", spanish: "El puente es fotografiado por muchos turistas.", spanishAlt: ["Muchos turistas fotografían el puente."], blankWord: "Touristen", explanation: "von vielen Touristen expresa el agente en dativo plural." },
    ] satisfies Phrase[],
  },
  {
    id: "g-oraciones-relativas",
    slug: "oraciones-relativas",
    title: "Oraciones de relativo",
    summary: "Describe personas y cosas con pronombres relativos y verbo final.",
    order: 18,
    cefrLevel: "B1.2",
    explanation: `Las oraciones de relativo añaden información sobre un sustantivo. El pronombre concuerda en género y número con ese sustantivo, mientras que el caso depende de su función en la subordinada.

## Pronombres relativos

| Caso | Masculino | Femenino | Neutro | Plural |
| Nominativo | der | die | das | die |
| Acusativo | den | die | das | die |
| Dativo | dem | der | dem | denen |

- El verbo conjugado va al final de la oración relativa.
- Las formas del relativo se parecen a las de los artículos definidos.`,
    phrases: [
      { german: "Der Mann, der nebenan wohnt, ist Arzt.", spanish: "El hombre que vive al lado es médico.", blankWord: "nebenan", explanation: "der es nominativo porque funciona como sujeto de wohnt." },
      { german: "Das Buch, das ich gerade lese, ist spannend.", spanish: "El libro que estoy leyendo ahora es emocionante.", blankWord: "spannend", explanation: "das es acusativo y objeto directo de lese; el verbo va al final." },
      { german: "Die Frau, der ich geholfen habe, wohnt hier.", spanish: "La mujer a la que he ayudado vive aquí.", blankWord: "geholfen", explanation: "der es dativo porque helfen rige dativo." },
      { german: "Der Kollege, den du gestern getroffen hast, arbeitet hier.", spanish: "El compañero al que viste ayer trabaja aquí.", blankWord: "Kollege", explanation: "La relativa den du … hast termina con el verbo auxiliar hast." },
      { german: "Das Kind, dem wir ein Geschenk geben, ist mein Neffe.", spanish: "El niño al que damos un regalo es mi sobrino.", blankWord: "Geschenk", explanation: "dem es dativo, el destinatario de geben." },
      { german: "Die Nachbarn, die im dritten Stock wohnen, sind freundlich.", spanish: "Los vecinos que viven en la tercera planta son amables.", blankWord: "dritten", explanation: "die es nominativo plural; wohnen queda al final de la relativa." },
    ] satisfies Phrase[],
  },
  {
    id: "g-genitivo",
    slug: "genitivo",
    title: "Genitivo",
    summary: "Expresa posesión con des, der y las terminaciones -s o -es.",
    order: 19,
    cefrLevel: "B1.2",
    explanation: `El genitivo expresa pertenencia y responde a la pregunta wessen? («¿de quién?»). Los artículos y, a menudo, los sustantivos masculinos y neutros cambian.

## Artículos y nombres

| Género | Artículo | Ejemplo |
| Masculino | des | das Auto des Mannes |
| Neutro | des | die Tür des Hauses |
| Femenino, plural | der | die Tasche der Frau |

- Los sustantivos masculinos y neutros añaden -s o -es: des Kindes, des Tages.
- wessen? pregunta por el poseedor.`,
    phrases: [
      { german: "Das ist das Fahrrad des Nachbarn.", spanish: "Esta es la bicicleta del vecino.", blankWord: "Nachbarn", explanation: "des marca el genitivo masculino y el sustantivo muestra la terminación -n." },
      { german: "Die Fenster des Hauses sind offen.", spanish: "Las ventanas de la casa están abiertas.", blankWord: "Fenster", explanation: "des Hauses es genitivo neutro con terminación -es." },
      { german: "Die Farbe der Jacke gefällt mir.", spanish: "Me gusta el color de la chaqueta.", blankWord: "Jacke", explanation: "der introduce el genitivo femenino." },
      { german: "Wegen des starken Regens fiel das Spiel aus.", spanish: "A causa de la lluvia intensa, se canceló el partido.", blankWord: "starken", explanation: "des starken Regens es un grupo en genitivo masculino." },
      { german: "Der Titel des Buches steht auf dem Umschlag.", spanish: "El título del libro aparece en la cubierta.", blankWord: "Umschlag", explanation: "des Buches expresa posesión en genitivo neutro." },
      { german: "Wessen Schlüssel liegen auf dem Tisch?", spanish: "¿De quién son las llaves que están sobre la mesa?", blankWord: "Schlüssel", explanation: "wessen pregunta por el poseedor en genitivo." },
    ] satisfies Phrase[],
  },
  {
    id: "g-plusquamperfekt",
    slug: "plusquamperfekt",
    title: "Plusquamperfekt",
    summary: "Sitúa una acción anterior a otra acción pasada.",
    order: 20,
    cefrLevel: "B1.2",
    explanation: `El Plusquamperfekt expresa una acción que ya había ocurrido antes de otro momento pasado. Se forma con hatte o war y el Partizip II.

## Formación y secuencia

| Auxiliar | Uso | Ejemplo |
| hatte | La mayoría de los verbos | Sie hatte schon gegessen. |
| war | Movimiento o cambio de estado | Er war früh aufgestanden. |
| nachdem | Acción anterior | Nachdem sie gegessen hatte, ging sie spazieren. |

- El participio va al final de la oración.
- En una subordinada con nachdem, el auxiliar conjugado queda al final.`,
    phrases: [
      { german: "Ich hatte die E-Mail schon gelesen.", spanish: "Ya había leído el correo electrónico.", blankWord: "E-Mail", explanation: "hatte gelesen forma el Plusquamperfekt de lesen." },
      { german: "Nachdem wir gegessen hatten, gingen wir spazieren.", spanish: "Después de haber comido, fuimos a pasear.", blankWord: "spazieren", explanation: "La subordinada con nachdem expresa la acción anterior." },
      { german: "Der Zug war bereits abgefahren.", spanish: "El tren ya había salido.", blankWord: "bereits", explanation: "abfahren forma el Plusquamperfekt con war." },
      { german: "Als sie ankam, hatte der Film schon begonnen.", spanish: "Cuando llegó, la película ya había empezado.", blankWord: "Film", explanation: "La acción de empezar el film ocurrió antes de que ella llegara." },
      { german: "Nachdem er die Tür abgeschlossen hatte, ging er los.", spanish: "Después de haber cerrado la puerta con llave, se marchó.", blankWord: "abgeschlossen", explanation: "El auxiliar hatte queda al final de la subordinada con nachdem." },
      { german: "Wir waren vor dem Frühstück aufgestanden.", spanish: "Nos habíamos levantado antes del desayuno.", blankWord: "Frühstück", explanation: "aufstehen forma el Plusquamperfekt con waren." },
    ] satisfies Phrase[],
  },
  {
    id: "g-konjunktiv-ii",
    slug: "konjunktiv-ii",
    title: "Konjunktiv II",
    summary: "Formula deseos, consejos y peticiones corteses o irreales.",
    order: 21,
    cefrLevel: "B2.1",
    explanation: `El Konjunktiv II expresa situaciones hipotéticas, deseos y peticiones corteses. Se usa würde más infinitivo y también formas frecuentes como wäre, hätte, könnte y sollte.

## Formas frecuentes

| Forma | Uso | Ejemplo |
| würde + infinitivo | Situación hipotética | Ich würde mehr reisen. |
| wäre, hätte | sein, haben | Wenn ich Zeit hätte, wäre ich dabei. |
| könnte, sollte | posibilidad, consejo | Du könntest früher anfangen. |

- En condiciones irreales con wenn, el verbo conjugado va al final.
- En la oración principal, el verbo ocupa la segunda posición.`,
    phrases: [
      { german: "Ich würde gern am Meer wohnen.", spanish: "Me gustaría vivir junto al mar.", blankWord: "gern", explanation: "würde wohnen expresa una situación hipotética o un deseo." },
      { german: "Wenn ich mehr Zeit hätte, würde ich dich besuchen.", spanish: "Si tuviera más tiempo, te visitaría.", blankWord: "Zeit", explanation: "hätte presenta una condición irreal y würde besuchen su resultado." },
      { german: "Es wäre schön, wenn du mitkommen könntest.", spanish: "Sería estupendo que pudieras venir con nosotros.", blankWord: "schön", explanation: "wäre y könntest son formas del Konjunktiv II." },
      { german: "An deiner Stelle würde ich den Arzt anrufen.", spanish: "En tu lugar, llamaría al médico.", blankWord: "Arzt", explanation: "würde anrufen ofrece un consejo hipotético." },
      { german: "Könnten Sie mir bitte helfen?", spanish: "¿Podría ayudarme, por favor?", blankWord: "bitte", explanation: "Könnten Sie formula una petición cortés." },
      { german: "Du solltest heute früher schlafen gehen.", spanish: "Deberías acostarte antes hoy.", blankWord: "früher", explanation: "solltest expresa un consejo en Konjunktiv II." },
    ] satisfies Phrase[],
  },
  {
    id: "g-konjunktiv-ii-pasado",
    slug: "konjunktiv-ii-pasado",
    title: "Konjunktiv II en pasado",
    summary: "Expresa arrepentimientos e hipótesis pasadas con doble infinitivo.",
    order: 22,
    cefrLevel: "B2.1",
    explanation: `El Konjunktiv II pasado describe algo que no ocurrió o que habría podido ocurrir. Se forma con hätte o wäre y el Partizip II.

## Acciones hipotéticas pasadas

| Tipo | Formación | Ejemplo |
| La mayoría de los verbos | hätte + Partizip II | Ich hätte mehr gelernt. |
| Movimiento o cambio | wäre + Partizip II | Sie wäre früher gekommen. |
| Con verbo modal | hätte + doble infinitivo | Er hätte helfen können. |

- Con verbos modales, se usan dos infinitivos en lugar del participio.
- La condición suele aparecer con wenn y el verbo al final.`,
    phrases: [
      { german: "Ich hätte einen früheren Zug genommen.", spanish: "Habría cogido un tren anterior.", blankWord: "Zug", explanation: "hätte genommen expresa una acción pasada hipotética." },
      { german: "Sie wäre gern länger geblieben.", spanish: "A ella le habría gustado quedarse más tiempo.", blankWord: "länger", explanation: "bleiben forma el pasado hipotético con wäre." },
      { german: "Wenn er früher losgefahren wäre, hätte er den Bus noch erwischt.", spanish: "Si hubiera salido antes, habría cogido el autobús.", blankWord: "erwischt", explanation: "La condición y el resultado usan el Konjunktiv II pasado." },
      { german: "Mit mehr Zeit hätte ich das Museum besucht.", spanish: "Con más tiempo, habría visitado el museo.", blankWord: "Museum", explanation: "hätte besucht presenta un resultado que no llegó a ocurrir." },
      { german: "Du hättest den Fehler vermeiden können.", spanish: "Podrías haber evitado el error.", blankWord: "Fehler", explanation: "Con el modal können se usa el doble infinitivo vermeiden können." },
      { german: "Er hätte seiner Schwester helfen sollen.", spanish: "Debería haber ayudado a su hermana.", blankWord: "Schwester", explanation: "hätte helfen sollen es la construcción de doble infinitivo con sollen." },
    ] satisfies Phrase[],
  },
  {
    id: "g-pasiva-modales",
    slug: "pasiva-modales",
    title: "Pasiva con modales y de estado",
    summary: "Combina pasiva y modales, y distingue proceso de estado.",
    order: 23,
    cefrLevel: "B2.1",
    explanation: `La pasiva puede combinarse con verbos modales para expresar obligación o posibilidad. La pasiva de estado usa sein y describe el resultado de una acción.

## Formas pasivas

| Construcción | Ejemplo | Significado |
| Modal + Partizip II + werden | Das Auto muss repariert werden. | Hay que reparar el coche. |
| Estado: sein + Partizip II | Die Tür ist geöffnet. | La puerta está abierta. |
| Perfekt de proceso | Das Haus ist gebaut worden. | Se ha construido la casa. |

- En la pasiva con modal, werden aparece en infinitivo al final.
- worden es la forma del participio usada con werden en el Perfekt pasivo.`,
    phrases: [
      { german: "Der Aufzug muss repariert werden.", spanish: "Hay que reparar el ascensor.", blankWord: "Aufzug", explanation: "muss repariert werden expresa obligación en pasiva." },
      { german: "Die Tür ist bereits geöffnet.", spanish: "La puerta ya está abierta.", blankWord: "bereits", explanation: "sein más el participio describe el estado de la puerta." },
      { german: "Das neue Rathaus ist im Mai eröffnet worden.", spanish: "El nuevo ayuntamiento se ha inaugurado en mayo.", blankWord: "Rathaus", explanation: "ist eröffnet worden forma el Perfekt de la pasiva de proceso." },
      { german: "Die Rechnung kann online bezahlt werden.", spanish: "La factura se puede pagar por internet.", blankWord: "online", explanation: "kann bezahlt werden combina el modal können con la pasiva." },
      { german: "Die Fenster sind wegen des Sturms geschlossen.", spanish: "Las ventanas están cerradas por la tormenta.", blankWord: "Sturms", explanation: "sind geschlossen expresa el estado resultante." },
      { german: "Der Vertrag musste gestern unterschrieben werden.", spanish: "Ayer hubo que firmar el contrato.", blankWord: "Vertrag", explanation: "musste unterschrieben werden es pasiva en pasado con un modal." },
    ] satisfies Phrase[],
  },
  {
    id: "g-conectores-temporales",
    slug: "conectores-temporales",
    title: "Conectores temporales",
    summary: "Ordena acontecimientos con als, wenn y otras conjunciones.",
    order: 24,
    cefrLevel: "B2.1",
    explanation: `Los conectores temporales indican cuándo ocurren los hechos y cuál es su orden. Algunos introducen subordinadas y colocan el verbo al final.

## Conectores de tiempo

| Conector | Uso | Ejemplo |
| als | Un hecho pasado único | Als ich ankam, war es dunkel. |
| wenn | Repetición, presente o futuro | Wenn ich Zeit habe, rufe ich an. |
| nachdem, bevor | Después de que, antes de que | Nachdem er gegessen hatte, ging er. |

- während indica simultaneidad; seit/seitdem, un inicio que continúa.
- sobald significa «en cuanto» y bis, «hasta que».`,
    phrases: [
      { german: "Als ich nach Berlin zog, kannte ich niemanden.", spanish: "Cuando me mudé a Berlín, no conocía a nadie.", blankWord: "niemanden", explanation: "als introduce un acontecimiento único y terminado en el pasado." },
      { german: "Wenn sie frei hat, besucht sie ihre Großeltern.", spanish: "Cuando tiene tiempo libre, visita a sus abuelos.", blankWord: "Großeltern", explanation: "wenn describe una situación repetida." },
      { german: "Nachdem der Zug abgefahren war, bemerkte ich meinen Fehler.", spanish: "Después de que saliera el tren, me di cuenta de mi error.", spanishAlt: ["Cuando el tren ya había salido, me di cuenta de mi error."], blankWord: "Fehler", explanation: "nachdem indica que el tren salió antes de que me diera cuenta del error." },
      { german: "Bevor du das Haus verlässt, schließe bitte die Fenster.", spanish: "Antes de salir de casa, cierra las ventanas, por favor.", blankWord: "Haus", explanation: "La subordinada con bevor va primero y el verbo principal aparece tras ella." },
      { german: "Während die Kinder draußen spielen, bereitet er das Abendessen vor.", spanish: "Mientras los niños juegan fuera, él prepara la cena.", blankWord: "Abendessen", explanation: "während expresa acciones simultáneas y el prefijo vor queda al final." },
      { german: "Sobald sie die Nachricht erhält, ruft sie uns an.", spanish: "En cuanto reciba el mensaje, nos llamará.", blankWord: "Nachricht", explanation: "sobald indica que la llamada ocurre inmediatamente después." },
    ] satisfies Phrase[],
  },
  {
    id: "g-conectores-dobles",
    slug: "conectores-dobles",
    title: "Conectores dobles",
    summary: "Une ideas con estructuras correlativas y je…desto.",
    order: 25,
    cefrLevel: "B2.2",
    explanation: `Los conectores dobles relacionan elementos equivalentes o contrastan dos ideas. Algunas estructuras modifican el orden de palabras.

## Estructuras frecuentes

| Conector | Significado | Ejemplo |
| nicht nur … sondern auch | no solo … sino también | Sie spricht nicht nur Deutsch, sondern auch Spanisch. |
| sowohl … als auch, weder … noch | tanto … como, ni … ni | Er mag sowohl Tee als auch Kaffee. |
| entweder … oder, zwar … aber | o … o, es cierto que … pero | Entweder fahren wir, oder wir bleiben. |

- En je … desto, cada parte compara dos cambios: Je länger, desto besser.
- zwar presenta un hecho que se matiza con aber.`,
    phrases: [
      { german: "Sie spricht nicht nur Deutsch, sondern auch Spanisch.", spanish: "No solo habla alemán, sino también español.", blankWord: "sondern", explanation: "nicht nur … sondern auch añade una segunda información equivalente." },
      { german: "Er trinkt sowohl Tee als auch Kaffee.", spanish: "Toma tanto té como café.", blankWord: "sowohl", explanation: "sowohl … als auch incluye ambas opciones." },
      { german: "Wir haben weder Brot noch Milch gekauft.", spanish: "No hemos comprado ni pan ni leche.", blankWord: "weder", explanation: "weder … noch niega los dos elementos." },
      { german: "Entweder nehmen wir den Bus, oder wir gehen zu Fuß.", spanish: "O cogemos el autobús o vamos a pie.", blankWord: "Bus", explanation: "entweder … oder presenta dos alternativas." },
      { german: "Je länger ich übe, desto sicherer spreche ich.", spanish: "Cuanto más practico, más seguro hablo.", blankWord: "sicherer", explanation: "je … desto correlaciona el aumento de la práctica y la seguridad." },
      { german: "Das Hotel ist zwar teuer, aber sehr zentral.", spanish: "Es cierto que el hotel es caro, pero está muy céntrico.", blankWord: "zentral", explanation: "zwar … aber introduce un contraste." },
    ] satisfies Phrase[],
  },
  {
    id: "g-nominalizacion",
    slug: "nominalizacion",
    title: "Nominalización y estilo nominal",
    summary: "Convierte acciones en sustantivos y reconoce expresiones nominales.",
    order: 26,
    cefrLevel: "B2.2",
    explanation: `El estilo nominal presenta acciones e ideas mediante sustantivos, algo habitual en textos formales. Los verbos pueden transformarse en nombres.

## De verbo a sustantivo

| Verbo | Sustantivo | Ejemplo |
| entscheiden | die Entscheidung | Die Entscheidung war schwierig. |
| lesen | das Lesen | Das Lesen macht mir Spaß. |
| teilnehmen | die Teilnahme | Bei der Teilnahme ist ein Ausweis nötig. |

- Los infinitivos nominalizados llevan artículo neutro y se escriben con mayúscula.
- Algunas preposiciones, como bei, nach y wegen, forman expresiones nominales frecuentes.`,
    phrases: [
      { german: "Die Entscheidung fiel uns nicht leicht.", spanish: "No nos resultó fácil tomar la decisión.", blankWord: "Entscheidung", explanation: "Entscheidung es el sustantivo derivado de entscheiden." },
      { german: "Das Lesen auf dem Balkon entspannt mich.", spanish: "Leer en el balcón me relaja.", blankWord: "Balkon", explanation: "Lesen es un infinitivo nominalizado, neutro y escrito con mayúscula." },
      { german: "Bei der Anmeldung brauchst du deinen Ausweis.", spanish: "Para inscribirte, necesitas tu documento de identidad.", blankWord: "Anmeldung", explanation: "Anmeldung convierte anmelden en un sustantivo." },
      { german: "Nach dem Essen gingen wir noch spazieren.", spanish: "Después de comer, aún salimos a pasear.", blankWord: "Essen", explanation: "Essen es un infinitivo nominalizado tras la preposición nach." },
      { german: "Wegen der Verspätung verpasste sie den Anschluss.", spanish: "Por el retraso, perdió el enlace.", blankWord: "Verspätung", explanation: "wegen introduce el grupo nominal der Verspätung." },
      { german: "Das regelmäßige Üben verbessert die Aussprache.", spanish: "La práctica regular mejora la pronunciación.", blankWord: "Aussprache", explanation: "Üben es un infinitivo nominalizado que funciona como sujeto." },
    ] satisfies Phrase[],
  },
  {
    id: "g-konjunktiv-i",
    slug: "konjunktiv-i",
    title: "Konjunktiv I: discurso indirecto",
    summary: "Reproduce declaraciones ajenas con formas de Konjunktiv I.",
    order: 27,
    cefrLevel: "B2.2",
    explanation: `El Konjunktiv I se usa sobre todo en el discurso indirecto, especialmente en noticias y textos formales. Permite transmitir una declaración sin presentarla como propia.

## Formas frecuentes

| Infinitivo | Konjunktiv I, er/sie | Ejemplo |
| sein, haben | sei, habe | Er sagt, er sei müde. |
| kommen | komme | Sie erklärt, sie komme später. |
| Formas iguales al indicativo (sie haben) | Sustitución por Konjunktiv II | Sie sagen, sie hätten Zeit. |

- El verbo de la declaración indirecta ocupa el final si la frase se introduce con dass.
- Si Konjunktiv I coincide con el indicativo, a menudo se usa Konjunktiv II para mayor claridad.`,
    phrases: [
      { german: "Er sagt, er sei heute krank.", spanish: "Dice que hoy está enfermo.", blankWord: "krank", explanation: "sei es el Konjunktiv I de sein en discurso indirecto." },
      { german: "Die Sprecherin erklärt, sie habe keine Fragen.", spanish: "La portavoz explica que no tiene preguntas.", blankWord: "Sprecherin", explanation: "habe es el Konjunktiv I de haben." },
      { german: "Der Zeuge berichtet, der Fahrer komme aus Dresden.", spanish: "El testigo informa de que el conductor es de Dresde.", blankWord: "Zeuge", explanation: "komme reproduce indirectamente lo que dice el testigo." },
      { german: "Die Ministerin betont, die Gespräche würden bald beginnen.", spanish: "La ministra subraya que las conversaciones empezarán pronto.", blankWord: "Gespräche", explanation: "würden beginnen sustituye al Konjunktiv I plural (beginnen), que coincide con el indicativo." },
      { german: "Sie sagen, sie hätten den Vertrag gelesen.", spanish: "Dicen que han leído el contrato.", blankWord: "Vertrag", explanation: "hätten sustituye al Konjunktiv I, que coincidiría con el indicativo." },
      { german: "Laut der Zeitung sei das Museum wieder geöffnet.", spanish: "Según el periódico, el museo vuelve a estar abierto.", blankWord: "Zeitung", explanation: "sei transmite una información atribuida a una fuente." },
    ] satisfies Phrase[],
  },
  {
    id: "g-preposiciones-genitivo",
    slug: "preposiciones-genitivo",
    title: "Preposiciones con genitivo",
    summary: "Construye expresiones formales con preposiciones que rigen genitivo.",
    order: 28,
    cefrLevel: "B2.2",
    explanation: `En registros formales, varias preposiciones rigen genitivo. El artículo cambia según el género y el sustantivo masculino o neutro puede añadir -s o -es.

## Preposiciones frecuentes

| Preposición | Significado | Ejemplo |
| wegen, trotz | a causa de, a pesar de | wegen des Regens |
| während, aufgrund | durante, debido a | während der Sitzung |
| innerhalb, außerhalb | dentro, fuera de | innerhalb eines Monats |
| statt | en vez de | statt eines Briefes |

- En el habla informal algunas personas usan dativo, pero el genitivo es la forma estándar formal.
- El artículo femenino y plural es der; el masculino y neutro suele ser des.`,
    phrases: [
      { german: "Wegen des Schnees blieb die Schule geschlossen.", spanish: "A causa de la nieve, el colegio permaneció cerrado.", blankWord: "Schnees", explanation: "wegen rige genitivo: des Schnees." },
      { german: "Trotz der Verspätung erreichte sie den Anschluss.", spanish: "A pesar del retraso, llegó a tiempo al enlace.", blankWord: "Verspätung", explanation: "trotz se construye con genitivo: der Verspätung." },
      { german: "Während der Sitzung blieb das Handy ausgeschaltet.", spanish: "Durante la reunión, el móvil permaneció apagado.", blankWord: "Sitzung", explanation: "während introduce el genitivo femenino der Sitzung." },
      { german: "Aufgrund eines technischen Problems fiel der Zug aus.", spanish: "Debido a un problema técnico, se canceló el tren.", blankWord: "Zug", explanation: "Aufgrund eines technischen Problems rige genitivo neutro." },
      { german: "Innerhalb eines Monats muss der Antrag eingehen.", spanish: "La solicitud debe recibirse en el plazo de un mes.", blankWord: "Antrag", explanation: "innerhalb rige genitivo: eines Monats." },
      { german: "Statt eines Briefes schickte er eine Nachricht.", spanish: "En vez de una carta, envió un mensaje.", blankWord: "Nachricht", explanation: "statt introduce el genitivo masculino eines Briefes." },
    ] satisfies Phrase[],
  },
] satisfies Array<{
  id: string;
  slug: string;
  title: string;
  summary: string;
  order: number;
  cefrLevel: CefrLevel;
  explanation: string;
  phrases: Phrase[];
}>;

export const grammarPhraseData = topics.map(({ id, phrases }) => ({ id, phrases }));

export const grammarTopics = topics.map(({ phrases, ...topic }) => ({
  ...topic,
  exercises: createExercises(topic.id, phrases),
}));

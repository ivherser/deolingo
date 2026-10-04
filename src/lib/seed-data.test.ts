import { describe, expect, it } from "vitest";
import { exerciseAnswerSchemas, exerciseDataSchemas, type ExerciseType } from "@/lib/exercises/types";
import { CEFR_LEVELS } from "@/lib/levels";
import { grammarPhraseData, grammarTopics } from "../../prisma/seed-data/grammar";
import { createExercises, type Phrase, unitPhraseData, units } from "../../prisma/seed-data/units";
import { vocabulary } from "../../prisma/seed-data/vocabulary";

const allExerciseTypes: ExerciseType[] = [
  "TRANSLATE_DE_ES",
  "TRANSLATE_ES_DE",
  "MULTIPLE_CHOICE",
  "WORD_ORDER",
  "FILL_BLANK",
  "MATCH_PAIRS",
];

function allSeedIds(): Set<string> {
  const ids = new Set<string>();
  for (const unit of units) {
    ids.add(unit.id);
    for (const lesson of unit.lessons) {
      ids.add(lesson.id);
      for (const exercise of lesson.exercises) {
        ids.add(exercise.id);
      }
    }
  }
  return ids;
}

function words(value: string): string[] {
  return value.split(" ");
}

function normalizeGerman(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/u, "")
    .toLocaleLowerCase();
}

function isWholeWordAt(value: string, word: string, index: number): boolean {
  const before = index === 0 ? undefined : value[index - 1];
  const after = value[index + word.length];
  const isWordCharacter = (character: string | undefined) =>
    character !== undefined && /[\p{L}\p{N}_]/u.test(character);
  return !isWordCharacter(before) && !isWordCharacter(after);
}

function isMultisetSubset(subset: string[], full: string[]): boolean {
  const counts = new Map<string, number>();
  for (const word of full) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  for (const word of subset) {
    const count = counts.get(word) ?? 0;
    if (count === 0) {
      return false;
    }
    counts.set(word, count - 1);
  }
  return true;
}

function validateExercises(
  exercises: Array<{
    type: keyof typeof exerciseDataSchemas;
    data: Record<string, unknown>;
    answer: Record<string, unknown>;
    id: string;
  }>,
  phrases: Phrase[],
) {
  for (const exercise of exercises) {
    exerciseDataSchemas[exercise.type].parse(exercise.data);
    exerciseAnswerSchemas[exercise.type].parse(exercise.answer);

    if (exercise.type === "MULTIPLE_CHOICE") {
      const data = exerciseDataSchemas.MULTIPLE_CHOICE.parse(exercise.data);
      const answer = exerciseAnswerSchemas.MULTIPLE_CHOICE.parse(exercise.answer);
      const correctPhrase = phrases.find((phrase) => phrase.german === data.sourceText);
      expect(data.sourceText).toBeTruthy();
      expect(correctPhrase?.spanish).toBe(data.options[answer.correctIndex]);
      expect(answer.correctIndex).toBeLessThan(data.options.length);
    }

    if (exercise.type === "WORD_ORDER") {
      const data = exerciseDataSchemas.WORD_ORDER.parse(exercise.data);
      const answer = exerciseAnswerSchemas.WORD_ORDER.parse(exercise.answer);
      expect(data.tiles.join(" ")).not.toBe(answer.accepted[0]);
      for (const sentence of answer.accepted) {
        expect(isMultisetSubset(words(sentence), data.tiles)).toBe(true);
      }
    }

    if (exercise.type === "FILL_BLANK") {
      const data = exerciseDataSchemas.FILL_BLANK.parse(exercise.data);
      const answer = exerciseAnswerSchemas.FILL_BLANK.parse(exercise.answer);
      expect(data.sentence).toContain("___");
      if (data.options) {
        expect(data.options).toHaveLength(3);
        expect(new Set(data.options.map((option) => option.toLocaleLowerCase())).size).toBe(3);
        expect(data.options).toContain(answer.accepted[0]);
      }
    }

    if (exercise.type === "MATCH_PAIRS") {
      const data = exerciseDataSchemas.MATCH_PAIRS.parse(exercise.data);
      const answer = exerciseAnswerSchemas.MATCH_PAIRS.parse(exercise.answer);
      const left = new Set(data.left);
      const right = new Set(data.right);
      expect(new Set(answer.pairs.map(([first]) => first))).toEqual(left);
      expect(new Set(answer.pairs.map(([, second]) => second))).toEqual(right);
      const partners = new Map(answer.pairs);
      data.left.forEach((phrase, index) => {
        expect(data.right[index]).not.toBe(partners.get(phrase));
      });
    }
  }
}

describe("seed data", () => {
  it("contains 33 units with at least six fully validated exercises per lesson", () => {
    expect(units).toHaveLength(33);
    const ids = new Set<string>();
    const phrasesByLessonId = new Map(unitPhraseData.map(({ id, phrases }) => [id, phrases]));

    for (const unit of units) {
      expect(ids.has(unit.id)).toBe(false);
      ids.add(unit.id);
      for (const lesson of unit.lessons) {
        expect(ids.has(lesson.id)).toBe(false);
        ids.add(lesson.id);
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(6);
        expect(new Set(lesson.exercises.map(({ type }) => type))).toEqual(new Set(allExerciseTypes));
        for (const exercise of lesson.exercises) {
          expect(ids.has(exercise.id)).toBe(false);
          ids.add(exercise.id);
        }
        validateExercises(lesson.exercises, phrasesByLessonId.get(lesson.id) ?? []);
      }
    }
  });

  it("contains the requested lesson counts and stable new unit orders", () => {
    const lessonsByLevel = new Map<string, number>();
    const orders = new Set<number>();
    for (const unit of units) {
      expect(orders.has(unit.order)).toBe(false);
      orders.add(unit.order);
      lessonsByLevel.set(unit.cefrLevel, (lessonsByLevel.get(unit.cefrLevel) ?? 0) + unit.lessons.length);
    }

    expect(lessonsByLevel.get("A1")).toBe(30);
    expect(lessonsByLevel.get("A2")).toBe(30);
    expect(lessonsByLevel.get("B1.1")).toBe(30);
    for (const level of CEFR_LEVELS.filter((level) => !["A1", "A2", "B1.1"].includes(level))) {
      expect(lessonsByLevel.get(level) ?? 0).toBeGreaterThanOrEqual(3);
    }

    for (let order = 16; order <= 24; order += 1) {
      const unit = units.find((candidate) => candidate.order === order);
      expect(unit?.id).toBe(`u${order}`);
      expect(unit?.cefrLevel).toBe("A2");
    }
    for (let order = 25; order <= 33; order += 1) {
      const unit = units.find((candidate) => candidate.order === order);
      expect(unit?.id).toBe(`u${order}`);
      expect(unit?.cefrLevel).toBe("B1.1");
    }
  });

  it("keeps new unit phrases unique and places every blank word as a whole word", () => {
    const newUnitIds = new Set(
      units.filter((unit) => unit.order >= 16 && unit.order <= 33).map((unit) => unit.id),
    );
    const newLessonIds = new Set(
      units
        .filter((unit) => newUnitIds.has(unit.id))
        .flatMap((unit) => unit.lessons.map((lesson) => lesson.id)),
    );
    const phrasesByLessonId = new Map(unitPhraseData.map(({ id, phrases }) => [id, phrases]));
    const previousGerman = new Set(
      unitPhraseData
        .filter(({ id }) => !newLessonIds.has(id))
        .flatMap(({ phrases }) => phrases.map(({ german }) => normalizeGerman(german))),
    );
    const newGerman = new Set<string>();

    for (const lessonId of newLessonIds) {
      const phrases = phrasesByLessonId.get(lessonId) ?? [];
      expect(phrases).toHaveLength(6);
      expect(new Set(phrases.slice(0, 3).map(({ german }) => german)).size).toBe(3);
      expect(new Set(phrases.slice(0, 3).map(({ spanish }) => spanish)).size).toBe(3);
      expect(phrases[3].german.split(" ").length).toBeLessThanOrEqual(9);
      for (const phrase of phrases) {
        const normalizedGerman = normalizeGerman(phrase.german);
        expect(newGerman.has(normalizedGerman)).toBe(false);
        expect(previousGerman.has(normalizedGerman)).toBe(false);
        newGerman.add(normalizedGerman);

        const firstIndex = phrase.german.indexOf(phrase.blankWord);
        expect(firstIndex).toBeGreaterThanOrEqual(0);
        expect(isWholeWordAt(phrase.german, phrase.blankWord, firstIndex)).toBe(true);
      }
    }
  });

  it("includes at least one unit for every supported CEFR level", () => {
    for (const unit of units) {
      expect(CEFR_LEVELS).toContain(unit.cefrLevel);
    }
    for (const level of CEFR_LEVELS) {
      expect(units.some((unit) => unit.cefrLevel === level)).toBe(true);
    }
  });

  it("uses both translation directions and every exercise family in every unit", () => {
    for (const unit of units) {
      const present = new Set<ExerciseType>(unit.lessons.flatMap((lesson) => lesson.exercises.map(({ type }) => type)));
      for (const family of allExerciseTypes) {
        expect(present.has(family)).toBe(true);
      }
    }
  });

  it("varies deterministic multiple-choice answer positions", () => {
    const exercises = [
      ...units.flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.exercises)),
      ...grammarTopics.flatMap((topic) => topic.exercises),
    ];
    const correctIndices = exercises
      .filter(({ type }) => type === "MULTIPLE_CHOICE")
      .map(({ answer }) => exerciseAnswerSchemas.MULTIPLE_CHOICE.parse(answer).correctIndex);

    expect(new Set(correctIndices).size).toBeGreaterThanOrEqual(3);
  });

  it("generates identical exercises for the same seed and accepts supplied alternatives", () => {
    const phrases: Phrase[] = [
      {
        german: "Ich heiße Anna.",
        spanish: "Me llamo Anna.",
        spanishAlt: ["Yo me llamo Anna."],
        blankWord: "heiße",
        explanation: "heißen significa «llamarse».",
      },
      {
        german: "Guten Morgen, Herr Weber.",
        spanish: "Buenos días, señor Weber.",
        germanAlt: ["Guten Morgen, Herr Weber!"],
        blankWord: "Morgen",
        explanation: "Guten Morgen es un saludo matutino.",
      },
      {
        german: "Wie heißt du?",
        spanish: "¿Cómo te llamas?",
        blankWord: "heißt",
        explanation: "Con du, heißen se conjuga heißt.",
      },
      {
        german: "Ich komme aus Spanien.",
        spanish: "Soy de España.",
        blankWord: "komme",
        explanation: "kommen se conjuga komme con ich.",
      },
      {
        german: "Ich bin Luis.",
        spanish: "Soy Luis.",
        blankWord: "bin",
        explanation: "sein se conjuga bin con ich.",
      },
      {
        german: "Tschüss, bis später.",
        spanish: "Chao, hasta luego.",
        germanAlt: ["Tschüs, bis später."],
        blankWord: "später",
        explanation: "Tschüss es una despedida informal.",
      },
    ];
    const firstGeneration = createExercises("deterministic-l1", phrases);
    const secondGeneration = createExercises("deterministic-l1", phrases);

    expect(secondGeneration).toEqual(firstGeneration);
    expect(firstGeneration[0].answer.accepted).toEqual(["Me llamo Anna.", "Yo me llamo Anna."]);
    expect(firstGeneration[1].answer.accepted).toEqual([
      "Guten Morgen, Herr Weber.",
      "Guten Morgen, Herr Weber!",
    ]);
    const farewellTranslation = units
      .find(({ id }) => id === "u01")
      ?.lessons.find(({ id }) => id === "u01-l3")
      ?.exercises[1];
    expect(farewellTranslation?.answer.accepted).toEqual([
      "Tschüss, bis später.",
      "Tschüs, bis später.",
    ]);
  });

  it("includes complete grammar topics for every CEFR level with unique IDs and orders", () => {
    expect(grammarTopics).toHaveLength(28);
    const ids = allSeedIds();
    const slugs = new Set<string>();
    const orders = new Set<number>();
    const topicCounts = new Map<string, number>();
    const phrasesByTopicId = new Map(grammarPhraseData.map(({ id, phrases }) => [id, phrases]));
    for (const topic of grammarTopics) {
      expect(CEFR_LEVELS).toContain(topic.cefrLevel);
      expect(slugs.has(topic.slug)).toBe(false);
      slugs.add(topic.slug);
      expect(orders.has(topic.order)).toBe(false);
      orders.add(topic.order);
      topicCounts.set(topic.cefrLevel, (topicCounts.get(topic.cefrLevel) ?? 0) + 1);
      expect(ids.has(topic.id)).toBe(false);
      ids.add(topic.id);
      expect(topic.exercises.length).toBeGreaterThanOrEqual(6);
      for (const exercise of topic.exercises) {
        expect(ids.has(exercise.id)).toBe(false);
        ids.add(exercise.id);
      }
      validateExercises(topic.exercises, phrasesByTopicId.get(topic.id) ?? []);
    }
    for (const level of CEFR_LEVELS) {
      expect(topicCounts.get(level) ?? 0).toBeGreaterThanOrEqual(4);
    }
    for (const [slug, order] of [
      ["articulos", 1],
      ["casos", 2],
      ["conjugacion", 3],
      ["orden-v2", 4],
      ["preposiciones", 5],
      ["adjetivos", 6],
    ]) {
      expect(grammarTopics.find((topic) => topic.slug === slug)?.order).toBe(order);
    }
  });

  it("includes levelled vocabulary with unique IDs and topic words", () => {
    expect(vocabulary.length).toBeGreaterThanOrEqual(200);
    const ids = allSeedIds();
    for (const topic of grammarTopics) {
      ids.add(topic.id);
      for (const exercise of topic.exercises) {
        ids.add(exercise.id);
      }
    }
    const pairs = new Set<string>();
    const nounTopics = [
      "saludos",
      "numeros",
      "familia",
      "comida",
      "casa",
      "ciudad",
      "tiempo",
      "ropa",
      "trabajo",
      "ocio",
    ];
    for (const item of vocabulary) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      expect(pairs.has(`${item.german}\u0000${item.topic}`)).toBe(false);
      pairs.add(`${item.german}\u0000${item.topic}`);
      expect(CEFR_LEVELS).toContain(item.cefrLevel);
      if (item.topic === "verbos" || item.topic === "conectores") {
        expect(item.article).toBeNull();
        expect(item.plural).toBeNull();
        expect(item.exampleDe?.trim()).toBeTruthy();
        expect(item.exampleEs?.trim()).toBeTruthy();
      } else {
        expect(nounTopics).toContain(item.topic);
        expect(["der", "die", "das"]).toContain(item.article);
        expect(item.plural?.length).toBeGreaterThan(0);
      }
    }
    for (const level of CEFR_LEVELS) {
      const verbCount = vocabulary.filter((item) => item.topic === "verbos" && item.cefrLevel === level).length;
      const connectorCount = vocabulary.filter((item) => item.topic === "conectores" && item.cefrLevel === level).length;
      expect(verbCount).toBeGreaterThanOrEqual(level === "A1" ? 20 : 15);
      expect(connectorCount).toBeGreaterThanOrEqual(10);
      if (level !== "A1") {
        const nounCount = vocabulary.filter((item) => nounTopics.includes(item.topic) && item.cefrLevel === level).length;
        expect(nounCount).toBeGreaterThanOrEqual(20);
        for (const topic of nounTopics) {
          expect(vocabulary.filter((item) => item.topic === topic && item.cefrLevel === level)).toHaveLength(2);
        }
      }
    }
  });
});

import { describe, expect, it } from "vitest";
import { exerciseAnswerSchemas, exerciseDataSchemas, type ExerciseType } from "@/lib/exercises/types";
import { grammarTopics } from "../../prisma/seed-data/grammar";
import { createExercises, type Phrase, units } from "../../prisma/seed-data/units";
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
) {
  for (const exercise of exercises) {
    exerciseDataSchemas[exercise.type].parse(exercise.data);
    exerciseAnswerSchemas[exercise.type].parse(exercise.answer);

    if (exercise.type === "MULTIPLE_CHOICE") {
      const data = exerciseDataSchemas.MULTIPLE_CHOICE.parse(exercise.data);
      const answer = exerciseAnswerSchemas.MULTIPLE_CHOICE.parse(exercise.answer);
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
  it("contains ten units with at least six fully validated exercises per lesson", () => {
    expect(units).toHaveLength(10);
    const ids = new Set<string>();

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
        validateExercises(lesson.exercises);
      }
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

  it("includes six complete grammar topics with at least six exercises each", () => {
    expect(grammarTopics).toHaveLength(6);
    const ids = allSeedIds();
    for (const topic of grammarTopics) {
      expect(ids.has(topic.id)).toBe(false);
      ids.add(topic.id);
      expect(topic.exercises.length).toBeGreaterThanOrEqual(6);
      for (const exercise of topic.exercises) {
        expect(ids.has(exercise.id)).toBe(false);
        ids.add(exercise.id);
      }
      validateExercises(topic.exercises);
    }
  });

  it("includes at least 200 vocabulary items with unique IDs and topic words", () => {
    expect(vocabulary.length).toBeGreaterThanOrEqual(200);
    const ids = allSeedIds();
    for (const topic of grammarTopics) {
      ids.add(topic.id);
      for (const exercise of topic.exercises) {
        ids.add(exercise.id);
      }
    }
    const pairs = new Set<string>();
    for (const item of vocabulary) {
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
      expect(pairs.has(`${item.german}\u0000${item.topic}`)).toBe(false);
      pairs.add(`${item.german}\u0000${item.topic}`);
      expect(["der", "die", "das"]).toContain(item.article);
      expect(item.plural.length).toBeGreaterThan(0);
    }
  });
});

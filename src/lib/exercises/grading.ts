import { z } from "zod";
import {
  exerciseDataSchemas,
  exerciseTypeSchema,
  exerciseAnswerSchemas,
  userAnswerSchemas,
  type ExerciseType,
} from "./types";

const gradingExerciseSchema = z.object({
  type: exerciseTypeSchema,
  data: z.unknown(),
  answer: z.unknown(),
});

export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[.,;:!?¡¿"'«»()-]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizedPairKey(pair: [string, string]): string {
  return `${normalizeText(pair[0])}\u0000${normalizeText(pair[1])}`;
}

function displayCorrectAnswer(type: ExerciseType, data: unknown, answer: unknown): string {
  if (type === "MULTIPLE_CHOICE") {
    const parsedData = exerciseDataSchemas.MULTIPLE_CHOICE.parse(data);
    const parsedAnswer = exerciseAnswerSchemas.MULTIPLE_CHOICE.parse(answer);
    const index = parsedAnswer.correctIndex;
    if (index >= parsedData.options.length) {
      throw new Error("Invalid multiple-choice seed answer");
    }
    return parsedData.options[index];
  }

  if (type === "MATCH_PAIRS") {
    const parsedAnswer = exerciseAnswerSchemas.MATCH_PAIRS.parse(answer);
    return parsedAnswer.pairs.map(([left, right]) => `${left} = ${right}`).join(", ");
  }

  const parsedAnswer = exerciseAnswerSchemas[type].parse(answer);
  return parsedAnswer.accepted[0];
}

export function gradeAnswer(
  exercise: { type: unknown; data: unknown; answer: unknown },
  userAnswer: unknown,
): { correct: boolean; correctAnswer: string } {
  const parsedExercise = gradingExerciseSchema.parse(exercise);
  const { type, data, answer } = parsedExercise;
  const correctAnswer = displayCorrectAnswer(type, data, answer);

  if (type === "MULTIPLE_CHOICE") {
    const parsedUserAnswer = userAnswerSchemas.MULTIPLE_CHOICE.safeParse(userAnswer);
    if (!parsedUserAnswer.success) {
      return { correct: false, correctAnswer };
    }
    const options = exerciseDataSchemas.MULTIPLE_CHOICE.parse(data).options;
    const expected = exerciseAnswerSchemas.MULTIPLE_CHOICE.parse(answer).correctIndex;
    return {
      correct: parsedUserAnswer.data === expected && expected < options.length,
      correctAnswer,
    };
  }

  if (type === "MATCH_PAIRS") {
    const parsedUserAnswer = userAnswerSchemas.MATCH_PAIRS.safeParse(userAnswer);
    if (!parsedUserAnswer.success) {
      return { correct: false, correctAnswer };
    }
    const expected = exerciseAnswerSchemas.MATCH_PAIRS.parse(answer).pairs;
    const submitted = parsedUserAnswer.data;
    const expectedKeys = expected.map(normalizedPairKey);
    const submittedKeys = submitted.map(normalizedPairKey);
    const uniqueSubmitted = new Set(submittedKeys);
    return {
      correct:
        submitted.length === expected.length &&
        uniqueSubmitted.size === submitted.length &&
        expectedKeys.every((key) => uniqueSubmitted.has(key)),
      correctAnswer,
    };
  }

  if (type === "WORD_ORDER") {
    const parsedUserAnswer = userAnswerSchemas.WORD_ORDER.safeParse(userAnswer);
    if (!parsedUserAnswer.success) {
      return { correct: false, correctAnswer };
    }
    const accepted = exerciseAnswerSchemas.WORD_ORDER.parse(answer).accepted;
    const candidate = parsedUserAnswer.data.join(" ");
    return {
      correct: accepted.some((expected) => normalizeText(expected) === normalizeText(candidate)),
      correctAnswer,
    };
  }

  const parsedUserAnswer = userAnswerSchemas[type].safeParse(userAnswer);
  if (!parsedUserAnswer.success) {
    return { correct: false, correctAnswer };
  }
  const accepted = exerciseAnswerSchemas[type].parse(answer).accepted;
  return {
    correct: accepted.some((expected) => normalizeText(expected) === normalizeText(parsedUserAnswer.data)),
    correctAnswer,
  };
}

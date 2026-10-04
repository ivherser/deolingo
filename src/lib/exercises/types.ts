import { z } from "zod";

export const exerciseTypeSchema = z.enum([
  "TRANSLATE_DE_ES",
  "TRANSLATE_ES_DE",
  "MULTIPLE_CHOICE",
  "WORD_ORDER",
  "FILL_BLANK",
  "MATCH_PAIRS",
]);

const acceptedSchema = z.array(z.string().min(1)).min(1);

export const exerciseDataSchemas = {
  TRANSLATE_DE_ES: z.object({
    sourceText: z.string().min(1),
    hint: z.string().optional(),
  }),
  TRANSLATE_ES_DE: z.object({
    sourceText: z.string().min(1),
    hint: z.string().optional(),
  }),
  MULTIPLE_CHOICE: z.object({
    sourceText: z.string().min(1).optional(),
    options: z.array(z.string().min(1)).min(2),
  }),
  WORD_ORDER: z.object({
    tiles: z.array(z.string().min(1)).min(1),
  }),
  FILL_BLANK: z.object({
    sentence: z.string().refine((sentence) => sentence.includes("___")),
    options: z.array(z.string().min(1)).optional(),
  }),
  MATCH_PAIRS: z.object({
    left: z.array(z.string().min(1)).min(1),
    right: z.array(z.string().min(1)).min(1),
  }),
} as const;

export const exerciseAnswerSchemas = {
  TRANSLATE_DE_ES: z.object({ accepted: acceptedSchema }),
  TRANSLATE_ES_DE: z.object({ accepted: acceptedSchema }),
  MULTIPLE_CHOICE: z.object({ correctIndex: z.number().int().min(0) }),
  WORD_ORDER: z.object({ accepted: acceptedSchema }),
  FILL_BLANK: z.object({ accepted: acceptedSchema }),
  MATCH_PAIRS: z.object({
    pairs: z.array(z.tuple([z.string().min(1), z.string().min(1)])).min(1),
  }),
} as const;

export const userAnswerSchemas = {
  TRANSLATE_DE_ES: z.string(),
  TRANSLATE_ES_DE: z.string(),
  MULTIPLE_CHOICE: z.number().int(),
  WORD_ORDER: z.array(z.string()),
  FILL_BLANK: z.string(),
  MATCH_PAIRS: z.array(z.tuple([z.string(), z.string()])),
} as const;

export type ExerciseType = z.infer<typeof exerciseTypeSchema>;
export type ExerciseData = {
  [Type in ExerciseType]: z.infer<(typeof exerciseDataSchemas)[Type]>;
}[ExerciseType];
export type ExerciseAnswer = {
  [Type in ExerciseType]: z.infer<(typeof exerciseAnswerSchemas)[Type]>;
}[ExerciseType];

export function parseExerciseData(type: ExerciseType, data: unknown): ExerciseData {
  return exerciseDataSchemas[type].parse(data) as ExerciseData;
}

export function parseExerciseAnswer(type: ExerciseType, answer: unknown): ExerciseAnswer {
  return exerciseAnswerSchemas[type].parse(answer) as ExerciseAnswer;
}

export function parseUserAnswer(type: ExerciseType, answer: unknown) {
  return userAnswerSchemas[type].safeParse(answer);
}

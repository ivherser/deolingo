import { exerciseDataSchemas, type ExerciseType } from "@/lib/exercises/types";
import { germanGlossary } from "@/lib/glossary-data";

export type GermanToken = { text: string; key: string | null };

type GlossaryExercise = { type: ExerciseType; data: unknown };

export function glossaryKey(token: string): string | null {
  const key = token
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .toLocaleLowerCase();
  return key || null;
}

export function tokenizeGerman(text: string): GermanToken[] {
  return text
    .split(/(\s+)/u)
    .filter((segment) => segment.length > 0)
    .map((segment) => ({
      text: segment,
      key: /^\s+$/u.test(segment) ? null : glossaryKey(segment),
    }));
}

export function lessonGlossaryTexts(exercises: readonly GlossaryExercise[]): string[] {
  return exercises.flatMap(({ type, data }) => {
    switch (type) {
      case "TRANSLATE_DE_ES":
        return [exerciseDataSchemas.TRANSLATE_DE_ES.parse(data).sourceText];
      case "MULTIPLE_CHOICE": {
        const sourceText = exerciseDataSchemas.MULTIPLE_CHOICE.parse(data).sourceText;
        return sourceText ? [sourceText] : [];
      }
      case "FILL_BLANK":
        return [exerciseDataSchemas.FILL_BLANK.parse(data).sentence];
      default:
        return [];
    }
  });
}

export function glossaryForTexts(texts: string[]): Record<string, string> {
  const presentKeys = new Set(
    texts.flatMap((text) =>
      tokenizeGerman(text).flatMap(({ key }) => (key ? [key] : [])),
    ),
  );
  return Object.fromEntries(
    Object.entries(germanGlossary).filter(([key]) => presentKeys.has(key)),
  );
}

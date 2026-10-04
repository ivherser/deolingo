import { z } from "zod";

export const CEFR_LEVELS = ["A1", "A2", "B1.1", "B1.2", "B2.1", "B2.2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];
export const cefrLevelSchema = z.enum(CEFR_LEVELS);
export const cefrLevelListSchema = z
  .string()
  .min(1)
  .max(60)
  .transform((value) => value.split(",").map((level) => level.trim()))
  .pipe(z.array(cefrLevelSchema).min(1))
  .transform((levels) => {
    const selected = new Set(levels);
    return CEFR_LEVELS.filter((level) => selected.has(level));
  });

export function levelsUpTo(level: CefrLevel): CefrLevel[] {
  return CEFR_LEVELS.slice(0, CEFR_LEVELS.indexOf(level) + 1);
}

export const CEFR_LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "Principiante",
  A2: "Básico",
  "B1.1": "Intermedio I",
  "B1.2": "Intermedio II",
  "B2.1": "Intermedio alto I",
  "B2.2": "Intermedio alto II",
};

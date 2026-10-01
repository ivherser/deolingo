import { z } from "zod";

export const CEFR_LEVELS = ["A1", "A2", "B1.1", "B1.2", "B2.1", "B2.2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];
export const cefrLevelSchema = z.enum(CEFR_LEVELS);
export const CEFR_LEVEL_LABELS: Record<CefrLevel, string> = {
  A1: "Principiante",
  A2: "Básico",
  "B1.1": "Intermedio I",
  "B1.2": "Intermedio II",
  "B2.1": "Intermedio alto I",
  "B2.2": "Intermedio alto II",
};

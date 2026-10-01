import { z } from "zod";

const stateSchema = z.object({
  easeFactor: z.number().finite().min(1.3),
  interval: z.number().int().min(0),
  repetitions: z.number().int().min(0),
});

export type SrsState = z.infer<typeof stateSchema>;

export function reviewCard(
  state: SrsState,
  quality: number,
  now: Date,
): SrsState & { nextReviewAt: Date } {
  const current = stateSchema.parse(state);
  const parsedQuality = z.number().int().min(0).max(5).safeParse(quality);
  if (!parsedQuality.success) {
    throw new RangeError("La calidad debe ser un entero entre 0 y 5.");
  }
  const parsedNow = z.date().parse(now);
  const q = parsedQuality.data;
  const difference = 5 - q;
  const easeFactor = Math.max(
    1.3,
    Math.round(
      (current.easeFactor +
        (0.1 - difference * (0.08 + difference * 0.02))) *
        100,
    ) / 100,
  );
  const repetitions = q < 3 ? 0 : current.repetitions + 1;
  const interval =
    q < 3
      ? 1
      : repetitions === 1
        ? 1
        : repetitions === 2
          ? 6
          : Math.round(current.interval * current.easeFactor);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewAt: new Date(parsedNow.getTime() + interval * 24 * 60 * 60 * 1000),
  };
}

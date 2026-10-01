import { z } from "zod";

export const MAX_HEARTS = 5;
export const HEART_REGEN_MINUTES = 30;
const heartIntervalMs = HEART_REGEN_MINUTES * 60 * 1000;

const heartsSchema = z.number().int().min(0).max(MAX_HEARTS);
const dateSchema = z.date();

export function regenerateHearts(
  hearts: number,
  heartsUpdatedAt: Date,
  now: Date,
): { hearts: number; heartsUpdatedAt: Date } {
  const currentHearts = heartsSchema.parse(hearts);
  const updatedAt = dateSchema.parse(heartsUpdatedAt);
  const currentTime = dateSchema.parse(now);
  if (currentHearts === MAX_HEARTS) {
    return { hearts: MAX_HEARTS, heartsUpdatedAt: currentTime };
  }
  const intervals = Math.floor((currentTime.getTime() - updatedAt.getTime()) / heartIntervalMs);
  if (intervals <= 0) {
    return { hearts: currentHearts, heartsUpdatedAt: updatedAt };
  }
  const gained = Math.min(MAX_HEARTS - currentHearts, intervals);
  const nextHearts = currentHearts + gained;
  return {
    hearts: nextHearts,
    heartsUpdatedAt:
      nextHearts === MAX_HEARTS
        ? currentTime
        : new Date(updatedAt.getTime() + gained * heartIntervalMs),
  };
}

export function nextHeartAt(hearts: number, heartsUpdatedAt: Date): Date | null {
  const currentHearts = heartsSchema.parse(hearts);
  const updatedAt = dateSchema.parse(heartsUpdatedAt);
  return currentHearts === MAX_HEARTS ? null : new Date(updatedAt.getTime() + heartIntervalMs);
}

export function updateStreak(
  lastActivityDate: Date | null,
  streak: number,
  now: Date,
): { streak: number; lastActivityDate: Date } {
  const currentStreak = z.number().int().min(0).parse(streak);
  const currentTime = dateSchema.parse(now);
  const previousDate = lastActivityDate === null ? null : dateSchema.parse(lastActivityDate);
  const today = currentTime.toISOString().slice(0, 10);

  if (previousDate?.toISOString().slice(0, 10) === today) {
    return { streak: currentStreak, lastActivityDate: currentTime };
  }

  const yesterday = new Date(`${today}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const isYesterday = previousDate?.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10);

  return {
    streak: isYesterday ? currentStreak + 1 : 1,
    lastActivityDate: currentTime,
  };
}

export function computeLessonXp(
  xpReward: number,
  isFirstCompletion: boolean,
  mistakes: number,
): number {
  const reward = z.number().int().min(0).parse(xpReward);
  const mistakeCount = z.number().int().min(0).parse(mistakes);
  return isFirstCompletion ? reward + (mistakeCount === 0 ? 5 : 0) : 5;
}

export function isLessonUnlocked(
  orderedLessonIds: string[],
  completedIds: Set<string>,
  lessonId: string,
): boolean {
  const index = orderedLessonIds.indexOf(lessonId);
  if (index === -1) {
    return false;
  }
  return index === 0 || completedIds.has(orderedLessonIds[index - 1]);
}

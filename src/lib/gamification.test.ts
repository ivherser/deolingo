import { describe, expect, it } from "vitest";
import {
  computeLessonXp,
  HEART_REFILL_AMOUNT,
  HEART_REGEN_MINUTES,
  isLessonUnlocked,
  MAX_HEARTS,
  nextHeartAt,
  regenerateHearts,
  updateStreak,
} from "./gamification";

const now = new Date("2026-10-01T00:15:00.000Z");

describe("heart regeneration", () => {
  it("adds one heart per full interval and preserves partial time", () => {
    const updatedAt = new Date(now.getTime() - (HEART_REGEN_MINUTES * 2 + 12) * 60_000);
    const result = regenerateHearts(1, updatedAt, now);
    expect(result.hearts).toBe(3);
    expect(result.heartsUpdatedAt).toEqual(new Date(updatedAt.getTime() + HEART_REGEN_MINUTES * 2 * 60_000));
  });

  it("caps at five hearts and advances the timestamp to now when full", () => {
    const result = regenerateHearts(4, new Date(now.getTime() - 60 * 60_000), now);
    expect(result).toEqual({ hearts: MAX_HEARTS, heartsUpdatedAt: now });
  });

  it("does not regenerate before a full interval", () => {
    const updatedAt = new Date(now.getTime() - 29 * 60_000);
    expect(regenerateHearts(2, updatedAt, now)).toEqual({ hearts: 2, heartsUpdatedAt: updatedAt });
  });

  it("sets the update time to now for a full heart count", () => {
    expect(regenerateHearts(5, new Date(now.getTime() - 60_000), now)).toEqual({
      hearts: 5,
      heartsUpdatedAt: now,
    });
    expect(nextHeartAt(5, now)).toBeNull();
  });

  it("does not regenerate heart counts above five", () => {
    const updatedAt = new Date(now.getTime() - 60 * 60_000);
    expect(regenerateHearts(7, updatedAt, now)).toEqual({ hearts: 7, heartsUpdatedAt: now });
    expect(nextHeartAt(7, updatedAt)).toBeNull();
    expect(HEART_REFILL_AMOUNT).toBe(5);
  });

  it("reports the next heart time", () => {
    const updatedAt = new Date(now.getTime() - 10 * 60_000);
    expect(nextHeartAt(3, updatedAt)).toEqual(new Date(updatedAt.getTime() + 30 * 60_000));
  });
});

describe("streaks", () => {
  it("keeps the streak within the same UTC day", () => {
    const yesterdayLate = new Date("2026-10-01T00:01:00.000Z");
    const todayEarly = new Date("2026-10-01T23:59:00.000Z");
    expect(updateStreak(yesterdayLate, 4, todayEarly).streak).toBe(4);
  });

  it("increments on the previous UTC day, including month boundaries", () => {
    expect(
      updateStreak(new Date("2026-09-30T23:59:00.000Z"), 4, new Date("2026-10-01T00:01:00.000Z"))
        .streak,
    ).toBe(5);
  });

  it("starts a new streak after a gap or without a previous activity", () => {
    expect(updateStreak(new Date("2026-09-28T00:00:00.000Z"), 9, now).streak).toBe(1);
    expect(updateStreak(null, 0, now).streak).toBe(1);
  });
});

describe("lesson progression", () => {
  it("awards the specified XP", () => {
    expect(computeLessonXp(10, true, 0)).toBe(15);
    expect(computeLessonXp(10, true, 1)).toBe(10);
    expect(computeLessonXp(10, false, 0)).toBe(5);
  });

  it("unlocks only the first uncompleted lesson in global order", () => {
    const ids = ["u01-l1", "u01-l2", "u02-l1"];
    expect(isLessonUnlocked(ids, new Set(), ids[0])).toBe(true);
    expect(isLessonUnlocked(ids, new Set(), ids[1])).toBe(false);
    expect(isLessonUnlocked(ids, new Set(["u01-l1"]), ids[1])).toBe(true);
    expect(isLessonUnlocked(ids, new Set(["u01-l1"]), ids[2])).toBe(false);
  });
});

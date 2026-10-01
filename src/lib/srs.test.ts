import { describe, expect, it } from "vitest";
import { reviewCard, type SrsState } from "./srs";

const now = new Date("2026-10-01T12:00:00.000Z");
const initial: SrsState = { easeFactor: 2.5, interval: 0, repetitions: 0 };

describe("reviewCard", () => {
  it("uses the simplified SM-2 intervals and previous ease factor", () => {
    const first = reviewCard(initial, 4, now);
    const second = reviewCard(first, 4, now);
    const third = reviewCard(second, 5, now);

    expect([first.interval, second.interval, third.interval]).toEqual([1, 6, 15]);
    expect([first.easeFactor, second.easeFactor, third.easeFactor]).toEqual([2.5, 2.5, 2.6]);
  });

  it("resets repetitions after a difficult review", () => {
    expect(reviewCard({ easeFactor: 2.5, interval: 8, repetitions: 4 }, 1, now)).toMatchObject({
      easeFactor: 1.96,
      interval: 1,
      repetitions: 0,
    });
  });

  it("never reduces ease factor below 1.3", () => {
    const state = { easeFactor: 1.3, interval: 1, repetitions: 1 };
    expect(reviewCard(state, 0, now).easeFactor).toBe(1.3);
    expect(reviewCard(state, 1, now).easeFactor).toBe(1.3);
  });

  it("adds exact 24-hour intervals from the supplied date", () => {
    expect(reviewCard(initial, 4, now).nextReviewAt.toISOString()).toBe(
      "2026-10-02T12:00:00.000Z",
    );
  });

  it.each([-1, 6, 2.5])("rejects invalid quality %s", (quality) => {
    expect(() => reviewCard(initial, quality, now)).toThrow(RangeError);
  });
});

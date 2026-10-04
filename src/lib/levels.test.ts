import { describe, expect, it } from "vitest";
import {
  CEFR_LEVELS,
  cefrLevelListSchema,
  cefrLevelSchema,
  levelsUpTo,
} from "@/lib/levels";

describe("cefrLevelSchema", () => {
  it("accepts every supported CEFR level", () => {
    for (const level of CEFR_LEVELS) {
      expect(cefrLevelSchema.parse(level)).toBe(level);
    }
  });

  it.each(["B1", "c1", ""])("rejects %j", (level) => {
    expect(cefrLevelSchema.safeParse(level).success).toBe(false);
  });
});

describe("levelsUpTo", () => {
  it('returns levels through "B1.1" in CEFR order', () => {
    expect(levelsUpTo("B1.1")).toEqual(["A1", "A2", "B1.1"]);
  });
});

describe("cefrLevelListSchema", () => {
  it("deduplicates and orders levels by CEFR level", () => {
    expect(cefrLevelListSchema.parse("A2,A1,A2")).toEqual(["A1", "A2"]);
  });

  it.each(["C1", "", "A1,,X"])("rejects %j", (levels) => {
    expect(cefrLevelListSchema.safeParse(levels).success).toBe(false);
  });
});

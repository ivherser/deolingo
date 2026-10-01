import { describe, expect, it } from "vitest";
import { CEFR_LEVELS, cefrLevelSchema } from "@/lib/levels";

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

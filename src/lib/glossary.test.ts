import { describe, expect, it } from "vitest";
import { units } from "../../prisma/seed-data/units";
import { germanGlossary } from "@/lib/glossary-data";
import {
  glossaryForTexts,
  glossaryKey,
  lessonGlossaryTexts,
  tokenizeGerman,
} from "@/lib/glossary";

describe("German glossary", () => {
  it.each([
    ["Haus.", "haus"],
    ["„Hallo“,", "hallo"],
    ["E-Mail", "e-mail"],
    ["___", null],
    ["…", null],
  ])("normalizes %s to %s", (token, expected) => {
    expect(glossaryKey(token)).toBe(expected);
  });

  it("tokenizes German while preserving all whitespace", () => {
    const text = "  Guten\tTag,\nWelt! ___ ";
    const tokens = tokenizeGerman(text);

    expect(tokens.map(({ text: segment }) => segment).join("")).toBe(text);
    expect(tokens.map(({ key }) => key)).toEqual([
      null,
      "guten",
      null,
      "tag",
      null,
      "welt",
      null,
      null,
      null,
    ]);
  });

  it("extracts only German text displayed by supported lesson exercises", () => {
    expect(
      lessonGlossaryTexts([
        { type: "TRANSLATE_DE_ES", data: { sourceText: "Guten Morgen!" } },
        { type: "MULTIPLE_CHOICE", data: { sourceText: "Ich lerne Deutsch.", options: ["una", "otra"] } },
        { type: "FILL_BLANK", data: { sentence: "Ich ___ Deutsch." } },
        { type: "TRANSLATE_ES_DE", data: { sourceText: "Buenos días." } },
        { type: "WORD_ORDER", data: { tiles: ["Lerne", "Deutsch"] } },
        { type: "MATCH_PAIRS", data: { left: ["hola"], right: ["Hallo"] } },
      ]),
    ).toEqual(["Guten Morgen!", "Ich lerne Deutsch.", "Ich ___ Deutsch."]);
  });

  it("covers every token in all seeded lesson glossary texts", () => {
    const texts = units.flatMap((unit) =>
      unit.lessons.flatMap((lesson) => lessonGlossaryTexts(lesson.exercises)),
    );
    const keys = new Set(
      texts.flatMap((text) =>
        tokenizeGerman(text).flatMap(({ key }) => (key ? [key] : [])),
      ),
    );

    for (const key of keys) {
      const gloss = germanGlossary[key];
      expect(gloss, `missing glossary key "${key}"`).toBeDefined();
      expect(gloss.trim().length, `empty glossary gloss for "${key}"`).toBeGreaterThan(0);
      expect(gloss.length, `gloss for "${key}" exceeds 60 characters`).toBeLessThanOrEqual(60);
    }
  });

  it("keeps data keys normalized and returns only keys present in the text", () => {
    const glossaryKeys = Object.keys(germanGlossary);
    for (const key of glossaryKeys) {
      expect(glossaryKey(key)).toBe(key);
    }
    expect(glossaryKeys).toEqual([...glossaryKeys].sort((left, right) => left.localeCompare(right, "de")));

    const texts = ["Das Haus steht neben dem Haus.", "„Hallo“!"];
    const result = glossaryForTexts(texts);
    const expectedKeys = new Set(
      texts.flatMap((text) =>
        tokenizeGerman(text).flatMap(({ key }) =>
          key && germanGlossary[key] ? [key] : [],
        ),
      ),
    );

    expect(Object.keys(result).sort()).toEqual([...expectedKeys].sort());
    expect(result).toEqual(
      Object.fromEntries([...expectedKeys].map((key) => [key, germanGlossary[key]])),
    );
  });
});

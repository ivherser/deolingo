import { describe, expect, it } from "vitest";
import { gradeAnswer, normalizeText } from "./grading";

describe("normalizeText", () => {
  it("normalizes German spelling, case, punctuation, and spacing", () => {
    expect(normalizeText("  Ich heiße   Anna! ")).toBe("ich heisse anna");
    expect(normalizeText("Tschüss")).toBe("tschuess");
  });

  it("ignores Spanish accents and punctuation", () => {
    expect(normalizeText("¿Cómo estás?")).toBe("como estas");
  });
});

describe("gradeAnswer", () => {
  it.each([
    [
      "TRANSLATE_DE_ES",
      { sourceText: "Ich heiße Anna" },
      { accepted: ["Me llamo Anna"] },
      "me llamo anna.",
      "Me llamo Anna",
    ],
    [
      "TRANSLATE_ES_DE",
      { sourceText: "Me llamo Anna" },
      { accepted: ["Ich heiße Anna"] },
      "ich heisse anna.",
      "Ich heiße Anna",
    ],
    [
      "MULTIPLE_CHOICE",
      { options: ["der Tisch", "die Tisch"] },
      { correctIndex: 0 },
      0,
      "der Tisch",
    ],
    [
      "WORD_ORDER",
      { tiles: ["Heute", "lerne", "ich", "Deutsch"] },
      { accepted: ["Heute lerne ich Deutsch"] },
      ["Heute", "lerne", "ich", "Deutsch"],
      "Heute lerne ich Deutsch",
    ],
    [
      "FILL_BLANK",
      { sentence: "Ich ___ Anna." },
      { accepted: ["heiße"] },
      "heisse",
      "heiße",
    ],
    [
      "MATCH_PAIRS",
      { left: ["Hallo"], right: ["Hola"] },
      { pairs: [["Hallo", "Hola"]] },
      [["Hallo", "Hola"]],
      "Hallo = Hola",
    ],
  ] as const)("grades %s correctly", (type, data, answer, userAnswer, correctAnswer) => {
    expect(gradeAnswer({ type, data, answer }, userAnswer)).toEqual({
      correct: true,
      correctAnswer,
    });
  });

  it.each([
    ["TRANSLATE_DE_ES", { sourceText: "Guten Morgen" }, { accepted: ["Buenos días"] }, "Buenas noches"],
    ["TRANSLATE_ES_DE", { sourceText: "Buenas noches" }, { accepted: ["Gute Nacht"] }, "Guten Tag"],
    ["MULTIPLE_CHOICE", { options: ["der Tisch", "die Tisch"] }, { correctIndex: 0 }, 1],
    ["WORD_ORDER", { tiles: ["Ich", "lerne", "Deutsch"] }, { accepted: ["Ich lerne Deutsch"] }, ["Deutsch", "lerne", "Ich"]],
    ["FILL_BLANK", { sentence: "Ich ___ Anna." }, { accepted: ["heiße"] }, "bin"],
    ["MATCH_PAIRS", { left: ["Hallo"], right: ["Hola"] }, { pairs: [["Hallo", "Hola"]] }, [["Hola", "Hallo"]]],
  ] as const)("rejects incorrect %s answers", (type, data, answer, userAnswer) => {
    expect(gradeAnswer({ type, data, answer }, userAnswer).correct).toBe(false);
  });

  it("accepts case, punctuation, whitespace, and Spanish accent variants", () => {
    expect(
      gradeAnswer(
        {
          type: "TRANSLATE_DE_ES",
          data: { sourceText: "Wie geht es dir?" },
          answer: { accepted: ["¿Cómo estás tú?"] },
        },
        "como estas tu",
      ).correct,
    ).toBe(true);
    expect(
      gradeAnswer(
        {
          type: "TRANSLATE_DE_ES",
          data: { sourceText: "Tschüss" },
          answer: { accepted: ["Adiós"] },
        },
        "adios!",
      ).correct,
    ).toBe(true);
  });

  it.each([
    ["TRANSLATE_DE_ES", { sourceText: "Hallo" }, { accepted: ["Hola"] }, 1],
    ["MULTIPLE_CHOICE", { options: ["a", "b"] }, { correctIndex: 0 }, "0"],
    ["MULTIPLE_CHOICE", { options: ["a", "b"] }, { correctIndex: 0 }, 2],
  ] as const)("returns incorrect for invalid user input in %s", (type, data, answer, userAnswer) => {
    expect(gradeAnswer({ type, data, answer }, userAnswer).correct).toBe(false);
  });

  it("compares match pairs independent of order and rejects missing or duplicate pairs", () => {
    const exercise = {
      type: "MATCH_PAIRS",
      data: { left: ["der Hund", "die Katze"], right: ["el perro", "el gato"] },
      answer: {
        pairs: [
          ["der Hund", "el perro"],
          ["die Katze", "el gato"],
        ],
      },
    };
    expect(gradeAnswer(exercise, [["die Katze", "el gato"], ["der Hund", "el perro"]]).correct).toBe(true);
    expect(gradeAnswer(exercise, [["der Hund", "el perro"]]).correct).toBe(false);
    expect(
      gradeAnswer(exercise, [["der Hund", "el perro"], ["der Hund", "el perro"]]).correct,
    ).toBe(false);
  });

  it("throws when seed answers are malformed", () => {
    expect(() =>
      gradeAnswer(
        {
          type: "MULTIPLE_CHOICE",
          data: { options: ["uno"] },
          answer: { correctIndex: 2 },
        },
        2,
      ),
    ).toThrow();
  });
});

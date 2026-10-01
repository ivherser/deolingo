"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CEFR_LEVELS, CEFR_LEVEL_LABELS, cefrLevelSchema, type CefrLevel } from "@/lib/levels";

type Lesson = {
  id: string;
  order: number;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  unlocked: boolean;
  current: boolean;
};

type Unit = {
  id: string;
  order: number;
  title: string;
  description: string;
  color: string;
  cefrLevel: CefrLevel;
  lessons: Lesson[];
};

const unitSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  title: z.string(),
  description: z.string(),
  color: z.string(),
  cefrLevel: cefrLevelSchema,
  lessons: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
      title: z.string(),
      description: z.string(),
      xpReward: z.number().int(),
      completed: z.boolean(),
      unlocked: z.boolean(),
      current: z.boolean(),
    }),
  ),
});
const unitsSchema = z.object({ level: cefrLevelSchema, units: z.array(unitSchema) });
const selectedLevelResponseSchema = z.object({ selectedLevel: cefrLevelSchema });

const lessonOffsetClasses = [
  "translate-x-0",
  "md:translate-x-10",
  "md:translate-x-7",
  "md:-translate-x-7",
  "md:-translate-x-10",
];

export function LearningPath() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [level, setLevel] = useState<CefrLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingLevel, setChangingLevel] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/units")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No pudimos cargar tu ruta.");
        }
        return unitsSchema.parse(await response.json());
      })
      .then((value) => {
        if (active) {
          setLevel(value.level);
          setUnits(value.units);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError("No pudimos cargar tu ruta. Inténtalo de nuevo.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLevelChange(nextLevel: CefrLevel) {
    if (nextLevel === level || changingLevel) {
      return;
    }
    const previousLevel = level;
    setLevel(nextLevel);
    setChangingLevel(true);
    setError("");
    try {
      const response = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedLevel: nextLevel }),
      });
      if (!response.ok) {
        throw new Error();
      }
      const updated = selectedLevelResponseSchema.parse(await response.json());
      if (updated.selectedLevel !== nextLevel) {
        throw new Error();
      }
      const unitsResponse = await fetch("/api/units");
      if (!unitsResponse.ok) {
        throw new Error();
      }
      const updatedUnits = unitsSchema.parse(await unitsResponse.json());
      if (updatedUnits.level !== nextLevel) {
        throw new Error();
      }
      setUnits(updatedUnits.units);
    } catch {
      setLevel(previousLevel);
      setError("No pudimos cambiar de nivel.");
    } finally {
      setChangingLevel(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center font-extrabold text-[#777]" role="status">
        Preparando tu ruta…
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="rounded-2xl bg-[#fff2f2] p-6 text-center font-extrabold text-[#c43f3f]" role="alert">
        {loadError}
      </div>
    );
  }

  const completed = units.flatMap((unit) => unit.lessons).filter((lesson) => lesson.completed).length;
  const total = units.reduce((count, unit) => count + unit.lessons.length, 0);

  return (
    <div className="mx-auto max-w-[620px]">
      <section className="mb-7 rounded-3xl border border-[#d8efca] bg-[#f4ffed] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#64a93b]">Tu curso · alemán {level}</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Aprende a tu ritmo</h1>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#58a700]">
            {completed}/{total} lecciones
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Nivel">
          {CEFR_LEVELS.map((cefrLevel) => {
            const selected = level === cefrLevel;
            return (
              <button
                key={cefrLevel}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={changingLevel}
                onClick={() => void handleLevelChange(cefrLevel)}
                className={`min-w-0 rounded-xl border-2 border-b-4 px-2 py-2 text-left transition disabled:cursor-wait disabled:opacity-70 ${
                  selected
                    ? "border-[#58cc02] border-b-[#58a700] bg-[#58cc02] text-white"
                    : "border-[#e5e5e5] border-b-[#d5d5d5] bg-white text-[#777] hover:border-[#c8e9b4]"
                }`}
              >
                <span className="block text-sm font-black">{cefrLevel}</span>
                <span className="block text-[10px] font-bold leading-4">{CEFR_LEVEL_LABELS[cefrLevel]}</span>
              </button>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-[#fff2f2] p-3 text-sm font-extrabold text-[#c43f3f]">
            {error}
          </p>
        )}
        <div
          className="mt-4 h-3 overflow-hidden rounded-full bg-[#dcebd3]"
          role="progressbar"
          aria-label="Progreso del curso"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div className="h-full rounded-full bg-[#58cc02] transition-all" style={{ width: `${total ? (completed / total) * 100 : 0}%` }} />
        </div>
      </section>

      {units.length === 0 ? (
        <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white p-8 text-center font-extrabold text-[#777]">
          Pronto habrá más unidades para este nivel.
        </div>
      ) : (
        <div className="space-y-10">
          {units.map((unit, unitIndex) => (
            <section key={unit.id} aria-labelledby={`${unit.id}-title`}>
            <div className="mb-5 rounded-3xl px-5 py-5 text-white shadow-sm sm:px-7" style={{ backgroundColor: unit.color }}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/80">
                Unidad {unitIndex + 1} · {level}
              </p>
              <h2 id={`${unit.id}-title`} className="mt-1 text-2xl font-black">
                {unit.title}
              </h2>
              <p className="mt-1 max-w-lg text-sm font-semibold text-white/90">{unit.description}</p>
            </div>
            <div className="relative mx-auto flex w-full max-w-[400px] flex-col items-center gap-4 py-1">
              {unit.lessons.map((lesson, index) => {
                const offsetClass = lessonOffsetClasses[index % lessonOffsetClasses.length];
                const className = `relative flex h-[74px] w-[74px] items-center justify-center rounded-full border-b-[6px] text-2xl font-black text-white transition-all ${
                  lesson.completed
                    ? "border-[#d89d00] bg-[#ffc800]"
                    : lesson.current
                      ? "current-node border-[#58a700] bg-[#58cc02]"
                      : "border-[#c8c8c8] bg-[#e5e5e5]"
                } ${lesson.unlocked ? "hover:brightness-105" : "cursor-not-allowed"}`;
                const node = (
                  <>
                    <span aria-hidden="true">{lesson.completed ? "✓" : lesson.unlocked ? "★" : "🔒"}</span>
                    {lesson.current && (
                      <span className="absolute -bottom-8 whitespace-nowrap rounded-lg bg-[#58cc02] px-2 py-1 text-[10px] font-black tracking-wide text-white shadow-sm">
                        EMPEZAR
                      </span>
                    )}
                  </>
                );
                return (
                  <div key={lesson.id} className={`relative flex w-full flex-col items-center ${offsetClass}`}>
                    {lesson.unlocked ? (
                      <Link href={`/lesson/${lesson.id}`} aria-label={`${lesson.title}${lesson.completed ? ", completada" : ""}`} className={className}>
                        {node}
                      </Link>
                    ) : (
                      <button type="button" disabled aria-label={`${lesson.title}, bloqueada`} className={className}>
                        {node}
                      </button>
                    )}
                    <span className={`${lesson.current ? "mt-8" : "mt-2"} max-w-[190px] text-center text-sm font-extrabold text-[#555]`}>{lesson.title}</span>
                    <span className="text-xs font-bold text-[#999]">{lesson.xpReward} XP</span>
                  </div>
                );
              })}
            </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

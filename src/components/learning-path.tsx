"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { z } from "zod";

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
  cefrLevel: string;
  lessons: Lesson[];
};

const unitsSchema = z.array(
  z.object({
    id: z.string(),
    order: z.number().int(),
    title: z.string(),
    description: z.string(),
    color: z.string(),
    cefrLevel: z.string(),
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
  }),
);

const lessonOffsetClasses = [
  "translate-x-0",
  "md:translate-x-10",
  "md:translate-x-7",
  "md:-translate-x-7",
  "md:-translate-x-10",
];

export function LearningPath() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setUnits(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("No pudimos cargar tu ruta. Inténtalo de nuevo.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center font-extrabold text-[#777]" role="status">
        Preparando tu ruta…
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl bg-[#fff2f2] p-6 text-center font-extrabold text-[#c43f3f]" role="alert">
        {error}
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#64a93b]">Tu curso · alemán A1</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Aprende a tu ritmo</h1>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#58a700]">
            {completed}/{total} lecciones
          </span>
        </div>
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

      <div className="space-y-10">
        {units.map((unit) => (
          <section key={unit.id} aria-labelledby={`${unit.id}-title`}>
            <div className="mb-5 rounded-3xl px-5 py-5 text-white shadow-sm sm:px-7" style={{ backgroundColor: unit.color }}>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/80">
                Unidad {unit.order} · {unit.cefrLevel}
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
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { exerciseDataSchemas, exerciseTypeSchema, type ExerciseType } from "@/lib/exercises/types";

type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  data: unknown;
};

type LessonPayload = {
  id: string;
  title: string;
  description?: string;
  xpReward?: number;
  unit?: { title: string; color: string };
  exercises: Exercise[];
};

type Feedback = {
  correct: boolean;
  correctAnswer: string;
  explanation: string | null;
  hearts: number;
};

type Completion = {
  xpEarned: number;
  progress: { xp: number; streak: number; hearts: number };
};

const exerciseSchema = z.object({
  id: z.string().min(1),
  type: exerciseTypeSchema,
  prompt: z.string(),
  data: z.unknown(),
});
const lessonSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  xpReward: z.number().optional(),
  unit: z.object({ title: z.string(), color: z.string() }).optional(),
  exercises: z.array(exerciseSchema).min(1),
});
const feedbackSchema = z.object({
  correct: z.boolean(),
  correctAnswer: z.string(),
  explanation: z.string().nullable(),
  hearts: z.number().int().min(0),
});
const completionSchema = z.object({
  xpEarned: z.number().int(),
  progress: z.object({
    xp: z.number().int(),
    streak: z.number().int(),
    hearts: z.number().int().min(0),
  }),
});
const heartProgressSchema = z.object({
  hearts: z.number().int().min(0).optional(),
  nextHeartAt: z.string().nullable().optional(),
});

export function ExerciseSession({
  mode,
  lessonId,
  grammarSlug,
}: {
  mode: "lesson" | "practice";
  lessonId?: string;
  grammarSlug?: string;
}) {
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonPayload | null>(null);
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [placedTiles, setPlacedTiles] = useState<number[]>([]);
  const [pairs, setPairs] = useState<Array<[string, string]>>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [checking, setChecking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [checks, setChecks] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [refillingHearts, setRefillingHearts] = useState(false);
  const [nextHeartAt, setNextHeartAt] = useState<string | null>(null);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [finished, setFinished] = useState(false);

  async function addHearts() {
    if (mode !== "lesson" || refillingHearts) {
      return;
    }
    setRefillingHearts(true);
    const progress = await fetch("/api/progress/hearts", { method: "POST" })
      .then(async (response) => (response.ok ? heartProgressSchema.parse(await response.json()) : null))
      .catch(() => null);
    if (progress?.hearts !== undefined) {
      setHearts(progress.hearts);
      setNextHeartAt(progress.nextHeartAt ?? null);
      const updatedHearts = progress.hearts;
      setFeedback((current) => (current ? { ...current, hearts: updatedHearts } : current));
      setOutOfHearts(false);
      setPageError("");
      window.dispatchEvent(new CustomEvent("hearts-refilled", { detail: { hearts: updatedHearts } }));
    }
    setRefillingHearts(false);
  }

  useEffect(() => {
    let active = true;
    const contentUrl =
      mode === "lesson"
        ? `/api/lessons/${encodeURIComponent(lessonId ?? "")}`
        : `/api/grammar/${encodeURIComponent(grammarSlug ?? "")}`;
    Promise.all([
      fetch(contentUrl).then(async (response) => {
        if (!response.ok) {
          throw new Error(response.status === 403 ? "Esta lección todavía está bloqueada." : "No pudimos cargar la actividad.");
        }
        const body: unknown = await response.json();
        return lessonSchema.parse(body);
      }),
      mode === "lesson"
        ? fetch("/api/progress").then(async (response) => {
            if (!response.ok) {
              return null;
            }
            return heartProgressSchema.parse(await response.json());
          })
        : Promise.resolve(null),
    ])
      .then(([payload, progress]) => {
        if (active) {
          const parsedExercises: Exercise[] = payload.exercises.map((exercise) => ({
            ...exercise,
            data: exerciseDataSchemas[exercise.type].parse(exercise.data),
          }));
          setLesson(payload);
          setQueue(parsedExercises);
          setHearts(progress?.hearts ?? 5);
          setNextHeartAt(progress?.nextHeartAt ?? null);
          setLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setPageError(cause instanceof Error ? cause.message : "No pudimos cargar la actividad.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [grammarSlug, lessonId, mode]);

  const current = queue[index];
  useEffect(() => {
    setAnswerText("");
    setChoice(null);
    setPlacedTiles([]);
    setPairs([]);
    setSelectedLeft(null);
  }, [index]);

  const answerReady = useMemo(() => {
    if (!current) {
      return false;
    }
    switch (current.type) {
      case "TRANSLATE_DE_ES":
      case "TRANSLATE_ES_DE":
      case "FILL_BLANK":
        return answerText.trim().length > 0;
      case "MULTIPLE_CHOICE":
        return choice !== null;
      case "WORD_ORDER":
        return placedTiles.length > 0;
      case "MATCH_PAIRS": {
        const data = exerciseDataSchemas.MATCH_PAIRS.parse(current.data);
        return pairs.length === data.left.length;
      }
    }
  }, [answerText, choice, current, pairs.length, placedTiles.length]);

  const makeAnswer = useCallback((): unknown => {
    if (!current) {
      return null;
    }
    switch (current.type) {
      case "TRANSLATE_DE_ES":
      case "TRANSLATE_ES_DE":
      case "FILL_BLANK":
        return answerText;
      case "MULTIPLE_CHOICE":
        return choice;
      case "WORD_ORDER": {
        const data = exerciseDataSchemas.WORD_ORDER.parse(current.data);
        return placedTiles.map((tileIndex) => data.tiles[tileIndex]);
      }
      case "MATCH_PAIRS":
        return pairs;
    }
  }, [answerText, choice, current, pairs, placedTiles]);

  useEffect(() => {
    if (!current || current.type !== "MULTIPLE_CHOICE" || feedback) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const number = Number(event.key);
      const options = exerciseDataSchemas.MULTIPLE_CHOICE.parse(current.data).options;
      if (number >= 1 && number <= options.length) {
        setChoice(number - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, feedback]);

  async function submitAnswer() {
    if (!current || !answerReady || checking) {
      return;
    }
    setChecking(true);
    try {
      const response = await fetch(`/api/exercises/${encodeURIComponent(current.id)}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: makeAnswer(), mode }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "No se pudo comprobar la respuesta.";
        if (message === "Sin corazones") {
          setOutOfHearts(true);
          return;
        }
        throw new Error(message);
      }
      const result = feedbackSchema.parse(body);
      setFeedback(result);
      setChecks((value) => value + 1);
      if (result.correct) {
        setCorrectAnswers((value) => value + 1);
      } else {
        setMistakes((value) => value + 1);
      }
      setHearts(result.hearts);
      if (mode === "lesson" && result.hearts === 0) {
        void fetch("/api/progress")
          .then(async (progressResponse) => (progressResponse.ok ? heartProgressSchema.parse(await progressResponse.json()) : null))
          .then((progress) => {
            if (progress) {
              setNextHeartAt(progress.nextHeartAt ?? null);
            }
          })
          .catch(() => undefined);
      }
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : "No se pudo comprobar la respuesta.");
    } finally {
      setChecking(false);
    }
  }

  async function advance() {
    if (!feedback || !current) {
      return;
    }
    if (mode === "lesson" && feedback.hearts === 0) {
      setOutOfHearts(true);
      return;
    }
    const nextQueue = feedback.correct || mode === "practice" ? queue : [...queue, current];
    setFeedback(null);
    if (index + 1 < nextQueue.length) {
      if (nextQueue !== queue) {
        setQueue(nextQueue);
      }
      setIndex((value) => value + 1);
      return;
    }

    if (mode === "practice") {
      setFinished(true);
      return;
    }

    setFinishing(true);
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId ?? "")}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mistakes }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "No se pudo guardar la lección.";
        if (message === "Sin corazones") {
          setOutOfHearts(true);
          return;
        }
        throw new Error(message);
      }
      setCompletion(completionSchema.parse(body));
      setFinished(true);
    } catch (cause) {
      setPageError(cause instanceof Error ? cause.message : "No se pudo guardar la lección.");
    } finally {
      setFinishing(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center font-extrabold text-[#777]" role="status">Cargando ejercicio…</div>;
  }
  if (pageError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <section className="max-w-md rounded-3xl border border-[#e5e5e5] p-8 text-center">
          <p role="alert" className="font-extrabold text-[#c43f3f]">{pageError}</p>
          <Link href="/" className="mt-5 inline-block font-black text-[#58a700]">Volver al camino</Link>
        </section>
      </main>
    );
  }
  if (outOfHearts) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffafa] px-4 py-10">
        <section className="max-w-md rounded-3xl border border-[#ffd3d3] bg-white p-8 text-center shadow-[0_6px_0_#ffd3d3]">
          <div className="text-6xl" aria-hidden="true">💔</div>
          <h1 className="mt-4 text-3xl font-black">Te has quedado sin corazones</h1>
          <p className="mt-2 font-semibold text-[#777]">Descansa un poco; recuperarás un corazón cada 30 minutos.</p>
          {nextHeartAt && <p className="mt-3 font-extrabold text-[#c43f3f]">Siguiente corazón: {new Date(nextHeartAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>}
          <div className="mt-6 flex flex-col items-center gap-3">
            <button type="button" disabled={refillingHearts} onClick={addHearts} className="pressable inline-flex rounded-xl border-[#d74242] bg-[#ff4b4b] px-6 py-3 font-black text-white disabled:opacity-60">❤️ AÑADIR 5 CORAZONES</button>
            <Link href="/" className="pressable inline-flex rounded-xl border-[#58a700] bg-[#58cc02] px-6 py-3 font-black text-white">VOLVER AL CAMINO</Link>
          </div>
        </section>
      </main>
    );
  }
  if (finished) {
    const accuracy = checks === 0 ? 100 : Math.round((correctAnswers / checks) * 100);
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fff4] px-4 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-[#d8efca] bg-white p-8 text-center shadow-[0_6px_0_#d8efca]">
          <div className="text-6xl" aria-hidden="true">🎉</div>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-[#64a93b]">{mode === "lesson" ? "Lección completada" : "Práctica terminada"}</p>
          <h1 className="mt-2 text-3xl font-black">{mode === "lesson" ? "¡Buen trabajo!" : "¡Sigue así!"}</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#eefaff] p-4"><div className="text-2xl font-black text-[#1688bb]">{completion?.xpEarned ?? 0}</div><div className="text-xs font-extrabold text-[#777]">XP ganados</div></div>
            <div className="rounded-2xl bg-[#fff8dc] p-4"><div className="text-2xl font-black text-[#b58b00]">{accuracy}%</div><div className="text-xs font-extrabold text-[#777]">Precisión</div></div>
          </div>
          <p className="mt-4 font-bold text-[#777]">🔥 Racha: {completion?.progress.streak ?? "—"} días</p>
          <Link href={mode === "lesson" ? "/" : `/grammar/${grammarSlug}`} onClick={() => router.refresh()} className="pressable mt-7 inline-flex w-full justify-center rounded-xl border-[#58a700] bg-[#58cc02] px-6 py-3.5 font-black text-white">
            CONTINUAR
          </Link>
        </section>
      </main>
    );
  }
  if (!lesson || !current) {
    return null;
  }

  const progress = Math.min(100, Math.round((index / Math.max(queue.length, 1)) * 100));

  return (
    <main className="min-h-screen bg-white pb-36">
      <header className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-5 sm:px-7">
        <button
          type="button"
          aria-label="Salir de la actividad"
          onClick={() => {
            if (window.confirm("¿Quieres salir? Tu progreso de esta lección no se guardará.")) {
              router.push(mode === "lesson" ? "/" : `/grammar/${grammarSlug}`);
            }
          }}
          className="rounded-xl px-2 py-1 text-2xl font-bold text-[#999] hover:bg-[#f5f5f5]"
        >
          ×
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#e5e5e5]" role="progressbar" aria-label="Progreso del ejercicio" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-[#58cc02] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        {mode === "lesson" && (
          <button
            type="button"
            disabled={refillingHearts}
            onClick={addHearts}
            aria-label={`Añadir 5 corazones (tienes ${hearts})`}
            className="whitespace-nowrap rounded-xl px-2 py-1 font-black text-[#d93d3d] disabled:opacity-60"
          >
            ❤️ {hearts}
          </button>
        )}
      </header>

      <section className="mx-auto max-w-2xl px-4 pt-7 sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#999]">{mode === "lesson" ? lesson.unit?.title ?? "Lección" : "Práctica de gramática"}</p>
        <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{current.prompt}</h1>

        <div className="mt-8">
          {renderExercise({
            exercise: current,
            text: answerText,
            setText: setAnswerText,
            choice,
            setChoice,
            placedTiles,
            setPlacedTiles,
            pairs,
            setPairs,
            selectedLeft,
            setSelectedLeft,
            disabled: Boolean(feedback) || checking,
          })}
        </div>

        {pageError && <p role="alert" className="mt-5 rounded-xl bg-[#fff0f0] px-4 py-3 font-bold text-[#c43f3f]">{pageError}</p>}
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-10 border-t border-[#e5e5e5] bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-2xl justify-end">
          {!feedback ? (
            <button type="button" disabled={!answerReady || checking} onClick={submitAnswer} className="pressable w-full rounded-xl border-[#58a700] bg-[#58cc02] px-7 py-3.5 font-black tracking-wide text-white disabled:cursor-not-allowed disabled:border-[#c8c8c8] disabled:bg-[#e5e5e5] sm:w-auto">
              {checking ? "COMPROBANDO…" : "COMPROBAR"}
            </button>
          ) : (
            <button type="button" disabled={finishing} onClick={advance} className={`pressable w-full rounded-xl px-7 py-3.5 font-black tracking-wide text-white sm:w-auto ${feedback.correct ? "border-[#58a700] bg-[#58cc02]" : "border-[#d74242] bg-[#ff4b4b]"}`}>
              {finishing ? "GUARDANDO…" : "CONTINUAR"}
            </button>
          )}
        </div>
      </footer>

      {feedback && (
        <div className={`animate-slide-up fixed inset-x-0 bottom-[72px] z-10 border-t-2 px-4 py-4 pb-5 sm:bottom-[76px] ${feedback.correct ? "border-[#bce99d] bg-[#f1ffea]" : "border-[#ffcaca] bg-[#fff1f1]"}`} aria-live="polite">
          <div className="mx-auto flex max-w-2xl items-start gap-3">
            <span className="text-3xl" aria-hidden="true">{feedback.correct ? "✅" : "❌"}</span>
            <div>
              <h2 className={`text-xl font-black ${feedback.correct ? "text-[#428515]" : "text-[#c43f3f]"}`}>{feedback.correct ? "¡Muy bien!" : "Solución correcta:"}</h2>
              {!feedback.correct && <p className="mt-1 font-extrabold text-[#555]">{feedback.correctAnswer}</p>}
              {feedback.explanation && <p className="mt-1 text-sm font-semibold text-[#666]">{feedback.explanation}</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function renderExercise({
  exercise,
  text,
  setText,
  choice,
  setChoice,
  placedTiles,
  setPlacedTiles,
  pairs,
  setPairs,
  selectedLeft,
  setSelectedLeft,
  disabled,
}: {
  exercise: Exercise;
  text: string;
  setText: (value: string) => void;
  choice: number | null;
  setChoice: (value: number | null) => void;
  placedTiles: number[];
  setPlacedTiles: (value: number[] | ((current: number[]) => number[])) => void;
  pairs: Array<[string, string]>;
  setPairs: (value: Array<[string, string]> | ((current: Array<[string, string]>) => Array<[string, string]>)) => void;
  selectedLeft: string | null;
  setSelectedLeft: (value: string | null) => void;
  disabled: boolean;
}) {
  if (exercise.type === "TRANSLATE_DE_ES" || exercise.type === "TRANSLATE_ES_DE") {
    const data = exerciseDataSchemas[exercise.type].parse(exercise.data);
    return (
      <div>
        <div className="mb-4 rounded-2xl bg-[#f5f5f5] p-5 text-xl font-extrabold">{data.sourceText}</div>
        <label className="block text-sm font-extrabold text-[#777]">
          Tu respuesta
          <textarea value={text} onChange={(event) => setText(event.target.value)} disabled={disabled} rows={3} autoFocus className="mt-2 w-full resize-y rounded-2xl border-2 border-[#e5e5e5] p-4 text-lg font-semibold outline-none focus:border-[#58cc02] disabled:bg-[#fafafa]" />
        </label>
        {data.hint && <p className="mt-2 text-sm font-semibold text-[#999]">Pista: {data.hint}</p>}
      </div>
    );
  }
  if (exercise.type === "MULTIPLE_CHOICE") {
    const data = exerciseDataSchemas.MULTIPLE_CHOICE.parse(exercise.data);
    return (
      <div className="space-y-3">
        {data.sourceText && <div className="mb-4 rounded-2xl bg-[#f5f5f5] p-5 text-xl font-extrabold">{data.sourceText}</div>}
        {data.options.map((option, index) => (
          <button key={`${index}-${option}`} type="button" disabled={disabled} onClick={() => setChoice(index)} aria-pressed={choice === index} className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left font-extrabold transition ${choice === index ? "border-[#58cc02] bg-[#f4ffed] text-[#4a861e]" : "border-[#e5e5e5] hover:bg-[#fafafa]"}`}>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-sm ${choice === index ? "border-[#58cc02] bg-[#58cc02] text-white" : "border-[#ddd] text-[#999]"}`}>{index + 1}</span>
            {option}
          </button>
        ))}
      </div>
    );
  }
  if (exercise.type === "WORD_ORDER") {
    const data = exerciseDataSchemas.WORD_ORDER.parse(exercise.data);
    const remaining = data.tiles.map((word, index) => ({ word, index })).filter(({ index }) => !placedTiles.includes(index));
    return (
      <div>
        <div className="mb-5 flex min-h-16 flex-wrap items-center gap-2 border-b-2 border-[#e5e5e5] pb-4">
          {placedTiles.map((tileIndex) => (
            <button key={tileIndex} type="button" disabled={disabled} onClick={() => setPlacedTiles((current) => current.filter((index) => index !== tileIndex))} className="rounded-xl border-2 border-[#d5d5d5] bg-white px-3 py-2 font-extrabold shadow-[0_2px_0_#d5d5d5]">{data.tiles[tileIndex]}</button>
          ))}
          {placedTiles.length === 0 && <span className="text-sm font-semibold text-[#aaa]">Toca las palabras en orden</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {remaining.map(({ word, index }) => (
            <button key={index} type="button" disabled={disabled} onClick={() => setPlacedTiles((current) => [...current, index])} className="rounded-xl border-2 border-[#e5e5e5] bg-white px-4 py-2.5 font-extrabold shadow-[0_3px_0_#e5e5e5] hover:bg-[#f8f8f8]">{word}</button>
          ))}
        </div>
      </div>
    );
  }
  if (exercise.type === "FILL_BLANK") {
    const data = exerciseDataSchemas.FILL_BLANK.parse(exercise.data);
    const [before, after] = data.sentence.split("___");
    return (
      <div>
        <p className="mb-5 text-xl font-extrabold leading-relaxed">{before}<span className="mx-1 inline-block min-w-20 border-b-2 border-[#58cc02] text-center text-[#58a700]">{text || "…"}</span>{after}</p>
        {data.options ? (
          <div className="flex flex-wrap gap-2">
            {data.options.map((option) => (
              <button key={option} type="button" disabled={disabled} onClick={() => setText(option)} aria-pressed={text === option} className={`rounded-xl border-2 px-4 py-2.5 font-extrabold ${text === option ? "border-[#58cc02] bg-[#f4ffed] text-[#4a861e]" : "border-[#e5e5e5] hover:bg-[#fafafa]"}`}>{option}</button>
            ))}
          </div>
        ) : (
          <input value={text} onChange={(event) => setText(event.target.value)} disabled={disabled} aria-label="Completa la frase" className="w-full rounded-2xl border-2 border-[#e5e5e5] p-4 text-lg font-semibold outline-none focus:border-[#58cc02]" />
        )}
      </div>
    );
  }
  const data = exerciseDataSchemas.MATCH_PAIRS.parse(exercise.data);
  const usedLeft = new Set(pairs.map(([left]) => left));
  const usedRight = new Set(pairs.map(([, right]) => right));
  function selectRight(right: string) {
    if (!selectedLeft || usedRight.has(right)) {
      return;
    }
    setPairs((current) => [...current, [selectedLeft, right]]);
    setSelectedLeft(null);
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {[data.left, data.right].map((column, columnIndex) => (
        <div key={columnIndex} className="space-y-3">
          {column.map((value) => {
            const isUsed = columnIndex === 0 ? usedLeft.has(value) : usedRight.has(value);
            const isSelected = columnIndex === 0 ? selectedLeft === value : false;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled || isUsed}
                onClick={() => (columnIndex === 0 ? setSelectedLeft(value) : selectRight(value))}
                className={`min-h-14 w-full rounded-xl border-2 px-2 py-3 text-sm font-extrabold sm:text-base ${isUsed ? "border-[#bfe8a6] bg-[#f5fff0] text-[#999]" : isSelected ? "border-[#58cc02] bg-[#f4ffed] text-[#4a861e]" : "border-[#e5e5e5] hover:bg-[#fafafa]"}`}
              >
                {value}
              </button>
            );
          })}
        </div>
      ))}
      {pairs.length > 0 && (
        <div className="col-span-2 mt-2 flex flex-wrap gap-2" aria-live="polite">
          {pairs.map(([left, right]) => <span key={`${left}-${right}`} className="rounded-full bg-[#f3f3f3] px-3 py-1 text-xs font-bold text-[#777]">{left} ↔ {right}</span>)}
        </div>
      )}
    </div>
  );
}

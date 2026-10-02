"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { z } from "zod";
import { CEFR_LEVELS, CEFR_LEVEL_LABELS, cefrLevelSchema, type CefrLevel } from "@/lib/levels";

const topicListSchema = z.array(
  z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    order: z.number().int(),
    cefrLevel: cefrLevelSchema,
  }),
);
const grammarResponseSchema = z.object({
  level: cefrLevelSchema,
  topics: topicListSchema,
});

const topicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  explanation: z.string(),
  cefrLevel: z.string(),
  exercises: z.array(z.object({ id: z.string(), type: z.string(), prompt: z.string(), data: z.unknown() })),
});

type GrammarTopic = z.infer<typeof topicSchema>;

export function GrammarIndex() {
  const [topics, setTopics] = useState<z.infer<typeof topicListSchema>>([]);
  const [level, setLevel] = useState<CefrLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const latestRequestedLevel = useRef<CefrLevel | null>(null);

  useEffect(() => {
    let active = true;
    latestRequestedLevel.current = null;
    fetch("/api/grammar")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No pudimos cargar los temas.");
        }
        return grammarResponseSchema.parse(await response.json());
      })
      .then((value) => {
        if (active && latestRequestedLevel.current === null) {
          setLevel(value.level);
          setTopics(value.topics);
        }
      })
      .catch(() => {
        if (active && latestRequestedLevel.current === null) {
          setError("No pudimos cargar los temas de gramática. Inténtalo de nuevo.");
        }
      })
      .finally(() => {
        if (active && latestRequestedLevel.current === null) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLevelChange(nextLevel: CefrLevel) {
    if (nextLevel === level) {
      return;
    }
    latestRequestedLevel.current = nextLevel;
    setLevel(nextLevel);
    setTopics([]);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/grammar?level=${encodeURIComponent(nextLevel)}`);
      if (!response.ok) {
        throw new Error("No pudimos cargar los temas.");
      }
      const value = grammarResponseSchema.parse(await response.json());
      if (latestRequestedLevel.current === nextLevel) {
        setLevel(value.level);
        setTopics(value.topics);
      }
    } catch {
      if (latestRequestedLevel.current === nextLevel) {
        setError("No pudimos cargar los temas de gramática. Inténtalo de nuevo.");
      }
    } finally {
      if (latestRequestedLevel.current === nextLevel) {
        setLoading(false);
      }
    }
  }

  return (
    <div>
      <header className="mb-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#64a93b]">Tu caja de herramientas</p>
        <h1 className="mt-1 text-3xl font-black">Gramática alemana</h1>
        <p className="mt-2 font-semibold text-[#777]">Reglas claras, ejemplos cotidianos y práctica breve.</p>
      </header>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Nivel de gramática">
        {CEFR_LEVELS.map((cefrLevel) => {
          const selected = level === cefrLevel;
          return (
            <button
              key={cefrLevel}
              type="button"
              aria-pressed={selected}
              onClick={() => void handleLevelChange(cefrLevel)}
              className={`min-w-0 rounded-xl border-2 border-b-4 px-2 py-2 text-left transition ${
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
      {error ? (
        <p role="alert" className="rounded-2xl bg-[#fff0f0] p-5 font-bold text-[#c43f3f]">{error}</p>
      ) : loading ? (
        <p role="status" className="py-12 text-center font-bold text-[#999]">Cargando temas…</p>
      ) : topics.length === 0 ? (
        <p role="status" className="py-12 text-center font-bold text-[#999]">Aún no hay temas para este nivel.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((topic, index) => (
            <Link key={topic.id} href={`/grammar/${topic.slug}`} className="group rounded-3xl border-2 border-[#e5e5e5] bg-white p-5 transition hover:-translate-y-1 hover:border-[#bce99d] hover:shadow-[0_4px_0_#dcebd3]">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2ffea] text-xl font-black text-[#58a700]">{index + 1}</span>
                <span className="rounded-full bg-[#f4f4f4] px-3 py-1 text-xs font-black text-[#888]">{topic.cefrLevel}</span>
              </div>
              <h2 className="mt-4 text-xl font-black group-hover:text-[#58a700]">{topic.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#777]">{topic.summary}</p>
              <span className="mt-4 inline-block text-sm font-black text-[#58a700]">Ver explicación →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function GrammarTopicPage({ slug }: { slug: string }) {
  const [topic, setTopic] = useState<GrammarTopic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/grammar/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No encontramos este tema.");
        }
        return topicSchema.parse(await response.json());
      })
      .then(setTopic)
      .catch(() => setError("No encontramos este tema de gramática."));
  }, [slug]);

  if (error) {
    return <p role="alert" className="rounded-2xl bg-[#fff0f0] p-5 font-bold text-[#c43f3f]">{error}</p>;
  }
  if (!topic) {
    return <p role="status" className="py-12 text-center font-bold text-[#999]">Cargando explicación…</p>;
  }

  return (
    <article>
      <Link href="/grammar" className="text-sm font-extrabold text-[#58a700] hover:underline">← Gramática</Link>
      <header className="mb-6 mt-4 rounded-3xl bg-[#f4ffed] p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#64a93b]">Gramática · {topic.cefrLevel}</p>
        <h1 className="mt-1 text-3xl font-black">{topic.title}</h1>
        <p className="mt-2 font-semibold text-[#666]">{topic.summary}</p>
      </header>
      <div className="rounded-3xl border-2 border-[#e5e5e5] bg-white p-5 sm:p-7">
        <SafeExplanation text={topic.explanation} />
      </div>
      <div className="mt-6 rounded-3xl bg-[#eefaff] p-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black">¿Lo tienes claro?</h2>
          <p className="mt-1 text-sm font-semibold text-[#777]">{topic.exercises.length} ejercicios para practicar sin perder corazones.</p>
        </div>
        <Link href={`/grammar/${topic.slug}/practice`} className="pressable mt-4 inline-flex w-full justify-center rounded-xl border-[#1688bb] bg-[#1cb0f6] px-6 py-3 font-black text-white sm:mt-0 sm:w-auto">
          PRACTICAR
        </Link>
      </div>
    </article>
  );
}

function SafeExplanation({ text }: { text: string }) {
  return <div className="space-y-4 text-[15px] leading-7 text-[#555]">{renderExplanation(text)}</div>;
}

function renderExplanation(text: string): ReactNode[] {
  const lines = text.split(/\r?\n/u);
  const elements: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} className="pt-2 text-xl font-black text-[#333]">{line.slice(3)}</h2>);
      index += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      elements.push(
        <ul key={key++} className="list-disc space-y-1 pl-6">
          {items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
        </ul>,
      );
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const cells = lines[index].trim().split("|").slice(1, -1).map((cell) => cell.trim());
        if (!cells.every((cell) => /^[-:]+$/u.test(cell))) {
          rows.push(cells);
        }
        index += 1;
      }
      elements.push(
        <div key={key++} className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
          <table className="w-full min-w-[360px] border-collapse text-left text-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? "bg-[#f4ffed] font-black text-[#4a861e]" : "border-t border-[#e5e5e5]"}>
                  {row.map((cell, cellIndex) => rowIndex === 0 ? <th key={cellIndex} className="px-3 py-2">{cell}</th> : <td key={cellIndex} className="px-3 py-2">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("## ") &&
      !lines[index].trim().startsWith("- ") &&
      !lines[index].trim().startsWith("|")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    elements.push(<p key={key++}>{paragraph.join(" ")}</p>);
  }
  return elements;
}

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  CEFR_LEVELS,
  CEFR_LEVEL_LABELS,
  cefrLevelListSchema,
  cefrLevelSchema,
  levelsUpTo,
  type CefrLevel,
} from "@/lib/levels";

const topicsSchema = z.array(z.object({ topic: z.string(), count: z.number().int().nonnegative() }));
const itemSchema = z.object({
  id: z.string(),
  german: z.string(),
  spanish: z.string(),
  article: z.string().nullable(),
  plural: z.string().nullable(),
  topic: z.string(),
  cefrLevel: cefrLevelSchema,
  exampleDe: z.string().nullable(),
  exampleEs: z.string().nullable(),
});
const itemsSchema = z.array(itemSchema);
const progressSchema = z.object({ selectedLevel: cefrLevelSchema });
const reviewCardsSchema = z.array(
  itemSchema.extend({
    review: z.object({
      easeFactor: z.number(),
      interval: z.number().int(),
      repetitions: z.number().int(),
      nextReviewAt: z.string(),
      lastReviewedAt: z.string().nullable(),
    }).nullable(),
  }),
);

type VocabularyItem = z.infer<typeof itemSchema>;
type ReviewCard = z.infer<typeof reviewCardsSchema>[number];

const topicIcons: Record<string, string> = {
  verbos: "🏃",
  conectores: "🔗",
  saludos: "👋",
  numeros: "🔢",
  familia: "👨‍👩‍👧",
  comida: "🍎",
  casa: "🏠",
  ciudad: "🚲",
  tiempo: "⏰",
  ropa: "👕",
  trabajo: "💼",
  ocio: "🎨",
};

const topicLabels: Record<string, string> = {
  verbos: "Verbos",
  conectores: "Conectores",
};

export function VocabularyIndex() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLevelsParam = useRef(searchParams.get("levels"));
  const [levels, setLevels] = useState<CefrLevel[] | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | null>(null);
  const [topics, setTopics] = useState<z.infer<typeof topicsSchema>>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/progress")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return progressSchema.parse(await response.json());
      })
      .then(({ selectedLevel: currentLevel }) => {
        if (!active) {
          return;
        }
        setSelectedLevel(currentLevel);
        const requestedLevels = initialLevelsParam.current;
        const parsedLevels = requestedLevels === null ? null : cefrLevelListSchema.safeParse(requestedLevels);
        setLevels(parsedLevels?.success ? parsedLevels.data : levelsUpTo(currentLevel));
      })
      .catch(() => {
        if (active) {
          setError("No pudimos cargar tu nivel.");
          setLoadingTopics(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!levels) {
      return;
    }
    let active = true;
    const query = `?levels=${encodeURIComponent(levels.join(","))}`;
    setLoadingTopics(true);
    setError("");
    Promise.all([
      fetch(`/api/vocabulary/topics${query}`).then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return topicsSchema.parse(await response.json());
      }),
      fetch(`/api/vocabulary/review${query}`).then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return reviewCardsSchema.parse(await response.json());
      }),
    ])
      .then(([topicList, cards]) => {
        if (!active) {
          return;
        }
        setTopics(topicList);
        setReviewCount(cards.length);
      })
      .catch(() => {
        if (active) {
          setError("No pudimos cargar el vocabulario.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingTopics(false);
        }
      });
    return () => {
      active = false;
    };
  }, [levels]);

  function selectLevels(nextLevels: CefrLevel[]) {
    const orderedLevels = CEFR_LEVELS.filter((level) => nextLevels.includes(level));
    if (orderedLevels.length === 0) {
      return;
    }
    setLevels(orderedLevels);
    router.replace(`${pathname}?levels=${encodeURIComponent(orderedLevels.join(","))}`, { scroll: false });
  }

  function toggleLevel(level: CefrLevel) {
    if (!levels) {
      return;
    }
    if (levels.includes(level)) {
      if (levels.length > 1) {
        selectLevels(levels.filter((current) => current !== level));
      }
      return;
    }
    selectLevels([...levels, level]);
  }

  const levelsQuery = levels ? `?levels=${encodeURIComponent(levels.join(","))}` : "";

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1688bb]">Palabras para usar de verdad</p>
        <h1 className="mt-1 text-3xl font-black">Vocabulario</h1>
        <p className="mt-2 font-semibold text-[#777]">Explora por tema o repasa con tarjetas inteligentes.</p>
      </header>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {CEFR_LEVELS.map((level) => {
          const selected = levels?.includes(level) ?? false;
          return (
            <button
              key={level}
              type="button"
              aria-pressed={selected}
              disabled={!levels}
              onClick={() => toggleLevel(level)}
              className={`rounded-xl border-2 px-3 py-2 text-sm font-black transition disabled:opacity-50 ${
                selected ? "border-[#1688bb] bg-[#eaf8ff] text-[#0879aa]" : "border-[#e5e5e5] bg-white text-[#777]"
              }`}
              title={CEFR_LEVEL_LABELS[level]}
            >
              {level}
            </button>
          );
        })}
        <button
          type="button"
          disabled={!selectedLevel || !levels}
          onClick={() => selectedLevel && selectLevels(levelsUpTo(selectedLevel))}
          className="rounded-xl border-2 border-[#d8efca] bg-[#f5fff0] px-3 py-2 text-sm font-black text-[#4d9200] disabled:opacity-50"
        >
          Hasta mi nivel ({selectedLevel ?? "…"})
        </button>
      </div>
      <Link href={`/vocabulary/review${levelsQuery}`} className="mb-7 flex items-center justify-between gap-4 rounded-3xl border-b-4 border-[#1688bb] bg-[#1cb0f6] p-5 text-white transition hover:brightness-105 sm:p-6">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.15em] text-white/80">Repetición espaciada</span>
          <h2 className="mt-1 text-xl font-black">Repasar ahora</h2>
          <p className="mt-1 text-sm font-semibold text-white/90">{reviewCount} tarjetas disponibles</p>
        </div>
        <span className="text-3xl" aria-hidden="true">🧠</span>
      </Link>
      {error ? (
        <p role="alert" className="rounded-2xl bg-[#fff0f0] p-5 font-bold text-[#c43f3f]">{error}</p>
      ) : loadingTopics ? (
        <p role="status" className="py-10 text-center font-bold text-[#999]">Cargando temas…</p>
      ) : topics.length === 0 ? (
        <p role="status" className="py-10 text-center font-bold text-[#999]">Aún no hay temas para estos niveles.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => (
            <Link key={topic.topic} href={`/vocabulary/${encodeURIComponent(topic.topic)}${levelsQuery}`} className="flex items-center justify-between rounded-2xl border-2 border-[#e5e5e5] bg-white p-4 transition hover:border-[#a8def8] hover:bg-[#f8fdff]">
              <span>
                <span className="block font-black capitalize">{topicLabels[topic.topic] ?? topic.topic}</span>
                <span className="mt-0.5 block text-sm font-semibold text-[#888]">{topic.count} palabras</span>
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eefaff] text-lg" aria-hidden="true">{topicIcons[topic.topic] ?? "📚"}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function VocabularyTopicPage({ topic }: { topic: string }) {
  const searchParams = useSearchParams();
  const levelsParam = searchParams.get("levels");
  const vocabularyHref =
    levelsParam === null ? "/vocabulary" : `/vocabulary?levels=${encodeURIComponent(levelsParam)}`;
  const levelsQuery = levelsParam === null ? "" : `&levels=${encodeURIComponent(levelsParam)}`;
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/vocabulary?topic=${encodeURIComponent(topic)}${levelsQuery}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return itemsSchema.parse(await response.json());
      })
      .then((loadedItems) => {
        if (active) {
          setItems(loadedItems);
          setIndex(0);
        }
      })
      .catch(() => {
        if (active) {
          setError("No pudimos cargar estas tarjetas.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [topic, levelsQuery]);

  function goTo(nextIndex: number) {
    if (items.length === 0) {
      return;
    }
    setIndex((nextIndex + items.length) % items.length);
    setFlipped(false);
  }

  async function rate(quality: number) {
    const item = items[index];
    if (!item || saving) {
      return;
    }
    setSaving(true);
    setSaveMessage("");
    setReviewError("");
    try {
      const response = await fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabularyItemId: item.id, quality }),
      });
      if (!response.ok) {
        throw new Error();
      }
      setSaveMessage("Guardado");
      goTo(index + 1);
    } catch {
      setReviewError("No se pudo guardar la valoración. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const item = items[index];
  const articleColor = item?.article === "der" ? "#1688bb" : item?.article === "die" ? "#e14f68" : "#58a700";

  return (
    <div>
      <Link href={vocabularyHref} className="text-sm font-extrabold text-[#1688bb] hover:underline">← Vocabulario</Link>
      <header className="mb-5 mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1688bb]">Tarjetas</p>
          <h1 className="mt-1 text-3xl font-black capitalize">{topicLabels[topic] ?? topic}</h1>
        </div>
        {items.length > 0 && <span className="text-sm font-extrabold text-[#999]">{index + 1} / {items.length}</span>}
      </header>
      {error ? (
        <p role="alert" className="rounded-2xl bg-[#fff0f0] p-5 font-bold text-[#c43f3f]">{error}</p>
      ) : loading ? (
        <p role="status" className="py-16 text-center font-bold text-[#999]">Cargando tarjetas…</p>
      ) : !item ? (
        <p role="status" className="py-16 text-center font-bold text-[#999]">No hay palabras para este tema en los niveles seleccionados.</p>
      ) : (
        <>
          <button type="button" aria-label={flipped ? "Mostrar anverso" : "Mostrar traducción"} aria-pressed={flipped} onClick={() => setFlipped((value) => !value)} className="block h-[330px] w-full [perspective:1000px] sm:h-[390px]">
            <span className={`flashcard-inner relative block h-full w-full ${flipped ? "is-flipped" : ""}`}>
              <span className="flashcard-face absolute inset-0 flex flex-col items-center justify-center rounded-[32px] border-2 border-[#d8effb] bg-gradient-to-br from-[#f3fbff] to-white p-6 shadow-[0_7px_0_#d8effb]">
                <span className="mb-8 rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#1688bb] shadow-sm">Deutsch</span>
                <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-black text-[#1688bb] shadow-sm">{item.cefrLevel}</span>
                {item.article && <span className="text-2xl font-black" style={{ color: articleColor }}>{item.article}</span>}
                <span className={`${item.article ? "mt-1" : ""} text-4xl font-black text-[#303030] sm:text-5xl`}>{item.german}</span>
                {item.plural && item.plural !== "—" && <span className="mt-4 text-base font-bold text-[#888]">Plural: die {item.plural}</span>}
                <span className="absolute bottom-6 text-sm font-bold text-[#aaa]">Toca para ver la traducción</span>
              </span>
              <span className="flashcard-face flashcard-back absolute inset-0 flex flex-col items-center justify-center rounded-[32px] border-2 border-[#d8efca] bg-gradient-to-br from-[#f5ffef] to-white p-6 shadow-[0_7px_0_#d8efca]">
                <span className="mb-8 rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#58a700] shadow-sm">Español</span>
                <span className="text-3xl font-black text-[#3c3c3c] sm:text-4xl">{item.spanish}</span>
                {item.exampleDe && <span className="mt-7 text-center text-lg font-extrabold text-[#555]">{item.exampleDe}</span>}
                {item.exampleEs && <span className="mt-1 text-center text-sm font-semibold text-[#888]">{item.exampleEs}</span>}
              </span>
            </span>
          </button>
          <p className="mt-3 text-center text-sm font-bold text-[#999]">Haz clic en la tarjeta para girarla</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button type="button" disabled={saving} onClick={() => { setSaveMessage(""); setReviewError(""); goTo(index - 1); }} className="rounded-xl border-2 border-[#e5e5e5] px-4 py-3 font-black text-[#666] hover:bg-[#f7f7f7] disabled:opacity-50">← Atrás</button>
            <button type="button" disabled={saving} onClick={() => void rate(3)} className="rounded-xl border-2 border-[#f1d5a4] px-4 py-3 font-black text-[#a56800] hover:bg-[#fff8eb] disabled:opacity-50">Difícil</button>
            <button type="button" disabled={saving} onClick={() => void rate(5)} className="rounded-xl border-2 border-[#d8efca] px-4 py-3 font-black text-[#58a700] hover:bg-[#f5fff0] disabled:opacity-50">Fácil</button>
            <button type="button" disabled={saving} onClick={() => { setSaveMessage(""); setReviewError(""); goTo(index + 1); }} className="rounded-xl border-2 border-[#e5e5e5] px-4 py-3 font-black text-[#666] hover:bg-[#f7f7f7] disabled:opacity-50">Adelante →</button>
          </div>
          {saveMessage && <p role="status" className="mt-3 text-center text-sm font-bold text-[#58a700]">{saveMessage}</p>}
          {reviewError && <p role="alert" className="mt-3 text-center text-sm font-bold text-[#c43f3f]">{reviewError}</p>}
        </>
      )}
    </div>
  );
}

export function VocabularyReviewPage() {
  const searchParams = useSearchParams();
  const levelsParam = searchParams.get("levels");
  const vocabularyHref =
    levelsParam === null ? "/vocabulary" : `/vocabulary?levels=${encodeURIComponent(levelsParam)}`;
  const levelsQuery = levelsParam === null ? "" : `?levels=${encodeURIComponent(levelsParam)}`;
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/api/vocabulary/review${levelsQuery}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return reviewCardsSchema.parse(await response.json());
      })
      .then((loadedCards) => {
        if (active) {
          setCards(loadedCards);
        }
      })
      .catch(() => {
        if (active) {
          setError("No pudimos cargar la sesión de repaso.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [levelsQuery]);

  async function rate(quality: number) {
    const card = cards[index];
    if (!card || saving) {
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabularyItemId: card.id, quality }),
      });
      if (!response.ok) {
        throw new Error();
      }
      setDone((value) => value + 1);
      setShowAnswer(false);
      if (index + 1 >= cards.length) {
        setIndex(cards.length);
      } else {
        setIndex((value) => value + 1);
      }
    } catch {
      setError("No se pudo guardar tu respuesta. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const card = cards[index];
  const articleColor = card?.article === "der" ? "#1688bb" : card?.article === "die" ? "#e14f68" : "#58a700";

  if (loading) {
    return <p role="status" className="py-16 text-center font-bold text-[#999]">Preparando el repaso…</p>;
  }
  if (error) {
    return <p role="alert" className="rounded-2xl bg-[#fff0f0] p-5 font-bold text-[#c43f3f]">{error}</p>;
  }
  if (!card) {
    return (
      <section className="rounded-3xl border border-[#d8efca] bg-[#f5fff0] p-8 text-center">
        <div className="text-5xl" aria-hidden="true">🌟</div>
        <h1 className="mt-3 text-2xl font-black">{done > 0 ? "¡Repaso completado!" : "¡Todo al día!"}</h1>
        <p className="mt-2 font-semibold text-[#777]">{done > 0 ? `Has repasado ${done} tarjetas.` : "No hay tarjetas pendientes por ahora."}</p>
        <Link href={vocabularyHref} className="pressable mt-6 inline-flex rounded-xl border-[#58a700] bg-[#58cc02] px-6 py-3 font-black text-white">VOLVER AL VOCABULARIO</Link>
      </section>
    );
  }

  return (
    <div>
      <Link href={vocabularyHref} className="text-sm font-extrabold text-[#1688bb] hover:underline">← Vocabulario</Link>
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-black">Repaso inteligente</h1>
        <span className="text-sm font-extrabold text-[#999]">{index + 1} / {cards.length}</span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e5e5e5]" role="progressbar" aria-label="Progreso del repaso" aria-valuenow={index} aria-valuemin={0} aria-valuemax={cards.length}>
        <div className="h-full rounded-full bg-[#1cb0f6] transition-all" style={{ width: `${(index / cards.length) * 100}%` }} />
      </div>
      <section className="mt-7 flex min-h-[300px] flex-col items-center justify-center rounded-[32px] border-2 border-[#d8effb] bg-gradient-to-br from-[#f3fbff] to-white p-6 text-center shadow-[0_7px_0_#d8effb] sm:min-h-[360px]">
        <p className="rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#1688bb] shadow-sm">{showAnswer ? "Respuesta" : "¿Recuerdas esta palabra?"}</p>
        <span className="mt-5 rounded-full bg-white px-3 py-1 text-xs font-black text-[#1688bb] shadow-sm">{card.cefrLevel}</span>
        {card.article && <p className="mt-2 text-2xl font-black" style={{ color: articleColor }}>{card.article}</p>}
        <h2 className={`${card.article ? "mt-1" : "mt-5"} text-4xl font-black sm:text-5xl`}>{card.german}</h2>
        {card.plural && card.plural !== "—" && <p className="mt-3 font-bold text-[#888]">Plural: {card.plural}</p>}
        {showAnswer && (
          <>
            <p className="mt-7 text-2xl font-black text-[#58a700]">{card.spanish}</p>
            {card.exampleDe && <p className="mt-3 text-sm font-extrabold text-[#555]">{card.exampleDe}</p>}
            {card.exampleEs && <p className="mt-1 text-sm font-semibold text-[#888]">{card.exampleEs}</p>}
          </>
        )}
      </section>
      {!showAnswer ? (
        <button type="button" onClick={() => setShowAnswer(true)} className="pressable mt-6 w-full rounded-xl border-[#1688bb] bg-[#1cb0f6] px-6 py-3.5 font-black text-white">MOSTRAR RESPUESTA</button>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { quality: 1, label: "Otra vez", color: "border-[#d74242] bg-[#ff4b4b]" },
            { quality: 3, label: "Difícil", color: "border-[#d99b00] bg-[#ffc800]" },
            { quality: 4, label: "Bien", color: "border-[#1688bb] bg-[#1cb0f6]" },
            { quality: 5, label: "Fácil", color: "border-[#58a700] bg-[#58cc02]" },
          ].map((rating) => (
            <button key={rating.quality} type="button" disabled={saving} onClick={() => rate(rating.quality)} className={`pressable rounded-xl px-3 py-3 font-black text-white disabled:opacity-60 ${rating.color}`}>{rating.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

type ProgressSummary = {
  hearts: number;
  xp: number;
  streak: number;
};

const progressSummarySchema = z.object({
  hearts: z.number().int().min(0),
  xp: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
});

const heartRefillSchema = z.object({ hearts: z.number().int().min(0) });

const navigation = [
  { href: "/", label: "Aprender", icon: "🛤️" },
  { href: "/grammar", label: "Gramática", icon: "📘" },
  { href: "/vocabulary", label: "Vocabulario", icon: "🗂️" },
  { href: "/profile", label: "Perfil", icon: "👤" },
];

function Stat({
  icon,
  label,
  value,
  color,
  onClick,
  disabled,
  ariaLabel,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const content = (
    <>
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div>
        <div className="text-xs font-extrabold uppercase tracking-wide text-[#777]">{label}</div>
        <div className="text-base font-black" style={{ color }}>
          {value}
        </div>
      </div>
    </>
  );
  const className = "flex items-center gap-2 rounded-2xl border border-[#e5e5e5] bg-white px-3 py-2";
  return onClick ? (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`${className} text-left hover:bg-[#fafafa] disabled:cursor-wait disabled:opacity-60`}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<ProgressSummary>({ hearts: 5, xp: 0, streak: 0 });
  const [refillingHearts, setRefillingHearts] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/progress")
      .then(async (response) => (response.ok ? progressSummarySchema.parse(await response.json()) : null))
      .then((value) => {
        if (active && value) {
          setSummary(value);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    function updateHearts(event: Event) {
      const result = heartRefillSchema.safeParse((event as CustomEvent<unknown>).detail);
      if (result.success) {
        setSummary((current) => ({ ...current, hearts: result.data.hearts }));
      }
    }
    window.addEventListener("hearts-refilled", updateHearts);
    return () => window.removeEventListener("hearts-refilled", updateHearts);
  }, []);

  async function addHearts() {
    if (refillingHearts) {
      return;
    }
    setRefillingHearts(true);
    const result = await fetch("/api/progress/hearts", { method: "POST" })
      .then(async (response) => (response.ok ? heartRefillSchema.parse(await response.json()) : null))
      .catch(() => null);
    if (result) {
      setSummary((current) => ({ ...current, hearts: result.hearts }));
    }
    setRefillingHearts(false);
  }

  const fullScreen = pathname.startsWith("/lesson/") || pathname.endsWith("/practice");
  if (fullScreen) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white text-[#3c3c3c]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[244px] border-r border-[#e5e5e5] bg-white px-5 py-8 md:block">
        <Link href="/" className="mb-10 flex items-center gap-2 text-3xl font-black tracking-tight text-[#58a700]">
          <span aria-hidden="true">🦉</span> Deolingo
        </Link>
        <nav aria-label="Navegación principal" className="space-y-2">
          {navigation.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3 font-extrabold transition-colors ${
                  active
                    ? "border-[#d7f3bd] bg-[#f4ffed] text-[#58a700]"
                    : "border-transparent text-[#777] hover:bg-[#f7f7f7]"
                }`}
              >
                <span aria-hidden="true" className="text-xl">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-10 border-b border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-xl font-black text-[#58a700]">
            🦉 Deolingo
          </Link>
          <div className="flex gap-2">
            <span className="rounded-xl bg-[#fff8dc] px-2 py-1 font-black text-[#b58b00]" aria-label={`${summary.streak} días de racha`}>
              🔥 {summary.streak}
            </span>
            <span className="rounded-xl bg-[#eefaff] px-2 py-1 font-black text-[#1688bb]" aria-label={`${summary.xp} puntos de experiencia`}>
              ⚡ {summary.xp}
            </span>
            <button
              type="button"
              disabled={refillingHearts}
              onClick={addHearts}
              aria-label={`Añadir 5 corazones (tienes ${summary.hearts})`}
              className="rounded-xl bg-[#fff1f1] px-2 py-1 font-black text-[#d93d3d] disabled:opacity-60"
            >
              ❤️ {summary.hearts}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-screen max-w-[1440px] md:pl-[244px]">
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-8 md:pb-10 md:pt-10">
          <div className="mx-auto max-w-[760px]">{children}</div>
        </main>
        <aside className="hidden w-[250px] shrink-0 space-y-3 border-l border-[#e5e5e5] px-5 py-10 lg:block">
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-[#999]">Tu progreso</h2>
          <Stat icon="🔥" label="Racha" value={`${summary.streak} días`} color="#d99b00" />
          <Stat icon="⚡" label="Experiencia" value={summary.xp} color="#1688bb" />
          <Stat
            icon="❤️"
            label="Corazones"
            value={summary.hearts}
            color="#e04a4a"
            onClick={addHearts}
            disabled={refillingHearts}
            ariaLabel={`Añadir 5 corazones (tienes ${summary.hearts})`}
          />
          <div className="mt-6 rounded-2xl bg-[#f5fff0] p-4">
            <p className="text-sm font-extrabold text-[#497c25]">¡Un poquito cada día!</p>
            <p className="mt-1 text-sm leading-5 text-[#777]">Cinco minutos bastan para avanzar.</p>
          </div>
        </aside>
      </div>

      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-[#e5e5e5] bg-white px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2 text-[11px] font-extrabold ${active ? "text-[#58a700]" : "text-[#999]"}`}
            >
              <span aria-hidden="true" className="text-xl">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

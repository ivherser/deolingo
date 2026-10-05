"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CEFR_LEVEL_LABELS, cefrLevelSchema } from "@/lib/levels";

const progressSchema = z.object({
  selectedLevel: cefrLevelSchema,
  xp: z.number().int(),
  streak: z.number().int(),
  longestStreak: z.number().int(),
  hearts: z.number().int(),
  nextHeartAt: z.string().nullable(),
  completedLessons: z.number().int(),
  totalLessons: z.number().int(),
  learnedWords: z.number().int(),
});
const unitsSchema = z.object({
  level: cefrLevelSchema,
  units: z.array(z.object({
    id: z.string(),
    title: z.string(),
    lessons: z.array(z.object({ id: z.string(), completed: z.boolean() })),
  })),
});

export function ProfilePage({ name, email }: { name: string; email: string }) {
  const [progress, setProgress] = useState<z.infer<typeof progressSchema> | null>(null);
  const [units, setUnits] = useState<z.infer<typeof unitsSchema>["units"]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/progress").then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return progressSchema.parse(await response.json());
      }),
      fetch("/api/units").then(async (response) => {
        if (!response.ok) {
          throw new Error();
        }
        return unitsSchema.parse(await response.json());
      }),
    ])
      .then(([profile, unitList]) => {
        setProgress(profile);
        setUnits(unitList.units);
      })
      .catch(() => setError("No pudimos cargar tus estadísticas."));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#64a93b]">Tu espacio</p>
        <h1 className="mt-1 text-3xl font-black">Perfil</h1>
      </header>
      <section className="rounded-3xl border-2 border-[#e5e5e5] bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ffed] text-3xl" aria-hidden="true">👩‍🎓</div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black">{name}</h2>
            <p className="truncate text-sm font-semibold text-[#888]">{email}</p>
          </div>
        </div>
      </section>
      {error ? (
        <p role="alert" className="mt-5 rounded-2xl bg-[#fff0f0] p-5 font-bold text-[#c43f3f]">{error}</p>
      ) : !progress ? (
        <p role="status" className="py-12 text-center font-bold text-[#999]">Cargando estadísticas…</p>
      ) : (
        <>
          <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ProfileStat icon="🇩🇪" label="Nivel" value={CEFR_LEVEL_LABELS[progress.selectedLevel]} color="#58a700" />
            <ProfileStat icon="⚡" label="Experiencia total" value={`${progress.xp} XP`} color="#1688bb" />
            <ProfileStat icon="🔥" label="Racha actual" value={`${progress.streak} días`} color="#d99b00" />
            <ProfileStat icon="🏆" label="Racha máxima" value={`${progress.longestStreak} días`} color="#b58b00" />
            <ProfileStat icon="❤️" label="Corazones" value={progress.hearts} color="#e14f68" />
            <ProfileStat icon="📚" label="Lecciones" value={`${progress.completedLessons}/${progress.totalLessons}`} color="#58a700" />
            <ProfileStat icon="🧠" label="Palabras" value={progress.learnedWords} color="#8b62bd" />
          </section>
          <section className="mt-7 rounded-3xl border-2 border-[#e5e5e5] p-5">
            <h2 className="text-lg font-black">Avance por unidad</h2>
            <div className="mt-4 space-y-4">
              {units.map((unit, index) => {
                const done = unit.lessons.filter((lesson) => lesson.completed).length;
                const percent = unit.lessons.length ? (done / unit.lessons.length) * 100 : 0;
                return (
                  <div key={unit.id}>
                    <div className="mb-1.5 flex justify-between gap-2 text-sm">
                      <span className="font-extrabold">{index + 1}. {unit.title}</span>
                      <span className="font-bold text-[#888]">{done}/{unit.lessons.length}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#eee]" role="progressbar" aria-label={`Progreso: ${unit.title}`} aria-valuenow={done} aria-valuemin={0} aria-valuemax={unit.lessons.length}>
                      <div className="h-full rounded-full bg-[#58cc02]" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
      <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="mt-6 w-full rounded-xl border-2 border-[#e5e5e5] px-5 py-3 font-black text-[#777] hover:border-[#ffbcbc] hover:text-[#c43f3f] sm:w-auto">CERRAR SESIÓN</button>
      <p className="mt-3 text-sm font-semibold text-[#999]">¿Quieres seguir aprendiendo? <Link href="/" className="font-black text-[#58a700]">Vuelve a tu ruta</Link></p>
      <p className="mt-6 text-xs font-bold text-[#bbb]">Versión {process.env.NEXT_PUBLIC_APP_VERSION}</p>
    </div>
  );
}

function ProfileStat({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl border border-[#e5e5e5] p-4">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <p className="mt-2 text-xl font-black" style={{ color }}>{value}</p>
      <p className="mt-0.5 text-xs font-bold leading-4 text-[#888]">{label}</p>
    </div>
  );
}

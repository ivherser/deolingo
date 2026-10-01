"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const safeAuthMessages = new Set([
  "No se pudo crear la cuenta",
  "Cuenta creada, pero no se pudo iniciar sesión.",
  "Correo o contraseña incorrectos.",
]);

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) {
          const body: { error?: string } = await response.json();
          throw new Error(body.error ?? "No se pudo crear la cuenta.");
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result?.ok) {
        throw new Error(isRegister ? "Cuenta creada, pero no se pudo iniciar sesión." : "Correo o contraseña incorrectos.");
      }
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error && safeAuthMessages.has(cause.message)
          ? cause.message
          : "Ocurrió un error. Inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fbf4] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e5e5e5] bg-white p-7 shadow-[0_6px_0_#e5e5e5] sm:p-9">
        <Link href="/" className="mb-7 flex items-center justify-center gap-2 text-3xl font-black text-[#58a700]">
          <span aria-hidden="true">🦉</span> Deolingo
        </Link>
        <h1 className="text-center text-2xl font-black">{isRegister ? "Crea tu cuenta" : "¡Qué bueno verte!"}</h1>
        <p className="mt-2 text-center font-semibold text-[#777]">
          {isRegister ? "Empieza hoy tu aventura con el alemán." : "Inicia sesión y sigue aprendiendo."}
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {isRegister && (
            <label className="block text-sm font-extrabold text-[#555]">
              Tu nombre
              <input value={name} onChange={(event) => setName(event.target.value)} required minLength={1} maxLength={50} autoComplete="name" className="mt-1.5 w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-base font-semibold outline-none transition focus:border-[#58cc02]" />
            </label>
          )}
          <label className="block text-sm font-extrabold text-[#555]">
            Correo electrónico
            <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" maxLength={254} autoComplete="email" className="mt-1.5 w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-base font-semibold outline-none transition focus:border-[#58cc02]" />
          </label>
          <label className="block text-sm font-extrabold text-[#555]">
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} required type="password" minLength={8} maxLength={72} autoComplete={isRegister ? "new-password" : "current-password"} className="mt-1.5 w-full rounded-xl border-2 border-[#e5e5e5] px-4 py-3 text-base font-semibold outline-none transition focus:border-[#58cc02]" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-[#fff0f0] px-4 py-3 text-sm font-bold text-[#c43f3f]">{error}</p>}
          <button type="submit" disabled={busy} className="pressable w-full rounded-xl border-[#58a700] bg-[#58cc02] px-5 py-3.5 font-black tracking-wide text-white disabled:cursor-wait disabled:opacity-60">
            {busy ? "UN MOMENTO…" : isRegister ? "CREAR CUENTA" : "INICIAR SESIÓN"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm font-semibold text-[#777]">
          {isRegister ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? "}
          <Link className="font-black text-[#58a700] hover:underline" href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </Link>
        </p>
      </section>
    </main>
  );
}

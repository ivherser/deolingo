"use client";

import { useEffect, useRef, useState } from "react";
import { tokenizeGerman } from "@/lib/glossary";

export function GlossaryText({
  text,
  glossary,
}: {
  text: string;
  glossary?: Record<string, string>;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [openToken, setOpenToken] = useState<number | null>(null);
  const tokens = tokenizeGerman(text);

  useEffect(() => {
    if (openToken === null) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpenToken(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenToken(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openToken]);

  return (
    <span ref={containerRef}>
      {tokens.map(({ text: token, key }, index) => {
        const gloss = key ? glossary?.[key] : undefined;
        if (!gloss) {
          return <span key={index}>{token}</span>;
        }

        const isOpen = openToken === index;
        return (
          <span key={index}>
            <span className="relative inline-block">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-label={`Traducción de ${token}`}
                onClick={() =>
                  setOpenToken((current) => (current === index ? null : index))
                }
                className="rounded-sm underline decoration-dotted decoration-2 underline-offset-4"
              >
                {token}
              </button>
              {isOpen && (
                <span
                  role="status"
                  className="absolute left-1/2 top-full z-20 mt-2 max-w-[min(14rem,80vw)] -translate-x-1/2 whitespace-normal rounded-xl border border-[#e5e5e5] bg-white px-3 py-2 text-sm font-bold leading-snug text-[#444] shadow-lg"
                >
                  {gloss}
                </span>
              )}
            </span>
            {isOpen && (
              <span
                aria-hidden="true"
                className="inline-block h-14 w-0 align-top"
              />
            )}
          </span>
        );
      })}
    </span>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ImagePlus, LogIn, RefreshCw, Shirt, Sparkles } from "lucide-react";
import { shrinkImage } from "@/lib/images/shrink";
import type { InspirationResult } from "@/lib/inspiration";

type Phase = "idle" | "analyzing" | "result";

export function GapsView({
  signedIn,
  totalGarments,
}: {
  signedIn: boolean;
  totalGarments: number;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<InspirationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setPhase("analyzing");
    try {
      const reduced = await shrinkImage(file);
      const res = await fetch("/api/inspiration", {
        method: "POST",
        headers: { "content-type": "image/jpeg" },
        body: reduced,
      });
      if (!res.ok) {
        const { error: reason } = await res
          .json()
          .catch(() => ({ error: null }));
        throw new Error(reason ?? "A análise falhou.");
      }
      setResult((await res.json()) as InspirationResult);
      setPhase("result");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "A análise falhou.");
      setPhase("idle");
    }
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setError(null);
    setPreview(null);
  }

  const header = (
    <header className="flex items-center justify-between px-5 pb-4">
      <div>
        <h1 className="font-heading text-[26px] font-extrabold">
          O que te falta
        </h1>
        <p className="mt-0.5 text-xs text-ink-soft">
          Compara um look com o teu armário
        </p>
      </div>
      <Link
        href="/profile"
        aria-label="Perfil"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white"
      >
        <Shirt className="h-5 w-5" />
      </Link>
    </header>
  );

  if (!signedIn) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
        {header}
        <div className="mx-5 mt-6 rounded-[26px] bg-white p-6 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-2">
            <LogIn className="h-6 w-6 text-ink-soft" />
          </span>
          <h2 className="font-heading mt-4 text-lg font-extrabold">
            Entra para comparar looks
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            A paridade é entre o look e o TEU armário — precisa da tua conta.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-coral py-3.5 text-[13px] font-extrabold text-white transition-transform active:scale-[0.98]"
          >
            Entrar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      {header}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5"
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="relative flex h-56 w-full flex-col items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-ink-2 to-[#0d0a12]"
            >
              <span
                aria-hidden
                className="absolute h-44 w-44 rounded-full bg-grape/35 blur-3xl"
              />
              <span className="z-10 flex h-28 w-28 items-center justify-center rounded-3xl border-[2.5px] border-dashed border-lime/75">
                <ImagePlus className="h-10 w-10 text-lime" />
              </span>
              <span className="absolute bottom-4 px-6 text-center text-xs font-medium text-cream/85">
                Escolhe um print de um look que gostavas de usar
              </span>
            </button>

            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              A IA identifica as peças do look e diz-te quais já tens no armário
              e quais te faltam — com a percentagem de paridade.
            </p>
            {totalGarments === 0 && (
              <p className="mt-2 text-sm font-semibold text-coral-deep">
                O teu armário está vazio: a paridade vai dar 0%. Vale a pena
                adicionares as tuas peças primeiro.
              </p>
            )}
            {error && (
              <p className="mt-3 text-center text-sm text-coral-deep">{error}</p>
            )}
          </motion.div>
        )}

        {phase === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5"
          >
            <div className="relative h-56 w-full overflow-hidden rounded-[26px]">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="A analisar"
                  className="h-full w-full object-cover"
                />
              )}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPositionX: ["150%", "-50%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              />
              <span className="absolute top-4 left-4 rounded-full bg-lime px-2.5 py-1 text-[10px] font-extrabold text-ink">
                ● A comparar com o teu armário…
              </span>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-soft">
              <Sparkles className="h-4 w-4 animate-pulse" />A identificar as
              peças do look…
            </p>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* paridade */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-5 mb-4 rounded-[22px] bg-gradient-to-br from-grape to-pink p-4.5 text-white"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-extrabold text-white">
                  Paridade com o look
                </h2>
                <span className="font-heading text-3xl font-extrabold">
                  {Math.round(result.parity * 100)}%
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-90">
                {result.lookSummary}
              </p>
            </motion.div>

            {/* peças do look */}
            {result.pieces.map((p, i) => (
              <motion.div
                key={`${p.description}-${i}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="mx-5 mb-2.5 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-soft"
              >
                {p.matched ? (
                  <span className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cream-2 p-1">
                    {/* Ver a nota em wardrobe-view.tsx sobre <img> vs next/image. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.matched.imageUrl}
                      alt={p.matched.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </span>
                ) : (
                  <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-cream-2">
                    <Shirt className="h-5 w-5 text-ink-soft/60" />
                  </span>
                )}
                <span className="min-w-0">
                  <b className="block truncate text-sm">{p.description}</b>
                  <small className="block text-[11.5px] leading-snug text-ink-soft">
                    {p.reason}
                  </small>
                  <span className="mt-1 block">
                    {p.matched ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold text-ink">
                        <Check className="h-3 w-3" />
                        Tens: {p.matched.name}
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-coral px-2 py-0.5 text-[10px] font-extrabold text-white">
                        Em falta
                      </span>
                    )}
                  </span>
                </span>
              </motion.div>
            ))}

            <div className="px-5 pt-2">
              <button
                onClick={reset}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-cream-2 py-3.5 text-[13px] font-extrabold text-ink transition-transform active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4" />
                Analisar outro look
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

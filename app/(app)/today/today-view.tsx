"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Plus, Shirt, Sparkles } from "lucide-react";
import { OutfitBoard } from "@/components/outfit/outfit-board";
import {
  FORMALITY_LABELS,
  FORMALITY_ORDER,
  type Formality,
} from "@/lib/attributes";
import type { Weather } from "@/lib/weather";
import { generateOutfit, saveOutfit, type GenerateResult } from "./actions";

type Phase = "choose" | "generating" | "result";

function todayLabel() {
  const parts = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = (parts.find((p) => p.type === "month")?.value ?? "").slice(0, 3);
  const short = weekday.replace("-feira", "");
  return `${short.charAt(0).toUpperCase() + short.slice(1)} · ${day} ${month}`;
}

export function TodayView({
  signedIn,
  totalGarments,
  formalityCounts,
  weather,
  district,
}: {
  signedIn: boolean;
  totalGarments: number;
  /** Peças por nível de formalidade — os números dos chips. */
  formalityCounts: Record<string, number>;
  weather: Weather | null;
  district: string | null;
}) {
  const [selected, setSelected] = useState<Formality[]>([]);
  const [phase, setPhase] = useState<Phase>("choose");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [, startTransition] = useTransition();

  function toggle(f: Formality) {
    setSelected((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  function generate() {
    setSaved(false);
    setResult(null);
    setPhase("generating");
    startTransition(async () => {
      const res = await generateOutfit(selected);
      setResult(res);
      setPhase(res.ok ? "result" : "choose");
    });
  }

  function save() {
    if (!result?.ok || saved) return;
    setSaved(true); // optimista: o coração responde já
    startTransition(() => void saveOutfit(result.outfitId));
  }

  const header = (
    <header className="flex items-center justify-between px-5 pb-4">
      <div>
        <h1 className="font-heading text-[26px] font-extrabold">
          Outfit de hoje
        </h1>
        <p className="mt-0.5 text-xs text-ink-soft">{todayLabel()}</p>
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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
        {header}
        <div className="mx-5 mt-6 rounded-[26px] bg-white p-6 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-2">
            <LogIn className="h-6 w-6 text-ink-soft" />
          </span>
          <h2 className="font-heading mt-4 text-lg font-extrabold">
            Entra para o teu outfit de hoje
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            As sugestões partem da roupa que tens no teu armário.
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
      {header}

      {/* meteorologia real do distrito do perfil */}
      {weather ? (
        <div className="mx-5 mb-4 flex items-center justify-between rounded-[20px] bg-ink px-4.5 py-4 text-cream">
          <div>
            <p className="text-[11px] opacity-80">
              {district} · {weather.condition}
            </p>
            <p className="font-heading text-3xl font-extrabold leading-none">
              {weather.temperatureC}°
            </p>
          </div>
          <p className="text-right text-[11px] opacity-80">
            {weather.maxC != null && <>máx {weather.maxC}° · </>}
            {weather.rain}
          </p>
        </div>
      ) : (
        <Link
          href="/profile"
          className="mx-5 mb-4 block rounded-[20px] bg-ink px-4.5 py-4 text-cream"
        >
          <p className="text-[13px] font-bold">
            {district
              ? "Não consegui obter o tempo agora."
              : "Escolhe o teu distrito no perfil"}
          </p>
          <p className="mt-0.5 text-[11px] opacity-80">
            {district
              ? "A sugestão sai na mesma, sem saber o tempo."
              : "Sem ele, a sugestão não sabe se está frio ou a chover →"}
          </p>
        </Link>
      )}

      {/* formalidade — em paridade com o Atributo das Peças, com contagem */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
        {FORMALITY_ORDER.map((f) => {
          const n = formalityCounts[f] ?? 0;
          const active = selected.includes(f);
          return (
            <button
              key={f}
              onClick={() => toggle(f)}
              disabled={n === 0}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors disabled:opacity-40 ${
                active
                  ? "border-coral bg-coral text-white"
                  : "border-ink/10 bg-white text-ink"
              }`}
            >
              {FORMALITY_LABELS[f]}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                  active ? "bg-white/25" : "bg-cream-2 text-ink-soft"
                }`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* área dinâmica */}
      <div className="flex flex-1 flex-col px-5 pb-24">
        <AnimatePresence mode="wait">
          {phase === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center"
            >
              {totalGarments === 0 ? (
                <>
                  <p className="max-w-xs text-sm text-ink-soft">
                    O teu armário ainda está vazio. A sugestão parte das peças
                    que tens — adiciona as primeiras.
                  </p>
                  <Link
                    href="/wardrobe/add"
                    className="flex h-13 items-center gap-2 rounded-full bg-coral px-8 text-base font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98]"
                  >
                    <Plus className="h-5 w-5" />
                    Adicionar peça
                  </Link>
                </>
              ) : (
                <>
                  <p className="max-w-xs text-sm text-ink-soft">
                    {selected.length > 0
                      ? `Outfit ${selected
                          .map((f) => FORMALITY_LABELS[f].toLowerCase())
                          .join(" ou ")}, com as tuas ${totalGarments} peças?`
                      : `Um outfit com as tuas ${totalGarments} peças — escolhe a formalidade, ou deixa a IA decidir.`}
                  </p>
                  {result && !result.ok && (
                    <p className="max-w-xs text-sm font-semibold text-coral-deep">
                      {result.error}
                    </p>
                  )}
                  <button
                    onClick={generate}
                    className="flex h-13 items-center gap-2 rounded-full bg-coral px-8 text-base font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98]"
                  >
                    <Sparkles className="h-5 w-5" />
                    Gerar outfit
                  </button>
                </>
              )}
            </motion.div>
          )}

          {phase === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[26px] bg-white p-4 shadow-soft"
            >
              <div className="grid grid-cols-[1.1fr_1fr] gap-2.5">
                <motion.div
                  className="row-span-2 min-h-42 rounded-2xl bg-cream-2"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-20 rounded-2xl bg-cream-2"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-soft">
                <Sparkles className="h-4 w-4 animate-pulse" />A escolher entre as
                tuas peças…
              </p>
            </motion.div>
          )}

          {phase === "result" && result?.ok && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[26px] bg-white p-4 shadow-soft"
            >
              <div className="mb-3.5 flex items-center justify-between">
                <p className="text-[15px] font-bold">A tua sugestão</p>
                <span className="rounded-full bg-lime px-3 py-1.5 text-[11px] font-extrabold text-ink">
                  {result.items.length}{" "}
                  {result.items.length === 1 ? "peça" : "peças"}
                </span>
              </div>

              <OutfitBoard items={result.items} />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: result.items.length * 0.15 + 0.1 }}
                className="mt-3.5 rounded-2xl bg-cream px-3.5 py-3 text-xs leading-relaxed text-ink-soft"
              >
                💡 <b className="text-coral-deep">Porquê?</b>{" "}
                {result.explanation}
              </motion.div>

              <div className="mt-3.5 flex gap-2.5">
                <button
                  onClick={save}
                  className={`flex-1 rounded-full py-3.5 text-[13px] font-extrabold transition-colors ${
                    saved ? "bg-lime text-ink" : "bg-ink text-cream"
                  }`}
                >
                  {saved ? "✓ Guardado" : "❤️ Guardar"}
                </button>
                <button
                  onClick={generate}
                  className="flex-1 rounded-full bg-cream-2 py-3.5 text-[13px] font-extrabold text-ink transition-transform active:scale-[0.98]"
                >
                  🔄 Outro
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

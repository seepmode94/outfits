"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { OutfitBoard } from "@/components/outfit/outfit-board";
import { MOCK_OUTFIT, MOCK_EXPLANATION, MOCK_WEATHER } from "@/lib/mock";

const OCCASIONS = [
  { emoji: "💼", label: "Trabalho" },
  { emoji: "🍷", label: "Jantar" },
  { emoji: "🏋️", label: "Ginásio" },
];

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

export default function TodayPage() {
  const [occasion, setOccasion] = useState("Trabalho");
  const [phase, setPhase] = useState<Phase>("choose");
  const [saved, setSaved] = useState(false);

  function generate() {
    setSaved(false);
    setPhase("generating");
    // simula a IA a pensar (mock — liga-se ao Gemini depois)
    setTimeout(() => setPhase("result"), 1500);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-white"
        >
          AS
        </Link>
      </header>

      {/* meteorologia */}
      <div className="mx-5 mb-4 flex items-center justify-between rounded-[20px] bg-ink px-4.5 py-4 text-cream">
        <div>
          <p className="text-[11px] opacity-80">
            {MOCK_WEATHER.city} · {MOCK_WEATHER.note}
          </p>
          <p className="font-heading text-3xl font-extrabold leading-none">
            {MOCK_WEATHER.temp}°
          </p>
        </div>
        <p className="text-right text-[11px] opacity-80">
          máx {MOCK_WEATHER.max}° · {MOCK_WEATHER.rain}
        </p>
      </div>

      {/* ocasião */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
        {OCCASIONS.map((o) => {
          const active = o.label === occasion;
          return (
            <button
              key={o.label}
              onClick={() => {
                setOccasion(o.label);
                if (phase === "result") generate();
              }}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                active
                  ? "border-coral bg-coral text-white"
                  : "border-ink/10 bg-white text-ink"
              }`}
            >
              {o.emoji} {o.label}
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
              <p className="max-w-xs text-sm text-ink-soft">
                Pronto para um outfit de {occasion.toLowerCase()} com a roupa
                que já tens?
              </p>
              <button
                onClick={generate}
                className="flex h-13 items-center gap-2 rounded-full bg-coral px-8 text-base font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98]"
              >
                <Sparkles className="h-5 w-5" />
                Gerar outfit
              </button>
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
                <Sparkles className="h-4 w-4 animate-pulse" />A escolher o teu
                outfit…
              </p>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[26px] bg-white p-4 shadow-soft"
            >
              <div className="mb-3.5 flex items-center justify-between">
                <p className="text-[15px] font-bold">A tua sugestão nº1</p>
                <span className="rounded-full bg-lime px-3 py-1.5 text-[11px] font-extrabold text-ink">
                  96% match
                </span>
              </div>

              <OutfitBoard items={MOCK_OUTFIT} />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: MOCK_OUTFIT.length * 0.15 + 0.1 }}
                className="mt-3.5 rounded-2xl bg-cream px-3.5 py-3 text-xs leading-relaxed text-ink-soft"
              >
                💡 <b className="text-coral-deep">Porquê?</b> {MOCK_EXPLANATION}
              </motion.div>

              <div className="mt-3.5 flex gap-2.5">
                <button
                  onClick={() => setSaved(true)}
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

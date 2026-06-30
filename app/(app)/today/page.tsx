"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, CloudSun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutfitBoard } from "@/components/outfit/outfit-board";
import { MOCK_OUTFIT, MOCK_EXPLANATION } from "@/lib/mock";

const OCCASIONS = ["Casual", "Escritório", "Evento", "Desporto", "Encontro"];
type Phase = "choose" | "generating" | "result";

export default function TodayPage() {
  const [occasion, setOccasion] = useState("Casual");
  const [phase, setPhase] = useState<Phase>("choose");
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  function generate() {
    setVote(null);
    setPhase("generating");
    // simula a IA a pensar (mock — liga-se ao Gemini depois)
    setTimeout(() => setPhase("result"), 1500);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold">
          Veste-me <span className="text-brand-gradient">hoje</span>
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CloudSun className="h-4 w-4" />
          <span>18°C · pouco nublado</span>
        </div>
      </header>

      {/* ocasião */}
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Para que ocasião?
        </p>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => {
            const active = o === occasion;
            return (
              <button
                key={o}
                onClick={() => setOccasion(o)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-transparent bg-brand-gradient text-white"
                    : "border-border bg-background text-foreground/70 hover:bg-secondary"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </section>

      {/* área dinâmica */}
      <div className="flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {phase === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center"
            >
              <p className="max-w-xs text-muted-foreground">
                Pronto para um outfit {occasion.toLowerCase()} com a roupa que já
                tens?
              </p>
              <Button
                onClick={generate}
                className="h-13 rounded-2xl bg-brand-gradient px-8 text-base font-semibold text-white shadow-lg shadow-primary/25 active:scale-[0.98]"
              >
                <Sparkles className="h-5 w-5" />
                Gerar outfit
              </Button>
            </motion.div>
          )}

          {phase === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3 py-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="aspect-square rounded-3xl bg-secondary"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
              <p className="col-span-2 mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
              className="flex flex-col gap-5"
            >
              <OutfitBoard items={MOCK_OUTFIT} />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: MOCK_OUTFIT.length * 0.15 + 0.1 }}
                className="rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed"
              >
                {MOCK_EXPLANATION}
              </motion.div>

              {/* feedback */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setVote("down")}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    vote === "down"
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                  aria-label="Não gostei"
                >
                  <ThumbsDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setVote("up")}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                    vote === "up"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                  aria-label="Gostei"
                >
                  <ThumbsUp className="h-5 w-5" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={generate}
                className="w-full rounded-2xl"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar outro
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

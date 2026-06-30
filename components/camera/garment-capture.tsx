"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Stage = "idle" | "processing" | "done";

export function GarmentCapture({
  onCutout,
}: {
  onCutout?: (dataUrl: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setProgress(0);
    setCutoutUrl(null);
    setOriginalUrl(URL.createObjectURL(file));
    setStage("processing");

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, {
        progress: (_key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });
      const url = URL.createObjectURL(blob);
      setCutoutUrl(url);
      setStage("done");
      onCutout?.(url);
    } catch (e) {
      console.error(e);
      setError("Não consegui recortar a imagem. Tenta outra foto.");
      setStage("idle");
    }
  }

  function reset() {
    setStage("idle");
    setOriginalUrl(null);
    setCutoutUrl(null);
    setError(null);
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-secondary/40">
        <AnimatePresence mode="wait">
          {/* ───────── IDLE ───────── */}
          {stage === "idle" && (
            <motion.button
              key="idle"
              type="button"
              onClick={() => inputRef.current?.click()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-primary/25">
                <Camera className="h-8 w-8" />
              </span>
              <span className="text-lg font-semibold">Adicionar uma peça</span>
              <span className="max-w-xs text-sm text-muted-foreground">
                Tira ou escolhe uma foto — uma peça de cada vez. A IA recorta o
                fundo automaticamente.
              </span>
            </motion.button>
          )}

          {/* ───────── PROCESSING ───────── */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt="A processar"
                  className="h-full w-full object-cover"
                />
              )}
              {/* varrimento shimmer por cima */}
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
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 animate-pulse" />
                A recortar a peça… {progress > 0 && `${progress}%`}
              </div>
            </motion.div>
          )}

          {/* ───────── DONE ───────── */}
          {stage === "done" && cutoutUrl && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
              style={{
                backgroundImage:
                  "repeating-conic-gradient(oklch(0.97 0.01 300) 0% 25%, white 0% 50%)",
                backgroundSize: "24px 24px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={cutoutUrl}
                alt="Peça recortada"
                initial={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-destructive">{error}</p>
      )}

      {stage === "done" && (
        <Button
          variant="outline"
          onClick={reset}
          className="mt-4 w-full rounded-2xl"
        >
          <RefreshCw className="h-4 w-4" />
          Tirar outra
        </Button>
      )}
    </div>
  );
}

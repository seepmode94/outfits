"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RefreshCw } from "lucide-react";

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
        // Sem `capture`: com ele, iOS e Android abrem a câmara directamente e
        // não deixam escolher da galeria. O sistema oferece as duas opções.
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="relative h-64 w-full overflow-hidden rounded-[26px] bg-gradient-to-br from-ink-2 to-[#0d0a12]">
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
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* glow grape */}
              <span
                aria-hidden
                className="absolute h-44 w-44 rounded-full bg-grape/35 blur-3xl"
              />
              <span className="z-10 flex h-36 w-36 items-center justify-center rounded-3xl border-[2.5px] border-dashed border-lime/75">
                <Camera className="h-10 w-10 text-lime" />
              </span>
              <span className="absolute bottom-4 text-xs font-medium text-cream/85">
                Fotografa ou escolhe da galeria — centra a peça no quadro
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
              <span className="absolute top-4 left-4 rounded-full bg-lime px-2.5 py-1 text-[10px] font-extrabold text-ink">
                ● A analisar… {progress > 0 && `${progress}%`}
              </span>
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
                  "repeating-conic-gradient(#FFE9DA 0% 25%, white 0% 50%)",
                backgroundSize: "24px 24px",
              }}
            >
              <motion.img
                src={cutoutUrl}
                alt="Peça recortada"
                initial={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
              <span className="absolute top-4 left-4 rounded-full bg-mint px-2.5 py-1 text-[10px] font-extrabold text-ink">
                ✓ Recortada
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-coral-deep">{error}</p>
      )}

      {stage === "done" && (
        <button
          onClick={reset}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cream-2 py-3.5 text-[13px] font-extrabold text-ink transition-transform active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          Tirar outra
        </button>
      )}
    </div>
  );
}

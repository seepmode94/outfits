"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RefreshCw } from "lucide-react";

type Stage = "idle" | "preparing" | "cutting" | "done";

/** Lado maior enviado ao servidor. Ver ADR-0002: reduzir antes de subir. */
const MAX_EDGE = 2048;
const JPEG_QUALITY = 0.85;

/**
 * Reduz a fotografia no browser antes do upload. Uma foto de telemóvel são
 * 2–5 MB e a rede móvel paga-a; 2048px é mais do que o Recorte precisa.
 */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sem contexto 2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new Error("não consegui codificar a fotografia");
  return blob;
}

export function GarmentCapture({
  onCutout,
}: {
  onCutout?: (dataUrl: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setCutoutUrl(null);
    setOriginalUrl(URL.createObjectURL(file));
    setStage("preparing");

    try {
      const reduced = await shrink(file);

      setStage("cutting");
      const res = await fetch("/api/cutout", {
        method: "POST",
        headers: { "content-type": "image/jpeg" },
        body: reduced,
      });

      if (!res.ok) {
        // O servidor manda a razão em português; mostra-se essa, não um genérico.
        const { error: reason } = await res
          .json()
          .catch(() => ({ error: null }));
        throw new Error(reason ?? "O recorte falhou.");
      }

      const url = URL.createObjectURL(await res.blob());
      setCutoutUrl(url);
      setStage("done");
      onCutout?.(url);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "O recorte falhou.");
      setStage("idle");
    }
  }

  function reset() {
    setStage("idle");
    setOriginalUrl(null);
    setCutoutUrl(null);
    setError(null);
  }

  const busy = stage === "preparing" || stage === "cutting";

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

          {/* ───────── A TRABALHAR ───────── */}
          {busy && (
            <motion.div
              key="busy"
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
              {/* O recorte agora é do servidor e não reporta progresso, por isso
                  o estado diz-se por etapas em vez de uma percentagem falsa. */}
              <span className="absolute top-4 left-4 rounded-full bg-lime px-2.5 py-1 text-[10px] font-extrabold text-ink">
                ● {stage === "preparing" ? "A preparar a foto…" : "A recortar…"}
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

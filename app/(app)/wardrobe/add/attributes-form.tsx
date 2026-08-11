"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { AttributesFields } from "@/components/wardrobe/attributes-fields";
import type { GarmentAttributes } from "@/lib/ai/schemas";
import type { CaptureResult } from "@/lib/capture";
import { createGarment } from "./actions";

export function AttributesForm({ capture }: { capture: CaptureResult }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [a, setA] = useState<GarmentAttributes>(capture.attributes);

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createGarment({
        recorteUrl: capture.recorteUrl,
        originalUrl: capture.originalUrl,
        attributes: a,
      });
      if (res.ok) router.push("/wardrobe");
      else setError(res.error);
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="px-5 pt-5"
    >
      <p className="pb-1 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
        Reconhecido pela IA
      </p>
      <p className="pb-4 text-[11px] text-ink-soft">
        Corrige o que estiver errado. A peça só entra no armário depois de
        confirmares.
      </p>

      <AttributesFields value={a} onChange={setA} />

      {error && (
        <p className="pt-4 text-center text-sm text-coral-deep">{error}</p>
      )}

      <button
        onClick={save}
        disabled={pending}
        className="mt-5 w-full rounded-full bg-coral py-4 text-sm font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "A guardar…" : "Guardar no armário"}
      </button>

      <p className="pt-3 pb-2 text-center text-[11px] text-ink-soft">
        Recorte em {(capture.ms.cutout / 1000).toFixed(1)}s · reconhecimento em{" "}
        {(capture.ms.analyze / 1000).toFixed(1)}s
      </p>
    </motion.section>
  );
}

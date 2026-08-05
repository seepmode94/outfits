"use client";

import Link from "next/link";
import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { motion } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { getGarment } from "@/lib/mock";

export default function GarmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const garment = getGarment(id);
  const [fav, setFav] = useState(garment?.fav ?? false);

  if (!garment) notFound();

  const attrs = [
    { k: "Cor", v: garment.color },
    { k: "Material", v: garment.material },
    { k: "Estilo", v: garment.style },
    { k: "Estação", v: garment.season },
  ];

  const pairs = garment.pairsWith
    .map(getGarment)
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      {/* hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-5 flex h-64 items-center justify-center rounded-[26px] text-[100px]"
        style={{ background: garment.bg }}
      >
        <Link
          href="/wardrobe"
          aria-label="Voltar ao armário"
          className="absolute top-3.5 left-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          onClick={() => setFav((f) => !f)}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm transition-transform active:scale-90"
        >
          {fav ? "❤️" : "🤍"}
        </button>
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {garment.emoji}
        </motion.span>
      </motion.div>

      {/* título */}
      <div className="flex items-start justify-between px-5 pt-4.5 pb-1.5">
        <div>
          <h1 className="font-heading text-[22px] font-extrabold">
            {garment.label}
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            {garment.material} · {garment.brand} · {garment.season.toLowerCase()}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-cream-2 px-2.5 py-1.5 text-[11px] font-extrabold whitespace-nowrap text-coral-deep">
          usado {garment.timesWorn}×
        </span>
      </div>

      {/* atributos */}
      <div className="flex flex-wrap gap-2 px-5 pt-1.5 pb-4">
        {attrs.map((a) => (
          <span
            key={a.k}
            className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-semibold shadow-soft"
          >
            <span className="mr-1.5 text-ink-soft">{a.k}</span>
            {a.v}
          </span>
        ))}
      </div>

      {/* combinações */}
      {pairs.length > 0 && (
        <>
          <p className="px-5 pb-2.5 text-sm font-extrabold">Combina bem com</p>
          <div className="flex gap-3 overflow-x-auto px-5 [scrollbar-width:none]">
            {pairs.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="w-20 shrink-0"
              >
                <Link href={`/wardrobe/${p.id}`} className="block">
                  <span
                    className="mb-1.5 flex h-20 items-center justify-center rounded-2xl text-3xl"
                    style={{ background: p.bg }}
                  >
                    {p.emoji}
                  </span>
                  <span className="block text-center text-[10px] text-ink-soft">
                    {p.label.split(" ")[0]}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

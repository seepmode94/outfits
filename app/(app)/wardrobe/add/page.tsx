"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { GarmentCapture } from "@/components/camera/garment-capture";

const RECOGNIZED = [
  { emoji: "👟", bg: "#EFFFC7", label: "Ténis", sub: "Tipo de peça" },
  { emoji: "🎨", bg: "#DDF7F2", label: "Branco / creme", sub: "Cor dominante" },
  { emoji: "🏷️", bg: "#E9DDFF", label: "Casual · desporto", sub: "Estilo sugerido" },
];

export default function AddGarmentPage() {
  const [cutout, setCutout] = useState<string | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      <header className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="font-heading text-[26px] font-extrabold">
            Adicionar peça
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">Aponta e fotografa</p>
        </div>
        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-white"
        >
          AS
        </Link>
      </header>

      <div className="px-5">
        <GarmentCapture onCutout={setCutout} />
      </div>

      {cutout && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        >
          <p className="px-5 pt-5 pb-2.5 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
            Reconhecido pela IA
          </p>

          {/* Atributos de exemplo — a IA real liga-se com a chave Gemini */}
          {RECOGNIZED.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="mx-5 mb-2.5 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-soft"
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ background: r.bg }}
              >
                {r.emoji}
              </span>
              <span>
                <b className="block text-[13px]">{r.label}</b>
                <small className="text-[11px] text-ink-soft">{r.sub}</small>
              </span>
              <span className="ml-auto text-lg font-extrabold text-mint">✓</span>
            </motion.div>
          ))}

          <div className="px-5 pt-3">
            <button
              disabled
              className="w-full rounded-full bg-coral py-4 text-sm font-extrabold text-white opacity-60"
            >
              📸 Guardar no armário
            </button>
            <p className="pt-3 text-center text-xs text-ink-soft">
              O reconhecimento por IA e a gravação ligam-se quando configurares
              a chave Gemini e a base de dados.
            </p>
          </div>
        </motion.section>
      )}
    </main>
  );
}

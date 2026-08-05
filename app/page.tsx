"use client";

import Link from "next/link";
import { motion } from "motion/react";

const FLOATING = [
  { emoji: "🧥", label: "Casaco", className: "top-[12%] left-5 -rotate-6" },
  { emoji: "👟", label: "Ténis", className: "top-[36%] right-4 rotate-[5deg]" },
  { emoji: "👖", label: "Calças", className: "bottom-[8%] left-9 rotate-3" },
];

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden bg-brand-gradient text-white">
      {/* glow lime no canto superior */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-lime/35 blur-3xl"
      />

      <div className="z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pt-8 pb-8">
        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 font-heading text-2xl font-extrabold"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-lime" />
          outfits
        </motion.div>

        {/* montagem de peças flutuantes */}
        <div className="relative flex flex-1 items-center justify-center py-10">
          {FLOATING.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 0.35 + i * 0.15,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className={`absolute flex items-center gap-2.5 rounded-3xl border border-white/25 bg-white/15 px-3.5 py-3 text-sm font-bold backdrop-blur-md ${f.className}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl">
                {f.emoji}
              </span>
              {f.label}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
            className="flex h-30 w-30 items-center justify-center rounded-[34px] bg-white text-6xl shadow-lift"
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              👕
            </motion.span>
          </motion.div>
        </div>

        {/* título + ações */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 260, damping: 24 }}
          className="flex flex-col"
        >
          <h1 className="mb-3 font-heading text-4xl font-extrabold leading-[1.03]">
            O que vestir
            <br />
            hoje? Já sabes.
          </h1>
          <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-white/90">
            Fotografa as tuas peças e deixa a IA montar o outfit perfeito para a
            ocasião e o tempo.
          </p>

          <Link
            href="/sign-in"
            className="mb-3 flex h-14 w-full items-center justify-center rounded-full bg-lime text-base font-extrabold text-ink transition-transform active:scale-[0.98]"
          >
            Começar grátis
          </Link>
          <Link
            href="/sign-in"
            className="flex h-13 w-full items-center justify-center rounded-full border-[1.5px] border-white/50 text-base font-bold text-white transition-colors hover:bg-white/10"
          >
            Já tenho conta
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

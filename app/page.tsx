"use client";

import Link from "next/link";
import { motion } from "motion/react";

const GARMENTS = [
  { emoji: "🧥", label: "Casaco", className: "bg-[oklch(0.93_0.05_295)]" },
  { emoji: "👕", label: "T-shirt", className: "bg-[oklch(0.94_0.05_350)]" },
  { emoji: "👖", label: "Calças", className: "bg-[oklch(0.93_0.05_230)]" },
  { emoji: "👟", label: "Ténis", className: "bg-[oklch(0.94_0.06_45)]" },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
} as const;

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden px-6">
      {/* fundo "aurora" — manchas de cor a derivar por toda a página */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="aurora-a absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[var(--brand-1)] opacity-40 blur-3xl" />
        <div className="aurora-b absolute top-1/4 -right-20 h-80 w-80 rounded-full bg-[var(--brand-2)] opacity-35 blur-3xl" />
        <div className="aurora-c absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-[var(--brand-3)] opacity-35 blur-3xl" />
        <div className="aurora-a absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-[var(--brand-2)] opacity-25 blur-3xl" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 py-12 text-center"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          ✨ O teu guarda-roupa, com cabeça
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-heading text-5xl font-bold leading-[1.05] tracking-tight"
        >
          O que vestir <span className="text-brand-gradient">hoje?</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-sm text-balance text-lg text-muted-foreground"
        >
          Fotografa as tuas peças e deixa a IA montar o outfit perfeito para a
          ocasião e o tempo. Vê o que tens — e o que te falta.
        </motion.p>

        {/* esboço da "montagem do outfit" */}
        <motion.div variants={fadeUp} className="grid w-full grid-cols-2 gap-3">
          {GARMENTS.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                delay: 0.5 + i * 0.12,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
              className={`flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-3xl ${g.className}`}
            >
              <motion.span
                className="text-4xl"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                {g.emoji}
              </motion.span>
              <span className="text-xs font-medium text-foreground/60">
                {g.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex w-full flex-col gap-3">
          <Link
            href="/sign-in"
            className="flex h-13 w-full items-center justify-center rounded-2xl bg-brand-gradient text-base font-semibold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]"
          >
            Começar grátis
          </Link>
          <Link
            href="/sign-in"
            className="flex h-12 w-full items-center justify-center rounded-2xl text-base font-medium text-foreground/70 transition-colors hover:bg-secondary"
          >
            Já tenho conta
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

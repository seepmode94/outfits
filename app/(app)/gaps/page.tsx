"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { MOCK_GAPS } from "@/lib/mock";

export default function GapsPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      <header className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="font-heading text-[26px] font-extrabold">
            O que te falta
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            Para completar o armário
          </p>
        </div>
        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-white"
        >
          AS
        </Link>
      </header>

      {/* banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 mb-4 rounded-[22px] bg-gradient-to-br from-grape to-pink p-4.5 text-white"
      >
        <h2 className="mb-1.5 font-heading text-lg font-extrabold text-white">
          Estás quase lá! 👏
        </h2>
        <p className="text-[12.5px] leading-relaxed opacity-90">
          Com {MOCK_GAPS.length} peças-chave, desbloqueias mais 14 combinações
          possíveis para o teu dia-a-dia.
        </p>
      </motion.div>

      {/* peças em falta */}
      {MOCK_GAPS.map((gap, i) => (
        <motion.div
          key={gap.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.08 }}
          className="mx-5 mb-2.5 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-soft"
        >
          <span
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: gap.bg }}
          >
            {gap.emoji}
          </span>
          <span>
            <b className="block text-sm">{gap.label}</b>
            <small className="text-[11.5px] leading-snug text-ink-soft">
              {gap.sub}
            </small>
            <span className="mt-1 block">
              <span className="inline-block rounded-full bg-coral px-2 py-0.5 text-[10px] font-extrabold text-white">
                Em falta
              </span>
            </span>
          </span>
          <ChevronRight className="ml-auto h-4.5 w-4.5 shrink-0 text-ink-soft" />
        </motion.div>
      ))}
    </main>
  );
}

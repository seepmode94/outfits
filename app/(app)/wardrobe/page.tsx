"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { MOCK_WARDROBE } from "@/lib/mock";

export default function WardrobePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Guarda-roupa</h1>
        <Link
          href="/wardrobe/add"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-md shadow-primary/25"
          aria-label="Adicionar peça"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <p className="text-sm text-muted-foreground">
        {MOCK_WARDROBE.length} peças{" "}
        <span className="opacity-60">(exemplo — liga o DB para guardar as tuas)</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        {MOCK_WARDROBE.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl"
            style={{ background: g.color }}
          >
            <span className="text-5xl">{g.emoji}</span>
            <span className="px-2 text-center text-xs font-medium text-foreground/70">
              {g.label}
            </span>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

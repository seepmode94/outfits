"use client";

import { motion } from "motion/react";
import type { MockGarment } from "@/lib/mock";

// O "quadro" do outfit: as peças encaixam uma a uma (o momento "wow").
export function OutfitBoard({ items }: { items: MockGarment[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((g, i) => (
        <motion.div
          key={g.id}
          initial={{ opacity: 0, y: 36, scale: 0.78, rotate: i % 2 ? 6 : -6 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{
            delay: i * 0.15,
            type: "spring",
            stiffness: 240,
            damping: 16,
          }}
          className="flex aspect-square flex-col items-center justify-center gap-2 rounded-3xl shadow-sm"
          style={{ background: g.color }}
        >
          <span className="text-5xl">{g.emoji}</span>
          <span className="px-2 text-center text-xs font-medium text-foreground/70">
            {g.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

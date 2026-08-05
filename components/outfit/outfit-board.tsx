"use client";

import { motion } from "motion/react";
import type { MockGarment } from "@/lib/mock";

function Tile({
  garment,
  index,
  className = "",
}: {
  garment: MockGarment;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      role="img"
      aria-label={garment.label}
      initial={{ opacity: 0, y: 36, scale: 0.78, rotate: index % 2 ? 6 : -6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 240,
        damping: 16,
      }}
      className={`flex items-center justify-center rounded-2xl text-4xl ${className}`}
      style={{ background: garment.bg }}
    >
      {garment.emoji}
    </motion.div>
  );
}

// O "quadro" do outfit: colagem com a peça principal em destaque,
// as peças encaixam uma a uma (o momento "wow").
export function OutfitBoard({ items }: { items: MockGarment[] }) {
  const [main, ...rest] = items;
  if (!main) return null;
  const rightColumn = rest.slice(0, 2);
  const bottomRow = rest.slice(2);

  return (
    <div className="grid grid-cols-[1.1fr_1fr] gap-2.5">
      <Tile garment={main} index={0} className="row-span-2 min-h-42 text-5xl" />
      <div className="grid gap-2.5">
        {rightColumn.map((g, i) => (
          <Tile key={g.id} garment={g} index={i + 1} className="h-20" />
        ))}
      </div>
      {bottomRow.map((g, i) => (
        <Tile
          key={g.id}
          garment={g}
          index={i + 1 + rightColumn.length}
          className="h-20"
        />
      ))}
    </div>
  );
}

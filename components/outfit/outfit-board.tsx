"use client";

import { motion } from "motion/react";

export type BoardItem = {
  id: string;
  /** URL do Recorte — PNG de fundo transparente. */
  imageUrl: string;
  name: string;
};

// Pastéis da identidade, atribuídos por posição — as Peças reais não têm cor
// de cartão própria (o mock tinha `bg` por item; a base de dados, e bem, não).
const TILE_BG = ["#FFE4D6", "#E9DDFF", "#DDF7F2", "#EFFFC7", "#FFF1F8"];

function Tile({
  item,
  index,
  className = "",
}: {
  item: BoardItem;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.78, rotate: index % 2 ? 6 : -6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 240,
        damping: 16,
      }}
      className={`flex items-center justify-center overflow-hidden rounded-2xl p-2.5 ${className}`}
      style={{ background: TILE_BG[index % TILE_BG.length] }}
    >
      {/* Ver a nota em wardrobe-view.tsx sobre <img> vs next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="max-h-full max-w-full object-contain drop-shadow-md"
      />
    </motion.div>
  );
}

// O "quadro" do outfit: colagem com a peça principal em destaque,
// as peças encaixam uma a uma (o momento "wow").
export function OutfitBoard({ items }: { items: BoardItem[] }) {
  const [main, ...rest] = items;
  if (!main) return null;
  const rightColumn = rest.slice(0, 2);
  const bottomRow = rest.slice(2);

  return (
    <div className="grid grid-cols-[1.1fr_1fr] gap-2.5">
      <Tile item={main} index={0} className="row-span-2 min-h-42" />
      <div className="grid gap-2.5">
        {rightColumn.map((g, i) => (
          <Tile key={g.id} item={g} index={i + 1} className="h-20" />
        ))}
      </div>
      {bottomRow.map((g, i) => (
        <Tile
          key={g.id}
          item={g}
          index={i + 1 + rightColumn.length}
          className="h-20"
        />
      ))}
    </div>
  );
}

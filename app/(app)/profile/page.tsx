"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { MOCK_WARDROBE } from "@/lib/mock";

const STYLE_TAGS = ["Casual", "Minimal", "Formal", "Desporto"];

const ROWS = [
  { emoji: "🧩", label: "O que te falta", href: "/gaps" },
  { emoji: "🌤️", label: "Localização & tempo", href: null },
  { emoji: "🔔", label: "Notificações do outfit", href: null },
  { emoji: "⭐", label: "Passar para Premium", href: null },
];

export default function ProfilePage() {
  const [active, setActive] = useState<string[]>(["Casual", "Minimal"]);
  const favs = MOCK_WARDROBE.filter((g) => g.fav).length;

  function toggle(tag: string) {
    setActive((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const stats = [
    { n: MOCK_WARDROBE.length, l: "Peças" },
    { n: 4, l: "Outfits" },
    { n: favs, l: "Favoritos" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pb-24">
      {/* topo com gradiente */}
      <div className="bg-brand-gradient px-5 pt-12 pb-7 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white font-heading text-3xl font-extrabold text-grape shadow-lift"
        >
          AS
        </motion.div>
        <h1 className="font-heading text-[22px] font-extrabold text-white">
          António Santos
        </h1>
        <p className="mt-0.5 text-xs opacity-90">
          Membro desde ago 2026 · Lisboa
        </p>
      </div>

      {/* estatísticas */}
      <div className="mx-5 mt-4 flex rounded-[20px] bg-white py-4 shadow-soft">
        {stats.map((s, i) => (
          <div
            key={s.l}
            className={`flex-1 text-center ${
              i < stats.length - 1 ? "border-r border-ink/10" : ""
            }`}
          >
            <div className="font-heading text-2xl font-extrabold">{s.n}</div>
            <div className="text-[10.5px] font-semibold text-ink-soft">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* estilo */}
      <div className="mx-5 mt-4">
        <p className="mb-2.5 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
          O meu estilo
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map((tag) => {
            const on = active.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold shadow-soft transition-colors ${
                  on
                    ? "border-ink bg-lime text-ink"
                    : "border-ink/10 bg-white text-ink"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* definições */}
      <div className="mx-5 mt-4">
        {ROWS.map((row) => {
          const inner = (
            <>
              <span className="text-lg">{row.emoji}</span>
              <span className="flex-1 text-left text-[13.5px] font-semibold">
                {row.label}
              </span>
              <ChevronRight className="h-4 w-4 text-ink-soft/50" />
            </>
          );
          const className =
            "mb-2 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-soft transition-transform active:scale-[0.99]";
          return row.href ? (
            <Link key={row.label} href={row.href} className={className}>
              {inner}
            </Link>
          ) : (
            <button key={row.label} className={className}>
              {inner}
            </button>
          );
        })}
      </div>
    </main>
  );
}

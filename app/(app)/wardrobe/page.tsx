"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";
import { MOCK_WARDROBE, ROLE_LABELS, type GarmentRole } from "@/lib/mock";

export default function WardrobePage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<GarmentRole | "all">("all");

  const roles = useMemo(
    () =>
      (Object.keys(ROLE_LABELS) as GarmentRole[]).filter((r) =>
        MOCK_WARDROBE.some((g) => g.role === r),
      ),
    [],
  );

  const garments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_WARDROBE.filter((g) => {
      if (role !== "all" && g.role !== role) return false;
      if (!q) return true;
      return [g.label, g.color, g.brand, g.material]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, role]);

  const favs = MOCK_WARDROBE.filter((g) => g.fav).length;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
      <header className="flex items-center justify-between px-5 pb-4">
        <div>
          <h1 className="font-heading text-[26px] font-extrabold">
            O teu armário
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            {MOCK_WARDROBE.length} peças · {roles.length} categorias
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

      {/* pesquisa */}
      <label className="mx-5 mb-4 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-soft">
        <Search className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar peça, cor ou marca…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
      </label>

      {/* estatísticas */}
      <div className="flex gap-2.5 px-5 pb-4">
        <div className="flex-1 rounded-2xl bg-ink p-3 text-cream">
          <div className="font-heading text-2xl font-extrabold">
            {MOCK_WARDROBE.length}
          </div>
          <div className="text-[10px] font-semibold opacity-85">Peças</div>
        </div>
        <div className="flex-1 rounded-2xl bg-grape p-3 text-white">
          <div className="font-heading text-2xl font-extrabold">4</div>
          <div className="text-[10px] font-semibold opacity-85">Outfits</div>
        </div>
        <div className="flex-1 rounded-2xl bg-mint p-3 text-ink">
          <div className="font-heading text-2xl font-extrabold">{favs}</div>
          <div className="text-[10px] font-semibold opacity-85">Favoritos</div>
        </div>
      </div>

      {/* filtros por categoria */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        {(["all", ...roles] as const).map((r) => {
          const active = role === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/10 bg-white text-ink-soft"
              }`}
            >
              {r === "all" ? "Tudo" : ROLE_LABELS[r]}
            </button>
          );
        })}
      </div>

      {/* grelha de peças */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-24">
        {garments.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/wardrobe/${g.id}`}
              className="block overflow-hidden rounded-[20px] bg-white shadow-soft transition-transform active:scale-[0.98]"
            >
              <div
                className="relative flex h-28 items-center justify-center text-5xl"
                style={{ background: g.bg }}
              >
                {g.emoji}
                <span className="absolute top-2 right-2 text-sm">
                  {g.fav ? "❤️" : "🤍"}
                </span>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-bold">{g.label}</p>
                <p className="text-[10px] text-ink-soft">{g.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
        {garments.length === 0 && (
          <p className="col-span-2 py-10 text-center text-sm text-ink-soft">
            Nenhuma peça encontrada. Tenta outra pesquisa.
          </p>
        )}
      </div>

      {/* botão flutuante de adicionar */}
      <Link
        href="/wardrobe/add"
        aria-label="Adicionar peça"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-coral text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7" />
      </Link>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { LogIn, Plus, Search, Shirt } from "lucide-react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type GarmentCategory,
} from "@/lib/attributes";
import type { WardrobeGarment } from "@/lib/db/wardrobe";

/** Nome do cartão. Cai no rótulo da categoria quando não há subcategoria. */
function nameOf(g: WardrobeGarment): string {
  return g.subcategory?.trim() || CATEGORY_LABELS[g.category];
}

/** Linha secundária: cor e material, os Atributos que o utilizador confirmou. */
function detailOf(g: WardrobeGarment): string {
  return [g.primaryColor, g.material].filter(Boolean).join(" · ");
}

export function WardrobeView({
  garments: loaded,
  signedIn,
}: {
  /** `null` = a leitura falhou. Não é a mesma coisa que um Armário vazio. */
  garments: WardrobeGarment[] | null;
  signedIn: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GarmentCategory | "all">("all");

  // Memoizado para o array vazio não ser novo em cada render, o que faria os
  // useMemo abaixo recalcularem sempre.
  const garments = useMemo(() => loaded ?? [], [loaded]);

  // Só mostra filtros de categorias que o utilizador realmente tem.
  const categories = useMemo(
    () => CATEGORY_ORDER.filter((c) => garments.some((g) => g.category === c)),
    [garments],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return garments.filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (!q) return true;
      // Nota: o mock pesquisava também por marca; a base de dados não tem
      // coluna de marca e a IA não a extrai, por isso saiu da pesquisa.
      return [g.subcategory, g.primaryColor, g.material, g.pattern]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [garments, query, category]);

  const favourites = garments.filter((g) => g.isFavourite).length;

  const header = (
    <header className="flex items-center justify-between px-5 pb-4">
      <div>
        <h1 className="font-heading text-[26px] font-extrabold">
          O teu armário
        </h1>
        <p className="mt-0.5 text-xs text-ink-soft">
          {garments.length === 0
            ? "Ainda sem peças"
            : `${garments.length} ${garments.length === 1 ? "peça" : "peças"} · ${categories.length} ${categories.length === 1 ? "categoria" : "categorias"}`}
        </p>
      </div>
      <Link
        href="/profile"
        aria-label="Perfil"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-white"
      >
        <Shirt className="h-5 w-5" />
      </Link>
    </header>
  );

  // ── Sem sessão: o Armário é de alguém, não há nada a mostrar ──
  if (!signedIn) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
        {header}
        <div className="mx-5 mt-6 rounded-[26px] bg-white p-6 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-2">
            <LogIn className="h-6 w-6 text-ink-soft" />
          </span>
          <h2 className="font-heading mt-4 text-lg font-extrabold">
            Entra para ver o teu armário
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            As tuas peças ficam guardadas na tua conta, para as tuas sugestões
            partirem da roupa que tens de verdade.
          </p>
          <Link
            href="/sign-in"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-coral py-3.5 text-[13px] font-extrabold text-white transition-transform active:scale-[0.98]"
          >
            Entrar
          </Link>
        </div>
      </main>
    );
  }

  // ── A leitura falhou. Nunca mostrar o convite de "armário vazio" aqui: quem
  //    tem 40 peças leria uma avaria como se tivesse perdido tudo.
  if (loaded === null) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
        {header}
        <div className="mx-5 mt-6 rounded-[26px] bg-white p-6 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-2 text-2xl">
            ⚠️
          </span>
          <h2 className="font-heading mt-4 text-lg font-extrabold">
            Não consegui abrir o teu armário
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            As tuas peças estão guardadas — foi a ligação que falhou. Tenta
            outra vez daqui a um instante.
          </p>
          <Link
            href="/wardrobe"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-cream-2 py-3.5 text-[13px] font-extrabold text-ink transition-transform active:scale-[0.98]"
          >
            Tentar outra vez
          </Link>
        </div>
      </main>
    );
  }

  // ── Armário vazio: o primeiro ecrã de todo o utilizador novo ──
  if (garments.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
        {header}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="px-5"
        >
          <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-ink-2 to-[#0d0a12]">
            <span
              aria-hidden
              className="absolute h-44 w-44 rounded-full bg-grape/35 blur-3xl"
            />
            <span className="z-10 flex h-32 w-32 items-center justify-center rounded-3xl border-[2.5px] border-dashed border-lime/75">
              <Shirt className="h-12 w-12 text-lime" />
            </span>
          </div>

          <h2 className="font-heading mt-5 text-[22px] leading-tight font-extrabold">
            O teu armário está à espera
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Fotografa a primeira peça. Uma foto é uma peça — o resto a IA
            reconhece por ti, e tu confirmas.
          </p>

          <Link
            href="/wardrobe/add"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-4 text-sm font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Adicionar a primeira peça
          </Link>

          <ol className="mt-7 space-y-3">
            {[
              "Fotografas ou escolhes da galeria",
              "Confirmas o que a IA reconheceu",
              "Pedes “veste-me hoje” e ela usa o que tens",
            ].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-2 text-xs font-extrabold">
                  {i + 1}
                </span>
                <span className="text-[13px] text-ink-soft">{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6">
      {header}

      {/* pesquisa */}
      <label className="mx-5 mb-4 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-soft">
        <Search className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Procurar peça, cor ou material…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
      </label>

      {/* estatísticas — as três derivam das Peças reais */}
      <div className="flex gap-2.5 px-5 pb-4">
        <div className="flex-1 rounded-2xl bg-ink p-3 text-cream">
          <div className="font-heading text-2xl font-extrabold">
            {garments.length}
          </div>
          <div className="text-[10px] font-semibold opacity-85">Peças</div>
        </div>
        <div className="flex-1 rounded-2xl bg-mint p-3 text-ink">
          <div className="font-heading text-2xl font-extrabold">
            {favourites}
          </div>
          <div className="text-[10px] font-semibold opacity-85">Favoritos</div>
        </div>
        <div className="flex-1 rounded-2xl bg-grape p-3 text-white">
          <div className="font-heading text-2xl font-extrabold">
            {categories.length}
          </div>
          <div className="text-[10px] font-semibold opacity-85">Categorias</div>
        </div>
      </div>

      {/* filtros por categoria */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        {(["all", ...categories] as const).map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/10 bg-white text-ink-soft"
              }`}
            >
              {c === "all" ? "Tudo" : CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </div>

      {/* grelha de peças — cada cartão mostra o Recorte */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-24">
        {visible.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.05 }}
          >
            <Link
              href={`/wardrobe/${g.id}`}
              className="block overflow-hidden rounded-[20px] bg-white shadow-soft transition-transform active:scale-[0.98]"
            >
              <div className="relative flex h-28 items-center justify-center bg-cream-2 p-2">
                {/* Recorte em Blob remoto. Fica em <img> até existir um Blob
                    store e sabermos o seu hostname para os remotePatterns do
                    next/image — configurá-lo às cegas faria o next/image
                    rebentar em runtime. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.imageUrl}
                  alt={nameOf(g)}
                  className="max-h-full max-w-full object-contain"
                />
                {g.isFavourite && (
                  <span className="absolute top-2 right-2 text-sm">❤️</span>
                )}
              </div>
              <div className="px-3 py-2.5">
                <p className="truncate text-xs font-bold">{nameOf(g)}</p>
                {detailOf(g) && (
                  <p className="truncate text-[10px] text-ink-soft">
                    {detailOf(g)}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
        {visible.length === 0 && (
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

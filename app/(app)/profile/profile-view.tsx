"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { ChevronRight, LogIn, LogOut } from "lucide-react";
import { STYLE_OPTIONS } from "@/lib/styles";
import { DISTRICT_NAMES } from "@/lib/districts";
import { GENDER_LABELS, GENDER_ORDER, type Gender } from "@/lib/genders";
import {
  signOutAction,
  updateDistrict,
  updateGender,
  updatePreferredStyles,
} from "./actions";

export interface ProfileUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

const ROWS = [
  { emoji: "🧩", label: "O que te falta", href: "/gaps" },
  { emoji: "🔔", label: "Notificações do outfit", href: null },
  { emoji: "⭐", label: "Passar para Premium", href: null },
];

function initials(user: ProfileUser): string {
  const source = user.name ?? user.email ?? "";
  const words = source.replace(/@.*$/, "").split(/[\s._-]+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function ProfileView({
  user,
  initialStyles,
  counts,
  initialDistrict,
  initialGender,
}: {
  user: ProfileUser | null;
  initialStyles: string[] | null;
  initialDistrict: string | null;
  initialGender: Gender | null;
  /** Contagens reais do Armário. `null` quando não há sessão ou a leitura falhou. */
  counts: { total: number; favourites: number; outfits: number } | null;
}) {
  const [active, setActive] = useState<string[]>(initialStyles ?? []);
  const [district, setDistrict] = useState<string | null>(initialDistrict);
  const [gender, setGender] = useState<Gender | null>(initialGender);
  const [, startTransition] = useTransition();

  function toggle(tag: string) {
    const next = active.includes(tag)
      ? active.filter((t) => t !== tag)
      : [...active, tag];
    setActive(next);
    // Com sessão, persiste no perfil; sem sessão fica só local.
    if (user) startTransition(() => void updatePreferredStyles(next));
  }

  // Outfits = os que o utilizador guardou (ou usou), não as sugestões soltas.
  // Até 2026-08-11 estava em "—" porque nada os gerava; agora o "Veste-me
  // hoje" grava e o ❤️ marca como guardado.
  const stats: { n: number | string; l: string }[] = [
    { n: counts?.total ?? "—", l: "Peças" },
    { n: counts?.outfits ?? "—", l: "Outfits" },
    { n: counts?.favourites ?? "—", l: "Favoritos" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pb-24">
      {/* topo com gradiente */}
      <div className="bg-brand-gradient px-5 pt-12 pb-7 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-white shadow-lift"
        >
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-heading text-3xl font-extrabold text-grape">
              {user ? initials(user) : "?"}
            </span>
          )}
        </motion.div>
        <h1 className="font-heading text-[22px] font-extrabold text-white">
          {user?.name ?? user?.email ?? "A tua conta"}
        </h1>
        <p className="mt-0.5 text-xs opacity-90">
          {user
            ? (user.email ?? "Sessão iniciada")
            : "Inicia sessão para guardar o teu armário"}
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
          {STYLE_OPTIONS.map((tag) => {
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

      {/* distrito e género — o que o "Veste-me hoje" precisa */}
      <div className="mx-5 mt-5">
        <p className="mb-2.5 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
          Distrito <span className="normal-case">(para a meteorologia)</span>
        </p>
        <select
          value={district ?? ""}
          onChange={(e) => {
            const next = e.target.value || null;
            setDistrict(next);
            if (user) startTransition(() => void updateDistrict(next));
          }}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-[13.5px] font-semibold shadow-soft outline-none"
        >
          <option value="">Escolhe o distrito…</option>
          {DISTRICT_NAMES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {!district && (
          <p className="mt-2 text-[11px] text-ink-soft">
            Sem distrito não há previsão do tempo, e o outfit de hoje fica sem
            saber se está frio.
          </p>
        )}
      </div>

      <div className="mx-5 mt-4">
        <p className="mb-2.5 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
          Como me identifico
        </p>
        <div className="flex flex-wrap gap-2">
          {GENDER_ORDER.map((g) => {
            const on = gender === g;
            return (
              <button
                key={g}
                onClick={() => {
                  const next = on ? null : g;
                  setGender(next);
                  if (user) startTransition(() => void updateGender(next));
                }}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold shadow-soft transition-colors ${
                  on
                    ? "border-coral bg-coral text-white"
                    : "border-ink/10 bg-white text-ink"
                }`}
              >
                {GENDER_LABELS[g]}
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

      {user ? (
        // Terminar sessão — limpa a sessão e devolve ao ecrã inicial, para
        // poder entrar com outra conta.
        <form action={signOutAction} className="mx-5 mt-6">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[13px] font-extrabold text-coral-deep shadow-soft transition-transform active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            Terminar sessão
          </button>
        </form>
      ) : (
        <Link
          href="/sign-in"
          className="mx-5 mt-6 flex items-center justify-center gap-2 rounded-full bg-coral py-3.5 text-[13px] font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.99]"
        >
          <LogIn className="h-4 w-4" />
          Iniciar sessão
        </Link>
      )}
    </main>
  );
}

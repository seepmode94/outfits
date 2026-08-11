"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  FORMALITY_LABELS,
  SEASON_LABELS,
  SEASON_ORDER,
  type GarmentCategory,
  type Formality,
  type Season,
} from "@/lib/attributes";
import type { GarmentAttributes } from "@/lib/ai/schemas";
import type { CaptureResult } from "@/lib/capture";
import { createGarment } from "./actions";

const field =
  "w-full rounded-2xl bg-white px-3.5 py-3 text-[13px] shadow-soft outline-none placeholder:text-ink-soft";
const label =
  "mb-1.5 block text-[11px] font-extrabold tracking-wider text-ink-soft uppercase";

export function AttributesForm({ capture }: { capture: CaptureResult }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [a, setA] = useState<GarmentAttributes>(capture.attributes);

  const set = <K extends keyof GarmentAttributes>(
    key: K,
    value: GarmentAttributes[K],
  ) => setA((prev) => ({ ...prev, [key]: value }));

  function toggleSeason(s: Season) {
    set(
      "seasons",
      a.seasons.includes(s)
        ? a.seasons.filter((x) => x !== s)
        : [...a.seasons, s],
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createGarment({
        recorteUrl: capture.recorteUrl,
        originalUrl: capture.originalUrl,
        attributes: a,
      });
      if (res.ok) router.push("/wardrobe");
      else setError(res.error);
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="px-5 pt-5"
    >
      <p className="pb-1 text-xs font-extrabold tracking-wider text-ink-soft uppercase">
        Reconhecido pela IA
      </p>
      <p className="pb-4 text-[11px] text-ink-soft">
        Corrige o que estiver errado. A peça só entra no armário depois de
        confirmares.
      </p>

      <div className="space-y-3.5">
        <div>
          <span className={label}>Categoria</span>
          <select
            value={a.category}
            onChange={(e) => set("category", e.target.value as GarmentCategory)}
            className={field}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={label}>Tipo de peça</span>
          <input
            value={a.subcategory}
            onChange={(e) => set("subcategory", e.target.value)}
            placeholder="ex: calções, camisa, ténis"
            className={field}
          />
        </div>

        <div>
          <span className={label}>Cor principal</span>
          <input
            value={a.primaryColor}
            onChange={(e) => set("primaryColor", e.target.value)}
            placeholder="ex: azul-marinho"
            className={field}
          />
        </div>

        <div>
          <span className={label}>Todas as cores</span>
          <input
            value={a.colors.join(", ")}
            onChange={(e) =>
              set(
                "colors",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="separadas por vírgula"
            className={field}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <span className={label}>Padrão</span>
            <input
              value={a.pattern}
              onChange={(e) => set("pattern", e.target.value)}
              placeholder="liso, riscas…"
              className={field}
            />
          </div>
          <div className="flex-1">
            <span className={label}>Material</span>
            <input
              value={a.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="algodão…"
              className={field}
            />
          </div>
        </div>

        <div>
          <span className={label}>Estilo</span>
          <select
            value={a.formality}
            onChange={(e) => set("formality", e.target.value as Formality)}
            className={field}
          >
            {(Object.keys(FORMALITY_LABELS) as Formality[]).map((f) => (
              <option key={f} value={f}>
                {FORMALITY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className={label}>Estações</span>
          <div className="flex gap-2">
            {SEASON_ORDER.map((s) => {
              const on = a.seasons.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeason(s)}
                  aria-pressed={on}
                  className={`flex-1 rounded-full border px-2 py-2.5 text-[11px] font-bold capitalize transition-colors ${
                    on
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/10 bg-white text-ink-soft"
                  }`}
                >
                  {SEASON_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <p className="pt-4 text-center text-sm text-coral-deep">{error}</p>
      )}

      <button
        onClick={save}
        disabled={pending}
        className="mt-5 w-full rounded-full bg-coral py-4 text-sm font-extrabold text-white shadow-[0_12px_24px_-6px_rgba(245,59,30,0.6)] transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "A guardar…" : "Guardar no armário"}
      </button>

      <p className="pt-3 pb-2 text-center text-[11px] text-ink-soft">
        Recorte em {(capture.ms.cutout / 1000).toFixed(1)}s · reconhecimento em{" "}
        {(capture.ms.analyze / 1000).toFixed(1)}s
      </p>
    </motion.section>
  );
}

"use client";

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  FORMALITY_LABELS,
  FORMALITY_ORDER,
  SEASON_LABELS,
  SEASON_ORDER,
  type Formality,
  type GarmentCategory,
  type Season,
} from "@/lib/attributes";
import type { GarmentAttributes } from "@/lib/ai/schemas";

/**
 * Os campos dos **Atributos**, controlados de fora.
 *
 * Partilhados entre criar (`wardrobe/add`) e editar (`wardrobe/[id]`): são o
 * mesmo conjunto de campos e as mesmas regras, e duplicá-los levaria a que uma
 * correção num sítio não chegasse ao outro.
 */

const field =
  "w-full rounded-2xl bg-white px-3.5 py-3 text-[13px] shadow-soft outline-none placeholder:text-ink-soft";
const label =
  "mb-1.5 block text-[11px] font-extrabold tracking-wider text-ink-soft uppercase";

export function AttributesFields({
  value: a,
  onChange,
}: {
  value: GarmentAttributes;
  onChange: (next: GarmentAttributes) => void;
}) {
  const set = <K extends keyof GarmentAttributes>(
    key: K,
    v: GarmentAttributes[K],
  ) => onChange({ ...a, [key]: v });

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
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
        {/* "Formalidade" e não "Estilo": o glossário chama-lhe assim, e "estilo"
            já significa outra coisa na app — o Streetwear/Vintage do perfil, que
            é o gosto do utilizador e não uma propriedade da peça. */}
        <span className={label}>Formalidade</span>
        <div className="grid grid-cols-2 gap-2">
          {FORMALITY_ORDER.map((f) => {
            const on = a.formality.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => set("formality", toggle(a.formality, f) as Formality[])}
                aria-pressed={on}
                className={`rounded-full border px-3 py-2.5 text-[11px] font-bold transition-colors ${
                  on
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/10 bg-white text-ink-soft"
                }`}
              >
                {FORMALITY_LABELS[f]}
              </button>
            );
          })}
        </div>
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
                onClick={() => set("seasons", toggle(a.seasons, s) as Season[])}
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
  );
}

/** Converte uma linha de `garments` na forma que os campos usam. */
export function attributesFromGarment(g: {
  category: GarmentCategory;
  subcategory: string | null;
  primaryColor: string | null;
  colors: string[] | null;
  pattern: string | null;
  formality: Formality[] | null;
  seasons: Season[] | null;
  material: string | null;
}): GarmentAttributes {
  return {
    category: g.category,
    subcategory: g.subcategory ?? "",
    primaryColor: g.primaryColor ?? "",
    colors: g.colors ?? [],
    pattern: g.pattern ?? "",
    formality: g.formality ?? [],
    seasons: g.seasons ?? [],
    material: g.material ?? "",
  };
}

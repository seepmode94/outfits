"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Pencil } from "lucide-react";
import {
  AttributesFields,
  attributesFromGarment,
} from "@/components/wardrobe/attributes-fields";
import {
  CATEGORY_LABELS,
  FORMALITY_LABELS,
  SEASON_LABELS,
  SEASON_ORDER,
} from "@/lib/attributes";
import type { GarmentAttributes } from "@/lib/ai/schemas";
import type { Garment } from "@/lib/db/schema";
import { setFavourite, updateGarment } from "./actions";

export function GarmentView({ garment }: { garment: Garment }) {
  const router = useRouter();
  const [fav, setFav] = useState(garment.isFavourite);
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<GarmentAttributes>(() =>
    attributesFromGarment(garment),
  );

  function startEditing() {
    // Recomeça sempre do que está guardado, para uma edição abandonada não
    // deixar rascunho a contaminar a seguinte.
    setDraft(attributesFromGarment(garment));
    setError(null);
    setEditing(true);
  }

  async function saveEdits() {
    setSaving(true);
    setError(null);
    const res = await updateGarment(garment.id, draft);
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh(); // recarrega a Peça do servidor para os chips mostrarem o novo
    } else {
      setError(res.error);
    }
  }

  function toggleFav() {
    const next = !fav;
    setFav(next); // optimista: o coração responde já
    startTransition(() => void setFavourite(garment.id, next));
  }

  const name = garment.subcategory?.trim() || CATEGORY_LABELS[garment.category];

  const seasons = (garment.seasons ?? [])
    .slice()
    .sort((a, b) => SEASON_ORDER.indexOf(a) - SEASON_ORDER.indexOf(b))
    .map((s) => SEASON_LABELS[s]);

  // Só os Atributos que a Peça realmente tem. Nada de linhas com "—".
  const attrs = [
    { k: "Cor", v: garment.primaryColor },
    { k: "Material", v: garment.material },
    { k: "Padrão", v: garment.pattern },
    {
      k: "Formalidade",
      v: (garment.formality ?? []).map((f) => FORMALITY_LABELS[f]).join(", ") || null,
    },
    { k: "Estação", v: seasons.length > 0 ? seasons.join(", ") : null },
  ].filter((a): a is { k: string; v: string } => Boolean(a.v));

  const subtitle = [
    CATEGORY_LABELS[garment.category],
    garment.material,
    seasons.length > 0 ? seasons.join(" / ") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col pt-6 pb-24">
      {/* hero: o Recorte sobre xadrez, como no ecrã de captura */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-5 flex h-64 items-center justify-center overflow-hidden rounded-[26px] p-6"
        style={{
          backgroundImage:
            "repeating-conic-gradient(#FFE9DA 0% 25%, white 0% 50%)",
          backgroundSize: "24px 24px",
        }}
      >
        <Link
          href="/wardrobe"
          aria-label="Voltar ao armário"
          className="absolute top-3.5 left-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <button
          onClick={toggleFav}
          aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={fav}
          className="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm transition-transform active:scale-90"
        >
          {fav ? "❤️" : "🤍"}
        </button>
        {/* Ver a nota em wardrobe-view.tsx sobre <img> vs next/image. */}
        <motion.img
          src={garment.imageUrl}
          alt={name}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="max-h-full max-w-full object-contain drop-shadow-xl"
        />
      </motion.div>

      {/* título */}
      <div className="px-5 pt-4.5 pb-1.5">
        <h1 className="font-heading text-[22px] font-extrabold">{name}</h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
        )}
      </div>

      {/* atributos: chips a ler, ou os mesmos campos do ecrã de adicionar */}
      {editing ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-2"
        >
          <AttributesFields value={draft} onChange={setDraft} />

          {error && (
            <p className="pt-4 text-center text-sm text-coral-deep">{error}</p>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="flex-1 rounded-full bg-cream-2 py-3.5 text-[13px] font-extrabold text-ink transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={saveEdits}
              disabled={saving}
              className="flex-[1.6] rounded-full bg-coral py-3.5 text-[13px] font-extrabold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? "A guardar…" : "Guardar alterações"}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {attrs.length > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pt-1.5 pb-3">
              {attrs.map((a) => (
                <span
                  key={a.k}
                  className="rounded-full border border-ink/10 bg-white px-3 py-2 text-xs font-semibold shadow-soft"
                >
                  <span className="mr-1.5 text-ink-soft">{a.k}</span>
                  {a.v}
                </span>
              ))}
            </div>
          )}
          <div className="px-5 pt-1">
            <button
              onClick={startEditing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-cream-2 py-3.5 text-[13px] font-extrabold text-ink transition-transform active:scale-[0.98]"
            >
              <Pencil className="h-4 w-4" />
              Editar detalhes
            </button>
          </div>
        </>
      )}

      {/* O mock mostrava aqui "usado N×", a marca e "combina bem com". Nenhum
          dos três existe na base de dados, e "combina bem com" depende de
          outfits gerados, que ainda não estão implementados. Voltam quando
          houver dados a sustentá-los, não antes. */}
    </main>
  );
}

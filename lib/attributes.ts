import type { Garment } from "@/lib/db/schema";

/**
 * Rótulos em português dos Atributos que são enums na base de dados.
 * As chaves vêm dos enums do schema, não de listas paralelas — se o enum
 * mudar, o TypeScript obriga a actualizar isto.
 */

export type GarmentCategory = NonNullable<Garment["category"]>;
export type Formality = NonNullable<Garment["formality"]>;
export type Season = NonNullable<Garment["seasons"]>[number];

/** No plural — servem os filtros do Armário. */
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  outerwear: "Casacos",
  top: "Tops",
  bottom: "Calças",
  footwear: "Calçado",
  dress: "Vestidos",
  accessory: "Acessórios",
};

export const CATEGORY_ORDER: GarmentCategory[] = [
  "outerwear",
  "top",
  "bottom",
  "dress",
  "footwear",
  "accessory",
];

export const FORMALITY_LABELS: Record<Formality, string> = {
  casual: "Casual",
  smart_casual: "Casual arranjado",
  formal: "Formal",
  sport: "Desporto",
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: "primavera",
  summer: "verão",
  autumn: "outono",
  winter: "inverno",
};

export const SEASON_ORDER: Season[] = ["spring", "summer", "autumn", "winter"];

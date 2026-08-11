import type { Garment } from "@/lib/db/schema";

/**
 * Rótulos em português dos Atributos que são enums na base de dados.
 * As chaves vêm dos enums do schema, não de listas paralelas — se o enum
 * mudar, o TypeScript obriga a actualizar isto.
 */

export type GarmentCategory = NonNullable<Garment["category"]>;
export type Formality = NonNullable<Garment["formality"]>;
export type Season = NonNullable<Garment["seasons"]>[number];

/**
 * Rótulos das categorias, como o utilizador as lê.
 *
 * `top` e `bottom` são **estruturais** na base de dados — dizem em que parte do
 * corpo a Peça vai, e é disso que o `suggestOutfit` precisa para montar um
 * outfit. Os rótulos passaram a dizer isso mesmo em vez de fingirem ser nomes
 * de peças: "Tops" lia-se como roupa de mulher numa camisa, e "Calças" estava
 * errado nos calções, que é literalmente a primeira Peça que entrou no Armário.
 */
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  outerwear: "Casacos",
  top: "Parte de cima",
  bottom: "Parte de baixo",
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

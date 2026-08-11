import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { garments, outfits, type Garment } from "./schema";

/**
 * O que o cartão do Armário precisa de cada Peça — deliberadamente menos do que
 * a linha inteira. `imageUrl` é o **Recorte**; a Foto original (`originalImageUrl`)
 * nunca sai do servidor, existe só para se poder refazer o Recorte (ADR-0002).
 */
export type WardrobeGarment = Pick<
  Garment,
  | "id"
  | "imageUrl"
  | "category"
  | "subcategory"
  | "primaryColor"
  | "material"
  | "pattern"
  | "isFavourite"
>;

/** As Peças de um utilizador, mais recentes primeiro. */
export async function listWardrobe(userId: string): Promise<WardrobeGarment[]> {
  return db
    .select({
      id: garments.id,
      imageUrl: garments.imageUrl,
      category: garments.category,
      subcategory: garments.subcategory,
      primaryColor: garments.primaryColor,
      material: garments.material,
      pattern: garments.pattern,
      isFavourite: garments.isFavourite,
    })
    .from(garments)
    .where(eq(garments.userId, userId))
    .orderBy(desc(garments.createdAt));
}

/**
 * Uma Peça pelo id, **sempre limitada ao dono**. O `userId` no `where` não é
 * zelo a mais: sem ele, qualquer utilizador com sessão leria o Armário alheio
 * adivinhando um uuid.
 */
export async function getGarment(
  userId: string,
  id: string,
): Promise<Garment | null> {
  const [row] = await db
    .select()
    .from(garments)
    .where(and(eq(garments.userId, userId), eq(garments.id, id)));

  return row ?? null;
}

/**
 * As Peças completas de um utilizador — tudo o que o `suggestOutfit` precisa
 * para raciocinar (Atributos inteiros), não só o que o cartão mostra.
 */
export async function listWardrobeFull(userId: string): Promise<Garment[]> {
  return db
    .select()
    .from(garments)
    .where(eq(garments.userId, userId))
    .orderBy(desc(garments.createdAt));
}

/**
 * Quantas Peças servem cada nível de formalidade. Como `formality` é um array
 * (uma camisa pode ser smart_casual E formal), a mesma Peça conta em mais do
 * que um nível — é essa a semântica que os chips do "Veste-me hoje" precisam.
 */
export async function countByFormality(
  userId: string,
): Promise<Record<string, number>> {
  const level = sql<string>`unnest(${garments.formality})`;
  const rows = await db
    .select({ level, n: sql<number>`count(*)::int` })
    .from(garments)
    .where(eq(garments.userId, userId))
    .groupBy(level);

  return Object.fromEntries(rows.map((r) => [r.level, r.n]));
}

/** Outfits que o utilizador guardou (ou usou) — a contagem honesta do Perfil. */
export async function countSavedOutfits(userId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(outfits)
    .where(
      and(eq(outfits.userId, userId), inArray(outfits.status, ["saved", "worn"])),
    );
  return row?.n ?? 0;
}

/**
 * Contagens para o Perfil. Uma query em vez de trazer as linhas todas só para
 * lhes medir o comprimento.
 */
export async function countWardrobe(
  userId: string,
): Promise<{ total: number; favourites: number }> {
  const [row] = await db
    .select({
      total: sql<number>`(count(*))::int`,
      favourites: sql<number>`(count(*) filter (where ${garments.isFavourite}))::int`,
    })
    .from(garments)
    .where(eq(garments.userId, userId));

  return row ?? { total: 0, favourites: 0 };
}

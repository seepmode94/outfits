import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "./index";
import { feedback, outfitGarments } from "./schema";

/**
 * O que o feedback do utilizador diz sobre cada Peça, na forma que o
 * `suggestOutfit` consome: listas de IDs a priorizar e a evitar.
 *
 * Duas origens, ambas previstas no schema desde o início:
 * - feedback a um **Outfit** — propaga-se às Peças dele via `outfit_garment`;
 * - feedback direto a uma **Peça** (`feedback.garment_id`), reservado para
 *   "esta peça não funcionou neste outfit" (ainda sem UI).
 *
 * Uma Peça pode ter sinais contraditórios (gostou de um outfit com ela, não
 * gostou de outro): vale o mais recente, por isso as queries vêm por ordem
 * cronológica e as últimas escritas ganham.
 */
export async function getFeedbackGarments(userId: string): Promise<{
  likedGarmentIds: string[];
  dislikedGarmentIds: string[];
}> {
  const [viaOutfit, direct] = await Promise.all([
    db
      .select({
        garmentId: outfitGarments.garmentId,
        value: feedback.value,
        at: feedback.createdAt,
      })
      .from(feedback)
      .innerJoin(outfitGarments, eq(outfitGarments.outfitId, feedback.outfitId))
      .where(eq(feedback.userId, userId))
      .orderBy(asc(feedback.createdAt)),
    db
      .select({
        garmentId: feedback.garmentId,
        value: feedback.value,
        at: feedback.createdAt,
      })
      .from(feedback)
      .where(and(eq(feedback.userId, userId), isNotNull(feedback.garmentId)))
      .orderBy(asc(feedback.createdAt)),
  ]);

  // Junta as duas origens por ordem temporal global; a última opinião ganha.
  const merged = [...viaOutfit, ...direct]
    .filter((r): r is typeof r & { garmentId: string } => r.garmentId != null)
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const latest = new Map<string, "like" | "dislike">();
  for (const r of merged) latest.set(r.garmentId, r.value);

  const likedGarmentIds: string[] = [];
  const dislikedGarmentIds: string[] = [];
  for (const [id, value] of latest) {
    (value === "like" ? likedGarmentIds : dislikedGarmentIds).push(id);
  }
  return { likedGarmentIds, dislikedGarmentIds };
}

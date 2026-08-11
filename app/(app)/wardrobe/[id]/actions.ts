"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { garmentAttributesSchema } from "@/lib/ai/schemas";
import { db } from "@/lib/db";
import { garments } from "@/lib/db/schema";

/**
 * Marca ou desmarca uma Peça como Favorito.
 *
 * O `userId` no `where` não é zelo a mais: sem ele, qualquer sessão marcaria a
 * Peça de outra pessoa adivinhando um uuid.
 */
export async function setFavourite(garmentId: string, isFavourite: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  await db
    .update(garments)
    .set({ isFavourite })
    .where(and(eq(garments.userId, userId), eq(garments.id, garmentId)));

  // As contagens do Perfil e a grelha do Armário mostram este valor.
  revalidatePath("/wardrobe");
  revalidatePath("/profile");
}

export type UpdateGarmentResult = { ok: true } | { ok: false; error: string };

/**
 * Corrige os **Atributos** de uma Peça já no Armário.
 *
 * As imagens não se tocam: o Recorte e a Foto original são o registo do que foi
 * fotografado. Aqui edita-se só o que a IA propôs e o utilizador confirmou — e
 * pode ter confirmado mal.
 */
export async function updateGarment(
  garmentId: string,
  attributes: unknown,
): Promise<UpdateGarmentResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Precisas de sessão." };

  const parsed = garmentAttributesSchema.safeParse(attributes);
  if (!parsed.success) {
    return { ok: false, error: "Atributos incompletos ou inválidos." };
  }
  const a = parsed.data;

  // O userId no where impede editar a Peça de outra pessoa com um uuid adivinhado.
  const rows = await db
    .update(garments)
    .set({
      category: a.category,
      subcategory: a.subcategory || null,
      primaryColor: a.primaryColor || null,
      colors: a.colors.length > 0 ? a.colors : null,
      pattern: a.pattern || null,
      formality: a.formality.length > 0 ? a.formality : null,
      seasons: a.seasons.length > 0 ? a.seasons : null,
      material: a.material || null,
    })
    .where(and(eq(garments.userId, userId), eq(garments.id, garmentId)))
    .returning({ id: garments.id });

  if (rows.length === 0) return { ok: false, error: "Peça não encontrada." };

  revalidatePath("/wardrobe");
  revalidatePath(`/wardrobe/${garmentId}`);

  return { ok: true };
}

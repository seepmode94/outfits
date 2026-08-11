"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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

"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { garmentAttributesSchema } from "@/lib/ai/schemas";
import { db } from "@/lib/db";
import { garments } from "@/lib/db/schema";
import { ownsBlobUrl } from "@/lib/images/store";

/**
 * Travão contra abuso automatizado, não o teto de produto. O teto vitalício do
 * Armário está no ADR-0003 mas ficou por reavaliar: existia para limitar custo
 * por foto, e o ADR-0004 pôs esse custo a zero. Este limite é só para uma
 * sessão descontrolada não enterrar a base de dados.
 */
const MAX_PER_DAY = 40;

export type CreateGarmentResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Transforma uma **Captura** em **Peça**. É este o momento em que a Peça passa
 * a existir: o `CONTEXT.md` fixa que sem confirmação humana dos **Atributos**
 * nada entra no **Armário**, por isso não há inserção em lado nenhum a montante.
 */
export async function createGarment(input: {
  recorteUrl: string;
  originalUrl: string | null;
  attributes: unknown;
}): Promise<CreateGarmentResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Precisas de sessão." };

  // Os URLs vêm do cliente, logo não são de confiar: sem esta verificação um
  // pedido forjado gravava no Armário um URL arbitrário, ou o Recorte de
  // outra pessoa. A Foto original é opcional (ver lib/images/store.ts), mas se
  // vier tem de ser igualmente do dono.
  if (!ownsBlobUrl(input.recorteUrl, userId)) {
    return { ok: false, error: "Imagens não reconhecidas." };
  }
  if (input.originalUrl && !ownsBlobUrl(input.originalUrl, userId)) {
    return { ok: false, error: "Imagens não reconhecidas." };
  }

  const parsed = garmentAttributesSchema.safeParse(input.attributes);
  if (!parsed.success) {
    return { ok: false, error: "Atributos incompletos ou inválidos." };
  }
  const a = parsed.data;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ recent }] = await db
    .select({ recent: sql<number>`(count(*))::int` })
    .from(garments)
    .where(and(eq(garments.userId, userId), gte(garments.createdAt, since)));

  if (recent >= MAX_PER_DAY) {
    return {
      ok: false,
      error: `Já adicionaste ${MAX_PER_DAY} peças nas últimas 24 horas. Continua amanhã.`,
    };
  }

  const [row] = await db
    .insert(garments)
    .values({
      userId,
      imageUrl: input.recorteUrl,
      originalImageUrl: input.originalUrl ?? null,
      category: a.category,
      subcategory: a.subcategory || null,
      primaryColor: a.primaryColor || null,
      colors: a.colors.length > 0 ? a.colors : null,
      pattern: a.pattern || null,
      formality: a.formality,
      seasons: a.seasons.length > 0 ? a.seasons : null,
      material: a.material || null,
    })
    .returning({ id: garments.id });

  revalidatePath("/wardrobe");
  revalidatePath("/profile");

  return { ok: true, id: row.id };
}

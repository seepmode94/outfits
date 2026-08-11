"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { suggestOutfit } from "@/lib/ai";
import { CATEGORY_LABELS, FORMALITY_LABELS, type Formality } from "@/lib/attributes";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { feedback, outfitGarments, outfits, profiles } from "@/lib/db/schema";
import { getFeedbackGarments } from "@/lib/db/feedback";
import { listWardrobeFull } from "@/lib/db/wardrobe";
import { getWeatherForDistrict } from "@/lib/weather";

export type OutfitItem = {
  id: string;
  imageUrl: string;
  name: string;
  role: string;
};

export type GenerateResult =
  | { ok: true; outfitId: string; items: OutfitItem[]; explanation: string }
  | { ok: false; error: string };

function currentSeason(): string {
  const m = new Date().getMonth() + 1;
  if (m === 12 || m <= 2) return "inverno";
  if (m <= 5) return "primavera";
  if (m <= 8) return "verão";
  return "outono";
}

/**
 * Gera um Outfit a partir das Peças reais do Armário e grava-o como sugestão.
 *
 * Os `formalities` vêm dos chips do ecrã, que estão em paridade com o Atributo
 * das Peças — deixou de haver "ocasiões" inventadas ("Trabalho", "Jantar") que
 * não correspondiam a nada no modelo de dados.
 */
export async function generateOutfit(
  formalities: Formality[],
): Promise<GenerateResult> {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Precisas de sessão." };

  const wardrobe = await listWardrobeFull(userId);
  if (wardrobe.length === 0) {
    return {
      ok: false,
      error: "O teu armário está vazio — adiciona peças primeiro.",
    };
  }

  const [[profile], pastFeedback] = await Promise.all([
    db
      .select({
        district: profiles.district,
        gender: profiles.gender,
        preferredStyles: profiles.preferredStyles,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId)),
    getFeedbackGarments(userId),
  ]);

  const weather = profile?.district
    ? await getWeatherForDistrict(profile.district)
    : null;
  const season = currentSeason();
  const formalityLabels = formalities.map((f) => FORMALITY_LABELS[f]);

  let suggestion;
  try {
    suggestion = await suggestOutfit({
      garments: wardrobe.map((g) => ({
        id: g.id,
        category: g.category,
        subcategory: g.subcategory,
        primaryColor: g.primaryColor,
        colors: g.colors,
        pattern: g.pattern,
        formality: g.formality,
        seasons: g.seasons,
        material: g.material,
      })),
      formalities: formalityLabels,
      weather: weather
        ? { temperatureC: weather.temperatureC, condition: weather.condition }
        : undefined,
      season,
      profile: {
        gender: profile?.gender ?? null,
        preferredStyles: profile?.preferredStyles ?? null,
      },
      // O 👍👎 de sugestões anteriores, resolvido a Peças: é isto que faz a
      // IA "aprender contigo" (PRD, pilar 4) — prioriza umas, evita outras.
      feedback: pastFeedback,
    });
  } catch (e) {
    console.error("[today] suggestOutfit falhou", e);
    return { ok: false, error: "A IA não respondeu. Tenta outra vez." };
  }

  // A IA devolve IDs; só valem os que são mesmo Peças deste Armário. Um modelo
  // pode inventar IDs ou repetir o mesmo — filtra-se e desduplica-se.
  const byId = new Map(wardrobe.map((g) => [g.id, g]));
  const seen = new Set<string>();
  const items: OutfitItem[] = [];
  for (const it of suggestion.items) {
    const g = byId.get(it.garmentId);
    if (!g || seen.has(g.id)) continue;
    seen.add(g.id);
    items.push({
      id: g.id,
      imageUrl: g.imageUrl,
      name: g.subcategory?.trim() || CATEGORY_LABELS[g.category],
      role: it.role,
    });
  }

  if (items.length === 0) {
    return {
      ok: false,
      error:
        "A IA não conseguiu montar um outfit com as peças que tens. Adiciona mais peças ao armário.",
    };
  }

  // Grava a sugestão (ARCHITECTURE §7): é o que permite o feedback e o
  // histórico. `status` fica "suggested" até o utilizador guardar.
  const [row] = await db
    .insert(outfits)
    .values({
      userId,
      occasion: formalityLabels.join(", ") || null,
      context: {
        weather: weather
          ? { temperatureC: weather.temperatureC, condition: weather.condition }
          : undefined,
        season,
        location: profile?.district ?? undefined,
      },
      explanation: suggestion.explanation,
      status: "suggested",
    })
    .returning({ id: outfits.id });

  await db.insert(outfitGarments).values(
    items.map((it) => ({
      outfitId: row.id,
      garmentId: it.id,
      role: it.role,
    })),
  );

  return {
    ok: true,
    outfitId: row.id,
    items,
    explanation: suggestion.explanation,
  };
}

/**
 * Regista o 👍👎 do utilizador sobre uma sugestão.
 *
 * Uma opinião por (utilizador, outfit): mudar de ideias **substitui** a
 * anterior em vez de empilhar linhas — o histórico de hesitações não alimenta
 * nada, e é a opinião final que o `getFeedbackGarments` deve ler. O feedback
 * direto a Peças (`feedback.garment_id`) continua reservado a outro fim.
 */
export async function giveFeedback(
  outfitId: string,
  value: "like" | "dislike",
) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return;

  // O outfit tem de ser deste utilizador — sem isto, um uuid adivinhado
  // permitia envenenar o feedback (e as sugestões futuras) de outra pessoa.
  const [own] = await db
    .select({ id: outfits.id })
    .from(outfits)
    .where(and(eq(outfits.userId, userId), eq(outfits.id, outfitId)));
  if (!own) return;

  const updated = await db
    .update(feedback)
    .set({ value })
    .where(
      and(
        eq(feedback.userId, userId),
        eq(feedback.outfitId, outfitId),
        isNull(feedback.garmentId),
      ),
    )
    .returning({ id: feedback.id });

  if (updated.length === 0) {
    await db.insert(feedback).values({ userId, outfitId, value });
  }
}

/** Marca uma sugestão como guardada — o ❤️ do ecrã deixa de ser decorativo. */
export async function saveOutfit(outfitId: string) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) return;

  await db
    .update(outfits)
    .set({ status: "saved" })
    .where(and(eq(outfits.userId, userId), eq(outfits.id, outfitId)));

  // A contagem de Outfits do Perfil conta os guardados.
  revalidatePath("/profile");
}

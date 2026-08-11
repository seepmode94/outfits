import { analyzeInspiration } from "@/lib/ai";
import { CATEGORY_LABELS } from "@/lib/attributes";
import { auth } from "@/lib/auth";
import { listWardrobeFull } from "@/lib/db/wardrobe";
import type { InspirationResult } from "@/lib/inspiration";

/**
 * Recebe uma **Inspiração** (o print de um look) e devolve a **Paridade** com
 * o Armário: que peças do look o utilizador já tem, e quais faltam.
 *
 * A imagem NÃO é persistida, de propósito: é quase sempre a fotografia de
 * outra pessoa, o glossário define a Inspiração como "analisada e descartada",
 * e não existe (ainda) tabela `inspirations` — é o gancho v2 do PRD.
 */

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const t0 = Date.now();

  const session = await auth().catch(() => null);
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Precisas de sessão." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return Response.json(
      { error: `Esperava uma imagem, recebi "${contentType}".` },
      { status: 415 },
    );
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.length === 0) {
    return Response.json({ error: "Corpo vazio." }, { status: 400 });
  }
  if (body.length > MAX_BYTES) {
    return Response.json(
      { error: "Imagem demasiado grande. Reduz antes de enviar." },
      { status: 413 },
    );
  }

  const wardrobe = await listWardrobeFull(userId);

  try {
    const analysis = await analyzeInspiration(
      body,
      wardrobe.map((g) => ({
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
      contentType,
    );

    if (analysis.pieces.length === 0) {
      return Response.json(
        { error: "Não reconheci peças de roupa nesta imagem. Tenta um print onde o look se veja bem." },
        { status: 422 },
      );
    }

    // Os IDs vêm de um modelo: só valem os que são mesmo Peças deste Armário.
    const byId = new Map(wardrobe.map((g) => [g.id, g]));
    const pieces = analysis.pieces.map((p) => {
      const g = p.matchGarmentId ? byId.get(p.matchGarmentId) : undefined;
      return {
        description: p.description,
        category: p.category,
        primaryColor: p.primaryColor,
        matched: g
          ? {
              id: g.id,
              imageUrl: g.imageUrl,
              name: g.subcategory?.trim() || CATEGORY_LABELS[g.category],
            }
          : null,
        reason: p.matchReason,
      };
    });

    // A Paridade calcula-se aqui, não no modelo: aritmética de LLM é decorativa.
    const matched = pieces.filter((p) => p.matched).length;

    const result: InspirationResult = {
      pieces,
      parity: matched / pieces.length,
      lookSummary: analysis.lookSummary,
      ms: Date.now() - t0,
    };

    return Response.json(result, {
      status: 200,
      headers: { "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("[inspiration] falhou", e);
    return Response.json(
      { error: "Não consegui analisar o look. Tenta outra vez." },
      { status: 500 },
    );
  }
}

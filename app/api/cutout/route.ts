import { analyzeGarment } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { cutout } from "@/lib/images/cutout";
import { storeCaptura, storeRecorte } from "@/lib/images/store";
import type { CaptureResult } from "@/lib/capture";

/**
 * Recebe a **Foto original** e devolve o **Recorte** mais os **Atributos**
 * propostos pela IA. Não cria Peça nenhuma: o `CONTEXT.md` exige confirmação
 * humana, feita depois por server action.
 *
 * É um Route Handler e não uma server action porque as server actions limitam o
 * corpo a 1 MB por omissão e uma foto de telemóvel são 2–5 MB (ADR-0002).
 */

/** Tecto do corpo. O cliente já reduz a foto; isto é o travão de segurança. */
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  const t0 = Date.now();

  // Sem sessão não se corre inferência: é CPU nossa a pedido de quem quer.
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
      { error: "Fotografia demasiado grande. Reduz antes de enviar." },
      { status: 413 },
    );
  }

  try {
    // A Captura persiste ANTES da espera: se o recorte ou a análise falharem,
    // a Foto original já está salva e não se pede outra fotografia (ADR-0002).
    const originalUrl = await storeCaptura(userId, body, contentType);

    // Em paralelo, ambos sobre a Foto original. A análise não espera pelo
    // Recorte de propósito (ADR-0002, decisão c): a espera passa a ser o maior
    // dos dois em vez da soma, e um recorte falhado não corrompe os Atributos.
    const tWork = Date.now();
    const [cut, analysis] = await Promise.allSettled([
      cutout(body),
      analyzeGarment(body, contentType),
    ]);
    const totalWork = Date.now() - tWork;

    if (cut.status === "rejected") {
      console.error("[cutout] recorte falhou", cut.reason);
      return Response.json(
        { error: "O recorte falhou no servidor. Tenta outra fotografia." },
        { status: 500 },
      );
    }

    // Um recorte que deixa quase nada transparente não recortou nada.
    if (cut.value.transparentRatio < 0.02) {
      return Response.json(
        {
          error:
            "Não distingui a peça do fundo. Tenta com a peça sobre uma superfície lisa e contrastante.",
        },
        { status: 422 },
      );
    }

    // A análise pode falhar sem levar o resto atrás: o utilizador preenche os
    // Atributos à mão em vez de perder a fotografia.
    if (analysis.status === "rejected") {
      console.error("[cutout] análise falhou", analysis.reason);
    }

    const recorteUrl = await storeRecorte(userId, cut.value.png);

    const result: CaptureResult = {
      recorteUrl,
      originalUrl,
      attributes:
        analysis.status === "fulfilled"
          ? analysis.value
          : {
              // Sem IA, o form abre vazio e o utilizador escolhe. `category` é a
              // única coluna obrigatória em `garments`, daí o palpite neutro.
              category: "top",
              subcategory: "",
              primaryColor: "",
              colors: [],
              pattern: "",
              formality: "casual",
              seasons: [],
              material: "",
            },
      ms: {
        cutout: cut.value.ms,
        analyze: totalWork,
        total: Date.now() - t0,
      },
    };

    return Response.json(result, {
      status: 200,
      headers: { "cache-control": "no-store" },
    });
  } catch (e) {
    console.error("[cutout] falhou", e);
    return Response.json(
      { error: "Não consegui processar a fotografia." },
      { status: 500 },
    );
  }
}

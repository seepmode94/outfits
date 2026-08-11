import { auth } from "@/lib/auth";
import { cutout } from "@/lib/images/cutout";

/**
 * Recebe a **Foto original** e devolve o **Recorte** (PNG com fundo transparente).
 *
 * É um Route Handler e não uma server action porque as server actions limitam o
 * corpo a 1 MB por omissão e uma foto de telemóvel são 2–5 MB (ADR-0002).
 *
 * Nota: por agora só devolve o Recorte, não o persiste — falta o Blob store.
 * A Captura e a escrita em `garments` entram quando ele existir.
 */

/** Tecto do corpo. O cliente já reduz a foto; isto é o travão de segurança. */
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  // Sem sessão não se corre inferência: é CPU nossa a pedido de quem quer.
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return Response.json({ error: "Precisas de sessão." }, { status: 401 });
  }

  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    return Response.json(
      { error: `Esperava uma imagem, recebi "${type}".` },
      { status: 415 },
    );
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) {
    return Response.json(
      { error: "Fotografia demasiado grande. Reduz antes de enviar." },
      { status: 413 },
    );
  }

  const body = Buffer.from(await request.arrayBuffer());
  if (body.length === 0) {
    return Response.json({ error: "Corpo vazio." }, { status: 400 });
  }
  if (body.length > MAX_BYTES) {
    return Response.json(
      { error: "Fotografia demasiado grande." },
      { status: 413 },
    );
  }

  try {
    const result = await cutout(body);

    // Um recorte que deixa quase nada transparente não recortou nada — vale
    // mais dizê-lo do que devolver a foto original com um alpha decorativo.
    if (result.transparentRatio < 0.02) {
      return Response.json(
        {
          error:
            "Não distingui a peça do fundo. Tenta com a peça sobre uma superfície lisa e contrastante.",
        },
        { status: 422 },
      );
    }

    return new Response(new Uint8Array(result.png), {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
        "x-cutout-ms": String(result.ms),
        "x-cutout-size": `${result.width}x${result.height}`,
        "x-cutout-transparent": result.transparentRatio.toFixed(3),
      },
    });
  } catch (e) {
    console.error("[cutout] falhou", e);
    return Response.json(
      { error: "O recorte falhou no servidor." },
      { status: 500 },
    );
  }
}

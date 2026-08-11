import { generateText, Output } from "ai";
import { visionModel } from "./provider";
import { garmentAttributesSchema, type GarmentAttributes } from "./schemas";

export type ImageInput = string | Uint8Array | ArrayBuffer | URL;

// A análise corre sobre a Foto original, que TEM fundo (ADR-0002) — antes
// dizia "recortada, sem fundo", o que passou a ser falso quando a análise
// deixou de esperar pelo Recorte para poder correr em paralelo com ele.
const PROMPT = `És um estilista especialista a catalogar um armário.
A imagem contém EXATAMENTE UMA peça de roupa, fotografada pelo utilizador.
Descreve APENAS a peça de roupa — ignora completamente o fundo, a superfície
onde está apoiada, sombras e qualquer outro objeto.
Analisa-a e devolve os seus atributos.

Regras:
- Responde em português de Portugal.
- Sê preciso na categoria e na cor principal.
- Em "colors" inclui todas as cores visíveis da peça (a principal primeiro), e nunca cores do fundo.
- Em "formality" escolhe TODOS os níveis em que a peça funciona, não só um: uma camisa branca serve smart_casual e formal; uma t-shirt lisa serve casual e sport.
- Se não tiveres a certeza do material, dá a tua melhor estimativa.
- Escolhe as estações em que a peça faz sentido (uma t-shirt leve → verão/primavera; um casaco grosso → outono/inverno).`;

/**
 * Reconhece os atributos de uma peça de roupa a partir da sua imagem (recortada).
 * `image` pode ser base64, data URL, bytes, ou URL.
 */
export async function analyzeGarment(
  image: ImageInput,
  mediaType = "image/png",
): Promise<GarmentAttributes> {
  const { output } = await generateText({
    model: visionModel,
    output: Output.object({ schema: garmentAttributesSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT },
          { type: "file", mediaType, data: image },
        ],
      },
    ],
  });

  return output;
}

import { generateText, Output } from "ai";
import { visionModel } from "./provider";
import { garmentAttributesSchema, type GarmentAttributes } from "./schemas";

export type ImageInput = string | Uint8Array | ArrayBuffer | URL;

const PROMPT = `És um estilista especialista a catalogar um guarda-roupa.
A imagem contém EXATAMENTE UMA peça de roupa (recortada, sem fundo).
Analisa-a e devolve os seus atributos.

Regras:
- Responde em português de Portugal.
- Sê preciso na categoria e na cor principal.
- Em "colors" inclui todas as cores visíveis (a principal primeiro).
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

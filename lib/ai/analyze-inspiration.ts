import { generateText, Output } from "ai";
import { visionModel } from "./provider";
import {
  inspirationAnalysisSchema,
  type InspirationAnalysis,
} from "./schemas";
import type { ImageInput } from "./analyze-garment";
import type { SuggestionGarment } from "./suggest-outfit";

/**
 * Analisa uma **Inspiração** — o print de um look que o utilizador quer
 * alcançar — e compara-a com o Armário: para cada peça vista na imagem, ou há
 * uma Peça que faz o seu papel, ou falta.
 *
 * A **Paridade** (percentagem) calcula-se em código a partir dos matches, não
 * aqui: pedir aritmética a um modelo é pedir números decorativos.
 *
 * Prevista desde o scaffold de julho (`ARCHITECTURE.md` §6 tinha
 * `// v2: analyzeInspiration(image, wardrobe)`).
 */

const PROMPT = `És um estilista pessoal. A imagem é um look de inspiração — pode ser uma pessoa vestida, um print de uma rede social ou de uma loja.

Identifica TODAS as peças de roupa visíveis no look (uma entrada por peça).
Ignora a pessoa, o cenário e adereços que não sejam roupa ou calçado.

Depois, para cada peça vista, decide se alguma peça do armário do utilizador
(lista JSON abaixo, com IDs) pode fazer o papel dela no look:
- serve se a categoria bate e a cor e formalidade são próximas o suficiente
  para o efeito do look ser o mesmo;
- não serve se a cor ou o carácter forem claramente outros (um blazer preto
  não faz de casaco de lã bege) — nesse caso "matchGarmentId" é null.
- usa APENAS IDs da lista; nunca inventes.

Responde em português de Portugal, com descrições curtas.`;

export async function analyzeInspiration(
  image: ImageInput,
  wardrobe: SuggestionGarment[],
  mediaType = "image/jpeg",
): Promise<InspirationAnalysis> {
  const { output } = await generateText({
    model: visionModel,
    output: Output.object({ schema: inspirationAnalysisSchema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT },
          {
            type: "text",
            text: `Armário do utilizador (JSON):\n${JSON.stringify(wardrobe)}`,
          },
          { type: "file", mediaType, data: image },
        ],
      },
    ],
  });
  return output;
}

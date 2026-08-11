import { generateText, Output } from "ai";
import { suggestModel } from "./provider";
import { outfitSuggestionSchema, type OutfitSuggestion } from "./schemas";

export interface SuggestionGarment {
  id: string;
  category: string;
  subcategory?: string | null;
  primaryColor?: string | null;
  colors?: string[] | null;
  pattern?: string | null;
  formality?: string[] | null;
  seasons?: string[] | null;
  material?: string | null;
}

export interface SuggestionContext {
  garments: SuggestionGarment[];
  /**
   * Níveis de formalidade pretendidos (etiquetas legíveis, ex: "Casual").
   * Substituiu a "ocasião" de texto livre a 2026-08-11: os chips do ecrã
   * passaram a estar em paridade com o Atributo de formalidade das Peças.
   */
  formalities?: string[];
  occasion?: string;
  weather?: { temperatureC?: number; condition?: string };
  season?: string;
  profile?: { gender?: string | null; preferredStyles?: string[] | null };
  feedback?: { likedGarmentIds?: string[]; dislikedGarmentIds?: string[] };
}

function buildPrompt(ctx: SuggestionContext): string {
  const weather = ctx.weather
    ? `${ctx.weather.temperatureC ?? "?"}°C, ${ctx.weather.condition ?? "—"}`
    : "desconhecido";
  const styles = ctx.profile?.preferredStyles?.join(", ") || "não definido";
  const liked = ctx.feedback?.likedGarmentIds?.join(", ") || "nenhuma";
  const disliked = ctx.feedback?.dislikedGarmentIds?.join(", ") || "nenhuma";

  return `És o estilista pessoal do utilizador. Escolhe UM outfit completo e coerente
a partir APENAS das peças disponíveis abaixo (usa os respetivos IDs).

Contexto:
- Formalidade pretendida: ${ctx.formalities?.length ? ctx.formalities.join(", ") : "qualquer"}${ctx.occasion ? `\n- Ocasião: ${ctx.occasion}` : ""}
- Tempo: ${weather}
- Estação: ${ctx.season ?? "—"}
- Género: ${ctx.profile?.gender ?? "—"}
- Estilos preferidos: ${styles}
- Peças que o utilizador GOSTOU antes (prioriza): ${liked}
- Peças que NÃO gostou (evita): ${disliked}

Regras:
- Um outfit completo = (top + bottom) OU (dress), mais footwear; adiciona outerwear se o tempo for frio e accessory se fizer sentido.
- Prefere peças cuja formalidade intersete a pretendida; combina cores e níveis coerentes entre si e com o tempo.
- Se faltar uma categoria essencial (ex: calçado), monta o melhor outfit possível com o que existe e di-lo na explicação.
- Usa SÓ peças da lista, pelos seus IDs exatos.
- A explicação deve ser curta (1-2 frases), calorosa e em português de Portugal.

Peças disponíveis (JSON):
${JSON.stringify(ctx.garments)}`;
}

/**
 * Sugere um outfit a partir do armário do utilizador, considerando
 * ocasião, tempo, estação, perfil e histórico de feedback.
 */
export async function suggestOutfit(
  ctx: SuggestionContext,
): Promise<OutfitSuggestion> {
  const { output } = await generateText({
    model: suggestModel,
    output: Output.object({ schema: outfitSuggestionSchema }),
    prompt: buildPrompt(ctx),
  });

  return output;
}

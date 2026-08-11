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
  formality?: string | null;
  seasons?: string[] | null;
  material?: string | null;
}

export interface SuggestionContext {
  garments: SuggestionGarment[];
  occasion: string;
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
- Ocasião: ${ctx.occasion}
- Tempo: ${weather}
- Estação: ${ctx.season ?? "—"}
- Género: ${ctx.profile?.gender ?? "—"}
- Estilos preferidos: ${styles}
- Peças que o utilizador GOSTOU antes (prioriza): ${liked}
- Peças que NÃO gostou (evita): ${disliked}

Regras:
- Um outfit completo = (top + bottom) OU (dress), mais footwear; adiciona outerwear se o tempo for frio e accessory se fizer sentido.
- Combina cores e níveis de formalidade adequados à ocasião e ao tempo.
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

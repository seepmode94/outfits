// Porta de entrada única para a IA. Nenhum ecrã fala com o Gemini diretamente —
// tudo passa por aqui. Trocar/misturar modelos = mexer só em provider.ts.

export { analyzeGarment, type ImageInput } from "./analyze-garment";
export {
  suggestOutfit,
  type SuggestionContext,
  type SuggestionGarment,
} from "./suggest-outfit";
export {
  garmentAttributesSchema,
  outfitSuggestionSchema,
  type GarmentAttributes,
  type OutfitSuggestion,
} from "./schemas";

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Atributos de uma peça (saída do reconhecimento por visão)
// ─────────────────────────────────────────────────────────────
export const garmentAttributesSchema = z.object({
  category: z
    .enum(["top", "bottom", "dress", "outerwear", "footwear", "accessory"])
    .describe("Categoria principal da peça"),
  subcategory: z
    .string()
    .describe("Tipo específico, ex: t-shirt, camisa, jeans, ténis, casaco"),
  primaryColor: z
    .string()
    .describe("Cor principal, em português, ex: azul-marinho, bege"),
  colors: z.array(z.string()).describe("Todas as cores visíveis na peça"),
  pattern: z
    .string()
    .describe("Padrão, ex: liso, riscas, xadrez, floral, estampado"),
  formality: z
    .enum(["casual", "smart_casual", "formal", "sport"])
    .describe("Nível de formalidade"),
  seasons: z
    .array(z.enum(["spring", "summer", "autumn", "winter"]))
    .describe("Estações do ano em que a peça é adequada"),
  material: z
    .string()
    .describe("Material provável, ex: algodão, ganga, lã, poliéster"),
});

export type GarmentAttributes = z.infer<typeof garmentAttributesSchema>;

// ─────────────────────────────────────────────────────────────
// Sugestão de outfit (saída do raciocínio sobre o guarda-roupa)
// ─────────────────────────────────────────────────────────────
export const outfitSuggestionSchema = z.object({
  items: z
    .array(
      z.object({
        garmentId: z
          .string()
          .describe("ID de uma peça escolhida (da lista fornecida)"),
        role: z
          .string()
          .describe(
            "Papel da peça no outfit: top, bottom, dress, footwear, outerwear, accessory",
          ),
      }),
    )
    .describe("Peças que compõem o outfit"),
  explanation: z
    .string()
    .describe("Explicação curta, calorosa e em português do porquê do outfit"),
});

export type OutfitSuggestion = z.infer<typeof outfitSuggestionSchema>;

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
    .array(z.enum(["casual", "smart_casual", "formal", "sport"]))
    .describe(
      "Níveis de formalidade em que a peça funciona — pode ser mais do que um (uma camisa branca serve smart_casual e formal)",
    ),
  seasons: z
    .array(z.enum(["spring", "summer", "autumn", "winter"]))
    .describe("Estações do ano em que a peça é adequada"),
  material: z
    .string()
    .describe("Material provável, ex: algodão, ganga, lã, poliéster"),
});

export type GarmentAttributes = z.infer<typeof garmentAttributesSchema>;

// ─────────────────────────────────────────────────────────────
// Sugestão de outfit (saída do raciocínio sobre o armário)
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

// ─────────────────────────────────────────────────────────────
// Análise de Inspiração (print de um look → paridade com o Armário)
// ─────────────────────────────────────────────────────────────
export const inspirationPieceSchema = z.object({
  description: z
    .string()
    .describe(
      "A peça vista na imagem, curta e em português, ex: casaco de lã bege oversized",
    ),
  category: z
    .enum(["top", "bottom", "dress", "outerwear", "footwear", "accessory"])
    .describe("Categoria da peça vista"),
  primaryColor: z.string().describe("Cor principal da peça vista, em português"),
  matchGarmentId: z
    .string()
    .nullable()
    .describe(
      "ID da peça do armário (da lista fornecida) que pode fazer o papel desta, ou null se nenhuma serve",
    ),
  matchReason: z
    .string()
    .describe(
      "Uma frase curta: porque é que a peça do armário serve, ou o que falta",
    ),
});

export const inspirationAnalysisSchema = z.object({
  pieces: z
    .array(inspirationPieceSchema)
    .describe("Uma entrada por peça de roupa visível no look"),
  lookSummary: z
    .string()
    .describe("Uma frase, calorosa e em português, sobre o estilo do look"),
});

export type InspirationPiece = z.infer<typeof inspirationPieceSchema>;
export type InspirationAnalysis = z.infer<typeof inspirationAnalysisSchema>;

// Dados de exemplo para mostrar a app a funcionar antes de ligar o DB + IA.

export interface MockGarment {
  id: string;
  label: string;
  emoji: string;
  color: string; // oklch para o fundo do cartão
  role: string;
}

export const MOCK_WARDROBE: MockGarment[] = [
  { id: "m1", label: "Casaco de ganga", emoji: "🧥", color: "oklch(0.9 0.06 250)", role: "outerwear" },
  { id: "m2", label: "T-shirt branca", emoji: "👕", color: "oklch(0.96 0.01 300)", role: "top" },
  { id: "m3", label: "Chinos bege", emoji: "👖", color: "oklch(0.91 0.05 80)", role: "bottom" },
  { id: "m4", label: "Ténis brancos", emoji: "👟", color: "oklch(0.95 0.02 300)", role: "footwear" },
  { id: "m5", label: "Óculos de sol", emoji: "🕶️", color: "oklch(0.92 0.04 320)", role: "accessory" },
  { id: "m6", label: "Camisa azul", emoji: "👔", color: "oklch(0.89 0.07 250)", role: "top" },
  { id: "m7", label: "Jeans escuros", emoji: "👖", color: "oklch(0.55 0.07 260)", role: "bottom" },
  { id: "m8", label: "Botas castanhas", emoji: "🥾", color: "oklch(0.85 0.07 60)", role: "footwear" },
];

// Outfit de exemplo "gerado" para o ecrã Veste-me hoje.
export const MOCK_OUTFIT: MockGarment[] = [
  MOCK_WARDROBE[0],
  MOCK_WARDROBE[1],
  MOCK_WARDROBE[2],
  MOCK_WARDROBE[3],
];

export const MOCK_EXPLANATION =
  "Escolhi um look casual e fresco: a t-shirt branca dá leveza, os chinos bege equilibram, e o casaco de ganga acrescenta personalidade. Ideal para um dia ameno de passeio.";

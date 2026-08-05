// Dados de exemplo para mostrar a app a funcionar antes de ligar o DB + IA.

export type GarmentRole =
  | "outerwear"
  | "top"
  | "bottom"
  | "footwear"
  | "dress"
  | "accessory";

export const ROLE_LABELS: Record<GarmentRole, string> = {
  outerwear: "Casacos",
  top: "Tops",
  bottom: "Calças",
  footwear: "Calçado",
  dress: "Vestidos",
  accessory: "Acessórios",
};

export interface MockGarment {
  id: string;
  label: string;
  sub: string; // ex: "Lã · outono" (linha secundária do cartão)
  emoji: string;
  bg: string; // pastel de fundo do cartão
  role: GarmentRole;
  fav: boolean;
  color: string;
  material: string;
  style: string;
  season: string;
  brand: string;
  timesWorn: number;
  pairsWith: string[]; // ids de peças que combinam
}

export const MOCK_WARDROBE: MockGarment[] = [
  {
    id: "g1",
    label: "Casaco bege",
    sub: "Lã · outono",
    emoji: "🧥",
    bg: "#FFE1D6",
    role: "outerwear",
    fav: false,
    color: "Bege",
    material: "Lã",
    style: "Casual",
    season: "Outono",
    brand: "Zara",
    timesWorn: 12,
    pairsWith: ["g2", "g3", "g4", "g6"],
  },
  {
    id: "g2",
    label: "T-shirt branca",
    sub: "Algodão",
    emoji: "👕",
    bg: "#E9DDFF",
    role: "top",
    fav: true,
    color: "Branco",
    material: "Algodão",
    style: "Casual",
    season: "Todo o ano",
    brand: "H&M",
    timesWorn: 23,
    pairsWith: ["g1", "g3", "g4"],
  },
  {
    id: "g3",
    label: "Jeans azul",
    sub: "Ganga",
    emoji: "👖",
    bg: "#DDF7F2",
    role: "bottom",
    fav: false,
    color: "Azul",
    material: "Ganga",
    style: "Casual",
    season: "Todo o ano",
    brand: "Levi's",
    timesWorn: 31,
    pairsWith: ["g1", "g2", "g4"],
  },
  {
    id: "g4",
    label: "Ténis brancos",
    sub: "Casual",
    emoji: "👟",
    bg: "#EFFFC7",
    role: "footwear",
    fav: true,
    color: "Branco",
    material: "Pele sintética",
    style: "Desportivo",
    season: "Todo o ano",
    brand: "Nike",
    timesWorn: 40,
    pairsWith: ["g2", "g3"],
  },
  {
    id: "g5",
    label: "Vestido preto",
    sub: "Noite",
    emoji: "👗",
    bg: "#FFDCEC",
    role: "dress",
    fav: false,
    color: "Preto",
    material: "Viscose",
    style: "Formal",
    season: "Todo o ano",
    brand: "Mango",
    timesWorn: 3,
    pairsWith: ["g1"],
  },
  {
    id: "g6",
    label: "Cachecol",
    sub: "Inverno",
    emoji: "🧣",
    bg: "#D8ECFF",
    role: "accessory",
    fav: false,
    color: "Azul claro",
    material: "Lã",
    style: "Casual",
    season: "Inverno",
    brand: "Zara",
    timesWorn: 8,
    pairsWith: ["g1", "g2"],
  },
];

export function getGarment(id: string): MockGarment | undefined {
  return MOCK_WARDROBE.find((g) => g.id === id);
}

// Outfit de exemplo "gerado" para o ecrã Outfit de hoje.
export const MOCK_OUTFIT: MockGarment[] = [
  MOCK_WARDROBE[0], // casaco (peça grande do quadro)
  MOCK_WARDROBE[1],
  MOCK_WARDROBE[2],
  MOCK_WARDROBE[3],
  MOCK_WARDROBE[5],
];

export const MOCK_EXPLANATION =
  "Está fresco de manhã, por isso juntei o casaco de lã. As cores neutras combinam entre si e servem para o trabalho.";

export const MOCK_WEATHER = {
  city: "Lisboa",
  temp: 18,
  max: 24,
  note: "⛅ fresco de manhã",
  rain: "sem chuva",
};

// Sugestões de peças em falta para o ecrã "O que te falta".
export interface MockGap {
  id: string;
  label: string;
  sub: string;
  emoji: string;
  bg: string;
}

export const MOCK_GAPS: MockGap[] = [
  {
    id: "gap1",
    label: "Blazer neutro",
    sub: "Combina com 60% do teu armário",
    emoji: "🧥",
    bg: "#FFDCEC",
  },
  {
    id: "gap2",
    label: "Sapatos formais",
    sub: "Faltam-te para ocasiões de jantar",
    emoji: "👞",
    bg: "#D8ECFF",
  },
  {
    id: "gap3",
    label: "Calças chino",
    sub: "Ponte entre casual e trabalho",
    emoji: "👖",
    bg: "#EFFFC7",
  },
];

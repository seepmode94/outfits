import type { Profile } from "@/lib/db/schema";

export type Gender = NonNullable<Profile["gender"]>;

/**
 * O que o utilizador lê ↔ o que a base de dados guarda.
 *
 * O onboarding usava as etiquetas em português como valor, o que nunca poderia
 * ser gravado: a coluna é um enum `female | male | non_binary |
 * prefer_not_to_say`. Este mapa é a tradução, num só sítio.
 */
export const GENDER_LABELS: Record<Gender, string> = {
  female: "Mulher",
  male: "Homem",
  non_binary: "Não-binário",
  prefer_not_to_say: "Prefiro não dizer",
};

export const GENDER_ORDER: Gender[] = [
  "female",
  "male",
  "non_binary",
  "prefer_not_to_say",
];

export function genderFromLabel(label: string): Gender | null {
  const found = GENDER_ORDER.find((g) => GENDER_LABELS[g] === label);
  return found ?? null;
}

/**
 * O que o servidor devolve depois de analisar uma **Inspiração**.
 * Módulo sem imports de servidor: partilhado entre a rota e o ecrã.
 */

export type InspirationMatch = {
  /** A peça vista na Inspiração. */
  description: string;
  category: string;
  primaryColor: string;
  /** A Peça do Armário que faz o papel dela — ou null se falta. */
  matched: { id: string; imageUrl: string; name: string } | null;
  reason: string;
};

export type InspirationResult = {
  pieces: InspirationMatch[];
  /** Paridade: fração 0–1 das peças do look que o Armário cobre. */
  parity: number;
  lookSummary: string;
  ms: number;
};

export type InspirationError = { error: string };

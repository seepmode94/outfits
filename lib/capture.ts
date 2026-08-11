import type { GarmentAttributes } from "@/lib/ai/schemas";

/**
 * O que o servidor devolve depois de processar uma **Captura**.
 *
 * Vive num módulo sem imports de servidor de propósito: é partilhado entre o
 * Route Handler e os Client Components do fluxo de adicionar peça.
 */
export type CaptureResult = {
  /** URL público do **Recorte** — é o que a interface mostra. */
  recorteUrl: string;
  /**
   * URL privado da **Foto original**. Nunca é exibida; serve para reprocessar.
   * `null` quando não há store privado configurado — ver `lib/images/store.ts`.
   */
  originalUrl: string | null;
  /** **Atributos** propostos pela IA. O utilizador confirma-os antes de a Peça existir. */
  attributes: GarmentAttributes;
  /** Quanto tempo o servidor levou, para afinarmos a espera com dados reais. */
  ms: { cutout: number; analyze: number; total: number };
};

export type CaptureError = { error: string };

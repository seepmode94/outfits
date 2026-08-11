import { google } from "@ai-sdk/google";

// A chave é lida de GOOGLE_GENERATIVE_AI_API_KEY automaticamente pelo provider.
// Modelos configuráveis por env — sobe para um mais potente quando quiseres.
//
// O default é o 3.6-flash por medição, não por gosto (ADR-0002): contra o
// 2.5-flash é 40% mais rápido, cumpre o pedido de responder em português (o
// 2.5 devolvia "navy"/"cotton") e acerta a caixa da peça com erro de 1 em 1000.
const VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? "gemini-3.6-flash";
const SUGGEST_MODEL = process.env.GEMINI_SUGGEST_MODEL ?? "gemini-3.6-flash";

// Modelo para "olhar" para peças de roupa (multimodal).
export const visionModel = google(VISION_MODEL);

// Modelo para raciocinar e sugerir outfits.
export const suggestModel = google(SUGGEST_MODEL);

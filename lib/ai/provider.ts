import { google } from "@ai-sdk/google";

// A chave é lida de GOOGLE_GENERATIVE_AI_API_KEY automaticamente pelo provider.
// Modelos configuráveis por env — sobe para um mais potente quando quiseres.
const VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? "gemini-2.5-flash";
const SUGGEST_MODEL = process.env.GEMINI_SUGGEST_MODEL ?? "gemini-2.5-flash";

// Modelo para "olhar" para peças de roupa (multimodal).
export const visionModel = google(VISION_MODEL);

// Modelo para raciocinar e sugerir outfits.
export const suggestModel = google(SUGGEST_MODEL);

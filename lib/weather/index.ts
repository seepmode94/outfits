import { findDistrict } from "@/lib/districts";

/**
 * Cliente Open-Meteo (gratuito, sem chave).
 *
 * Desde 2026-08-11 já não geocodifica: o distrito vem de uma lista fechada com
 * coordenadas (`lib/districts.ts`), por isso é uma chamada em vez de duas e
 * "porto"/"Oporto" deixam de ser um problema — nunca chegam aqui.
 */

export interface Weather {
  temperatureC: number;
  /** Máxima prevista para hoje. */
  maxC: number | null;
  /** Descrição em português, ex: "céu limpo". */
  condition: string;
  /** Ex: "sem chuva" ou "chuva provável". */
  rain: string;
}

// Mapeia códigos WMO (weather_code) para descrição em português.
function weatherCodeToText(code: number): string {
  if (code === 0) return "céu limpo";
  if (code <= 2) return "pouco nublado";
  if (code === 3) return "nublado";
  if (code <= 48) return "nevoeiro";
  if (code <= 57) return "chuvisco";
  if (code <= 67) return "chuva";
  if (code <= 77) return "neve";
  if (code <= 82) return "aguaceiros";
  if (code <= 86) return "aguaceiros de neve";
  if (code <= 99) return "trovoada";
  return "—";
}

/**
 * Tempo atual + máxima e probabilidade de chuva de hoje, para um distrito da
 * lista. Devolve `null` se o distrito não existir ou o Open-Meteo falhar —
 * o ecrã degrada, não rebenta.
 */
export async function getWeatherForDistrict(
  district: string,
): Promise<Weather | null> {
  const d = findDistrict(district);
  if (!d) return null;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}` +
        `&current=temperature_2m,weather_code` +
        `&daily=temperature_2m_max,precipitation_probability_max` +
        `&forecast_days=1&timezone=auto`,
      // O tempo de um distrito não muda ao segundo: 30 min de cache partilhada
      // evita bater no Open-Meteo a cada visita ao ecrã.
      { next: { revalidate: 1800 } },
    );
    const wx = (await res.json()) as {
      current?: { temperature_2m: number; weather_code: number };
      daily?: {
        temperature_2m_max?: number[];
        precipitation_probability_max?: number[];
      };
    };
    if (!wx.current) return null;

    const rainProb = wx.daily?.precipitation_probability_max?.[0];

    return {
      temperatureC: Math.round(wx.current.temperature_2m),
      maxC:
        wx.daily?.temperature_2m_max?.[0] != null
          ? Math.round(wx.daily.temperature_2m_max[0])
          : null,
      condition: weatherCodeToText(wx.current.weather_code),
      rain:
        rainProb == null
          ? "—"
          : rainProb >= 50
            ? "chuva provável"
            : rainProb >= 20
              ? "pode chover"
              : "sem chuva",
    };
  } catch {
    return null;
  }
}

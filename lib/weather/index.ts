// Cliente Open-Meteo (gratuito, sem chave). Geocodifica o distrito → coordenadas
// → tempo atual.

export interface Weather {
  temperatureC: number;
  condition: string;
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
 * Devolve o tempo atual para um distrito (ex: "Porto", "Lisboa").
 * Retorna null se não conseguir geocodificar ou obter o tempo.
 */
export async function getWeatherForDistrict(
  district: string,
): Promise<Weather | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        district,
      )}&count=1&language=pt&format=json`,
    );
    const geo = (await geoRes.json()) as {
      results?: { latitude: number; longitude: number }[];
    };
    const loc = geo.results?.[0];
    if (!loc) return null;

    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`,
    );
    const wx = (await wxRes.json()) as {
      current?: { temperature_2m: number; weather_code: number };
    };
    if (!wx.current) return null;

    return {
      temperatureC: Math.round(wx.current.temperature_2m),
      condition: weatherCodeToText(wx.current.weather_code),
    };
  } catch {
    return null;
  }
}

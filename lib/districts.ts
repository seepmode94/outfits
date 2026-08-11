/**
 * Distritos de Portugal e as coordenadas da respetiva capital.
 *
 * O Open-Meteo pede latitude e longitude, não nomes. Guardar o distrito de uma
 * lista fechada — em vez do texto livre que o onboarding tinha — evita ter de
 * geocodificar "porto", "Oporto" ou "Prto", e torna a meteorologia determinista.
 *
 * As coordenadas são da capital de distrito, que é a precisão de que uma
 * previsão do tempo precisa.
 */

export type District = {
  name: string;
  lat: number;
  lon: number;
};

export const DISTRICTS: District[] = [
  { name: "Aveiro", lat: 40.6405, lon: -8.6538 },
  { name: "Beja", lat: 38.015, lon: -7.8632 },
  { name: "Braga", lat: 41.5454, lon: -8.4265 },
  { name: "Bragança", lat: 41.8061, lon: -6.7567 },
  { name: "Castelo Branco", lat: 39.8222, lon: -7.4915 },
  { name: "Coimbra", lat: 40.2033, lon: -8.4103 },
  { name: "Évora", lat: 38.5714, lon: -7.9135 },
  { name: "Faro", lat: 37.0194, lon: -7.9304 },
  { name: "Guarda", lat: 40.5373, lon: -7.2676 },
  { name: "Leiria", lat: 39.7436, lon: -8.8071 },
  { name: "Lisboa", lat: 38.7223, lon: -9.1393 },
  { name: "Portalegre", lat: 39.2967, lon: -7.4285 },
  { name: "Porto", lat: 41.1579, lon: -8.6291 },
  { name: "Santarém", lat: 39.2362, lon: -8.6859 },
  { name: "Setúbal", lat: 38.5244, lon: -8.8882 },
  { name: "Viana do Castelo", lat: 41.6946, lon: -8.8309 },
  { name: "Vila Real", lat: 41.3006, lon: -7.7441 },
  { name: "Viseu", lat: 40.6566, lon: -7.9125 },
  { name: "Madeira", lat: 32.6669, lon: -16.9241 },
  { name: "Açores", lat: 37.7412, lon: -25.6756 },
];

export const DISTRICT_NAMES = DISTRICTS.map((d) => d.name);

export function findDistrict(name: string | null | undefined): District | null {
  if (!name) return null;
  return DISTRICTS.find((d) => d.name === name) ?? null;
}

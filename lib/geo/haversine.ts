const EARTH_RADIUS_METERS = 6_371_000;

/** Retorna distância em metros entre dois pontos geográficos. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Arredonda coordenada para grade de ~1km (privacidade LGPD). */
export function fuzzyCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Formata distância em metros para exibição. */
export function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

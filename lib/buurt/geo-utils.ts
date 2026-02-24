/**
 * Geo Utilities — Coordinate conversions for NL
 *
 * WGS84 (EPSG:4326) ↔ Rijksdriehoeksstelsel (EPSG:28992)
 * Simplified RDNAPTRANS formulas, accurate to ~1m within NL.
 */

/**
 * Convert WGS84 lat/lng to Dutch RD (Rijksdriehoeksstelsel) coordinates.
 * Accurate to ~1 meter within the Netherlands.
 */
export function wgs84ToRD(
  lat: number,
  lng: number,
): { x: number; y: number } {
  // Reference point: Amersfoort
  const refLat = 52.15517440;
  const refLng = 5.38720621;

  const dLat = 0.36 * (lat - refLat);
  const dLng = 0.36 * (lng - refLng);

  const dLat2 = dLat * dLat;
  const dLat3 = dLat2 * dLat;
  const dLng2 = dLng * dLng;
  const dLng3 = dLng2 * dLng;

  const x =
    155000 +
    190094.945 * dLng -
    11832.228 * dLat * dLng -
    114.221 * dLat2 * dLng +
    0.0 * dLng3;

  const y =
    463000 +
    309056.544 * dLat +
    3638.893 * dLng2 +
    73.077 * dLat2 -
    157.984 * dLat * dLng2 +
    59.788 * dLat3;

  return { x: Math.round(x), y: Math.round(y) };
}

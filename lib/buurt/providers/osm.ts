/**
 * OSM Provider — Refactored from lib/buurt-intelligence.ts
 *
 * Exports the existing OSM functions + haversineDistance for reuse.
 * Adds Redis caching.
 */

import {
  fetchNearbyPlaces as fetchNearbyPlacesOriginal,
  analyzeBuurt,
} from "@/lib/buurt-intelligence";
import type { BuurtAnalysis, NearbyPlace } from "@/lib/buurt-intelligence";
import type { CompetitorInfo } from "../types";
import { getCached, setCache } from "../cache";

export type { BuurtAnalysis, NearbyPlace };

/**
 * Haversine distance between two coordinates in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Fetch OSM data with Redis caching
 */
export async function fetchOSMData(
  lat: number,
  lng: number,
  radius: number,
): Promise<{ analysis: BuurtAnalysis; places: NearbyPlace[] } | null> {
  // Check cache
  const cached = await getCached<{ analysis: BuurtAnalysis; places: NearbyPlace[] }>(
    lat,
    lng,
    "osm",
    radius,
  );
  if (cached) return cached;

  try {
    const places = await fetchNearbyPlacesOriginal(lat, lng, radius);
    const analysis = analyzeBuurt(places, radius);

    const result = { analysis, places };
    await setCache(lat, lng, "osm", radius, result);

    return result;
  } catch {
    return null;
  }
}

/**
 * Convert OSM NearbyPlace[] to CompetitorInfo[]
 */
export function osmToCompetitors(places: NearbyPlace[]): CompetitorInfo[] {
  return places
    .filter(
      (p) =>
        p.category === "horeca_concurrent" ||
        p.category === "horeca_complementair",
    )
    .map((p) => ({
      naam: p.name,
      type: p.type,
      afstand: p.distance,
      bron: "osm" as const,
    }))
    .sort((a, b) => a.afstand - b.afstand);
}

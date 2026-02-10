"use server";

import { fetchNearbyPlaces, analyzeBuurt, type BuurtAnalysis } from "@/lib/buurt-intelligence";

/**
 * Get neighborhood analysis for a property location
 * Uses OpenStreetMap Overpass API (free, no API key needed)
 */
export async function getBuurtAnalysis(
  lat: number,
  lng: number,
  radiusMeters: number = 500
): Promise<BuurtAnalysis | null> {
  try {
    if (!lat || !lng || lat === 0 || lng === 0) return null;

    const places = await fetchNearbyPlaces(lat, lng, radiusMeters);
    return analyzeBuurt(places, radiusMeters);
  } catch (error) {
    console.error("Buurt analysis error:", error);
    return null;
  }
}

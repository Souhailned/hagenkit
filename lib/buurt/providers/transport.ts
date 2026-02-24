/**
 * Transport Provider — OV Stops via OSM + optional Google Places
 *
 * Primary: Overpass API (free, no key needed)
 * Optional: Google Places (if GOOGLE_PLACES_API_KEY is set — enriches with station names)
 *
 * Scoring: trein <1km: +3, metro <800m: +2, tram <500m: +1.5, bus <400m: +0.5
 */

import type { TransportAnalysis, TransportStop } from "../types";
import { getCached, setCache } from "../cache";
import { haversineDistance } from "./osm";

const TIMEOUT = 8000;

/**
 * Fetch transport analysis for a location
 */
export async function fetchTransportAnalysis(
  lat: number,
  lng: number,
  radius: number,
): Promise<TransportAnalysis | null> {
  const cached = await getCached<TransportAnalysis>(lat, lng, "transport", radius);
  if (cached) return cached;

  try {
    // Fetch OV stops from OSM + optionally Google Places in parallel
    const [ovStops, googleStops] = await Promise.allSettled([
      fetchOVStops(lat, lng, radius),
      fetchGoogleTransit(lat, lng, radius),
    ]);

    const stops: TransportStop[] = [];

    // Add OSM stops first (always available)
    if (ovStops.status === "fulfilled" && ovStops.value) {
      stops.push(...ovStops.value);
    }

    // Merge Google stops (deduplicate by name proximity)
    if (googleStops.status === "fulfilled" && googleStops.value) {
      for (const gStop of googleStops.value) {
        const isDuplicate = stops.some(
          (s) =>
            Math.abs(s.afstand - gStop.afstand) < 200 &&
            s.naam.toLowerCase().includes(gStop.naam.toLowerCase().split(" ")[0]),
        );
        if (!isDuplicate) {
          stops.push(gStop);
        }
      }
    }

    // Sort by distance
    stops.sort((a, b) => a.afstand - b.afstand);

    // Calculate score
    const score = calculateTransportScore(stops);
    const bereikbaarheidOV = scoreToLabel(score);

    const result: TransportAnalysis = { stops, score, bereikbaarheidOV };

    await setCache(lat, lng, "transport", radius, result);
    return result;
  } catch (error) {
    console.error("[transport] Error:", error);
    return null;
  }
}

function calculateTransportScore(stops: TransportStop[]): number {
  let score = 0;

  for (const stop of stops) {
    switch (stop.type) {
      case "trein":
        if (stop.afstand <= 1000) score += 3;
        else if (stop.afstand <= 2000) score += 1.5;
        break;
      case "metro":
        if (stop.afstand <= 800) score += 2;
        else if (stop.afstand <= 1500) score += 1;
        break;
      case "tram":
        if (stop.afstand <= 500) score += 1.5;
        else if (stop.afstand <= 1000) score += 0.5;
        break;
      case "bus":
        if (stop.afstand <= 400) score += 0.5;
        break;
    }
  }

  return Math.min(10, Math.round(score * 10) / 10);
}

function scoreToLabel(score: number): TransportAnalysis["bereikbaarheidOV"] {
  if (score >= 8) return "uitstekend";
  if (score >= 6) return "goed";
  if (score >= 4) return "redelijk";
  if (score >= 2) return "matig";
  return "slecht";
}

// ---------------------------------------------------------------------------
// OV Stops via Overpass API (free, always available)
// ---------------------------------------------------------------------------
async function fetchOVStops(
  lat: number,
  lng: number,
  radius: number,
): Promise<TransportStop[]> {
  const query = `
    [out:json][timeout:8];
    (
      node["public_transport"="stop_position"](around:${radius},${lat},${lng});
      node["railway"="tram_stop"](around:${radius},${lat},${lng});
      node["railway"="station"](around:${radius * 2},${lat},${lng});
      node["station"="subway"](around:${radius * 1.5},${lat},${lng});
    );
    out body;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(TIMEOUT),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const elements = data?.elements || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return elements.map((el: any) => {
      const elLat = el.lat || lat;
      const elLng = el.lon || lng;
      const afstand = Math.round(haversineDistance(lat, lng, elLat, elLng));

      let type: TransportStop["type"] = "bus";
      if (el.tags?.railway === "station" || el.tags?.railway === "halt") {
        type = "trein";
      } else if (el.tags?.station === "subway" || el.tags?.subway === "yes") {
        type = "metro";
      } else if (el.tags?.railway === "tram_stop" || el.tags?.tram === "yes") {
        type = "tram";
      }

      const lijnen = el.tags?.route_ref
        ? el.tags.route_ref.split(";").map((l: string) => l.trim())
        : undefined;

      return {
        naam: el.tags?.name || `${type === "bus" ? "Bushalte" : type === "tram" ? "Tramhalte" : "Station"}`,
        type,
        afstand,
        lijnen,
      };
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Google Places transit search (optional — requires GOOGLE_PLACES_API_KEY)
// ---------------------------------------------------------------------------
async function fetchGoogleTransit(
  lat: number,
  lng: number,
  radius: number,
): Promise<TransportStop[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.types,places.location",
        },
        body: JSON.stringify({
          includedTypes: [
            "train_station",
            "transit_station",
            "subway_station",
            "light_rail_station",
            "bus_station",
          ],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: radius * 2, // Wider catchment for stations
            },
          },
        }),
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const places = data?.places || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return places.map((place: any) => {
      const pLat = place.location?.latitude ?? lat;
      const pLng = place.location?.longitude ?? lng;
      const afstand = Math.round(haversineDistance(lat, lng, pLat, pLng));

      const types: string[] = place.types || [];
      let type: TransportStop["type"] = "bus";
      if (types.includes("train_station")) type = "trein";
      else if (types.includes("subway_station")) type = "metro";
      else if (types.includes("light_rail_station")) type = "tram";

      return {
        naam: place.displayName?.text || "Station",
        type,
        afstand,
      };
    });
  } catch {
    return [];
  }
}

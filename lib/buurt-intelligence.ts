/**
 * Buurtintelligentie — Locatie-analyse voor horecapanden
 * 
 * Gebruikt OpenStreetMap Overpass API (gratis, geen key nodig)
 * om concurrentie, bereikbaarheid en voorzieningen te analyseren.
 */

export type NearbyPlace = {
  name: string;
  type: string;
  category: PlaceCategory;
  distance: number; // meters
  lat: number;
  lng: number;
};

export type PlaceCategory = 
  | "horeca_concurrent" 
  | "horeca_complementair"
  | "supermarkt"
  | "transport" 
  | "kantoor" 
  | "onderwijs" 
  | "winkel"
  | "cultuur";

export type BuurtAnalysis = {
  concurrenten: NearbyPlace[];
  complementair: NearbyPlace[];
  transport: NearbyPlace[];
  voorzieningen: NearbyPlace[];
  stats: BuurtStats;
  bruisIndex: number; // 1-10
  summary: string; // NL samenvatting
};

export type BuurtStats = {
  horecaCount: number;
  horecaDensity: string; // "laag" | "gemiddeld" | "hoog"
  transportScore: number; // 1-10
  voorzieningenScore: number; // 1-10
  kantorenNabij: number;
  concurrentRadius: number; // meters used
};

/**
 * Query OpenStreetMap Overpass API for nearby places
 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radiusMeters: number = 500
): Promise<NearbyPlace[]> {
  // Overpass QL query for horeca, transport, offices etc.
  const query = `
    [out:json][timeout:10];
    (
      // Horeca
      node["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream|biergarten|food_court"](around:${radiusMeters},${lat},${lng});
      // Transport
      node["public_transport"="stop_position"](around:${radiusMeters},${lat},${lng});
      node["amenity"="parking"](around:${radiusMeters},${lat},${lng});
      node["railway"="station"](around:${radiusMeters * 2},${lat},${lng});
      // Kantoren
      node["office"](around:${radiusMeters},${lat},${lng});
      way["office"](around:${radiusMeters},${lat},${lng});
      // Supermarkten & winkels
      node["shop"~"supermarket|convenience|mall"](around:${radiusMeters},${lat},${lng});
      // Onderwijs
      node["amenity"~"university|school|college"](around:${radiusMeters},${lat},${lng});
      // Cultuur
      node["amenity"~"theatre|cinema|museum"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.elements || []).map((el: any) => {
      const elLat = el.lat || el.center?.lat || lat;
      const elLng = el.lon || el.center?.lon || lng;

      return {
        name: el.tags?.name || categorizeOSM(el.tags).label,
        type: el.tags?.amenity || el.tags?.shop || el.tags?.office || el.tags?.railway || el.tags?.public_transport || "unknown",
        category: categorizeOSM(el.tags).category,
        distance: Math.round(haversineDistance(lat, lng, elLat, elLng)),
        lat: elLat,
        lng: elLng,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Analyze a neighborhood based on nearby places
 */
export function analyzeBuurt(
  places: NearbyPlace[],
  radiusMeters: number = 500
): BuurtAnalysis {
  const concurrenten = places.filter((p) => p.category === "horeca_concurrent");
  const complementair = places.filter((p) => p.category === "horeca_complementair");
  const transport = places.filter((p) => p.category === "transport");
  const kantoren = places.filter((p) => p.category === "kantoor");
  const winkels = places.filter((p) => p.category === "winkel" || p.category === "supermarkt");
  const onderwijs = places.filter((p) => p.category === "onderwijs");
  const cultuur = places.filter((p) => p.category === "cultuur");
  const voorzieningen = [...winkels, ...onderwijs, ...cultuur];

  const horecaCount = concurrenten.length + complementair.length;
  const horecaDensity = horecaCount > 15 ? "hoog" : horecaCount > 5 ? "gemiddeld" : "laag";

  const transportScore = Math.min(10, Math.round(
    (transport.filter((t) => t.distance < 300).length * 2) +
    (transport.filter((t) => t.type === "station").length * 3)
  ));

  const voorzieningenScore = Math.min(10, Math.round(
    winkels.length * 1.5 + onderwijs.length * 2 + cultuur.length * 1.5
  ));

  // Bruisindex: combinatie van horeca density, transport, voorzieningen
  const bruisIndex = Math.min(10, Math.max(1, Math.round(
    (horecaCount > 10 ? 3 : horecaCount > 5 ? 2 : 1) +
    (transportScore > 5 ? 2 : 1) +
    (voorzieningenScore > 5 ? 2 : 1) +
    (kantoren.length > 3 ? 2 : kantoren.length > 0 ? 1 : 0)
  )));

  const stats: BuurtStats = {
    horecaCount,
    horecaDensity,
    transportScore,
    voorzieningenScore,
    kantorenNabij: kantoren.length,
    concurrentRadius: radiusMeters,
  };

  // Generate NL summary
  const summary = generateSummary(concurrenten, complementair, transport, kantoren, voorzieningen, stats, bruisIndex);

  return {
    concurrenten,
    complementair,
    transport,
    voorzieningen,
    stats,
    bruisIndex,
    summary,
  };
}

function generateSummary(
  concurrenten: NearbyPlace[],
  complementair: NearbyPlace[],
  transport: NearbyPlace[],
  kantoren: NearbyPlace[],
  voorzieningen: NearbyPlace[],
  stats: BuurtStats,
  bruisIndex: number,
): string {
  const parts: string[] = [];

  // Opening
  if (bruisIndex >= 7) {
    parts.push("Dit is een levendige locatie met veel horeca-activiteit.");
  } else if (bruisIndex >= 4) {
    parts.push("Een locatie met gemiddelde drukte en groeipotentieel.");
  } else {
    parts.push("Een rustige locatie — geschikt voor bestemmingshoreca.");
  }

  // Concurrentie
  if (concurrenten.length > 10) {
    parts.push(`Met ${concurrenten.length} horecazaken binnen ${stats.concurrentRadius}m is de concurrentie stevig — een onderscheidend concept is essentieel.`);
  } else if (concurrenten.length > 3) {
    parts.push(`${concurrenten.length} horecazaken in de buurt bieden een goede mix van concurrentie en synergie.`);
  } else {
    parts.push(`Slechts ${concurrenten.length} concurrenten nabij — potentieel voor een uniek aanbod.`);
  }

  // Transport
  const stations = transport.filter((t) => t.type === "station");
  if (stations.length > 0) {
    parts.push(`Treinstation${stations.length > 1 ? "s" : ""} binnen loopafstand — goed voor passanten.`);
  } else if (transport.length > 3) {
    parts.push("Goed bereikbaar met OV (meerdere haltes nabij).");
  }

  // Kantoren
  if (kantoren.length > 5) {
    parts.push(`${kantoren.length} kantoren in de buurt zorgen voor lunchverkeer en zakelijke bezoekers.`);
  }

  return parts.join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function categorizeOSM(tags: any): { category: PlaceCategory; label: string } {
  if (!tags) return { category: "winkel", label: "Onbekend" };

  const amenity = tags.amenity || "";
  const shop = tags.shop || "";
  const office = tags.office || "";

  // Horeca concurrent (direct competition)
  if (["restaurant", "fast_food", "food_court"].includes(amenity)) {
    return { category: "horeca_concurrent", label: "Restaurant" };
  }
  if (["bar", "pub", "biergarten"].includes(amenity)) {
    return { category: "horeca_concurrent", label: "Bar" };
  }

  // Horeca complementair (nearby horeca that drives traffic)
  if (["cafe", "ice_cream"].includes(amenity)) {
    return { category: "horeca_complementair", label: "Café" };
  }

  // Transport
  if (tags.public_transport || tags.railway === "station") {
    return { category: "transport", label: tags.railway === "station" ? "Station" : "OV-halte" };
  }
  if (amenity === "parking") {
    return { category: "transport", label: "Parkeren" };
  }

  // Offices
  if (office) {
    return { category: "kantoor", label: "Kantoor" };
  }

  // Shops
  if (["supermarket", "convenience"].includes(shop)) {
    return { category: "supermarkt", label: "Supermarkt" };
  }
  if (shop === "mall") {
    return { category: "winkel", label: "Winkelcentrum" };
  }

  // Education
  if (["university", "school", "college"].includes(amenity)) {
    return { category: "onderwijs", label: "Onderwijs" };
  }

  // Culture
  if (["theatre", "cinema", "museum"].includes(amenity)) {
    return { category: "cultuur", label: amenity === "cinema" ? "Bioscoop" : amenity === "museum" ? "Museum" : "Theater" };
  }

  return { category: "winkel", label: "Voorziening" };
}

/**
 * Haversine distance between two coordinates in meters
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

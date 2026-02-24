/**
 * Buurtanalyse 2.0 Orchestrator
 *
 * Fetches all providers in parallel via Promise.allSettled(),
 * assembles EnhancedBuurtAnalysis, and caches the result.
 */

import type { EnhancedBuurtAnalysis } from "./types";
import { getCached, setCache } from "./cache";
import { fetchCBSDemographics } from "./providers/cbs";
import { fetchBAGInfo } from "./providers/bag";
import { fetchTransportAnalysis } from "./providers/transport";
import { fetchOSMData, osmToCompetitors } from "./providers/osm";
import { fetchGooglePlaces } from "./providers/google-places";
import { estimatePassanten } from "./providers/passanten";

/**
 * Run full location analysis — orchestrates all providers
 */
export async function analyzeLocation(
  lat: number,
  lng: number,
  radius: number,
): Promise<EnhancedBuurtAnalysis> {
  // Check full-analysis cache first (24h TTL)
  const cached = await getCached<EnhancedBuurtAnalysis>(
    lat,
    lng,
    "full-analysis",
    radius,
  );
  if (cached) return cached;

  // Fetch all providers in parallel
  const [cbsResult, bagResult, transportResult, osmResult, googleResult] =
    await Promise.allSettled([
      fetchCBSDemographics(lat, lng),
      fetchBAGInfo(lat, lng),
      fetchTransportAnalysis(lat, lng, radius),
      fetchOSMData(lat, lng, radius),
      fetchGooglePlaces(lat, lng, radius),
    ]);

  // Extract values (null if failed)
  const demographics =
    cbsResult.status === "fulfilled" ? cbsResult.value : null;
  const building =
    bagResult.status === "fulfilled" ? bagResult.value : null;
  const transportAnalysis =
    transportResult.status === "fulfilled" ? transportResult.value : null;
  const osmData =
    osmResult.status === "fulfilled" ? osmResult.value : null;
  const googlePlaces =
    googleResult.status === "fulfilled" ? googleResult.value : null;

  // Get base OSM analysis (fallback to empty)
  const baseAnalysis = osmData?.analysis ?? {
    concurrenten: [],
    complementair: [],
    transport: [],
    voorzieningen: [],
    stats: {
      horecaCount: 0,
      horecaDensity: "laag",
      transportScore: 0,
      voorzieningenScore: 0,
      kantorenNabij: 0,
      concurrentRadius: radius,
    },
    bruisIndex: 1,
    summary: "Geen data beschikbaar voor deze locatie.",
  };

  // Override transport score if we have better data
  if (transportAnalysis) {
    baseAnalysis.stats.transportScore = transportAnalysis.score;
  }

  // Build competitors list (OSM + Google)
  const osmCompetitors = osmData ? osmToCompetitors(osmData.places) : [];
  const competitors = googlePlaces
    ? mergeCompetitors(osmCompetitors, googlePlaces)
    : osmCompetitors;

  // Estimate passanten (v2: includes competitor enrichment)
  const passanten = estimatePassanten({
    demographics,
    transportAnalysis,
    horecaCount: baseAnalysis.stats.horecaCount,
    kantorenCount: baseAnalysis.stats.kantorenNabij,
    competitors,
  });

  // Track data sources
  const dataSources: string[] = ["OSM"];
  if (demographics) dataSources.push("CBS");
  if (building) dataSources.push("BAG/PDOK");
  if (transportAnalysis) dataSources.push("NS/OV");
  if (googlePlaces) dataSources.push("Google Places");

  const dataQuality: EnhancedBuurtAnalysis["dataQuality"] =
    dataSources.length >= 4
      ? "volledig"
      : dataSources.length >= 2
        ? "gedeeltelijk"
        : "basis";

  // Generate enhanced summary
  const summary = generateEnhancedSummary(
    baseAnalysis.summary,
    demographics,
    transportAnalysis,
    passanten,
  );

  const result: EnhancedBuurtAnalysis = {
    // Base BuurtAnalysis fields
    ...baseAnalysis,
    summary,

    // Enhanced fields
    demographics,
    building,
    transportAnalysis,
    passanten,
    competitors,
    dataSources,
    dataQuality,
    fetchedAt: new Date().toISOString(),
  };

  // Cache full result
  await setCache(lat, lng, "full-analysis", radius, result);

  return result;
}

/**
 * Merge OSM and Google competitors, preferring Google data for duplicates.
 *
 * Dedup strategy: name-based fuzzy match. Two entries are considered duplicates
 * if the first word of one name appears in the other (case-insensitive).
 * Distance-from-center comparison was removed — two different businesses can
 * have the same distance to the query point.
 */
function mergeCompetitors(
  osm: EnhancedBuurtAnalysis["competitors"],
  google: EnhancedBuurtAnalysis["competitors"],
): EnhancedBuurtAnalysis["competitors"] {
  const merged = [...google]; // Google has ratings, prioritize

  for (const osmComp of osm) {
    const osmFirstWord = osmComp.naam.toLowerCase().split(" ")[0];
    if (!osmFirstWord || osmFirstWord.length < 2) {
      // Very short name — skip dedup, just add
      merged.push(osmComp);
      continue;
    }

    // Name-based dedup: check if any Google result name contains the OSM first word
    // AND if the OSM name contains the Google first word (bidirectional check)
    const isDuplicate = merged.some((g) => {
      const gFirstWord = g.naam.toLowerCase().split(" ")[0];
      return (
        g.naam.toLowerCase().includes(osmFirstWord) ||
        (gFirstWord.length >= 2 && osmComp.naam.toLowerCase().includes(gFirstWord))
      );
    });

    if (!isDuplicate) {
      merged.push(osmComp);
    }
  }

  return merged.sort((a, b) => a.afstand - b.afstand);
}

/**
 * Generate enhanced summary with demographic context
 */
function generateEnhancedSummary(
  baseSummary: string,
  demographics: EnhancedBuurtAnalysis["demographics"],
  transport: EnhancedBuurtAnalysis["transportAnalysis"],
  passanten: EnhancedBuurtAnalysis["passanten"],
): string {
  const parts = [baseSummary];

  if (demographics) {
    if (demographics.gemiddeldInkomen) {
      const landelijkGemiddeld = 28; // x1000 EUR (approx)
      if (demographics.gemiddeldInkomen > landelijkGemiddeld * 1.2) {
        parts.push(
          `Het gemiddeld inkomen in ${demographics.buurtNaam} ligt boven het landelijk gemiddelde — geschikt voor premium concepten.`,
        );
      } else if (demographics.gemiddeldInkomen < landelijkGemiddeld * 0.8) {
        parts.push(
          `Het inkomensniveau is relatief laag — focus op betaalbare concepten.`,
        );
      }
    }

    if (demographics.leeftijdsverdeling.jong > 35) {
      parts.push("Veel jongeren in de buurt — potentieel voor trendy concepten.");
    }
  }

  if (transport?.bereikbaarheidOV === "uitstekend") {
    parts.push("Uitstekende OV-bereikbaarheid trekt extra passantenverkeer.");
  }

  if (passanten && passanten.dagschatting > 1000) {
    parts.push(
      `Geschatte ${passanten.dagschatting.toLocaleString("nl-NL")} passanten per dag.`,
    );
  }

  return parts.join(" ");
}

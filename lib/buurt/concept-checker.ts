/**
 * Concept Checker — AI-powered concept viability analysis
 *
 * Evaluates whether a specific horeca concept (e.g., "smoothiebar") fits
 * a location based on demographics, competition, foot traffic, pricing,
 * and competitor reviews.
 *
 * v2: AI competitor classification + quality scoring
 */

import type {
  ConceptCheckResult,
  EnhancedBuurtAnalysis,
  CompetitorInfo,
} from "./types";
import { analyzeLocation } from "./analyze";
import { searchConceptCompetitors } from "./providers/google-places";
import { getCached, setCache } from "./cache";
import { classifyCompetitors } from "./ai-classifier";
import type { ClassifiedCompetitors, LocationContext } from "./ai-classifier";
import { assessResultQuality } from "./quality-scorer";

// ---------------------------------------------------------------------------
// Concept-to-category mapping
// ---------------------------------------------------------------------------
const CONCEPT_CATEGORIES: Record<string, string[]> = {
  smoothiebar: ["cafe", "ice_cream", "fast_food"],
  espressobar: ["cafe"],
  koffiebar: ["cafe"],
  wijnbar: ["bar", "pub"],
  cocktailbar: ["bar", "pub"],
  pokebowl: ["restaurant", "fast_food"],
  bakkerij: ["cafe", "fast_food", "bakery"],
  sushi: ["restaurant"],
  pizzeria: ["restaurant", "fast_food"],
  broodjeszaak: ["fast_food", "cafe"],
  ijssalon: ["ice_cream", "cafe"],
  lunchroom: ["cafe", "fast_food", "restaurant"],
  restaurant: ["restaurant"],
  cafe: ["cafe"],
  bar: ["bar", "pub"],
  dark_kitchen: ["restaurant", "fast_food", "meal_delivery"],
  eetcafe: ["restaurant", "cafe", "bar"],
  bistro: ["restaurant"],
  brasserie: ["restaurant"],
};

// ---------------------------------------------------------------------------
// Doelgroep profiles
// ---------------------------------------------------------------------------
interface DoelgroepProfiel {
  idealAge: "jong" | "werkleeftijd" | "any";
  minIncome: number; // x1000 EUR
  urbanDensity: "hoog" | "gemiddeld" | "any";
  priceLevel: number; // expected 1-4
}

const DOELGROEP_PROFIELEN: Record<string, DoelgroepProfiel> = {
  smoothiebar: { idealAge: "jong", minIncome: 25, urbanDensity: "hoog", priceLevel: 1 },
  espressobar: { idealAge: "werkleeftijd", minIncome: 28, urbanDensity: "hoog", priceLevel: 2 },
  koffiebar: { idealAge: "werkleeftijd", minIncome: 25, urbanDensity: "gemiddeld", priceLevel: 1 },
  wijnbar: { idealAge: "werkleeftijd", minIncome: 30, urbanDensity: "hoog", priceLevel: 3 },
  cocktailbar: { idealAge: "jong", minIncome: 28, urbanDensity: "hoog", priceLevel: 3 },
  pokebowl: { idealAge: "jong", minIncome: 25, urbanDensity: "hoog", priceLevel: 2 },
  bakkerij: { idealAge: "any", minIncome: 20, urbanDensity: "any", priceLevel: 1 },
  sushi: { idealAge: "werkleeftijd", minIncome: 30, urbanDensity: "gemiddeld", priceLevel: 3 },
  pizzeria: { idealAge: "any", minIncome: 22, urbanDensity: "gemiddeld", priceLevel: 2 },
  broodjeszaak: { idealAge: "werkleeftijd", minIncome: 22, urbanDensity: "gemiddeld", priceLevel: 1 },
  ijssalon: { idealAge: "jong", minIncome: 20, urbanDensity: "hoog", priceLevel: 1 },
  lunchroom: { idealAge: "werkleeftijd", minIncome: 25, urbanDensity: "gemiddeld", priceLevel: 2 },
  restaurant: { idealAge: "werkleeftijd", minIncome: 30, urbanDensity: "gemiddeld", priceLevel: 3 },
  cafe: { idealAge: "any", minIncome: 22, urbanDensity: "gemiddeld", priceLevel: 2 },
  bar: { idealAge: "jong", minIncome: 22, urbanDensity: "hoog", priceLevel: 2 },
  dark_kitchen: { idealAge: "jong", minIncome: 20, urbanDensity: "any", priceLevel: 1 },
  eetcafe: { idealAge: "any", minIncome: 22, urbanDensity: "gemiddeld", priceLevel: 2 },
  bistro: { idealAge: "werkleeftijd", minIncome: 28, urbanDensity: "gemiddeld", priceLevel: 3 },
  brasserie: { idealAge: "werkleeftijd", minIncome: 30, urbanDensity: "gemiddeld", priceLevel: 3 },
};

const DEFAULT_PROFIEL: DoelgroepProfiel = {
  idealAge: "any",
  minIncome: 22,
  urbanDensity: "gemiddeld",
  priceLevel: 2,
};

// Global timeout for the entire concept check flow (25s)
const CONCEPT_CHECK_TIMEOUT_MS = 25_000;

/**
 * Check concept viability for a location.
 * Wraps the core logic in a global timeout to prevent runaway requests.
 */
export async function checkConceptViability(
  concept: string,
  lat: number,
  lng: number,
  radius: number = 500,
): Promise<ConceptCheckResult> {
  const abortController = new AbortController();

  const resultPromise = checkConceptViabilityCore(concept, lat, lng, radius);
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      abortController.abort();
      reject(new Error("[concept-checker] Global timeout after 25s"));
    }, CONCEPT_CHECK_TIMEOUT_MS);
  });

  // Prevent unhandled rejection from the losing promise
  resultPromise.catch(() => {});

  return Promise.race([resultPromise, timeoutPromise]);
}

async function checkConceptViabilityCore(
  concept: string,
  lat: number,
  lng: number,
  radius: number,
): Promise<ConceptCheckResult> {
  // Get full analysis (cached) + Google text search in parallel
  const [analysis, googleConcept] = await Promise.all([
    analyzeLocation(lat, lng, radius),
    searchConceptCompetitors(concept, lat, lng, radius),
  ]);

  // Normalize concept
  const normalizedConcept = concept.toLowerCase().trim().replace(/\s+/g, "_");
  const categories = CONCEPT_CATEGORIES[normalizedConcept] || inferCategories(concept);
  const profiel = DOELGROEP_PROFIELEN[normalizedConcept] || DEFAULT_PROFIEL;

  // --- AI Competitor Classification ---
  // Build location context from analysis for smarter AI classification
  const locationContext: LocationContext = {
    buurtNaam: analysis.demographics?.buurtNaam,
    gemeenteNaam: analysis.demographics?.gemeenteNaam,
    dichtheid: analysis.demographics?.dichtheid,
    leeftijdsverdeling: analysis.demographics?.leeftijdsverdeling,
    horecaCount: analysis.stats.horecaCount,
    isHorecaGeschikt: analysis.building?.isHorecaGeschikt,
    bereikbaarheidOV: analysis.transportAnalysis?.bereikbaarheidOV,
  };

  // Classify Google text search results (or analysis competitors as fallback)
  const rawCompetitors = googleConcept && googleConcept.length > 0
    ? googleConcept
    : analysis.competitors;

  const classified = await classifyCompetitors(
    concept,
    rawCompetitors,
    categories,
    locationContext,
  );

  // Competition scan from classified results (pass investigatedCompetitors through)
  const competitionScan = buildCompetitionScan(classified);

  // Price positioning — use direct + indirect competitors (not irrelevant)
  const relevantForPricing = [...classified.direct, ...classified.indirect];
  const pricePositioning = analyzePricePositioning(
    relevantForPricing.length >= 3 ? relevantForPricing : analysis.competitors,
    profiel,
  );

  // Gap analysis — use classified direct count
  const gapAnalyse = generateGapAnalysis(
    analysis,
    classified.direct.length,
    concept,
    pricePositioning,
  );

  // Doelgroep match
  const doelgroepMatch = analyzeDoelgroep(analysis, profiel);

  // Kansen en risico's
  const { kansen, risicos } = generateKansenRisicos(
    analysis,
    competitionScan,
    doelgroepMatch,
    pricePositioning,
  );

  // Calculate viability score (now with correct direct count)
  const viabilityScore = calculateViabilityScore(
    analysis,
    competitionScan,
    doelgroepMatch,
    pricePositioning,
  );

  // Fetch reviews for top 5 direct competitors (from classified.direct)
  const competitorReviews = buildCompetitorReviews(classified.direct);

  // AI insight (optional — uses LLM)
  const aiInsight = await generateAIInsight(
    concept,
    analysis,
    viabilityScore,
    competitionScan,
    doelgroepMatch,
    pricePositioning,
    competitorReviews,
    lat,
    lng,
  );

  // Top competitors for display — directly from classified.direct
  const topConcurrenten = classified.direct
    .slice(0, 5)
    .map((c) => ({
      naam: c.naam,
      rating: c.rating,
      reviewCount: c.reviewCount,
      priceLevel: c.priceLevel,
      afstand: c.afstand,
    }));

  // Assemble result
  const result: ConceptCheckResult = {
    concept,
    viabilityScore,
    competitionScan,
    gapAnalyse,
    doelgroepMatch,
    pricePositioning: {
      ...pricePositioning,
      conceptLevel: profiel.priceLevel,
    },
    topConcurrenten,
    kansen,
    risicos,
    aiInsight,
  };

  // --- Quality Assessment ---
  const quality = assessResultQuality(result, analysis);
  result.qualityScore = quality.qualityScore;
  result.qualityNotes = quality.qualityNotes;

  return result;
}

/**
 * Try to infer categories from concept name
 */
function inferCategories(concept: string): string[] {
  const lower = concept.toLowerCase();
  if (lower.includes("koffie") || lower.includes("coffee")) return ["cafe"];
  if (lower.includes("bar")) return ["bar", "pub"];
  if (lower.includes("restaurant") || lower.includes("eet")) return ["restaurant"];
  if (lower.includes("pizza")) return ["restaurant", "fast_food"];
  if (lower.includes("sushi") || lower.includes("japan")) return ["restaurant"];
  if (lower.includes("ijs") || lower.includes("ice")) return ["ice_cream", "cafe"];
  if (lower.includes("brood") || lower.includes("sandwich")) return ["fast_food", "cafe"];
  if (lower.includes("bak")) return ["cafe", "fast_food"];
  return ["restaurant", "cafe"];
}

/**
 * Build competition scan from classified competitors
 */
function buildCompetitionScan(
  classified: ClassifiedCompetitors,
): ConceptCheckResult["competitionScan"] {
  const dichtstbij: CompetitorInfo | null =
    classified.direct.length > 0
      ? classified.direct.reduce((closest, c) =>
          c.afstand < closest.afstand ? c : closest,
        )
      : null;

  return {
    directeCount: classified.direct.length,
    indirecteCount: classified.indirect.length,
    dichtstbij,
    aiClassified: classified.aiClassified,
    irrelevantFiltered: classified.irrelevant.length,
    investigatedCompetitors: classified.investigatedCompetitors,
  };
}

/**
 * Analyze price positioning of the market
 */
function analyzePricePositioning(
  competitors: CompetitorInfo[],
  profiel: DoelgroepProfiel,
): { gemiddeld: number | null; label: string; match: boolean } {
  const withPrice = competitors.filter((c) => c.priceLevel != null);
  if (withPrice.length < 3) {
    return { gemiddeld: null, label: "Onvoldoende data", match: true };
  }

  const avg = withPrice.reduce((sum, c) => sum + (c.priceLevel ?? 0), 0) / withPrice.length;
  const gemiddeld = Math.round(avg * 10) / 10;

  const labels = ["Gratis", "\u20AC", "\u20AC\u20AC", "\u20AC\u20AC\u20AC", "\u20AC\u20AC\u20AC\u20AC"];
  const label = labels[Math.round(avg)] || "\u20AC\u20AC";

  // Match = concept price level is within ±1 of market average
  const match = Math.abs(profiel.priceLevel - avg) <= 1;

  return { gemiddeld, label, match };
}

function generateGapAnalysis(
  analysis: EnhancedBuurtAnalysis,
  directeCount: number,
  concept: string,
  pricing: { gemiddeld: number | null; label: string },
): string {
  const totalHoreca = analysis.stats.horecaCount;
  const parts: string[] = [];

  if (directeCount === 0 && totalHoreca > 5) {
    parts.push(`Geen ${concept} binnen ${analysis.stats.concurrentRadius}m, maar wel ${totalHoreca} andere horecazaken \u2014 er is duidelijk vraag, maar dit specifieke aanbod ontbreekt.`);
  } else if (directeCount === 0 && totalHoreca <= 5) {
    parts.push(`Geen ${concept} en weinig horeca in de directe omgeving \u2014 pionierslocatie met groeipotentieel.`);
  } else if (directeCount >= 5) {
    parts.push(`${directeCount} vergelijkbare zaken nabij \u2014 de markt is verzadigd. Een zeer onderscheidend concept is essentieel.`);
  } else {
    parts.push(`${directeCount} vergelijkbare zaken en ${totalHoreca} horecazaken totaal \u2014 gezonde competitie met ruimte voor een sterk concept.`);
  }

  if (pricing.gemiddeld != null) {
    parts.push(`Gemiddeld prijsniveau: ${pricing.label}.`);
  }

  return parts.join(" ");
}

function analyzeDoelgroep(
  analysis: EnhancedBuurtAnalysis,
  profiel: DoelgroepProfiel,
): ConceptCheckResult["doelgroepMatch"] {
  if (!analysis.demographics) {
    return { score: 50, uitleg: "Geen demografische data beschikbaar voor nauwkeurige match." };
  }

  const demo = analysis.demographics;
  let score = 50;
  const parts: string[] = [];

  // Age match
  if (profiel.idealAge === "jong") {
    if (demo.leeftijdsverdeling.jong > 30) {
      score += 20;
      parts.push("veel jongeren in de buurt");
    } else if (demo.leeftijdsverdeling.jong < 15) {
      score -= 15;
      parts.push("weinig jongeren");
    }
  } else if (profiel.idealAge === "werkleeftijd") {
    if (demo.leeftijdsverdeling.werkleeftijd > 55) {
      score += 15;
      parts.push("veel werkenden");
    }
  }

  // Income match
  if (demo.gemiddeldInkomen) {
    if (demo.gemiddeldInkomen >= profiel.minIncome * 1.2) {
      score += 20;
      parts.push("bovengemiddeld inkomen");
    } else if (demo.gemiddeldInkomen >= profiel.minIncome) {
      score += 10;
      parts.push("passend inkomensniveau");
    } else {
      score -= 15;
      parts.push("inkomen onder doelgroep-minimum");
    }
  }

  // Density match
  if (demo.dichtheid && profiel.urbanDensity !== "any") {
    const isUrban = demo.dichtheid > 3000;
    if (profiel.urbanDensity === "hoog" && isUrban) {
      score += 10;
      parts.push("stedelijke locatie");
    } else if (profiel.urbanDensity === "hoog" && !isUrban) {
      score -= 10;
      parts.push("geen stedelijke omgeving");
    }
  }

  score = Math.max(0, Math.min(100, score));

  const uitleg =
    parts.length > 0
      ? `Doelgroep-match: ${parts.join(", ")}.`
      : "Gemiddelde match met de lokale bevolking.";

  return { score, uitleg };
}

function generateKansenRisicos(
  analysis: EnhancedBuurtAnalysis,
  competition: ConceptCheckResult["competitionScan"],
  doelgroep: ConceptCheckResult["doelgroepMatch"],
  pricing: { gemiddeld: number | null; label: string; match: boolean },
): { kansen: string[]; risicos: string[] } {
  const kansen: string[] = [];
  const risicos: string[] = [];

  // Competition-based
  if (competition.directeCount === 0) {
    kansen.push("Geen directe concurrentie \u2014 first-mover voordeel");
  }
  if (competition.directeCount >= 5) {
    risicos.push("Hoge concurrentie \u2014 differentiatie is cruciaal");
  }

  // Price positioning
  if (pricing.gemiddeld != null && !pricing.match) {
    risicos.push(`Prijsniveau wijkt af van marktgemiddelde (${pricing.label})`);
  }
  if (pricing.gemiddeld != null && pricing.match) {
    kansen.push(`Prijsniveau past bij de buurt (${pricing.label})`);
  }

  // Transport-based
  if (analysis.transportAnalysis?.bereikbaarheidOV === "uitstekend") {
    kansen.push("Uitstekende OV-bereikbaarheid trekt breed publiek");
  }
  if (
    analysis.transportAnalysis?.bereikbaarheidOV === "slecht" ||
    analysis.transportAnalysis?.bereikbaarheidOV === "matig"
  ) {
    risicos.push("Beperkte bereikbaarheid \u2014 afhankelijk van lokaal publiek");
  }

  // Demographics-based
  if (doelgroep.score >= 70) {
    kansen.push("Sterke match met lokale bevolking");
  }
  if (doelgroep.score < 30) {
    risicos.push("Zwakke match met lokale doelgroep");
  }

  // Passanten
  if (analysis.passanten && analysis.passanten.dagschatting > 1500) {
    kansen.push(`Hoog passantenverkeer (~${analysis.passanten.dagschatting.toLocaleString("nl-NL")}/dag)`);
  }
  if (analysis.passanten && analysis.passanten.dagschatting < 500) {
    risicos.push("Laag passantenverkeer \u2014 marketing-gedreven model nodig");
  }

  // Office proximity
  if (analysis.stats.kantorenNabij > 5) {
    kansen.push("Veel kantoren nabij \u2014 sterk lunchpotentieel");
  }

  // BAG
  if (analysis.building?.isHorecaGeschikt) {
    kansen.push("Pand heeft horeca-geschikte bestemming");
  }

  return { kansen, risicos };
}

function calculateViabilityScore(
  analysis: EnhancedBuurtAnalysis,
  competition: ConceptCheckResult["competitionScan"],
  doelgroep: ConceptCheckResult["doelgroepMatch"],
  pricing: { match: boolean; gemiddeld: number | null },
): number {
  let score = 50;

  // Competition factor (-20 to +20)
  if (competition.directeCount === 0) score += 15;
  else if (competition.directeCount <= 2) score += 5;
  else if (competition.directeCount >= 10) score -= 20;
  else if (competition.directeCount >= 5) score -= 15;

  // Transport factor (-10 to +15)
  if (analysis.transportAnalysis) {
    if (analysis.transportAnalysis.score >= 8) score += 15;
    else if (analysis.transportAnalysis.score >= 5) score += 5;
    else if (analysis.transportAnalysis.score < 2) score -= 10;
  }

  // Demographics factor (-10 to +15)
  score += Math.round((doelgroep.score - 50) * 0.3);

  // Passanten factor (-5 to +10)
  if (analysis.passanten) {
    if (analysis.passanten.dagschatting > 2000) score += 10;
    else if (analysis.passanten.dagschatting > 1000) score += 5;
    else if (analysis.passanten.dagschatting < 300) score -= 5;
  }

  // Bruisindex factor (-5 to +10) — guard against null/undefined from stale cache
  const bruisIndex = analysis.bruisIndex ?? 0;
  if (bruisIndex >= 7) score += 10;
  else if (bruisIndex >= 4) score += 3;
  else score -= 5;

  // Price positioning factor (-5 to +5)
  if (pricing.gemiddeld != null) {
    if (pricing.match) score += 5;
    else score -= 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Build review summaries from classified direct competitors
 */
function buildCompetitorReviews(directCompetitors: CompetitorInfo[]): string[] {
  const googleDirect = directCompetitors
    .filter((c) => c.rating != null)
    .slice(0, 5);

  if (googleDirect.length === 0) return [];

  return googleDirect.map(
    (c) =>
      `${c.naam}: \u2605${c.rating}${c.reviewCount ? ` (${c.reviewCount} reviews)` : ""}${c.priceLevel != null ? ` ${["Gratis", "\u20AC", "\u20AC\u20AC", "\u20AC\u20AC\u20AC", "\u20AC\u20AC\u20AC\u20AC"][c.priceLevel]}` : ""}`,
  );
}

/**
 * Generate AI insight using LLM (optional — cached)
 */
async function generateAIInsight(
  concept: string,
  analysis: EnhancedBuurtAnalysis,
  viabilityScore: number,
  competition: ConceptCheckResult["competitionScan"],
  doelgroep: ConceptCheckResult["doelgroepMatch"],
  pricing: { gemiddeld: number | null; label: string },
  competitorReviews: string[],
  lat: number,
  lng: number,
): Promise<string | null> {
  const cacheKey = `${concept.toLowerCase().trim()}::r${Math.round(lat * 10000)}::${Math.round(lng * 10000)}`;
  const cached = await getCached<string>(lat, lng, "ai", hashCode(cacheKey));
  if (cached) return cached;

  try {
    const { getModel } = await import("@/lib/ai/model");
    const { generateText } = await import("ai");
    const { model } = await getModel();

    const reviewContext = competitorReviews.length > 0
      ? `\n- Top concurrenten: ${competitorReviews.join("; ")}`
      : "";

    const pricingContext = pricing.gemiddeld != null
      ? `\n- Marktprijsniveau: ${pricing.label} (gemiddeld ${pricing.gemiddeld.toFixed(1)}/4)`
      : "";

    const prompt = `Je bent een ervaren horeca-adviseur in Nederland. Geef een beknopt advies (max 150 woorden, in het Nederlands) over het openen van een "${concept}" op deze locatie.

Context:
- Buurt: ${analysis.demographics?.buurtNaam || "onbekend"}, ${analysis.demographics?.gemeenteNaam || ""}
- Viability score: ${viabilityScore}/100
- Directe concurrenten: ${competition.directeCount}
- Indirecte concurrenten: ${competition.indirecteCount}
- Doelgroep match: ${doelgroep.score}/100 (${doelgroep.uitleg})
- Bereikbaarheid: ${analysis.transportAnalysis?.bereikbaarheidOV || "onbekend"}
- Passanten: ~${analysis.passanten?.dagschatting || "onbekend"}/dag
- Bruisindex: ${analysis.bruisIndex}/10${pricingContext}${reviewContext}
${analysis.demographics?.gemiddeldInkomen ? `- Gemiddeld inkomen: \u20AC${analysis.demographics.gemiddeldInkomen}k` : ""}
${analysis.demographics?.leeftijdsverdeling ? `- Leeftijd: ${analysis.demographics.leeftijdsverdeling.jong}% jong, ${analysis.demographics.leeftijdsverdeling.werkleeftijd}% werkleeftijd, ${analysis.demographics.leeftijdsverdeling.ouder}% 65+` : ""}
${analysis.demographics?.dichtheid ? `- Dichtheid: ${analysis.demographics.dichtheid} inw/km\u00B2` : ""}

Geef concreet advies: is dit een kansrijke locatie voor een ${concept}? Wat is het belangrijkste aandachtspunt? Eindig met een concrete tip.`;

    const result = await generateText({
      model,
      prompt,
      maxOutputTokens: 300,
    });

    const insight = result.text?.trim() || null;

    if (insight) {
      await setCache(lat, lng, "ai", hashCode(cacheKey), insight);
    }

    return insight;
  } catch (error) {
    console.error("[concept-checker] AI insight error:", error);
    return null;
  }
}

/** Simple hash for cache key differentiation per concept */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

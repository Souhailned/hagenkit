/**
 * AI Competitor Classifier v2 — Agent-based semantic classification
 *
 * Uses AI SDK 6 generateText() with tools + maxSteps so the LLM can DECIDE
 * which competitors need deeper investigation via Google Reviews.
 *
 * Flow:
 * 1. Agent sees all competitors with name, type, rating, distance
 * 2. For obvious cases (McDonald's for smoothiebar) → classifies immediately
 * 3. For ambiguous cases ("Het Hoekje" type: cafe) → calls getPlaceReviews tool
 * 4. After investigation, outputs final JSON with all classifications
 *
 * Fallback: classifyByCategory() deterministic approach on timeout/error
 * Cache: Redis 7 days per concept + sorted competitor names hash (v2 prefix)
 */

import type { CompetitorInfo } from "./types";
import { getCached, setCache } from "./cache";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ClassifiedCompetitors {
  direct: CompetitorInfo[];
  indirect: CompetitorInfo[];
  irrelevant: CompetitorInfo[];
  aiClassified: boolean;
  /** Names of competitors that needed Google Reviews investigation */
  investigatedCompetitors?: string[];
}

/** Context about the location — passed to the AI for better classification */
export interface LocationContext {
  buurtNaam?: string;
  gemeenteNaam?: string;
  dichtheid?: number | null;
  leeftijdsverdeling?: { jong: number; werkleeftijd: number; ouder: number };
  horecaCount?: number;
  isHorecaGeschikt?: boolean;
  bereikbaarheidOV?: string;
}

type Classification = "direct" | "indirect" | "irrelevant";

interface ClassificationEntry {
  cat: Classification;
  conf: number;
}

/** Cached shape: classification map + investigated list */
interface CachedClassification {
  map: Record<string, ClassificationEntry>;
  investigated: string[];
}

// Agent timeout in milliseconds
const AGENT_TIMEOUT_MS = 15_000;
// Max agent steps (each tool call = 1 step; final JSON output = 1 step)
// Allow up to 6 investigations + 1 final response = 7 steps
const AGENT_MAX_STEPS = 8;

// ---------------------------------------------------------------------------
// Main: classify competitors (AI agent with fallback)
// ---------------------------------------------------------------------------

/**
 * Classify competitors semantically using an AI agent, with deterministic fallback.
 * The agent can call getPlaceReviews for ambiguous competitors.
 */
export async function classifyCompetitors(
  concept: string,
  competitors: CompetitorInfo[],
  categories: string[],
  locationContext?: LocationContext,
): Promise<ClassifiedCompetitors> {
  if (competitors.length === 0) {
    return { direct: [], indirect: [], irrelevant: [], aiClassified: false };
  }

  // Try AI agent classification
  const hasApiKey = !!process.env.GROQ_API_KEY || !!process.env.OPENAI_API_KEY;
  if (hasApiKey) {
    try {
      const result = await classifyWithAgent(concept, competitors, locationContext);
      if (result) {
        // Cross-check: validate AI output makes sense
        const validated = validateClassifications(result, competitors, categories);
        return validated;
      }
    } catch (error) {
      console.warn("[ai-classifier] AI agent classification failed, using fallback:", error);
    }
  }

  // Fallback: deterministic category-based classification
  return classifyByCategory(competitors, categories);
}

// ---------------------------------------------------------------------------
// AI Agent Classification with tools
// ---------------------------------------------------------------------------

async function classifyWithAgent(
  concept: string,
  competitors: CompetitorInfo[],
  locationContext?: LocationContext,
): Promise<ClassifiedCompetitors | null> {
  // Build cache key with v2 prefix to invalidate old cache entries
  const cacheKey = buildClassifyCacheKey(concept, competitors);
  const cached = await getCached<CachedClassification>(
    0, 0, "ai-classify", cacheKey,
  );

  if (cached) {
    const result = applyClassificationsFromMap(competitors, cached.map);
    result.investigatedCompetitors = cached.investigated;
    return result;
  }

  // Dynamic imports to keep bundle lean
  const { generateText, tool, stepCountIs } = await import("ai");
  const { getModel } = await import("@/lib/ai/model");
  const { z } = await import("zod");
  const { fetchPlaceDetails } = await import("@/lib/buurt/providers/google-places");
  const { model } = await getModel();

  // Track which competitors the agent investigated via reviews
  const investigatedNames: string[] = [];

  // Build competitor list for the prompt
  const competitorLines = competitors
    .map((c, i) => {
      const extras: string[] = [];
      if (c.rating) extras.push(`\u2605${c.rating}`);
      if (c.afstand) extras.push(`${c.afstand}m`);
      if (c.placeId) extras.push(`placeId: ${c.placeId}`);
      const extraStr = extras.length > 0 ? ` [${extras.join(", ")}]` : "";
      return `${i}. ${c.naam} (type: ${c.type})${extraStr}`;
    })
    .join("\n");

  // Build location context string
  const locationStr = buildLocationString(locationContext);

  // Define the getPlaceReviews tool (Task 3)
  const getPlaceReviews = tool({
    description:
      "Haal Google Reviews en beschrijving op van een horeca concurrent. " +
      "Gebruik dit ALLEEN als de naam en type onvoldoende informatie geven om " +
      "betrouwbaar te classificeren (bijv. generieke namen als 'Het Hoekje', " +
      "'De Buren', of als het type 'cafe' is maar het concept ook cafe-achtig is).",
    inputSchema: z.object({
      placeId: z
        .string()
        .describe("Google Places resource name (bijv. places/ChIJxyz...)"),
      competitorName: z
        .string()
        .describe("Naam van de concurrent (voor logging)"),
    }),
    execute: async ({ placeId, competitorName }) => {
      investigatedNames.push(competitorName);

      // Validate placeId format — LLM can hallucinate placeIds for OSM competitors
      if (!placeId || !placeId.startsWith("places/") || placeId.length < 10) {
        console.warn(`[ai-classifier] Invalid placeId "${placeId}" for "${competitorName}" — skipping`);
        return {
          reviews: ["Geen reviews beschikbaar (ongeldig place ID)"],
          editorialSummary: null,
        };
      }

      // Verify the placeId actually exists in our competitor list
      const isKnownPlaceId = competitors.some((c) => c.placeId === placeId);
      if (!isKnownPlaceId) {
        console.warn(`[ai-classifier] Unknown placeId "${placeId}" for "${competitorName}" — not in competitor list`);
        return {
          reviews: ["Geen reviews beschikbaar (onbekend place ID)"],
          editorialSummary: null,
        };
      }

      const details = await fetchPlaceDetails(placeId);
      if (!details || details.reviews.length === 0) {
        return {
          reviews: ["Geen reviews beschikbaar"],
          editorialSummary: null,
        };
      }

      return {
        reviews: details.reviews.map(
          (r) => `[${r.rating}/5] ${r.text}`,
        ),
        editorialSummary: details.editorialSummary,
      };
    },
  });

  // System prompt for the agent
  const systemPrompt = `Je bent een ervaren horeca-marktanalist in Nederland. Je classificeert concurrenten voor een nieuw horecaconcept.
${locationStr}
CLASSIFICATIE REGELS:
- direct: zelfde type zaak of direct concurrerend aanbod (bijv. smoothiebar vs smoothie/sap/acai bar)
- indirect: gerelateerd horeca dat deels hetzelfde publiek bedient (bijv. cafe, ijssalon bij smoothiebar)
- irrelevant: totaal ander type horeca, niet concurrerend (bijv. McDonald's of pizzeria bij smoothiebar)
- confidence: 1=heel onzeker, 5=heel zeker

WERKWIJZE:
1. Bekijk alle concurrenten. Voor overduidelijke gevallen (bijv. McDonald's voor een smoothiebar) classificeer je direct met hoge confidence.
2. Voor AMBIGUE gevallen waar naam en type alleen onvoldoende zijn (generieke namen, overlappende concepten), gebruik de getPlaceReviews tool om Google Reviews te lezen.
3. Na je onderzoek, geef je ALTIJD je definitieve classificatie als JSON.

OUTPUT FORMAT — antwoord ALLEEN met geldig JSON in exact dit formaat op de laatste regel:
{"classifications":[{"index":0,"name":"Naam","category":"direct","confidence":4},{"index":1,"name":"Naam2","category":"irrelevant","confidence":5}]}

Zorg dat ELKE concurrent (index 0 t/m ${competitors.length - 1}) in de output staat. Mis er geen.`;

  // Run agent with timeout + AbortController for cleanup
  const abortController = new AbortController();

  const agentPromise = generateText({
    model,
    tools: { getPlaceReviews },
    stopWhen: stepCountIs(AGENT_MAX_STEPS),
    temperature: 0,
    maxOutputTokens: 800,
    system: systemPrompt,
    prompt: `Classificeer deze concurrenten voor het concept "${concept}":\n\n${competitorLines}`,
    abortSignal: abortController.signal,
  });

  // Promise.race with timeout — attach .catch() to prevent unhandled rejection
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      abortController.abort();
      reject(new Error("[ai-classifier] Agent timeout after 15s"));
    }, AGENT_TIMEOUT_MS);
  });

  // Prevent unhandled rejection from the losing promise
  agentPromise.catch(() => {});

  const result = await Promise.race([agentPromise, timeoutPromise]);

  // Log token usage (Task 5)
  const usage = result.usage;
  console.log(
    `[ai-classifier] Agent completed — ` +
    `steps: ${result.steps.length}, ` +
    `investigated: [${investigatedNames.join(", ")}], ` +
    `tokens: ${usage.inputTokens ?? 0}in/${usage.outputTokens ?? 0}out`,
  );

  // Parse the final text response into classifications
  const classificationMap = parseAgentResponse(
    result.text,
    competitors,
    investigatedNames,
  );

  if (!classificationMap) {
    throw new Error("[ai-classifier] Failed to parse agent JSON output");
  }

  // Validate all competitors are classified (Task 5) — fill gaps with "indirect"
  for (let i = 0; i < competitors.length; i++) {
    const c = competitors[i];
    const mapKey = `${c.naam}::${i}`;
    if (!classificationMap[mapKey]) {
      console.warn(`[ai-classifier] Missing classification for "${c.naam}" — defaulting to indirect`);
      classificationMap[mapKey] = { cat: "indirect", conf: 2 };
    }
  }

  // Boost confidence for investigated competitors (Task 5)
  for (const name of investigatedNames) {
    for (const [key, entry] of Object.entries(classificationMap)) {
      if (key.startsWith(`${name}::`)) {
        entry.conf = 5;
      }
    }
  }

  // Cache for 7 days with v2 format
  const cacheData: CachedClassification = {
    map: classificationMap,
    investigated: investigatedNames,
  };
  await setCache(0, 0, "ai-classify", cacheKey, cacheData);

  const classified = applyClassificationsFromMap(competitors, classificationMap);
  classified.investigatedCompetitors = investigatedNames;
  return classified;
}

// ---------------------------------------------------------------------------
// Parse agent text response into classification map
// ---------------------------------------------------------------------------

function parseAgentResponse(
  text: string,
  competitors: CompetitorInfo[],
  _investigated: string[],
): Record<string, ClassificationEntry> | null {
  // Find the last JSON object containing "classifications" — non-greedy inner match
  // Use lastIndexOf to find the final { before "classifications" to avoid capturing
  // intermediate tool call JSON that may precede the final answer
  const classIdx = text.lastIndexOf('"classifications"');
  if (classIdx === -1) return null;
  const startIdx = text.lastIndexOf("{", classIdx);
  if (startIdx === -1) return null;
  // Find the matching closing brace by counting nesting
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  const jsonMatch = endIdx !== -1 ? [text.slice(startIdx, endIdx + 1)] : null;
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      classifications: Array<{
        index: number;
        name?: string;
        category: string;
        confidence: number;
      }>;
    };

    if (!Array.isArray(parsed.classifications)) return null;

    const validCategories = new Set(["direct", "indirect", "irrelevant"]);
    const map: Record<string, ClassificationEntry> = {};

    for (const item of parsed.classifications) {
      // Resolve competitor by index (primary) or name (fallback)
      let competitor: CompetitorInfo | undefined;
      let resolvedIndex = -1;

      if (item.index >= 0 && item.index < competitors.length) {
        competitor = competitors[item.index];
        resolvedIndex = item.index;
      } else if (item.name) {
        resolvedIndex = competitors.findIndex(
          (c) => c.naam.toLowerCase() === item.name!.toLowerCase(),
        );
        competitor = resolvedIndex >= 0 ? competitors[resolvedIndex] : undefined;
      }

      if (!competitor || resolvedIndex < 0) continue;

      const cat = validCategories.has(item.category)
        ? (item.category as Classification)
        : "indirect";

      const conf = Math.max(1, Math.min(5, Math.round(item.confidence || 3)));

      // Use RESOLVED index (not LLM-provided) to match gap-filling loop
      const mapKey = `${competitor.naam}::${resolvedIndex}`;
      map[mapKey] = { cat, conf };
    }

    return Object.keys(map).length > 0 ? map : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Deterministic fallback: category-based classification
// ---------------------------------------------------------------------------

/**
 * Classify competitors based on Google Places type categories.
 * Used when AI is unavailable or agent fails.
 */
export function classifyByCategory(
  competitors: CompetitorInfo[],
  categories: string[],
): ClassifiedCompetitors {
  const direct: CompetitorInfo[] = [];
  const indirect: CompetitorInfo[] = [];
  const irrelevant: CompetitorInfo[] = [];

  for (const c of competitors) {
    const typeLower = c.type.toLowerCase();
    const isMatch = categories.some((cat) => typeLower.includes(cat));
    if (isMatch) {
      direct.push(c);
    } else {
      // All non-matching go to indirect in fallback mode
      indirect.push(c);
    }
  }

  return { direct, indirect, irrelevant, aiClassified: false };
}

// ---------------------------------------------------------------------------
// Output validation — cross-check AI results
// ---------------------------------------------------------------------------

/**
 * Validate AI classifications for sanity:
 * 1. If ALL competitors classified as same category -> suspicious, use fallback
 */
function validateClassifications(
  aiResult: ClassifiedCompetitors,
  competitors: CompetitorInfo[],
  categories: string[],
): ClassifiedCompetitors {
  const total = competitors.length;
  if (total === 0) return aiResult;

  // Check: all in same bucket = suspicious (only for 3+ competitors)
  if (
    aiResult.direct.length === total ||
    aiResult.indirect.length === total ||
    aiResult.irrelevant.length === total
  ) {
    if (total > 2) {
      console.warn("[ai-classifier] All competitors in same category — suspicious, using fallback");
      return classifyByCategory(competitors, categories);
    }
  }

  return aiResult;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applyClassificationsFromMap(
  competitors: CompetitorInfo[],
  classificationMap: Record<string, ClassificationEntry>,
): ClassifiedCompetitors {
  const direct: CompetitorInfo[] = [];
  const indirect: CompetitorInfo[] = [];
  const irrelevant: CompetitorInfo[] = [];

  for (let i = 0; i < competitors.length; i++) {
    const c = competitors[i];
    const mapKey = `${c.naam}::${i}`;
    const entry = classificationMap[mapKey];
    // Low confidence (1) -> default to indirect (safe middle ground)
    const classification = entry
      ? (entry.conf <= 1 ? "indirect" : entry.cat)
      : "indirect";

    switch (classification) {
      case "direct":
        direct.push(c);
        break;
      case "indirect":
        indirect.push(c);
        break;
      case "irrelevant":
        irrelevant.push(c);
        break;
    }
  }

  return { direct, indirect, irrelevant, aiClassified: true };
}

function buildLocationString(locationContext?: LocationContext): string {
  if (!locationContext) return "";

  const parts: string[] = [];
  if (locationContext.buurtNaam) {
    parts.push(
      `Buurt: ${locationContext.buurtNaam}${locationContext.gemeenteNaam ? `, ${locationContext.gemeenteNaam}` : ""}`,
    );
  }
  if (locationContext.dichtheid) {
    parts.push(`Dichtheid: ${locationContext.dichtheid} inw/km\u00B2`);
  }
  if (locationContext.leeftijdsverdeling) {
    const lv = locationContext.leeftijdsverdeling;
    parts.push(`Leeftijd: ${lv.jong}% jong, ${lv.werkleeftijd}% werkend, ${lv.ouder}% 65+`);
  }
  if (locationContext.horecaCount) {
    parts.push(`${locationContext.horecaCount} horecazaken in de buurt`);
  }
  if (locationContext.bereikbaarheidOV) {
    parts.push(`OV: ${locationContext.bereikbaarheidOV}`);
  }

  return parts.length > 0 ? `\nLocatie: ${parts.join(" | ")}\n` : "";
}

/**
 * Build a stable cache key from concept + sorted competitor names.
 * v2 prefix to invalidate old cache entries from the non-agent classifier.
 */
function buildClassifyCacheKey(concept: string, competitors: CompetitorInfo[]): number {
  const names = competitors.map((c) => c.naam).sort().join("|");
  const key = `v2::${concept.toLowerCase().trim()}::${names}`;
  return Math.abs(hashString(key));
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Quality Scorer — Deterministic quality assessment
 *
 * Evaluates the reliability and completeness of a concept check result.
 * No AI calls — pure computation, 0ms added latency.
 *
 * Max possible score: 100 (points rebalanced from original 105)
 */

import type { ConceptCheckResult, EnhancedBuurtAnalysis } from "./types";

export interface QualityAssessment {
  qualityScore: number; // 0-100
  qualityNotes: string[];
  dataCompleteness: number; // 0-100
}

interface ScoringCheck {
  points: number;
  condition: boolean;
  note: string; // shown when condition is FALSE (i.e. issue found)
}

/**
 * Assess overall quality of a concept check result.
 * Returns a score (0-100), human-readable notes, and data completeness %.
 */
export function assessResultQuality(
  result: ConceptCheckResult,
  analysis: EnhancedBuurtAnalysis,
): QualityAssessment {
  const qualityNotes: string[] = [];

  // --- Classification quality note (separate from scoring) ---
  if (!result.competitionScan.aiClassified) {
    qualityNotes.push(
      "Concurrenten geclassificeerd via categorie-fallback — minder nauwkeurig",
    );
  }

  const hasCompetitors =
    result.competitionScan.directeCount > 0 ||
    result.competitionScan.indirecteCount > 0;

  const checks: ScoringCheck[] = [
    // --- Data completeness (40 pts max) ---
    {
      points: 10,
      condition: analysis.demographics !== null,
      note: "CBS demografische data niet beschikbaar",
    },
    {
      points: 8,
      condition: analysis.transportAnalysis !== null,
      note: "OV-bereikbaarheidsdata ontbreekt",
    },
    {
      points: 8,
      condition: analysis.competitors.some((c) => c.bron === "google"),
      note: "Geen Google Places data — alleen OSM gebruikt",
    },
    {
      points: 7,
      condition:
        analysis.passanten !== null &&
        analysis.passanten.bronnen.length >= 2,
      note: "Passantenschatting gebaseerd op weinig bronnen",
    },
    {
      points: 7,
      condition: analysis.building !== null,
      note: "BAG pandgegevens niet beschikbaar",
    },

    // --- Classification quality (max 12 pts) ---
    {
      points: getClassificationPoints(result),
      condition: true, // always awarded — points vary by method
      note: "", // quality note added separately above
    },

    // --- Competition data richness (max 13 pts) ---
    {
      points: 5,
      condition:
        !hasCompetitors ||
        result.competitionScan.directeCount >= 3 ||
        result.competitionScan.indirecteCount >= 3,
      note: "Weinig concurrenten gevonden — marktanalyse minder betrouwbaar",
    },
    {
      points: 4,
      condition:
        !hasCompetitors ||
        result.topConcurrenten.some((c) => c.rating !== undefined),
      note: "Geen Google ratings beschikbaar voor concurrenten",
    },
    {
      points: 4,
      condition: result.pricePositioning.gemiddeld !== null,
      note: "Onvoldoende prijsdata voor marktpositionering",
    },

    // --- Score consistency (max 15 pts) ---
    {
      points: 8,
      condition: isScoreConsistent(result),
      note: "Viability score lijkt inconsistent met kansen/risico's",
    },
    {
      points: 7,
      condition: isViabilityRealistic(result, analysis),
      note: "Viability score is extreem met onvolledige data",
    },

    // --- Data freshness (max 15 pts) ---
    {
      points: 15,
      condition: isDataFresh(analysis),
      note: "Data is ouder dan 24 uur",
    },
  ];

  // Calculate score
  let qualityScore = 0;

  for (const check of checks) {
    if (check.condition) {
      qualityScore += check.points;
    } else if (check.note) {
      qualityNotes.push(check.note);
    }
  }

  // Clamp (max = 10+8+8+7+7 + 12 + 5+4+4 + 8+7 + 15 = 95 base + 5 from investigation = 100)
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // Data completeness = how many of the 5 data sources are present
  const sources = [
    analysis.demographics !== null,
    analysis.transportAnalysis !== null,
    analysis.building !== null,
    analysis.passanten !== null,
    analysis.competitors.some((c) => c.bron === "google"),
  ];
  const dataCompleteness = Math.round(
    (sources.filter(Boolean).length / sources.length) * 100,
  );

  return { qualityScore, qualityNotes, dataCompleteness };
}

// ---------------------------------------------------------------------------
// Consistency checks
// ---------------------------------------------------------------------------

/**
 * Check if viability score is consistent with kansen/risicos balance.
 * Very high score + many more risks than opportunities = inconsistent.
 */
function isScoreConsistent(result: ConceptCheckResult): boolean {
  const { viabilityScore, kansen, risicos } = result;

  // Very high score but significantly more risks than opportunities
  if (viabilityScore >= 85 && risicos.length > kansen.length + 2) {
    return false;
  }

  // Very low score but significantly more opportunities than risks
  if (viabilityScore <= 15 && kansen.length > risicos.length + 2) {
    return false;
  }

  return true;
}

/**
 * Check if viability score is realistic given data availability.
 * Extreme scores (0 or 5 / 95 or 100) with very limited data are suspicious.
 */
function isViabilityRealistic(
  result: ConceptCheckResult,
  analysis: EnhancedBuurtAnalysis,
): boolean {
  const sourcesPresent = [
    analysis.demographics,
    analysis.transportAnalysis,
    analysis.building,
    analysis.passanten,
  ].filter(Boolean).length;

  // Only flag if we have very limited data AND extreme scores
  if (sourcesPresent <= 1) {
    if (result.viabilityScore <= 5 || result.viabilityScore >= 95) {
      return false;
    }
  }

  return true;
}

/**
 * Determine classification quality points:
 * - Agent with investigation (used Google Reviews): +12
 * - AI classified (no investigation needed): +8
 * - Category fallback (no AI): +3
 */
function getClassificationPoints(result: ConceptCheckResult): number {
  if (!result.competitionScan.aiClassified) return 3;
  if (
    result.competitionScan.investigatedCompetitors &&
    result.competitionScan.investigatedCompetitors.length > 0
  ) {
    return 12;
  }
  return 8;
}

/**
 * Check if data was fetched within the last 24 hours.
 */
function isDataFresh(analysis: EnhancedBuurtAnalysis): boolean {
  if (!analysis.fetchedAt) return false;

  const fetchedAt = new Date(analysis.fetchedAt).getTime();
  if (isNaN(fetchedAt)) return false;

  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return now - fetchedAt < twentyFourHours;
}

/**
 * Passanten Estimate Provider
 *
 * Pure calculation — no external API calls.
 * Combines data from other providers to estimate daily foot traffic.
 *
 * v2: Enhanced with Google Places data (review counts, price levels,
 *     opening hours patterns) for more accurate estimates.
 */

import type {
  CBSDemographics,
  TransportAnalysis,
  CompetitorInfo,
  PassantenEstimate,
} from "../types";

interface PassantenInput {
  demographics: CBSDemographics | null;
  transportAnalysis: TransportAnalysis | null;
  horecaCount: number;
  kantorenCount: number;
  competitors?: CompetitorInfo[];
}

/**
 * Estimate daily foot traffic based on available data
 */
export function estimatePassanten(input: PassantenInput): PassantenEstimate {
  const bronnen: string[] = [];
  let estimate = 0;

  // Factor 1: Population density
  if (input.demographics?.dichtheid) {
    // Average walkout rate: ~5% of nearby population walks past daily
    const densityFactor = Math.min(input.demographics.dichtheid * 0.05, 2000);
    estimate += densityFactor;
    bronnen.push("CBS bevolkingsdichtheid");
  }

  // Factor 2: Transport score
  if (input.transportAnalysis) {
    // Higher transport score = more transient foot traffic
    const transportFactor = input.transportAnalysis.score * 150;
    estimate += transportFactor;
    bronnen.push("OV-bereikbaarheid");
  }

  // Factor 3: Horeca cluster effect
  if (input.horecaCount > 0) {
    // More horeca = more foot traffic (cluster effect)
    const horecaFactor = Math.min(input.horecaCount * 50, 1000);
    estimate += horecaFactor;
    bronnen.push("Horeca-cluster");
  }

  // Factor 4: Office workers
  if (input.kantorenCount > 0) {
    // Average office ~25 employees, ~30% walk out for lunch
    const officeFactor = input.kantorenCount * 25 * 0.3;
    estimate += officeFactor;
    bronnen.push("Kantoorverkeer");
  }

  // Factor 5: Google Places review volume as popularity proxy
  if (input.competitors && input.competitors.length > 0) {
    const googleComps = input.competitors.filter((c) => c.bron === "google");
    if (googleComps.length > 0) {
      const totalReviews = googleComps.reduce(
        (sum, c) => sum + (c.reviewCount ?? 0),
        0,
      );
      // High review counts indicate high foot traffic area
      // ~1% of visitors leave reviews → rough multiplier
      if (totalReviews > 0) {
        const reviewFactor = Math.min(totalReviews * 0.5, 800);
        estimate += reviewFactor;
        bronnen.push("Google Reviews populariteit");
      }
    }

    // Factor 6: Evening/weekend horeca indicates evening foot traffic
    const withHours = input.competitors.filter(
      (c) => c.openingHours?.weekdayDescriptions?.length,
    );
    if (withHours.length >= 2) {
      const hasEveningHoreca = withHours.some((c) =>
        c.openingHours!.weekdayDescriptions.some(
          (line) =>
            line.includes("22:") ||
            line.includes("23:") ||
            line.includes("00:") ||
            line.includes("01:"),
        ),
      );
      if (hasEveningHoreca) {
        estimate += 200; // Evening economy bonus
        bronnen.push("Avondhoreca");
      }
    }

    // Factor 7: Upscale area attracts destination visitors
    const withPrice = googleComps.filter((c) => c.priceLevel != null);
    if (withPrice.length >= 3) {
      const avgPrice =
        withPrice.reduce((sum, c) => sum + (c.priceLevel ?? 0), 0) /
        withPrice.length;
      if (avgPrice >= 2.5) {
        estimate += 150; // Upscale destination bonus
        bronnen.push("Bestemmingsverkeer (upscale)");
      }
    }
  }

  // Round to nearest 100
  const dagschatting = Math.round(estimate / 100) * 100;

  // Confidence based on number of sources
  const confidence: PassantenEstimate["confidence"] =
    bronnen.length >= 5
      ? "hoog"
      : bronnen.length >= 3
        ? "gemiddeld"
        : "laag";

  return {
    dagschatting: Math.max(dagschatting, 100), // Minimum 100
    confidence,
    bronnen,
  };
}

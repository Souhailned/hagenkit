"use server";

import { analyzeLocation } from "@/lib/buurt/analyze";
import { checkConceptViability } from "@/lib/buurt/concept-checker";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSessionWithRole } from "@/lib/session";
import {
  buurtAnalysisInputSchema,
  conceptCheckInputSchema,
} from "@/lib/validations/buurt-analysis";
import type { EnhancedBuurtAnalysis, ConceptCheckResult } from "@/lib/buurt/types";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Get enhanced neighborhood analysis for a property location.
 * Requires authentication — uses billable external APIs.
 */
export async function getBuurtAnalysis(
  lat: number,
  lng: number,
  radiusMeters: number = 500,
): Promise<ActionResult<EnhancedBuurtAnalysis>> {
  // Auth check — billable API calls require authentication
  const ctx = await getSessionWithRole();
  if (!ctx) {
    return { success: false, error: "Niet ingelogd." };
  }

  // Validate input
  const parsed = buurtAnalysisInputSchema.safeParse({
    lat,
    lng,
    radius: radiusMeters,
  });

  if (!parsed.success) {
    return { success: false, error: "Ongeldige locatie-coördinaten." };
  }

  // Rate limit per user (not global)
  const rateResult = await checkRateLimit(`buurt:${ctx.userId}`, "api");
  if (!rateResult.success) {
    return { success: false, error: "Te veel verzoeken. Probeer het later opnieuw." };
  }

  try {
    const analysis = await analyzeLocation(
      parsed.data.lat,
      parsed.data.lng,
      parsed.data.radius,
    );

    return { success: true, data: analysis };
  } catch (error) {
    console.error("Buurt analysis error:", error);
    return { success: false, error: "Analyse kon niet worden uitgevoerd." };
  }
}

/**
 * Check concept viability for a location.
 * Requires authentication — triggers AI calls and billable APIs.
 */
export async function checkConceptForLocation(
  concept: string,
  lat: number,
  lng: number,
  radius: number = 500,
): Promise<ActionResult<ConceptCheckResult>> {
  // Auth check — AI calls require authentication
  const ctx = await getSessionWithRole();
  if (!ctx) {
    return { success: false, error: "Niet ingelogd." };
  }

  // Validate input
  const parsed = conceptCheckInputSchema.safeParse({
    concept,
    lat,
    lng,
    radius,
  });

  if (!parsed.success) {
    return { success: false, error: "Ongeldig concept of locatie." };
  }

  // Rate limit per user on AI tier (10/min)
  const rateResult = await checkRateLimit(`concept:${ctx.userId}`, "ai");
  if (!rateResult.success) {
    return { success: false, error: "Te veel verzoeken. Probeer het later opnieuw." };
  }

  try {
    const result = await checkConceptViability(
      parsed.data.concept,
      parsed.data.lat,
      parsed.data.lng,
      parsed.data.radius,
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("Concept check error:", error);
    return { success: false, error: "Concept check kon niet worden uitgevoerd." };
  }
}

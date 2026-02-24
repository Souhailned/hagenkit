import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getModel } from "@/lib/ai/model";
import { getPropertyBySlug } from "@/app/actions/property";
import { getBuurtAnalysis } from "@/app/actions/buurt-analysis";
import { checkConceptForLocation } from "@/app/actions/buurt-analysis";
import { getSimilarProperties } from "@/app/actions/recommendations";
import { buildPropertySystemPrompt } from "@/lib/ai/property-context";
import type { PropertyContextData } from "@/lib/ai/property-context";
import { NextResponse } from "next/server";

export const maxDuration = 30;

// ---------------------------------------------------------------------------
// In-memory cache per slug (property + buurt data rarely change mid-session)
// ---------------------------------------------------------------------------
const contextCache = new Map<
  string,
  { system: string; propertyId: string; lat: number | null; lng: number | null; expiresAt: number }
>();

async function getOrBuildContext(slug: string) {
  const cached = contextCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }

  // Fetch property data
  const propertyResult = await getPropertyBySlug(slug);
  if (!propertyResult.success || !propertyResult.data) {
    return null;
  }

  const property = propertyResult.data;
  const lat = property.latitude;
  const lng = property.longitude;

  // Fetch buurt data if coordinates available
  let buurtData: import("@/lib/buurt/types").EnhancedBuurtAnalysis | null = null;
  if (lat != null && lng != null) {
    const buurtResult = await getBuurtAnalysis(lat, lng, 500);
    if (buurtResult.success) {
      buurtData = buurtResult.data;
    }
  }

  // Build context data object matching PropertyContextData
  const contextData: PropertyContextData = {
    title: property.title,
    slug: property.slug,
    propertyType: property.propertyType,
    address: property.address,
    city: property.city,
    postalCode: property.postalCode,
    province: property.province,
    neighborhood: property.neighborhood,
    description: property.description,
    surfaceTotal: property.surfaceTotal,
    surfaceKitchen: property.surfaceKitchen,
    surfaceTerrace: property.surfaceTerrace,
    surfaceBasement: property.surfaceBasement,
    surfaceStorage: property.surfaceStorage,
    surfaceCommercial: property.surfaceCommercial,
    floors: property.floors,
    ceilingHeight: property.ceilingHeight,
    rentPrice: property.rentPrice,
    salePrice: property.salePrice,
    priceType: property.priceType,
    priceNegotiable: property.priceNegotiable,
    servicesCosts: property.servicesCosts,
    depositMonths: property.depositMonths,
    seatingCapacityInside: property.seatingCapacityInside,
    seatingCapacityOutside: property.seatingCapacityOutside,
    standingCapacity: property.standingCapacity,
    kitchenType: property.kitchenType,
    buildYear: property.buildYear,
    lastRenovation: property.lastRenovation,
    energyLabel: property.energyLabel,
    monumentStatus: property.monumentStatus,
    horecaScore: property.horecaScore,
    locationScore: property.locationScore,
    footfallEstimate: property.footfallEstimate,
    hasTerrace: property.hasTerrace,
    hasParking: property.hasParking,
    hasBasement: property.hasBasement,
    hasStorage: property.hasStorage,
    previousUse: property.previousUse,
    wasHoreca: property.wasHoreca,
    previousHorecaType: property.previousHorecaType,
    yearsHoreca: property.yearsHoreca,
    availableFrom: property.availableFrom,
    minimumLeaseTerm: property.minimumLeaseTerm,
    features: property.features.map((f) => ({
      key: f.key,
      value: f.value,
      category: f.category,
    })),
    agency: property.agency ? { name: property.agency.name } : null,
  };

  const system = buildPropertySystemPrompt(contextData, buurtData);

  const entry = {
    system,
    propertyId: property.id,
    lat,
    lng,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min cache
  };

  contextCache.set(slug, entry);
  return entry;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    // Rate limit by IP (public endpoint — no auth required)
    const identifier = req.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = await checkRateLimit(identifier, "ai");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) },
      );
    }

    const { messages, propertySlug }: { messages?: UIMessage[]; propertySlug?: string } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages payload" },
        { status: 400 },
      );
    }

    if (!propertySlug || typeof propertySlug !== "string") {
      return NextResponse.json(
        { error: "Missing propertySlug" },
        { status: 400 },
      );
    }

    // Build / fetch cached context
    const context = await getOrBuildContext(propertySlug);
    if (!context) {
      return NextResponse.json(
        { error: "Pand niet gevonden" },
        { status: 404 },
      );
    }

    const { model, supportsTools } = await getModel();

    // Tools available for the property advisor
    const advisorTools = {
      checkConcept: tool({
        description:
          "Controleer of een specifiek horecaconcept past op deze locatie. Bijvoorbeeld: 'Past een sushibar hier?'",
        inputSchema: z.object({
          concept: z.string().describe("Het horecaconcept om te checken, bijv. 'sushibar', 'wijnbar', 'pizzeria'"),
        }),
        execute: async ({ concept }) => {
          if (context.lat == null || context.lng == null) {
            return { error: "Geen locatiegegevens beschikbaar voor concept check." };
          }
          const result = await checkConceptForLocation(concept, context.lat, context.lng, 500);
          if (!result.success) {
            return { error: result.error };
          }
          const d = result.data;
          return {
            concept: d.concept,
            viabilityScore: d.viabilityScore,
            directeConcurrenten: d.competitionScan.directeCount,
            indirecteConcurrenten: d.competitionScan.indirecteCount,
            gapAnalyse: d.gapAnalyse,
            doelgroepMatch: d.doelgroepMatch,
            kansen: d.kansen,
            risicos: d.risicos,
            aiInsight: d.aiInsight,
          };
        },
      }),
      getSimilarProperties: tool({
        description:
          "Zoek vergelijkbare horecapanden. Gebruik dit als de gebruiker vraagt naar alternatieven of vergelijkbare panden.",
        inputSchema: z.object({
          limit: z.number().optional().default(4).describe("Aantal vergelijkbare panden (max 4)"),
        }),
        execute: async ({ limit }) => {
          const result = await getSimilarProperties(context.propertyId, limit);
          if (!result.success || result.properties.length === 0) {
            return { message: "Geen vergelijkbare panden gevonden." };
          }
          return result.properties.map((p) => ({
            title: p.title,
            city: p.city,
            type: p.propertyType,
            price: p.rentPrice ? `€${(p.rentPrice / 100).toLocaleString("nl-NL")}/mnd` : "Prijs op aanvraag",
            area: p.surfaceTotal ? `${p.surfaceTotal} m²` : undefined,
            url: `/aanbod/${p.slug}`,
            matchReason: p.matchReason,
          }));
        },
      }),
    };

    // Convert UIMessages (from DefaultChatTransport) → ModelMessages (for streamText)
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system: context.system,
      messages: modelMessages,
      ...(supportsTools ? { tools: advisorTools, stopWhen: stepCountIs(3) } : {}),
    });

    return result.toUIMessageStreamResponse({
      onError: () =>
        "Er ging iets mis tijdens het verwerken van je vraag. Probeer opnieuw.",
    });
  } catch (error) {
    console.error("[api/chat/property] Failed to handle chat request:", error);
    return NextResponse.json(
      {
        error:
          "Er ging iets mis tijdens het verwerken van je vraag. Probeer opnieuw.",
      },
      { status: 500 },
    );
  }
}

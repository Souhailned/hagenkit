"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { generateObject } from "ai";
import { z } from "zod";

export type ListingTurboInput = {
  propertyType: string;
  title: string;
  city: string;
  address?: string;
  surface: number;
  rentPrice?: number; // in cents
  salePrice?: number; // in cents
  priceType: "RENT" | "SALE" | "BOTH";
  features: string[];
  buildYear?: number;
  seatingCapacity?: number;
};

export type ListingTurboOutput = {
  description: string; // ~200 words professional
  shortDescription: string; // ~50 words hook
  highlights: string[]; // 4-6 bullet points
  socialMedia: {
    instagram: string; // Caption for IG/Reels
    linkedin: string; // Professional post
    facebook: string; // Casual post
  };
  seoTitle: string;
  seoDescription: string;
};

/** Zod schema for structured AI output */
const listingTurboSchema = z.object({
  description: z.string().describe("Professionele beschrijving, 150-200 woorden, wervend maar eerlijk. Nederlands."),
  shortDescription: z.string().describe("Korte hook, max 50 woorden, pakt direct de aandacht."),
  highlights: z.array(z.string()).describe("4-6 korte bullet points met de belangrijkste USPs"),
  socialMedia: z.object({
    instagram: z.string().describe("Instagram caption met emoji's, max 2200 chars, met relevante hashtags"),
    linkedin: z.string().describe("Professionele LinkedIn post, zakelijk maar enthousiast, max 1300 chars"),
    facebook: z.string().describe("Casual Facebook post, uitnodigend en direct, max 500 chars"),
  }),
  seoTitle: z.string().describe("SEO-geoptimaliseerde titel, max 60 chars"),
  seoDescription: z.string().describe("Meta description, max 155 chars, met call-to-action"),
});

const typeLabels: Record<string, string> = {
  RESTAURANT: "restaurant", CAFE: "café", BAR: "bar", HOTEL: "hotel",
  EETCAFE: "eetcafé", LUNCHROOM: "lunchroom", KOFFIEBAR: "koffiebar",
  PIZZERIA: "pizzeria", BAKERY: "bakkerij", DARK_KITCHEN: "dark kitchen",
  SNACKBAR: "snackbar", GRAND_CAFE: "grand café", COCKTAILBAR: "cocktailbar",
  NIGHTCLUB: "nachtclub", BED_AND_BREAKFAST: "bed & breakfast",
};

function formatPrice(cents: number, type: "RENT" | "SALE" | "BOTH"): string {
  const amount = `€${(cents / 100).toLocaleString("nl-NL")}`;
  return type === "RENT" ? `${amount}/mnd` : amount;
}

/**
 * Get the appropriate AI model based on available API keys.
 * Priority: Groq (fast/cheap) > OpenAI > null (fallback to template).
 */
async function getModel() {
  if (process.env.GROQ_API_KEY) {
    const { createGroq } = await import("@ai-sdk/groq");
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return groq("llama-3.3-70b-versatile");
  }
  if (process.env.OPENAI_API_KEY) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o-mini");
  }
  return null;
}

function buildTurboPrompt(input: ListingTurboInput): string {
  const type = typeLabels[input.propertyType] || input.propertyType.toLowerCase();
  const price = input.rentPrice
    ? formatPrice(input.rentPrice, "RENT")
    : input.salePrice
    ? formatPrice(input.salePrice, "SALE")
    : "";

  return `Je bent een ervaren horeca-makelaar en copywriter. Genereer ALLE teksten voor een horecapand listing.

PAND:
- Type: ${type}
- Titel: ${input.title}
- Locatie: ${input.city}${input.address ? `, ${input.address}` : ""}
- Oppervlakte: ${input.surface} m²
${price ? `- Prijs: ${price}` : ""}
${input.buildYear ? `- Bouwjaar: ${input.buildYear}` : ""}
${input.seatingCapacity ? `- Zitplaatsen: ${input.seatingCapacity}` : ""}
${input.features.length > 0 ? `- Kenmerken: ${input.features.join(", ")}` : ""}

REGELS:
- Schrijf ALLES in het Nederlands
- Verzin GEEN informatie die niet gegeven is
- Noem NOOIT "AI" of "automatisch gegenereerd"
- Wees professioneel maar niet saai
- Focus op wat het pand uniek maakt
- Gebruik relevante hashtags voor social media (#horecagrond #horeca #${input.city.toLowerCase()} etc.)`;
}

export async function generateListingTurbo(
  input: ListingTurboInput
): Promise<{ success: true; data: ListingTurboOutput } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Je moet ingelogd zijn" };
  }

  try {
    const model = await getModel();
    if (!model) {
      // No AI provider available, use template fallback
      return { success: true, data: generateTemplate(input) };
    }

    const { object } = await generateObject({
      model,
      schema: listingTurboSchema,
      prompt: buildTurboPrompt(input),
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("Listing Turbo error:", error);
    return { success: true, data: generateTemplate(input) };
  }
}

function generateTemplate(input: ListingTurboInput): ListingTurboOutput {
  const type = typeLabels[input.propertyType] || "horecapand";
  const price = input.rentPrice
    ? formatPrice(input.rentPrice, "RENT")
    : input.salePrice
    ? formatPrice(input.salePrice, "SALE")
    : "";

  return {
    description: `Bent u op zoek naar een unieke ${type} in ${input.city}? Dit pand van ${input.surface} m² biedt een uitstekende mogelijkheid voor ondernemers die hun droom willen realiseren.\n\nGelegen in het hart van ${input.city}, beschikt dit ${type} over alle faciliteiten die u nodig heeft.${input.features.length > 0 ? ` Het pand beschikt onder andere over: ${input.features.slice(0, 3).join(", ")}.` : ""}\n\nDe ruime opzet biedt voldoende ruimte voor een succesvolle horecaonderneming. Interesse? Neem direct contact op voor meer informatie of een bezichtiging.`,
    shortDescription: `${type.charAt(0).toUpperCase() + type.slice(1)} van ${input.surface} m² in ${input.city}.${price ? ` ${price}.` : ""} Direct beschikbaar voor ondernemers met ambitie.`,
    highlights: [
      `${input.surface} m² vloeroppervlak`,
      `Locatie: ${input.city}`,
      ...(price ? [`Prijs: ${price}`] : []),
      ...(input.seatingCapacity ? [`${input.seatingCapacity} zitplaatsen`] : []),
      ...input.features.slice(0, 2),
    ],
    socialMedia: {
      instagram: `🏢 Nieuw op Horecagrond!\n\n${type.charAt(0).toUpperCase() + type.slice(1)} in ${input.city} | ${input.surface} m²${price ? ` | ${price}` : ""}\n\n📍 ${input.city}\n🔑 Direct beschikbaar\n\n#horecagrond #horeca #${input.city.toLowerCase().replace(/\s/g, "")} #ondernemen #horecapand`,
      linkedin: `🏢 Nieuw horecapand beschikbaar in ${input.city}\n\nWij presenteren een ${type} van ${input.surface} m² op een uitstekende locatie in ${input.city}.${price ? ` Vraagprijs: ${price}.` : ""}\n\nIdeal voor ondernemers die op zoek zijn naar een kant-en-klare horecalocatie.\n\nMeer info: horecagrond.nl`,
      facebook: `🔥 Nieuw! ${type.charAt(0).toUpperCase() + type.slice(1)} in ${input.city} (${input.surface} m²)${price ? ` voor ${price}` : ""}. Ken jij iemand die een horecapand zoekt? Tag ze! 👇`,
    },
    seoTitle: `${input.title} | ${type.charAt(0).toUpperCase() + type.slice(1)} ${input.city}`,
    seoDescription: `${type.charAt(0).toUpperCase() + type.slice(1)} te ${input.priceType === "SALE" ? "koop" : "huur"} in ${input.city}. ${input.surface} m².${price ? ` ${price}.` : ""} Bekijk nu op Horecagrond.`,
  };
}

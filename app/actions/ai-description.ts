"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { generateText } from "ai";
import { checkRateLimit } from "@/lib/rate-limit";

interface GenerateDescriptionInput {
  propertyType: string;
  city: string;
  surface: number;
  features: string[];
  currentDescription?: string;
  tone?: "professioneel" | "wervend" | "zakelijk";
  targetAudience?: string;
}

// Property type labels for prompt
const typeLabels: Record<string, string> = {
  RESTAURANT: "restaurant",
  CAFE: "café",
  BAR: "bar",
  HOTEL: "hotel",
  EETCAFE: "eetcafé",
  LUNCHROOM: "lunchroom",
  KOFFIEBAR: "koffiebar",
  PIZZERIA: "pizzeria",
  BAKERY: "bakkerij",
  DARK_KITCHEN: "dark kitchen",
  SNACKBAR: "snackbar",
  GRAND_CAFE: "grand café",
  COCKTAILBAR: "cocktailbar",
  BED_AND_BREAKFAST: "bed & breakfast",
  NIGHTCLUB: "nachtclub",
};

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

function buildPrompt(input: GenerateDescriptionInput): string {
  const type = typeLabels[input.propertyType] || input.propertyType.toLowerCase();
  const featureList = input.features.length > 0
    ? `\nKenmerken: ${input.features.join(", ")}`
    : "";

  return `Schrijf een professionele, wervende beschrijving voor een horecapand op Horecagrond.nl.

Type: ${type}
Locatie: ${input.city}
Oppervlakte: ${input.surface} m²${featureList}
Toon: ${input.tone || "professioneel"}
${input.targetAudience ? `Doelgroep: ${input.targetAudience}` : ""}
${input.currentDescription ? `\nHuidige beschrijving (verbeter deze):\n${input.currentDescription}` : ""}

Schrijf in het Nederlands. De beschrijving moet:
- Beginnen met een pakkende openingszin
- De unieke selling points benadrukken
- De locatievoordelen benoemen
- Professioneel maar uitnodigend zijn
- Ongeveer 150-200 woorden lang zijn
- GEEN informatie verzinnen die niet gegeven is

Geef alleen de beschrijving, geen extra uitleg.`;
}

export async function generatePropertyDescription(input: GenerateDescriptionInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Je moet ingelogd zijn" };
  }

  // Rate limit
  const rateLimitResult = await checkRateLimit(session.user.id, "ai");
  if (!rateLimitResult.success) {
    return { error: "Rate limit exceeded. Try again later." };
  }

  const prompt = buildPrompt(input);

  try {
    const model = await getModel();
    if (!model) {
      // No AI provider available, use template fallback
      return { description: generateTemplate(input) };
    }

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    return { description: text };
  } catch (error) {
    console.error("AI description error:", error);
    return { description: generateTemplate(input) };
  }
}

function generateTemplate(input: GenerateDescriptionInput): string {
  const type = typeLabels[input.propertyType] || "horecapand";
  const features = input.features.slice(0, 3).join(", ");

  return `Bent u op zoek naar een unieke ${type} in ${input.city}? Dit pand van ${input.surface} m² biedt een uitstekende mogelijkheid voor ondernemers die hun droom willen realiseren.

Gelegen in ${input.city}, beschikt dit ${type} over alle faciliteiten die u nodig heeft om direct aan de slag te gaan.${features ? ` Het pand beschikt onder andere over: ${features}.` : ""}

De ruime opzet van ${input.surface} m² biedt voldoende ruimte voor een succesvolle horecaonderneming. De locatie is strategisch gekozen en trekt zowel lokale bewoners als passanten.

Interesse? Neem direct contact op voor meer informatie of een bezichtiging. Dit pand is snel weg!`;
}

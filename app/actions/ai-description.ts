"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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

  const prompt = buildPrompt(input);

  // Try to call AI API - for now use a template-based approach
  // Later: integrate with AI SDK 6 + Groq/OpenAI
  try {
    // Check if we have an API key for any LLM provider
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      // Use Groq (fast, cheap, Llama)
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { description: data.choices[0].message.content };
      }
    }

    if (openaiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { description: data.choices[0].message.content };
      }
    }

    // Fallback: template-based description
    return { description: generateTemplate(input) };
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

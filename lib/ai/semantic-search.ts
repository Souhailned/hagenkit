/**
 * Semantic Search — AI-powered natural language property search
 * 
 * Instead of pgvector embeddings, we use an LLM to parse natural language
 * into structured search filters. This is simpler, cheaper, and works
 * without database extensions.
 * 
 * Example: "Restaurant met terras in Amsterdam-Zuid onder 5000 euro"
 * → { types: ["RESTAURANT"], features: ["TERRACE"], cities: ["Amsterdam"], priceMax: 500000 }
 */

import { generateObject } from "ai";
import { z } from "zod";

const searchFiltersSchema = z.object({
  types: z.array(z.string()).describe("Property types like RESTAURANT, CAFE, BAR, HOTEL, EETCAFE, LUNCHROOM, KOFFIEBAR, PIZZERIA, SNACKBAR, BAKERY, DARK_KITCHEN, etc."),
  cities: z.array(z.string()).describe("Dutch city names like Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven, etc."),
  priceMin: z.number().optional().describe("Minimum price in cents (multiply euros by 100)"),
  priceMax: z.number().optional().describe("Maximum price in cents (multiply euros by 100)"),
  areaMin: z.number().optional().describe("Minimum surface area in m²"),
  areaMax: z.number().optional().describe("Maximum surface area in m²"),
  features: z.array(z.string()).describe("Features like TERRACE, PARKING, KITCHEN, ALCOHOL_LICENSE, VENTILATION, CELLAR, WHEELCHAIR_ACCESSIBLE"),
  keywords: z.array(z.string()).describe("Additional search keywords not captured by other fields"),
  intent: z.enum(["search", "question", "comparison", "recommendation"]).describe("What the user wants to do"),
});

export type SemanticSearchFilters = z.infer<typeof searchFiltersSchema>;

/**
 * Parse a natural language query into structured search filters
 */
export async function parseSearchQuery(query: string): Promise<SemanticSearchFilters> {
  try {
    // Try to use Groq for fast/cheap parsing
    const { createGroq } = await import("@ai-sdk/groq");
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: searchFiltersSchema,
      prompt: `Je bent een zoekassistent voor Horecagrond, een platform voor horeca vastgoed in Nederland.

Vertaal de volgende zoekopdracht naar gestructureerde zoekfilters. Let op:
- Prijzen in de horeca zijn meestal huurprijzen per maand
- "Onder 5000 euro" = priceMax: 500000 (in centen)
- "Groot" = areaMin: 200, "Klein" = areaMax: 100
- "Met terras" = features: ["TERRACE"]
- "Professionele keuken" = features: ["KITCHEN"]
- Herken Nederlandse steden en wijken

Zoekopdracht: "${query}"`,
      temperature: 0,
    });

    return result.object;
  } catch (error) {
    console.error("AI search parsing failed:", error);
    // Fallback: return keywords-only result
    return {
      types: [],
      cities: [],
      features: [],
      keywords: query.split(/\s+/).filter((w) => w.length > 2),
      intent: "search",
    };
  }
}

/**
 * Simple keyword-based fallback for when AI is unavailable
 */
export function parseSearchQueryLocal(query: string): Partial<SemanticSearchFilters> {
  const q = query.toLowerCase();
  const result: Partial<SemanticSearchFilters> = {
    types: [],
    cities: [],
    features: [],
    keywords: [],
  };

  // Type detection
  const typeMap: Record<string, string> = {
    restaurant: "RESTAURANT",
    café: "CAFE",
    cafe: "CAFE",
    bar: "BAR",
    hotel: "HOTEL",
    eetcafé: "EETCAFE",
    eetcafe: "EETCAFE",
    lunchroom: "LUNCHROOM",
    koffiebar: "KOFFIEBAR",
    pizzeria: "PIZZERIA",
    snackbar: "SNACKBAR",
    bakkerij: "BAKERY",
    "dark kitchen": "DARK_KITCHEN",
    nachtclub: "NIGHTCLUB",
    cocktailbar: "COCKTAILBAR",
  };
  for (const [key, type] of Object.entries(typeMap)) {
    if (q.includes(key)) result.types!.push(type);
  }

  // City detection
  const cities = [
    "amsterdam", "rotterdam", "den haag", "utrecht", "eindhoven",
    "groningen", "tilburg", "almere", "breda", "nijmegen",
    "enschede", "haarlem", "arnhem", "maastricht", "leiden",
    "dordrecht", "apeldoorn", "amersfoort", "delft", "hilversum",
  ];
  for (const city of cities) {
    if (q.includes(city)) {
      result.cities!.push(city.charAt(0).toUpperCase() + city.slice(1));
    }
  }
  // Fix "den haag"
  if (q.includes("den haag")) {
    result.cities = result.cities!.filter((c) => c !== "Den" && c !== "Haag");
    if (!result.cities!.includes("Den Haag")) result.cities!.push("Den Haag");
  }

  // Feature detection
  if (q.includes("terras")) result.features!.push("TERRACE");
  if (q.includes("parkeer") || q.includes("parking")) result.features!.push("PARKING");
  if (q.includes("keuken")) result.features!.push("KITCHEN");
  if (q.includes("kelder")) result.features!.push("CELLAR");
  if (q.includes("vergunning") || q.includes("alcohol")) result.features!.push("ALCOHOL_LICENSE");
  if (q.includes("rolstoel") || q.includes("toegankelijk")) result.features!.push("WHEELCHAIR_ACCESSIBLE");
  if (q.includes("afzuig") || q.includes("ventilatie")) result.features!.push("VENTILATION");

  // Price detection
  const priceMatch = q.match(/(?:onder|max|maximaal|tot)\s*€?\s*(\d+(?:\.\d+)?)\s*(?:euro|€)?/);
  if (priceMatch) {
    result.priceMax = Math.round(parseFloat(priceMatch[1].replace(".", "")) * 100);
  }
  const priceMinMatch = q.match(/(?:vanaf|min|minimaal|boven)\s*€?\s*(\d+(?:\.\d+)?)\s*(?:euro|€)?/);
  if (priceMinMatch) {
    result.priceMin = Math.round(parseFloat(priceMinMatch[1].replace(".", "")) * 100);
  }

  // Area detection
  if (q.includes("groot") || q.includes("ruim")) result.areaMin = 200;
  if (q.includes("klein") || q.includes("compact")) result.areaMax = 100;
  const areaMatch = q.match(/(\d+)\s*m[²2]/);
  if (areaMatch) result.areaMin = parseInt(areaMatch[1]);

  return result;
}

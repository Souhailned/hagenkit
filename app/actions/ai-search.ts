"use server";

import { parseSearchQuery, parseSearchQueryLocal, type SemanticSearchFilters } from "@/lib/ai/semantic-search";

export async function aiParseSearch(query: string): Promise<{
  success: boolean;
  filters?: SemanticSearchFilters;
  error?: string;
}> {
  if (!query?.trim()) {
    return { success: false, error: "Lege zoekopdracht" };
  }

  try {
    // Use AI parsing if Groq API key is available
    if (process.env.GROQ_API_KEY) {
      const filters = await parseSearchQuery(query);
      return { success: true, filters };
    }

    // Fallback to local keyword parsing
    const filters = parseSearchQueryLocal(query) as SemanticSearchFilters;
    filters.intent = "search";
    return { success: true, filters };
  } catch (error) {
    console.error("AI search failed:", error);
    // Always fallback to local parsing
    const filters = parseSearchQueryLocal(query) as SemanticSearchFilters;
    filters.intent = "search";
    return { success: true, filters };
  }
}

"use server";

import { parseSearchQuery, parseSearchQueryLocal, type SemanticSearchFilters } from "@/lib/ai/semantic-search";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function aiParseSearch(query: string): Promise<{
  success: boolean;
  filters?: SemanticSearchFilters;
  error?: string;
}> {
  if (!query?.trim()) {
    return { success: false, error: "Lege zoekopdracht" };
  }

  // Auth + rate limit
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.id) {
    const rateLimitResult = await checkRateLimit(session.user.id, "ai");
    if (!rateLimitResult.success) {
      return { success: false, error: "Rate limit exceeded. Try again later." };
    }
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

"use server";

import prisma from "@/lib/prisma";

export interface DemoConceptData {
  id: string;
  style: string;
  imageUrl: string;
  generatedAt: Date;
}

/**
 * Fetch all active, completed demo concepts for a property (public, no auth required).
 * Only returns concepts that have a generated imageUrl.
 */
export async function getDemoConcepts(
  propertyId: string
): Promise<DemoConceptData[]> {
  try {
    const concepts = await prisma.propertyDemoConcept.findMany({
      where: {
        propertyId,
        isActive: true,
        status: "completed",
        imageUrl: { not: null },
      },
      select: { id: true, style: true, imageUrl: true, generatedAt: true },
      orderBy: { generatedAt: "asc" },
    });
    // Filter out null imageUrls at TS level and assert type
    return concepts.filter(
      (c): c is DemoConceptData => c.imageUrl !== null && c.generatedAt !== null
    );
  } catch {
    return [];
  }
}

/**
 * Track a user interaction with the dream slider (fire & forget).
 * Optionally encodes the style name into the source for popularity tracking.
 */
export async function trackDreamInteraction(
  propertyId: string,
  action: string,
  style?: string
): Promise<void> {
  try {
    const source = style
      ? `dream_slider_${action}:${style}`
      : `dream_slider_${action}`;
    await prisma.propertyView.create({
      data: { propertyId, source },
    });
  } catch {
    // Fire and forget — ignore errors
  }
}

/**
 * Get the most popular demo concept style for a property based on click tracking.
 * Falls back to null if no style clicks have been recorded.
 */
export async function getMostPopularStyle(
  propertyId: string
): Promise<string | null> {
  try {
    // Query all style click events for this property
    const views = await prisma.propertyView.findMany({
      where: {
        propertyId,
        source: { startsWith: "dream_slider_style_click:" },
      },
      select: { source: true },
    });

    if (views.length === 0) return null;

    // Count occurrences by style
    const styleCounts = new Map<string, number>();
    for (const view of views) {
      if (!view.source) continue;
      const style = view.source.replace("dream_slider_style_click:", "");
      styleCounts.set(style, (styleCounts.get(style) || 0) + 1);
    }

    // Find the most popular style
    let maxStyle: string | null = null;
    let maxCount = 0;
    for (const [style, count] of styleCounts) {
      if (count > maxCount) {
        maxCount = count;
        maxStyle = style;
      }
    }

    return maxStyle;
  } catch {
    return null;
  }
}

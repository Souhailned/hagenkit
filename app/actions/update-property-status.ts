"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { PropertyType } from "@/generated/prisma/client";

type PropertyStatus = "DRAFT" | "ACTIVE" | "UNDER_OFFER" | "RENTED" | "SOLD" | "ARCHIVED";

/** Returns the best default demo style for a given property type */
function getDefaultStyle(propertyType: PropertyType): string {
  const typeMap: Partial<Record<PropertyType, string>> = {
    RESTAURANT: "restaurant_modern",
    BRASSERIE: "restaurant_modern",
    PIZZERIA: "restaurant_modern",
    WOK_RESTAURANT: "restaurant_modern",
    SUSHI: "restaurant_modern",
    HOTEL_RESTAURANT: "restaurant_modern",
    CAFE: "cafe_gezellig",
    EETCAFE: "cafe_gezellig",
    GRAND_CAFE: "cafe_gezellig",
    KOFFIEBAR: "cafe_gezellig",
    TEAROOM: "cafe_gezellig",
    BROUWERIJ_CAFE: "cafe_gezellig",
    BAR: "bar_lounge",
    COCKTAILBAR: "bar_lounge",
    WIJNBAR: "bar_lounge",
    NIGHTCLUB: "bar_lounge",
    HOTEL: "hotel_boutique",
    BED_AND_BREAKFAST: "hotel_boutique",
    LUNCHROOM: "lunchroom_hip",
    IJSSALON: "lunchroom_hip",
    PANNENKOEKHUIS: "lunchroom_hip",
  };
  return typeMap[propertyType] || "restaurant_modern";
}

export async function updatePropertyStatus(propertyId: string, status: PropertyStatus) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Niet ingelogd" };
  }

  // Verify ownership
  const property = await prisma.property.findFirst({
    where: { id: propertyId, createdById: session.user.id },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!property) {
    return { error: "Pand niet gevonden of geen toegang" };
  }

  const isFirstPublish = status === "ACTIVE" && !property.publishedAt;
  const updateData: Record<string, unknown> = { status };

  // Set publishedAt when activating
  if (isFirstPublish) {
    updateData.publishedAt = new Date();
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
  });

  // On first publish: trigger match alerts + auto-generate demo concept
  if (isFirstPublish) {
    const { matchAndNotifySearchAlerts } = await import("@/lib/search-alerts/matcher");
    void matchAndNotifySearchAlerts(propertyId).catch(console.error);

    const primaryImage = property.images[0];
    if (primaryImage?.originalUrl) {
      const { generateAllDemoConcepts } = await import("@/app/actions/demo-concepts");
      void generateAllDemoConcepts(
        propertyId,
        primaryImage.originalUrl,
      ).catch(console.error);
    }
  }

  return { success: true, status };
}

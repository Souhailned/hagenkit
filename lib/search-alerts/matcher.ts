import prisma from "@/lib/prisma";
import { sendTemplateEmail } from "@/lib/notifications/email-service";
import { EmailTemplateId } from "@/lib/notifications/types";

/**
 * Find SearchAlerts matching a newly-published property and send
 * notification emails. This is a direct async function (no Trigger.dev).
 */
export async function matchAndNotifySearchAlerts(
  propertyId: string
): Promise<{ matched: number }> {
  // 1. Fetch property with agency and primary image
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      agency: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!property) {
    console.warn("[search-alerts] Property not found", { propertyId });
    return { matched: 0 };
  }

  // 2. Find matching active SearchAlerts
  const alerts = await prisma.searchAlert.findMany({
    where: {
      active: true,
      emailEnabled: true,
      OR: [
        { cities: { isEmpty: true } },
        { cities: { has: property.city } },
      ],
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  // 3. Filter: must also match propertyType, price range, surface, and rate limit
  const PRICE_TOLERANCE = 0.2; // +/- 20%

  const matched = alerts.filter((alert) => {
    // Property type must match if specified
    if (
      alert.propertyTypes.length > 0 &&
      !alert.propertyTypes.includes(property.propertyType)
    ) {
      return false;
    }

    // Price check (use rentPrice or salePrice, in cents)
    const price = property.rentPrice || property.salePrice || 0;
    if (
      alert.priceMin !== null &&
      price < alert.priceMin * (1 - PRICE_TOLERANCE)
    ) {
      return false;
    }
    if (
      alert.priceMax !== null &&
      price > alert.priceMax * (1 + PRICE_TOLERANCE)
    ) {
      return false;
    }

    // Surface check
    if (
      alert.surfaceMin !== null &&
      property.surfaceTotal < alert.surfaceMin
    ) {
      return false;
    }
    if (
      alert.surfaceMax !== null &&
      property.surfaceTotal > alert.surfaceMax
    ) {
      return false;
    }

    // Last sent check: don't spam (min 24h between emails)
    if (alert.lastSentAt) {
      const hoursSince =
        (Date.now() - alert.lastSentAt.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return false;
      }
    }

    return true;
  });

  // 4. Send emails
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";

  for (const alert of matched) {
    const price = property.rentPrice
      ? `\u20AC${(property.rentPrice / 100).toLocaleString("nl-NL")}/mnd`
      : property.salePrice
        ? `\u20AC${(property.salePrice / 100).toLocaleString("nl-NL")}`
        : "Op aanvraag";

    const matchedCriteria: string[] = [];
    if (property.city) {
      matchedCriteria.push(`Stad: ${property.city}`);
    }
    if (alert.propertyTypes.length > 0) {
      matchedCriteria.push(`Type: ${property.propertyType}`);
    }
    if (alert.priceMin !== null || alert.priceMax !== null) {
      matchedCriteria.push(`Prijs: ${price}`);
    }

    await sendTemplateEmail(
      EmailTemplateId.NEW_PROPERTY_MATCH,
      {
        alertName: alert.name,
        userName: alert.user.name || "there",
        property: {
          title: property.title,
          city: property.city,
          propertyType: property.propertyType,
          price,
          slug: property.slug,
          imageUrl: property.images[0]?.originalUrl,
        },
        matchedCriteria:
          matchedCriteria.length > 0
            ? matchedCriteria
            : ["Algemene overeenkomst"],
        propertyUrl: `${appUrl}/aanbod/${property.slug}`,
        editAlertsUrl: `${appUrl}/dashboard/search-alerts`,
      },
      { to: alert.user.email }
    );
  }

  // 5. Update lastSentAt for matched alerts
  if (matched.length > 0) {
    await prisma.searchAlert.updateMany({
      where: { id: { in: matched.map((a) => a.id) } },
      data: { lastSentAt: new Date() },
    });
  }

  console.log("[search-alerts] match completed", {
    propertyId,
    matched: matched.length,
  });
  return { matched: matched.length };
}

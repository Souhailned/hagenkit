"use server";

import prisma from "@/lib/prisma";

interface RecommendedProperty {
  id: string;
  title: string;
  slug: string;
  city: string;
  propertyType: string;
  rentPrice: number | null;
  surfaceTotal: number | null;
  images: string[];
  matchReason: string;
}

export async function getSimilarProperties(
  propertyId: string,
  limit = 4
): Promise<{ success: boolean; properties: RecommendedProperty[] }> {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        city: true,
        propertyType: true,
        rentPrice: true,
        surfaceTotal: true,
      },
    });

    if (!property) return { success: false, properties: [] };

    // Strategy 1: Same city + same type
    const sameCityType = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        city: property.city,
        propertyType: property.propertyType,
        status: "ACTIVE",
      },
      select: {
        id: true, title: true, slug: true, city: true,
        propertyType: true, rentPrice: true, surfaceTotal: true,
        images: { select: { originalUrl: true }, take: 1 },
      },
      take: limit,
      orderBy: { publishedAt: "desc" },
    });

    const results: RecommendedProperty[] = sameCityType.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      city: p.city,
      propertyType: p.propertyType,
      rentPrice: p.rentPrice,
      surfaceTotal: p.surfaceTotal,
      images: p.images.map(i => i.originalUrl),
      matchReason: `Zelfde type in ${property.city}`,
    }));

    // Strategy 2: Same city, different type (fill remaining)
    if (results.length < limit) {
      const sameCityOther = await prisma.property.findMany({
        where: {
          id: { notIn: [propertyId, ...results.map((r) => r.id)] },
          city: property.city,
          status: "ACTIVE",
        },
        select: {
          id: true, title: true, slug: true, city: true,
          propertyType: true, rentPrice: true, surfaceTotal: true, images: { select: { originalUrl: true }, take: 1 },
        },
        take: limit - results.length,
        orderBy: { publishedAt: "desc" },
      });
      results.push(
        ...sameCityOther.map((p) => ({
          id: p.id, title: p.title, slug: p.slug, city: p.city,
          propertyType: p.propertyType, rentPrice: p.rentPrice,
          surfaceTotal: p.surfaceTotal, images: p.images.map(i => i.originalUrl),
          matchReason: `In ${property.city}`,
        }))
      );
    }

    // Strategy 3: Same type, different city (fill remaining)
    if (results.length < limit) {
      const sameTypeOther = await prisma.property.findMany({
        where: {
          id: { notIn: [propertyId, ...results.map((r) => r.id)] },
          propertyType: property.propertyType,
          status: "ACTIVE",
        },
        select: {
          id: true, title: true, slug: true, city: true,
          propertyType: true, rentPrice: true, surfaceTotal: true, images: { select: { originalUrl: true }, take: 1 },
        },
        take: limit - results.length,
        orderBy: { publishedAt: "desc" },
      });
      results.push(
        ...sameTypeOther.map((p) => ({
          id: p.id, title: p.title, slug: p.slug, city: p.city,
          propertyType: p.propertyType, rentPrice: p.rentPrice,
          surfaceTotal: p.surfaceTotal, images: p.images.map(i => i.originalUrl),
          matchReason: `Vergelijkbaar type`,
        }))
      );
    }

    // Strategy 4: Price range (±30%)
    if (results.length < limit && property.rentPrice) {
      const priceLow = Math.round(property.rentPrice * 0.7);
      const priceHigh = Math.round(property.rentPrice * 1.3);
      const priceMatch = await prisma.property.findMany({
        where: {
          id: { notIn: [propertyId, ...results.map((r) => r.id)] },
          status: "ACTIVE",
          rentPrice: { gte: priceLow, lte: priceHigh },
        },
        select: {
          id: true, title: true, slug: true, city: true,
          propertyType: true, rentPrice: true, surfaceTotal: true, images: { select: { originalUrl: true }, take: 1 },
        },
        take: limit - results.length,
        orderBy: { publishedAt: "desc" },
      });
      results.push(
        ...priceMatch.map((p) => ({
          id: p.id, title: p.title, slug: p.slug, city: p.city,
          propertyType: p.propertyType, rentPrice: p.rentPrice,
          surfaceTotal: p.surfaceTotal, images: p.images.map(i => i.originalUrl),
          matchReason: `Vergelijkbare prijs`,
        }))
      );
    }

    return { success: true, properties: results.slice(0, limit) };
  } catch (error) {
    console.error("Recommendations failed:", error);
    return { success: false, properties: [] };
  }
}

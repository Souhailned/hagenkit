"use server";

import prisma from "@/lib/prisma";

export async function getSimilarProperties(propertyId: string, limit = 3) {
  // Get the current property
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { propertyType: true, city: true, priceType: true, surfaceTotal: true },
  });

  if (!property) return [];

  // Find similar: same type OR same city, exclude current
  const similar = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      status: "ACTIVE",
      OR: [
        { propertyType: property.propertyType },
        { city: property.city },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      propertyType: true,
      priceType: true,
      rentPrice: true,
      salePrice: true,
      surfaceTotal: true,
      images: { where: { isPrimary: true }, take: 1, select: { thumbnailUrl: true, originalUrl: true } },
    },
    orderBy: { viewCount: "desc" },
    take: limit,
  });

  return similar;
}

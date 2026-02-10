"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function duplicateProperty(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  const original = await prisma.property.findFirst({
    where: { id: propertyId, createdById: session.user.id },
  });

  if (!original) return { error: "Pand niet gevonden" };

  const newSlug = `${original.slug}-kopie-${Date.now().toString(36)}`;

  const duplicate = await prisma.property.create({
    data: {
      title: `${original.title} (kopie)`,
      slug: newSlug,
      description: original.description,
      shortDescription: original.shortDescription,
      address: original.address,
      postalCode: original.postalCode,
      city: original.city,
      province: original.province,
      neighborhood: original.neighborhood,
      latitude: original.latitude,
      longitude: original.longitude,
      propertyType: original.propertyType,
      priceType: original.priceType,
      rentPrice: original.rentPrice,
      salePrice: original.salePrice,
      surfaceTotal: original.surfaceTotal,
      buildYear: original.buildYear,
      seatingCapacityInside: original.seatingCapacityInside,
      seatingCapacityOutside: original.seatingCapacityOutside,
      standingCapacity: original.standingCapacity,
      totalCapacity: original.totalCapacity,
      status: "DRAFT",
      viewCount: 0,
      inquiryCount: 0,
      createdById: session.user.id,
      agencyId: original.agencyId,
    },
  });

  return { success: true, propertyId: duplicate.id, slug: duplicate.slug };
}

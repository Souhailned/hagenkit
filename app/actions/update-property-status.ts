"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type PropertyStatus = "DRAFT" | "ACTIVE" | "UNDER_OFFER" | "RENTED" | "SOLD" | "ARCHIVED";

export async function updatePropertyStatus(propertyId: string, status: PropertyStatus) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Niet ingelogd" };
  }

  // Verify ownership
  const property = await prisma.property.findFirst({
    where: { id: propertyId, createdById: session.user.id },
  });

  if (!property) {
    return { error: "Pand niet gevonden of geen toegang" };
  }

  const updateData: Record<string, unknown> = { status };

  // Set publishedAt when activating
  if (status === "ACTIVE" && !property.publishedAt) {
    updateData.publishedAt = new Date();
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: updateData,
  });

  return { success: true, status };
}

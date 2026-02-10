"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type PropertyStatus = "DRAFT" | "ACTIVE" | "UNDER_OFFER" | "RENTED" | "SOLD" | "ARCHIVED";

export async function bulkUpdateStatus(propertyIds: string[], status: PropertyStatus) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  if (propertyIds.length === 0) return { error: "Geen panden geselecteerd" };
  if (propertyIds.length > 50) return { error: "Maximaal 50 panden tegelijk" };

  const result = await prisma.property.updateMany({
    where: {
      id: { in: propertyIds },
      createdById: session.user.id,
    },
    data: {
      status,
      ...(status === "ACTIVE" ? { publishedAt: new Date() } : {}),
    },
  });

  return { success: true, updated: result.count };
}

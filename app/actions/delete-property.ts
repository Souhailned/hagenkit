"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function deleteProperty(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  const property = await prisma.property.findFirst({
    where: { id: propertyId, createdById: session.user.id },
  });

  if (!property) return { error: "Pand niet gevonden of geen toegang" };

  // Soft delete - archive instead of hard delete
  await prisma.property.update({
    where: { id: propertyId },
    data: { status: "ARCHIVED" },
  });

  return { success: true };
}

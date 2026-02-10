"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface UpdatePropertyInput {
  id: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  rentPrice?: number | null;
  salePrice?: number | null;
  surfaceTotal?: number;
  buildYear?: number | null;
  seatingCapacityInside?: number | null;
  seatingCapacityOutside?: number | null;
}

export async function updateProperty(input: UpdatePropertyInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  const property = await prisma.property.findFirst({
    where: { id: input.id, createdById: session.user.id },
  });

  if (!property) return { error: "Pand niet gevonden of geen toegang" };

  const { id, ...data } = input;

  const updated = await prisma.property.update({
    where: { id },
    data,
  });

  return { success: true, slug: updated.slug };
}

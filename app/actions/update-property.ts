"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updatePropertySchema, type UpdatePropertyInput } from "@/lib/validations/property";

export async function updateProperty(rawInput: UpdatePropertyInput) {
  // Validate input
  const input = updatePropertySchema.parse(rawInput);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { error: "Niet ingelogd" };

  const property = await prisma.property.findFirst({
    where: { id: input.id, createdById: session.user.id },
  });

  if (!property) return { error: "Pand niet gevonden of geen toegang" };

  const { id, ...data } = input;

  const updated = await prisma.property.update({
    where: { id },
    data: data as Parameters<typeof prisma.property.update>[0]["data"],
  });

  return { success: true, slug: updated.slug };
}

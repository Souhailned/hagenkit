"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface CreatePropertyInput {
  // Step 1: Basis
  title: string;
  propertyType: string;
  priceType: string;
  rentPrice?: number;
  salePrice?: number;

  // Step 2: Locatie
  address: string;
  city: string;
  postalCode: string;
  province?: string;

  // Step 3: Details
  surfaceTotal: number;
  surfaceCommercial?: number;
  surfaceKitchen?: number;
  surfaceTerrace?: number;
  floors?: number;
  seatingCapacityInside?: number;
  seatingCapacityOutside?: number;

  // Step 4: Beschrijving
  description?: string;
  shortDescription?: string;
}

function generateSlug(title: string, city: string): string {
  const base = `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

export async function createProperty(input: CreatePropertyInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Je moet ingelogd zijn" };
  }

  // Get user's agency (or create one)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { agencyMemberships: { include: { agency: true } } },
  });

  let agencyId: string;

  if (user?.agencyMemberships?.[0]?.agencyId) {
    agencyId = user.agencyMemberships[0].agencyId;
  } else {
    // Auto-create agency for first-time agents
    const agency = await prisma.agency.create({
      data: {
        name: `${user?.name || "Mijn"} Makelaardij`,
        slug: `agency-${Date.now().toString(36)}`,
        members: {
          create: { userId: session.user.id, role: "OWNER" },
        },
      },
    });
    agencyId = agency.id;
  }

  const slug = generateSlug(input.title, input.city);

  const property = await prisma.property.create({
    data: {
      title: input.title,
      slug,
      propertyType: input.propertyType as any,
      priceType: input.priceType as any,
      rentPrice: input.rentPrice ? input.rentPrice * 100 : null, // Convert to cents
      salePrice: input.salePrice ? input.salePrice * 100 : null,
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      province: input.province,
      surfaceTotal: input.surfaceTotal,
      surfaceCommercial: input.surfaceCommercial,
      surfaceKitchen: input.surfaceKitchen,
      surfaceTerrace: input.surfaceTerrace,
      floors: input.floors || 1,
      seatingCapacityInside: input.seatingCapacityInside,
      seatingCapacityOutside: input.seatingCapacityOutside,
      description: input.description,
      shortDescription: input.shortDescription,
      status: "DRAFT",
      agencyId,
      createdById: session.user.id,
    },
  });

  return { success: true, propertyId: property.id, slug: property.slug };
}

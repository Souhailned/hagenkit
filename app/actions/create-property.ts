"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createPropertySchema } from "@/lib/validations/property";
import type { ActionResult } from "@/types/actions";
import type { z } from "zod";

function generateSlug(title: string, city: string): string {
  const base = `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Subset schema for the wizard — only the fields the wizard sends.
 * The full createPropertySchema has many optional fields the wizard doesn't use.
 */
const wizardInputSchema = createPropertySchema.pick({
  title: true,
  propertyType: true,
  priceType: true,
  rentPrice: true,
  salePrice: true,
  address: true,
  city: true,
  postalCode: true,
  province: true,
  surfaceTotal: true,
  surfaceCommercial: true,
  surfaceKitchen: true,
  surfaceTerrace: true,
  floors: true,
  seatingCapacityInside: true,
  seatingCapacityOutside: true,
  description: true,
  shortDescription: true,
});

type WizardInput = z.infer<typeof wizardInputSchema>;

export async function createProperty(
  input: WizardInput
): Promise<ActionResult<{ propertyId: string; slug: string }>> {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Je moet ingelogd zijn" };
    }

    // 2. Validate input with Zod
    const validated = wizardInputSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }
    const data = validated.data;

    // 3. Get user's agency (or create one)
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

    // 4. Create property
    const slug = generateSlug(data.title, data.city);

    const property = await prisma.property.create({
      data: {
        title: data.title,
        slug,
        propertyType: data.propertyType,
        priceType: data.priceType,
        rentPrice: data.rentPrice ? data.rentPrice * 100 : null, // Convert to cents
        salePrice: data.salePrice ? data.salePrice * 100 : null,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        province: data.province,
        surfaceTotal: data.surfaceTotal,
        surfaceCommercial: data.surfaceCommercial,
        surfaceKitchen: data.surfaceKitchen,
        surfaceTerrace: data.surfaceTerrace,
        floors: data.floors ?? 1,
        seatingCapacityInside: data.seatingCapacityInside,
        seatingCapacityOutside: data.seatingCapacityOutside,
        description: data.description,
        shortDescription: data.shortDescription,
        status: "DRAFT",
        agencyId,
        createdById: session.user.id,
      },
    });

    return { success: true, data: { propertyId: property.id, slug: property.slug } };
  } catch (error) {
    console.error("Error creating property:", error);
    return { success: false, error: "Er ging iets mis bij het aanmaken van het pand" };
  }
}

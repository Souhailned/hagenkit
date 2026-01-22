"use server";

import prisma from "@/lib/prisma";
import { propertyInquirySchema, propertyViewSchema, type PropertyInquiryInput, type PropertyViewInput } from "@/lib/validations/property";
import { headers } from "next/headers";
import crypto from "crypto";

// ActionResult type for consistent response format
type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Property with relations type
export type PropertyWithRelations = Awaited<ReturnType<typeof getPropertyBySlug>>["data"];

/**
 * Get a property by its slug with all related data
 */
export async function getPropertyBySlug(slug: string): Promise<ActionResult<{
  id: string;
  slug: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  address: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  province: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;
  priceType: "RENT" | "SALE" | "RENT_OR_SALE";
  rentPrice: number | null;
  rentPriceMin: number | null;
  salePrice: number | null;
  salePriceMin: number | null;
  priceNegotiable: boolean;
  servicesCosts: number | null;
  depositMonths: number | null;
  surfaceTotal: number;
  surfaceCommercial: number | null;
  surfaceKitchen: number | null;
  surfaceStorage: number | null;
  surfaceTerrace: number | null;
  surfaceBasement: number | null;
  floors: number;
  ceilingHeight: number | null;
  propertyType: string;
  status: string;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  standingCapacity: number | null;
  kitchenType: string | null;
  hasBasement: boolean;
  hasStorage: boolean;
  hasTerrace: boolean;
  hasParking: boolean;
  parkingSpaces: number | null;
  previousUse: string | null;
  wasHoreca: boolean;
  previousHorecaType: string | null;
  yearsHoreca: number | null;
  buildYear: number | null;
  lastRenovation: number | null;
  monumentStatus: boolean;
  energyLabel: string | null;
  horecaScore: string | null;
  horecaScoreDetails: unknown;
  locationScore: number | null;
  footfallEstimate: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  featured: boolean;
  availableFrom: Date | null;
  availableUntil: Date | null;
  minimumLeaseTerm: number | null;
  publishedAt: Date | null;
  viewCount: number;
  inquiryCount: number;
  savedCount: number;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    originalUrl: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    largeUrl: string | null;
    enhancedUrl: string | null;
    type: string;
    caption: string | null;
    altText: string | null;
    order: number;
    isPrimary: boolean;
  }>;
  features: Array<{
    id: string;
    category: string;
    key: string;
    value: string | null;
    numericValue: number | null;
    booleanValue: boolean | null;
    verified: boolean;
    highlighted: boolean;
    displayOrder: number;
  }>;
  agency: {
    id: string;
    name: string;
    slug: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    logoUrl: string | null;
    description: string | null;
    city: string | null;
    province: string | null;
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
  };
} | null>> {
  try {
    const property = await prisma.property.findUnique({
      where: {
        slug,
        status: "ACTIVE",
      },
      include: {
        images: {
          orderBy: [
            { isPrimary: "desc" },
            { order: "asc" },
          ],
          select: {
            id: true,
            originalUrl: true,
            thumbnailUrl: true,
            mediumUrl: true,
            largeUrl: true,
            enhancedUrl: true,
            type: true,
            caption: true,
            altText: true,
            order: true,
            isPrimary: true,
          },
        },
        features: {
          orderBy: [
            { highlighted: "desc" },
            { displayOrder: "asc" },
          ],
          select: {
            id: true,
            category: true,
            key: true,
            value: true,
            numericValue: true,
            booleanValue: true,
            verified: true,
            highlighted: true,
            displayOrder: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            phone: true,
            website: true,
            logoUrl: true,
            description: true,
            city: true,
            province: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
      },
    });

    return { success: true, data: property };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, error: "Er is een fout opgetreden bij het ophalen van het pand" };
  }
}

/**
 * Get similar properties based on type, city, and price range
 */
export async function getSimilarProperties(
  propertyId: string,
  propertyType: string,
  city: string,
  priceType: string,
  limit: number = 3
): Promise<ActionResult<Array<{
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  city: string;
  priceType: string;
  rentPrice: number | null;
  salePrice: number | null;
  surfaceTotal: number;
  propertyType: string;
  images: Array<{
    id: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    isPrimary: boolean;
  }>;
}>>> {
  try {
    const properties = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: "ACTIVE",
        OR: [
          // Note: propertyType is a Prisma enum (PropertyType)
          { propertyType: { equals: propertyType } },
          { city },
        ],
      },
      take: limit,
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        city: true,
        priceType: true,
        rentPrice: true,
        salePrice: true,
        surfaceTotal: true,
        propertyType: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            id: true,
            thumbnailUrl: true,
            mediumUrl: true,
            isPrimary: true,
          },
        },
      },
    });

    return { success: true, data: properties };
  } catch (error) {
    console.error("Error fetching similar properties:", error);
    return { success: false, error: "Er is een fout opgetreden" };
  }
}

/**
 * Record a property view
 */
export async function recordPropertyView(input: PropertyViewInput): Promise<ActionResult<{ viewId: string }>> {
  try {
    const validated = propertyViewSchema.parse(input);

    // Get IP hash for unique view tracking
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0] || "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);

    // Check if this is a unique view (same IP in last 24 hours)
    const existingView = await prisma.propertyView.findFirst({
      where: {
        propertyId: validated.propertyId,
        ipHash,
        viewedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingView) {
      return { success: true, data: { viewId: existingView.id } };
    }

    // Create new view record
    const view = await prisma.propertyView.create({
      data: {
        propertyId: validated.propertyId,
        sessionId: validated.sessionId,
        ipHash,
        source: validated.source,
        deviceType: validated.deviceType,
      },
    });

    // Increment view count on property (cached counter)
    await prisma.property.update({
      where: { id: validated.propertyId },
      data: { viewCount: { increment: 1 } },
    });

    return { success: true, data: { viewId: view.id } };
  } catch (error) {
    console.error("Error recording property view:", error);
    return { success: false, error: "Er is een fout opgetreden" };
  }
}

/**
 * Create a property inquiry
 */
export async function createPropertyInquiry(input: PropertyInquiryInput): Promise<ActionResult<{ inquiryId: string }>> {
  try {
    const validated = propertyInquirySchema.parse(input);

    // Create the inquiry
    const inquiry = await prisma.propertyInquiry.create({
      data: {
        propertyId: validated.propertyId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        message: validated.message,
        conceptDescription: validated.conceptDescription || null,
        budget: validated.budget || null,
        intendedUse: validated.intendedUse || null,
        source: "WEBSITE",
      },
    });

    // Increment inquiry count on property
    await prisma.property.update({
      where: { id: validated.propertyId },
      data: { inquiryCount: { increment: 1 } },
    });

    // TODO: Send email notification to agency

    return { success: true, data: { inquiryId: inquiry.id } };
  } catch (error) {
    console.error("Error creating property inquiry:", error);
    if (error instanceof Error && error.message.includes("validation")) {
      return { success: false, error: "Ongeldige invoer. Controleer alle velden." };
    }
    return { success: false, error: "Er is een fout opgetreden bij het versturen van uw bericht" };
  }
}

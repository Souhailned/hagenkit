"use server";

import { ActionResult } from "@/types/actions";
import {
  SearchPropertiesResult,
  Property,
  SortOption,
  PropertyType,
  PropertyFeature,
} from "@/types/property";
import {
  searchPropertiesSchema,
  SearchPropertiesInput,
} from "@/lib/validations/property";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Standard includes for property queries
const propertyIncludes = {
  images: {
    orderBy: { order: "asc" as const },
  },
  features: {
    orderBy: { displayOrder: "asc" as const },
  },
  financials: true,
  agency: {
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
} satisfies Prisma.PropertyInclude;

// Minimal includes for list views
const propertyListIncludes = {
  images: {
    where: { isPrimary: true },
    take: 1,
  },
  agency: {
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
    },
  },
} satisfies Prisma.PropertyInclude;

/**
 * Map a Prisma property result to the Property interface expected by the UI.
 * Adds backward-compatible `type`, `price`, `area`, `features`, `isFeatured`, `isNew` fields.
 */
function mapProperty(p: any): Property {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const isNew = p.publishedAt ? new Date(p.publishedAt) > sevenDaysAgo : new Date(p.createdAt) > sevenDaysAgo;

  // Derive legacy price field
  let price: number | undefined;
  if (p.priceType === "RENT" || p.priceType === "RENT_OR_SALE") {
    price = p.rentPrice ? Math.round(p.rentPrice / 100) : undefined;
  } else {
    price = p.salePrice ? Math.round(p.salePrice / 100) : undefined;
  }

  // Derive legacy features array from PropertyFeature records
  const featureKeys: string[] = [];
  if (p.features?.length) {
    for (const f of p.features) {
      if (f.booleanValue === true) {
        // Map DB keys to legacy UI feature keys
        const keyMap: Record<string, string> = {
          alcohol_license: "ALCOHOL_LICENSE",
          terrace_license: "TERRACE",
          professional_kitchen: "KITCHEN",
          extraction_system: "VENTILATION",
          wheelchair_accessible: "WHEELCHAIR_ACCESSIBLE",
          cold_storage: "CELLAR",
          bar_setup: "ALCOHOL_LICENSE",
        };
        const mapped = keyMap[f.key];
        if (mapped && !featureKeys.includes(mapped)) featureKeys.push(mapped);
      }
    }
  }
  // Also add boolean-based features
  if (p.hasTerrace && !featureKeys.includes("TERRACE")) featureKeys.push("TERRACE");
  if (p.hasParking && !featureKeys.includes("PARKING")) featureKeys.push("PARKING");
  if (p.hasBasement && !featureKeys.includes("CELLAR")) featureKeys.push("CELLAR");

  return {
    ...p,
    // Legacy compat fields
    type: p.propertyType,
    price,
    area: p.surfaceTotal,
    features: featureKeys,
    featureRecords: p.features,
    isFeatured: p.featured,
    isNew,
    // Ensure images is always an array
    images: p.images ?? [],
    // Dates
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

/**
 * Search and filter properties with pagination.
 */
export async function searchProperties(
  params: SearchPropertiesInput
): Promise<ActionResult<SearchPropertiesResult>> {
  try {
    const validatedParams = searchPropertiesSchema.parse(params);

    const {
      page = 1,
      pageSize = 12,
      sortBy = "newest",
      search,
      cities,
      types,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      features,
    } = validatedParams;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      status: "ACTIVE",
    };

    // Search filter
    if (search?.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    // City filter
    if (cities?.length) {
      where.city = { in: cities };
    }

    // Type filter
    if (types?.length) {
      where.propertyType = { in: types };
    }

    // Price filter (params are in display euros for legacy compat, DB is in centen)
    if (priceMin !== undefined) {
      where.OR = [
        ...(Array.isArray(where.OR) ? where.OR : []),
      ];
      // Apply to both rent and sale price
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { rentPrice: { gte: priceMin } },
            { salePrice: { gte: priceMin } },
          ],
        },
      ];
    }
    if (priceMax !== undefined) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            { rentPrice: { lte: priceMax } },
            { salePrice: { lte: priceMax } },
          ],
        },
      ];
    }

    // Area filter
    if (areaMin !== undefined) {
      where.surfaceTotal = { ...(where.surfaceTotal as any), gte: areaMin };
    }
    if (areaMax !== undefined) {
      where.surfaceTotal = { ...(where.surfaceTotal as any), lte: areaMax };
    }

    // Features filter (check PropertyFeature records)
    if (features?.length) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        ...features.map((key) => ({
          features: {
            some: {
              key,
              booleanValue: true,
            },
          },
        })),
      ];
    }

    // Sorting
    let orderBy: Prisma.PropertyOrderByWithRelationInput;
    switch (sortBy) {
      case "newest":
        orderBy = { publishedAt: "desc" };
        break;
      case "price_low_high":
        orderBy = { rentPrice: "asc" };
        break;
      case "price_high_low":
        orderBy = { salePrice: "desc" };
        break;
      case "area":
        orderBy = { surfaceTotal: "desc" };
        break;
      default:
        orderBy = { publishedAt: "desc" };
    }

    // Execute query with count
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: propertyListIncludes,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    const pageCount = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        properties: properties.map(mapProperty),
        total,
        pageCount,
        page,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Error searching properties:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Er is een fout opgetreden bij het zoeken naar panden",
    };
  }
}

/**
 * Get available filter options from the database.
 */
export async function getFilterOptions(): Promise<
  ActionResult<{
    cities: string[];
    types: { value: PropertyType; label: string }[];
    features: { value: PropertyFeature; label: string }[];
    priceRange: { min: number; max: number };
    areaRange: { min: number; max: number };
  }>
> {
  try {
    const { PropertyTypeLabels, PropertyFeatureLabels } = await import(
      "@/types/property"
    );

    // Get distinct cities
    const cityResults = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    });
    const cities = cityResults.map((r) => r.city);

    // Get distinct property types in use
    const typeResults = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { propertyType: true },
      distinct: ["propertyType"],
    });
    const types = typeResults.map((r) => ({
      value: r.propertyType as PropertyType,
      label: PropertyTypeLabels[r.propertyType as PropertyType] || r.propertyType,
    }));

    // Get popular features from PropertyFeature table
    const featureResults = await prisma.propertyFeature.groupBy({
      by: ["key"],
      where: { booleanValue: true, property: { status: "ACTIVE" } },
      _count: { key: true },
      orderBy: { _count: { key: "desc" } },
      take: 8,
    });

    // Map DB feature keys to UI PropertyFeature keys
    const dbToUiKeyMap: Record<string, PropertyFeature> = {
      alcohol_license: "ALCOHOL_LICENSE" as PropertyFeature,
      terrace_license: "TERRACE" as PropertyFeature,
      professional_kitchen: "KITCHEN" as PropertyFeature,
      extraction_system: "VENTILATION" as PropertyFeature,
      wheelchair_accessible: "WHEELCHAIR_ACCESSIBLE" as PropertyFeature,
      cold_storage: "CELLAR" as PropertyFeature,
      bar_setup: "ALCOHOL_LICENSE" as PropertyFeature,
    };

    const seenFeatures = new Set<string>();
    const features: { value: PropertyFeature; label: string }[] = [];
    for (const r of featureResults) {
      const uiKey = dbToUiKeyMap[r.key];
      if (uiKey && !seenFeatures.has(uiKey)) {
        seenFeatures.add(uiKey);
        features.push({
          value: uiKey,
          label: PropertyFeatureLabels[uiKey] || r.key,
        });
      }
    }

    // Get price and area ranges
    const aggregates = await prisma.property.aggregate({
      where: { status: "ACTIVE" },
      _min: { rentPrice: true, salePrice: true, surfaceTotal: true },
      _max: { rentPrice: true, salePrice: true, surfaceTotal: true },
    });

    const allMinPrices = [aggregates._min.rentPrice, aggregates._min.salePrice].filter(Boolean) as number[];
    const allMaxPrices = [aggregates._max.rentPrice, aggregates._max.salePrice].filter(Boolean) as number[];

    return {
      success: true,
      data: {
        cities,
        types,
        features,
        priceRange: {
          min: allMinPrices.length ? Math.min(...allMinPrices) : 0,
          max: allMaxPrices.length ? Math.max(...allMaxPrices) : 0,
        },
        areaRange: {
          min: aggregates._min.surfaceTotal ?? 0,
          max: aggregates._max.surfaceTotal ?? 0,
        },
      },
    };
  } catch (error) {
    console.error("Error getting filter options:", error);
    return {
      success: false,
      error: "Er is een fout opgetreden bij het ophalen van filteropties",
    };
  }
}

/**
 * Get a single property by slug for the detail page.
 */
export async function getPropertyBySlug(
  slug: string
): Promise<ActionResult<Property | null>> {
  try {
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        ...propertyIncludes,
        installations: {
          orderBy: { category: "asc" },
        },
        licenses: true,
      },
    });

    if (!property || property.status !== "ACTIVE") {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: mapProperty(property),
    };
  } catch (error) {
    console.error("Error getting property:", error);
    return {
      success: false,
      error: "Er is een fout opgetreden bij het ophalen van het pand",
    };
  }
}

/**
 * Get featured properties for the homepage.
 */
export async function getFeaturedProperties(): Promise<
  ActionResult<Property[]>
> {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      include: propertyListIncludes,
      orderBy: { publishedAt: "desc" },
      take: 4,
    });

    return {
      success: true,
      data: properties.map(mapProperty),
    };
  } catch (error) {
    console.error("Error getting featured properties:", error);
    return {
      success: false,
      error: "Er is een fout opgetreden bij het ophalen van uitgelichte panden",
    };
  }
}

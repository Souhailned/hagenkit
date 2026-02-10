"use server";

import {
  type PropertyFilter,
  type PropertyType,
  type PriceType,
  type SortBy,
  type SortOrder,
  listPropertiesSchema,
} from "@/lib/validations/property";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ActionResult type for consistent returns
type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Property type for search results (matches Prisma model)
export interface PropertySearchResult {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  propertyType: PropertyType;
  priceType: PriceType;
  rentPrice: number | null;
  salePrice: number | null;
  city: string;
  province: string | null;
  address: string;
  surfaceTotal: number;
  hasTerrace: boolean;
  hasKitchen: boolean;
  hasParking: boolean;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  publishedAt: Date | null;
  viewCount: number;
  savedCount: number;
  primaryImage: {
    thumbnailUrl: string;
    altText: string | null;
  } | null;
  agency: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface SearchPropertiesResult {
  items: PropertySearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Input type for search
export interface SearchPropertiesInput {
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  filters?: PropertyFilter;
  search?: string;
}

// Removed mock data - using real Prisma queries below
// Shared select for property search results
const propertySearchSelect = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  propertyType: true,
  priceType: true,
  rentPrice: true,
  salePrice: true,
  city: true,
  province: true,
  address: true,
  surfaceTotal: true,
  hasTerrace: true,
  kitchenType: true,
  hasParking: true,
  seatingCapacityInside: true,
  seatingCapacityOutside: true,
  publishedAt: true,
  viewCount: true,
  savedCount: true,
  images: {
    where: { isPrimary: true as const },
    take: 1,
    select: { thumbnailUrl: true, altText: true },
  },
  agency: {
    select: { id: true, name: true, slug: true },
  },
} satisfies Prisma.PropertySelect;

function mapToSearchResult(p: any): PropertySearchResult {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    propertyType: p.propertyType as PropertyType,
    priceType: p.priceType as PriceType,
    rentPrice: p.rentPrice,
    salePrice: p.salePrice,
    city: p.city,
    province: p.province,
    address: p.address,
    surfaceTotal: p.surfaceTotal,
    hasTerrace: p.hasTerrace,
    hasKitchen: p.kitchenType !== null,
    hasParking: p.hasParking,
    seatingCapacityInside: p.seatingCapacityInside,
    seatingCapacityOutside: p.seatingCapacityOutside,
    publishedAt: p.publishedAt,
    viewCount: p.viewCount,
    savedCount: p.savedCount,
    primaryImage: p.images?.[0] ? { thumbnailUrl: p.images[0].thumbnailUrl ?? "", altText: p.images[0].altText ?? null } : null,
    agency: p.agency,
  };
}

// Mock data removed — using real Prisma queries below

/**
 * Search properties with filters, pagination, and sorting
 * This action is used on the public listings page with SSR
 */
export async function searchProperties(
  input: SearchPropertiesInput
): Promise<ActionResult<SearchPropertiesResult>> {
  try {
    // Validate input
    const validated = listPropertiesSchema.parse({
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      sortBy: input.sortBy ?? "publishedAt",
      sortOrder: input.sortOrder ?? "desc",
      filters: input.filters,
      search: input.search,
    });

    // Build Prisma where clause
    const where: Prisma.PropertyWhereInput = {
      status: "ACTIVE",
    };

    // Search filter (title, description, city, address)
    if (validated.search) {
      where.OR = [
        { title: { contains: validated.search, mode: "insensitive" } },
        { shortDescription: { contains: validated.search, mode: "insensitive" } },
        { description: { contains: validated.search, mode: "insensitive" } },
        { city: { contains: validated.search, mode: "insensitive" } },
        { address: { contains: validated.search, mode: "insensitive" } },
      ];
    }

    // Apply property filters
    if (validated.filters) {
      const { filters } = validated;

      // City filter
      if (filters.cities && filters.cities.length > 0) {
        where.city = { in: filters.cities };
      }

      // Province filter
      if (filters.provinces && filters.provinces.length > 0) {
        where.province = { in: filters.provinces };
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        where.propertyType = { in: filters.propertyTypes };
      }

      // Price type filter
      if (filters.priceType) {
        where.OR = [
          { priceType: filters.priceType },
          { priceType: "RENT_OR_SALE" },
        ];
      }

      // Price range filter (rent or sale based on filter priceType)
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        const priceField = filters.priceType === "SALE" ? "salePrice" as const : "rentPrice" as const;
        const priceFilter: Record<string, number> = {};
        if (filters.priceMin !== undefined) priceFilter.gte = filters.priceMin;
        if (filters.priceMax !== undefined) priceFilter.lte = filters.priceMax;
        where[priceField] = priceFilter;
      }

      // Surface filter
      if (filters.surfaceMin !== undefined || filters.surfaceMax !== undefined) {
        const surfaceFilter: Record<string, number> = {};
        if (filters.surfaceMin !== undefined) surfaceFilter.gte = filters.surfaceMin;
        if (filters.surfaceMax !== undefined) surfaceFilter.lte = filters.surfaceMax;
        where.surfaceTotal = surfaceFilter;
      }

      // Feature filters
      if (filters.hasTerrace !== undefined) {
        where.hasTerrace = filters.hasTerrace;
      }
      if (filters.hasKitchen !== undefined) {
        // Since hasKitchen is derived from kitchenType, check kitchenType is not null/none
        where.kitchenType = filters.hasKitchen ? { not: null } : null;
      }
      if (filters.hasParking !== undefined) {
        where.hasParking = filters.hasParking;
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    switch (validated.sortBy) {
      case "publishedAt":
        orderBy.publishedAt = validated.sortOrder;
        break;
      case "rentPrice":
        orderBy.rentPrice = validated.sortOrder;
        break;
      case "salePrice":
        orderBy.salePrice = validated.sortOrder;
        break;
      case "surfaceTotal":
        orderBy.surfaceTotal = validated.sortOrder;
        break;
      case "viewCount":
        orderBy.viewCount = validated.sortOrder;
        break;
    }

    // Query properties with count
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip: (validated.page - 1) * validated.limit,
        take: validated.limit,
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          propertyType: true,
          priceType: true,
          rentPrice: true,
          salePrice: true,
          city: true,
          province: true,
          address: true,
          surfaceTotal: true,
          hasTerrace: true,
          kitchenType: true,
          hasParking: true,
          seatingCapacityInside: true,
          seatingCapacityOutside: true,
          publishedAt: true,
          viewCount: true,
          savedCount: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              thumbnailUrl: true,
              altText: true,
            },
          },
          agency: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    // Map to result type
    const items: PropertySearchResult[] = properties.map(mapToSearchResult);

    const totalPages = Math.ceil(total / validated.limit);

    return {
      success: true,
      data: {
        items,
        total,
        page: validated.page,
        limit: validated.limit,
        totalPages,
        hasMore: validated.page < totalPages,
      },
    };
  } catch (error) {
    console.error("Error searching properties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Er ging iets mis bij het zoeken",
    };
  }
}

/**
 * Get featured properties for homepage
 */
export async function getFeaturedProperties(
  limit: number = 4
): Promise<ActionResult<PropertySearchResult[]>> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE", featured: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: propertySearchSelect,
    });
    const featured: PropertySearchResult[] = properties.map(mapToSearchResult);
    return { success: true, data: featured };
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return {
      success: false,
      error: "Kon uitgelichte panden niet laden",
    };
  }
}

/**
 * Get recent properties
 */
export async function getRecentProperties(
  limit: number = 6
): Promise<ActionResult<PropertySearchResult[]>> {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: propertySearchSelect,
    });
    const recent: PropertySearchResult[] = properties.map(mapToSearchResult);
    return { success: true, data: recent };
  } catch (error) {
    console.error("Error fetching recent properties:", error);
    return {
      success: false,
      error: "Kon recente panden niet laden",
    };
  }
}

/**
 * Get unique cities from properties for filter options
 */
export async function getPropertyCities(): Promise<ActionResult<string[]>> {
  try {
    const results = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    });
    const cities = results.map((r) => r.city);
    return { success: true, data: cities };
  } catch {
    return { success: false, error: "Kon steden niet laden" };
  }
}

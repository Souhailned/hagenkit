"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./user";
import type { ActionResult } from "@/types/actions";
import {
  listPropertiesSchema,
  type ListPropertiesInput,
  type PropertyFilterInput,
} from "@/lib/validations/property";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Property summary type for list views
 * Includes primary image and key stats
 */
export interface PropertySummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  propertyType: string | null;
  status: string;
  priceType: string | null;
  rentPrice: number | null;
  salePrice: number | null;
  city: string | null;
  province: string | null;
  surfaceTotal: number;
  hasTerrace: boolean | null;
  hasKitchen: boolean;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  viewCount: number;
  inquiryCount: number;
  savedCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  primaryImage: {
    id: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    altText: string | null;
  } | null;
  agency: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
}

/**
 * Paginated search result type
 */
export interface PropertySearchResult {
  items: PropertySummary[];
  total: number;
  hasMore: boolean;
  page: number;
  pageCount: number;
}

/**
 * Select fields for property summary queries
 */
const propertySummarySelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  propertyType: true,
  status: true,
  priceType: true,
  rentPrice: true,
  salePrice: true,
  city: true,
  province: true,
  surfaceTotal: true,
  hasTerrace: true,
  surfaceKitchen: true,
  seatingCapacityInside: true,
  seatingCapacityOutside: true,
  viewCount: true,
  inquiryCount: true,
  savedCount: true,
  publishedAt: true,
  createdAt: true,
  images: {
    where: { isPrimary: true },
    take: 1,
    select: {
      id: true,
      thumbnailUrl: true,
      mediumUrl: true,
      altText: true,
    },
  },
  agency: {
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
    },
  },
} as const;

/**
 * Transform raw property data to PropertySummary
 */
function toPropertySummary(property: {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  propertyType: string | null;
  status: string;
  priceType: string | null;
  rentPrice: number | null;
  salePrice: number | null;
  city: string | null;
  province: string | null;
  surfaceTotal: number;
  hasTerrace: boolean | null;
  surfaceKitchen: number | null;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  viewCount: number;
  inquiryCount: number;
  savedCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  images: Array<{
    id: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    altText: string | null;
  }>;
  agency: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
}): PropertySummary {
  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    shortDescription: property.shortDescription,
    propertyType: property.propertyType,
    status: property.status,
    priceType: property.priceType,
    rentPrice: property.rentPrice,
    salePrice: property.salePrice,
    city: property.city,
    province: property.province,
    surfaceTotal: property.surfaceTotal,
    hasTerrace: property.hasTerrace,
    hasKitchen: property.surfaceKitchen != null && property.surfaceKitchen > 0,
    seatingCapacityInside: property.seatingCapacityInside,
    seatingCapacityOutside: property.seatingCapacityOutside,
    viewCount: property.viewCount,
    inquiryCount: property.inquiryCount,
    savedCount: property.savedCount,
    publishedAt: property.publishedAt,
    createdAt: property.createdAt,
    primaryImage: property.images[0] ?? null,
    agency: property.agency,
  };
}

/**
 * Build Prisma where clause from filter input
 */
function buildWhereClause(
  filters?: PropertyFilterInput,
  search?: string,
  statusFilter: string | string[] = "ACTIVE"
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};

  // Status filter (default to ACTIVE for public searches)
  if (Array.isArray(statusFilter)) {
    where.status = { in: statusFilter as Prisma.Enumerable<string> };
  } else {
    where.status = statusFilter;
  }

  // Search by title or description
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { neighborhood: { contains: search, mode: "insensitive" } },
    ];
  }

  if (!filters) return where;

  // Location filters
  if (filters.cities && filters.cities.length > 0) {
    where.city = { in: filters.cities, mode: "insensitive" };
  }

  if (filters.provinces && filters.provinces.length > 0) {
    where.province = { in: filters.provinces, mode: "insensitive" };
  }

  // Property type filter
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    where.propertyType = { in: filters.propertyTypes as Prisma.Enumerable<string> };
  }

  // Price type filter
  if (filters.priceType) {
    where.priceType = filters.priceType;
  }

  // Price range filters
  if (filters.priceMin || filters.priceMax) {
    // Determine which price field to filter based on priceType
    const priceField = filters.priceType === "SALE" ? "salePrice" : "rentPrice";

    if (filters.priceMin && filters.priceMax) {
      where[priceField] = {
        gte: filters.priceMin,
        lte: filters.priceMax,
      };
    } else if (filters.priceMin) {
      where[priceField] = { gte: filters.priceMin };
    } else if (filters.priceMax) {
      where[priceField] = { lte: filters.priceMax };
    }
  }

  // Surface area filters
  if (filters.surfaceMin || filters.surfaceMax) {
    if (filters.surfaceMin && filters.surfaceMax) {
      where.surfaceTotal = {
        gte: filters.surfaceMin,
        lte: filters.surfaceMax,
      };
    } else if (filters.surfaceMin) {
      where.surfaceTotal = { gte: filters.surfaceMin };
    } else if (filters.surfaceMax) {
      where.surfaceTotal = { lte: filters.surfaceMax };
    }
  }

  // Boolean feature filters
  if (filters.hasTerrace !== undefined) {
    where.hasTerrace = filters.hasTerrace;
  }

  if (filters.hasKitchen !== undefined && filters.hasKitchen) {
    where.surfaceKitchen = { gt: 0 };
  }

  if (filters.hasBasement !== undefined) {
    where.hasBasement = filters.hasBasement;
  }

  if (filters.hasStorage !== undefined) {
    where.hasStorage = filters.hasStorage;
  }

  if (filters.hasParking !== undefined) {
    where.hasParking = filters.hasParking;
  }

  // Seating capacity filters
  if (filters.seatingCapacityMin || filters.seatingCapacityMax) {
    // Filter on combined inside + outside seating capacity
    if (filters.seatingCapacityMin) {
      where.seatingCapacityInside = { gte: filters.seatingCapacityMin };
    }
    if (filters.seatingCapacityMax) {
      where.seatingCapacityInside = {
        ...((where.seatingCapacityInside as object) || {}),
        lte: filters.seatingCapacityMax,
      };
    }
  }

  return where;
}

/**
 * Search properties with filters, pagination, and sorting
 * Only returns ACTIVE status properties for public searches
 */
export async function searchProperties(
  input: ListPropertiesInput
): Promise<ActionResult<PropertySearchResult>> {
  try {
    // Validate input
    const validatedInput = listPropertiesSchema.parse(input);
    const { page, limit, sortBy, sortOrder, filters, search } = validatedInput;

    // Build where clause (only ACTIVE properties)
    const where = buildWhereClause(filters, search, "ACTIVE");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: Prisma.PropertyOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute queries in parallel
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: propertySummarySelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Transform to PropertySummary
    const items = properties.map(toPropertySummary);
    const pageCount = Math.ceil(total / limit);
    const hasMore = page < pageCount;

    return {
      success: true,
      data: {
        items,
        total,
        hasMore,
        page,
        pageCount,
      },
    };
  } catch (error) {
    console.error("Error searching properties:", error);
    return {
      success: false,
      error: "Failed to search properties. Please try again.",
    };
  }
}

/**
 * Get featured properties
 * Returns properties where featured=true and featuredUntil > now
 */
export async function getFeaturedProperties(
  limit: number = 6
): Promise<ActionResult<PropertySummary[]>> {
  try {
    const now = new Date();

    const properties = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
        OR: [
          { featuredUntil: null }, // No expiration
          { featuredUntil: { gt: now } }, // Not expired
        ],
      },
      select: propertySummarySelect,
      orderBy: [
        { featuredUntil: "asc" }, // Expiring soon first
        { publishedAt: "desc" },
      ],
      take: limit,
    });

    const items = properties.map(toPropertySummary);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return {
      success: false,
      error: "Failed to fetch featured properties.",
    };
  }
}

/**
 * Get recent properties
 * Returns properties sorted by publishedAt desc
 */
export async function getRecentProperties(
  limit: number = 8
): Promise<ActionResult<PropertySummary[]>> {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        publishedAt: { not: null },
      },
      select: propertySummarySelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });

    const items = properties.map(toPropertySummary);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching recent properties:", error);
    return {
      success: false,
      error: "Failed to fetch recent properties.",
    };
  }
}

/**
 * Get similar properties based on type, city, and price range
 * Excludes the source property
 */
export async function getSimilarProperties(
  propertyId: string,
  limit: number = 4
): Promise<ActionResult<PropertySummary[]>> {
  try {
    // First, get the source property to find similar ones
    const sourceProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        propertyType: true,
        city: true,
        priceType: true,
        rentPrice: true,
        salePrice: true,
      },
    });

    if (!sourceProperty) {
      return {
        success: false,
        error: "Property not found.",
      };
    }

    // Build similarity criteria
    const where: Prisma.PropertyWhereInput = {
      id: { not: propertyId }, // Exclude self
      status: "ACTIVE",
    };

    // Build OR conditions for similarity matching
    const orConditions: Prisma.PropertyWhereInput[] = [];

    // Same type
    if (sourceProperty.propertyType) {
      orConditions.push({ propertyType: sourceProperty.propertyType });
    }

    // Same city
    if (sourceProperty.city) {
      orConditions.push({ city: sourceProperty.city });
    }

    // Similar price range (within 50% of source price)
    if (sourceProperty.priceType === "RENT" && sourceProperty.rentPrice) {
      const minPrice = Math.floor(sourceProperty.rentPrice * 0.5);
      const maxPrice = Math.ceil(sourceProperty.rentPrice * 1.5);
      orConditions.push({
        rentPrice: { gte: minPrice, lte: maxPrice },
      });
    } else if (sourceProperty.priceType === "SALE" && sourceProperty.salePrice) {
      const minPrice = Math.floor(sourceProperty.salePrice * 0.5);
      const maxPrice = Math.ceil(sourceProperty.salePrice * 1.5);
      orConditions.push({
        salePrice: { gte: minPrice, lte: maxPrice },
      });
    }

    // Add OR conditions if any
    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    // Query similar properties
    const properties = await prisma.property.findMany({
      where,
      select: propertySummarySelect,
      orderBy: [
        // Prioritize same type and city
        { propertyType: "asc" },
        { city: "asc" },
        { publishedAt: "desc" },
      ],
      take: limit,
    });

    const items = properties.map(toPropertySummary);

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("Error fetching similar properties:", error);
    return {
      success: false,
      error: "Failed to fetch similar properties.",
    };
  }
}

/**
 * Get properties by agency
 * For agency owners/admins: returns all statuses
 * For public view: returns only ACTIVE properties
 */
export async function getPropertiesByAgency(
  agencyId: string,
  options?: {
    page?: number;
    limit?: number;
    includeAllStatuses?: boolean;
  }
): Promise<ActionResult<PropertySearchResult>> {
  try {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    // Determine if user is agency owner/admin
    let isAgencyMember = false;
    const currentUser = await getCurrentUser();

    if (currentUser && options?.includeAllStatuses) {
      // Check if user is a member of this agency
      const membership = await prisma.agencyMember.findFirst({
        where: {
          agencyId,
          userId: currentUser.id,
          role: { in: ["OWNER", "ADMIN"] },
        },
      });
      isAgencyMember = !!membership;
    }

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      agencyId,
    };

    // Only show ACTIVE properties for public view
    if (!isAgencyMember) {
      where.status = "ACTIVE";
    }

    // Execute queries
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: propertySummarySelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    const items = properties.map(toPropertySummary);
    const pageCount = Math.ceil(total / limit);
    const hasMore = page < pageCount;

    return {
      success: true,
      data: {
        items,
        total,
        hasMore,
        page,
        pageCount,
      },
    };
  } catch (error) {
    console.error("Error fetching agency properties:", error);
    return {
      success: false,
      error: "Failed to fetch agency properties.",
    };
  }
}

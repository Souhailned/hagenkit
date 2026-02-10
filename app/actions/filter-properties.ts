"use server";

import prisma from "@/lib/prisma";
import type { ActionResult } from "@/types/actions";
import type { PropertyType } from "@/generated/prisma/browser";
import { Prisma } from "@/generated/prisma/client";

export interface FilterPropertiesParams {
  minPrice?: number;
  maxPrice?: number;
  types?: PropertyType[];
  city?: string;
  minArea?: number;
  maxArea?: number;
  page?: number;
  pageSize?: number;
}

export interface FilteredProperty {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  city: string;
  province: string | null;
  priceType: "RENT" | "SALE" | "RENT_OR_SALE";
  rentPrice: number | null;
  salePrice: number | null;
  surfaceTotal: number;
  propertyType: PropertyType;
  status: string;
  hasTerrace: boolean;
  hasParking: boolean;
  featured: boolean;
  viewCount: number;
  images: Array<{
    id: string;
    originalUrl: string;
    thumbnailUrl: string | null;
    mediumUrl: string | null;
    altText: string | null;
    isPrimary: boolean;
    order: number;
  }>;
}

export interface FilteredPropertiesResult {
  properties: FilteredProperty[];
  total: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

/**
 * Filter properties based on search criteria
 */
export async function getFilteredProperties(
  params: FilterPropertiesParams
): Promise<ActionResult<FilteredPropertiesResult>> {
  try {
    const {
      minPrice,
      maxPrice,
      types,
      city,
      minArea,
      maxArea,
      page = 1,
      pageSize = 12,
    } = params;

    // Build where clause
    const where: Prisma.PropertyWhereInput = {
      status: "ACTIVE",
    };

    // Price filters (prices are in cents)
    if (minPrice !== undefined && minPrice > 0) {
      where.OR = [
        { rentPrice: { gte: minPrice * 100 } }, // Convert to cents
        { salePrice: { gte: minPrice * 100 } },
      ];
    }

    if (maxPrice !== undefined && maxPrice > 0) {
      if (where.OR) {
        where.OR = [
          { rentPrice: { gte: minPrice ? minPrice * 100 : 0, lte: maxPrice * 100 } },
          { salePrice: { gte: minPrice ? minPrice * 100 : 0, lte: maxPrice * 100 } },
        ];
      } else {
        where.OR = [
          { rentPrice: { lte: maxPrice * 100 } },
          { salePrice: { lte: maxPrice * 100 } },
        ];
      }
    }

    // Property type filter
    if (types && types.length > 0) {
      where.propertyType = { in: types };
    }

    // City filter (case-insensitive partial match)
    if (city && city.trim()) {
      where.city = { contains: city.trim(), mode: "insensitive" };
    }

    // Surface area filters
    if (minArea !== undefined && minArea > 0) {
      where.surfaceTotal = { gte: minArea };
    }

    if (maxArea !== undefined && maxArea > 0) {
      if (where.surfaceTotal) {
        where.surfaceTotal = {
          gte: minArea || 0,
          lte: maxArea,
        };
      } else {
        where.surfaceTotal = { lte: maxArea };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Execute query with count
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: pageSize,
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
          province: true,
          priceType: true,
          rentPrice: true,
          salePrice: true,
          surfaceTotal: true,
          propertyType: true,
          status: true,
          hasTerrace: true,
          hasParking: true,
          featured: true,
          viewCount: true,
          images: {
            orderBy: [
              { isPrimary: "desc" },
              { order: "asc" },
            ],
            take: 3,
            select: {
              id: true,
              originalUrl: true,
              thumbnailUrl: true,
              mediumUrl: true,
              altText: true,
              isPrimary: true,
              order: true,
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const pageCount = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        properties,
        total,
        pageCount,
        page,
        pageSize,
      },
    };
  } catch (error) {
    console.error("Error filtering properties:", error);
    return {
      success: false,
      error: "Er is een fout opgetreden bij het filteren van panden",
    };
  }
}

/**
 * Get unique cities from active properties
 */
export async function getCities(): Promise<ActionResult<string[]>> {
  try {
    const cities = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    });

    return {
      success: true,
      data: cities.map((c) => c.city),
    };
  } catch (error) {
    console.error("Error fetching cities:", error);
    return {
      success: false,
      error: "Er is een fout opgetreden bij het ophalen van steden",
    };
  }
}

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
import {
  mockProperties,
  getAvailableCities,
  getPopularFeatures,
} from "@/lib/data/mock-properties";

/**
 * Helper to get effective price for sorting.
 * Works with both mock (property.price) and Prisma (property.rentPrice/salePrice) data.
 */
function getEffectivePrice(property: Property): number {
  // Mock data uses `price` field directly
  const mockPrice = (property as any).price;
  if (mockPrice != null) return mockPrice;

  // Prisma data uses separate rent/sale fields (in cents)
  switch (property.priceType) {
    case "RENT":
      return property.rentPrice || 0;
    case "SALE":
      return property.salePrice || 0;
    case "RENT_OR_SALE":
      return property.rentPrice || property.salePrice || 0;
    default:
      return 0;
  }
}

/**
 * Search and filter properties with pagination.
 *
 * PRISMA MIGRATION: Replace mock filtering with:
 * ```
 * const where: Prisma.PropertyWhereInput = {
 *   status: "ACTIVE",
 *   ...(search && { OR: [
 *     { title: { contains: search, mode: 'insensitive' } },
 *     { description: { contains: search, mode: 'insensitive' } },
 *     { city: { contains: search, mode: 'insensitive' } },
 *   ]}),
 *   ...(cities?.length && { city: { in: cities } }),
 *   ...(types?.length && { propertyType: { in: types } }),
 * };
 * const properties = await prisma.property.findMany({
 *   where,
 *   include: { images: { where: { isPrimary: true }, take: 1 } },
 *   orderBy: sortByMap[sortBy],
 *   skip: (page - 1) * pageSize,
 *   take: pageSize,
 * });
 * ```
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

    let filtered: Property[] = [...mockProperties];

    // Search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p: any) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
      );
    }

    // City filter
    if (cities && cities.length > 0) {
      filtered = filtered.filter((p: any) => cities.includes(p.city));
    }

    // Type filter
    if (types && types.length > 0) {
      filtered = filtered.filter((p: any) =>
        types.includes(p.type as PropertyType)
      );
    }

    // Price filter
    if (priceMin !== undefined) {
      filtered = filtered.filter((p: any) => (p.price || 0) >= priceMin);
    }
    if (priceMax !== undefined) {
      filtered = filtered.filter((p: any) => (p.price || 0) <= priceMax);
    }

    // Area filter
    if (areaMin !== undefined) {
      filtered = filtered.filter(
        (p: any) => (p.area || p.surfaceTotal || 0) >= areaMin
      );
    }
    if (areaMax !== undefined) {
      filtered = filtered.filter(
        (p: any) => (p.area || p.surfaceTotal || 0) <= areaMax
      );
    }

    // Features filter
    if (features && features.length > 0) {
      filtered = filtered.filter((p: any) =>
        features.every((f) => p.features.includes(f as PropertyFeature))
      );
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        break;
      case "price_low_high":
        filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case "price_high_low":
        filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case "area":
        filtered.sort((a, b) => (b.surfaceTotal || 0) - (a.surfaceTotal || 0));
        break;
    }

    // Pagination
    const total = filtered.length;
    const pageCount = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProperties = filtered.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        properties: paginatedProperties,
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
 * Get available filter options.
 *
 * PRISMA MIGRATION: Replace with:
 * ```
 * const cities = await prisma.property.findMany({
 *   where: { status: "ACTIVE" },
 *   select: { city: true },
 *   distinct: ["city"],
 *   orderBy: { city: "asc" },
 * });
 * ```
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
    const cities = getAvailableCities();
    const popularFeatures = getPopularFeatures();

    const prices = mockProperties.map((p: any) => p.price || 0);
    const areas = mockProperties.map(
      (p: any) => p.area || p.surfaceTotal || 0
    );

    const { PropertyTypeLabels, PropertyFeatureLabels } = await import(
      "@/types/property"
    );

    const types = Object.entries(PropertyTypeLabels).map(([value, label]) => ({
      value: value as PropertyType,
      label,
    }));

    const features = popularFeatures.map((f) => ({
      value: f,
      label: PropertyFeatureLabels[f],
    }));

    return {
      success: true,
      data: {
        cities,
        types,
        features,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        areaRange: {
          min: Math.min(...areas),
          max: Math.max(...areas),
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
 *
 * PRISMA MIGRATION: Replace with:
 * ```
 * const property = await prisma.property.findUnique({
 *   where: { slug, status: "ACTIVE" },
 *   include: {
 *     images: { orderBy: { order: "asc" } },
 *     features: { orderBy: { displayOrder: "asc" } },
 *     agency: { select: { id: true, name: true, slug: true, logo: true } },
 *     creator: {
 *       select: {
 *         id: true, name: true, email: true, image: true,
 *         agentProfile: true,
 *       },
 *     },
 *   },
 * });
 * ```
 */
export async function getPropertyBySlug(
  slug: string
): Promise<ActionResult<Property | null>> {
  try {
    const property = mockProperties.find((p: any) => p.slug === slug);

    return {
      success: true,
      data: property || null,
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
 *
 * PRISMA MIGRATION: Replace with:
 * ```
 * const properties = await prisma.property.findMany({
 *   where: { status: "ACTIVE", featured: true },
 *   include: { images: { where: { isPrimary: true }, take: 1 } },
 *   orderBy: { publishedAt: "desc" },
 *   take: 4,
 * });
 * ```
 */
export async function getFeaturedProperties(): Promise<
  ActionResult<Property[]>
> {
  try {
    const featured = mockProperties.filter((p: any) => p.isFeatured);
    return {
      success: true,
      data: featured.slice(0, 4),
    };
  } catch (error) {
    console.error("Error getting featured properties:", error);
    return {
      success: false,
      error: "Er is een fout opgetreden bij het ophalen van uitgelichte panden",
    };
  }
}

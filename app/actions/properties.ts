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
 * Search and filter properties with pagination
 * Supports SSR with URL search params
 */
export async function searchProperties(
  params: SearchPropertiesInput
): Promise<ActionResult<SearchPropertiesResult>> {
  try {
    // Validate input
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

    // Start with all properties
    let filtered: Property[] = [...mockProperties];

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply city filter
    if (cities && cities.length > 0) {
      filtered = filtered.filter((p) => cities.includes(p.city));
    }

    // Apply type filter
    if (types && types.length > 0) {
      filtered = filtered.filter((p) =>
        types.includes(p.type as PropertyType)
      );
    }

    // Apply price filter
    if (priceMin !== undefined) {
      filtered = filtered.filter((p) => p.price >= priceMin);
    }
    if (priceMax !== undefined) {
      filtered = filtered.filter((p) => p.price <= priceMax);
    }

    // Apply area filter
    if (areaMin !== undefined) {
      filtered = filtered.filter((p) => p.area >= areaMin);
    }
    if (areaMax !== undefined) {
      filtered = filtered.filter((p) => p.area <= areaMax);
    }

    // Apply features filter
    if (features && features.length > 0) {
      filtered = filtered.filter((p) =>
        features.every((f) => p.features.includes(f as PropertyFeature))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case SortOption.NEWEST:
        filtered.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        break;
      case SortOption.PRICE_LOW_HIGH:
        filtered.sort((a, b) => a.price - b.price);
        break;
      case SortOption.PRICE_HIGH_LOW:
        filtered.sort((a, b) => b.price - a.price);
        break;
      case SortOption.AREA:
        filtered.sort((a, b) => b.area - a.area);
        break;
    }

    // Calculate pagination
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
 * Get available filter options
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

    // Get price and area ranges from data
    const prices = mockProperties.map((p) => p.price);
    const areas = mockProperties.map((p) => p.area);

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
 * Get a single property by slug
 */
export async function getPropertyBySlug(
  slug: string
): Promise<ActionResult<Property | null>> {
  try {
    const property = mockProperties.find((p) => p.slug === slug);

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

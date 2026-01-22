/**
 * Property types for the seeker dashboard
 * These types will be used with the real Prisma models when available
 */

export type PropertyType =
  | "RESTAURANT"
  | "CAFE"
  | "BAR"
  | "HOTEL"
  | "DARK_KITCHEN"
  | "NIGHTCLUB"
  | "FOOD_COURT"
  | "CATERING"
  | "BAKERY"
  | "OTHER";

export type PropertyStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "UNDER_OFFER"
  | "RENTED"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

export type PriceType = "RENT" | "SALE" | "RENT_OR_SALE";

/**
 * Property list item for cards and grids
 */
export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  propertyType: PropertyType;
  status: PropertyStatus;
  priceType: PriceType;
  rentPrice: number | null; // in cents
  salePrice: number | null; // in cents
  city: string;
  province: string | null;
  neighborhood: string | null;
  surfaceTotal: number; // in m²
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  hasTermace: boolean;
  hasKitchen: boolean;
  horecaScore: string | null; // A+ to F
  featured: boolean;
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

/**
 * Seeker profile preferences
 */
export interface SeekerPreferences {
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCities: string[];
  preferredProvinces: string[];
  preferredTypes: PropertyType[];
  minSurface: number | null;
  maxSurface: number | null;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
}

/**
 * Seeker recommendations response
 */
export interface SeekerRecommendations {
  recommended: PropertyListItem[];
  recentlyViewed: PropertyListItem[];
  newMatches: PropertyListItem[];
  hasPreferences: boolean;
}

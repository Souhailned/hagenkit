/**
 * Property-related types for the Horecagrond platform
 * These types mirror the Prisma schema models for Property, SeekerProfile, etc.
 */

// Property type enum
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

// Property status enum
export type PropertyStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "UNDER_OFFER"
  | "RENTED"
  | "SOLD"
  | "ARCHIVED"
  | "REJECTED";

// Price type enum
export type PriceType = "RENT" | "SALE" | "RENT_OR_SALE";

// Alert frequency enum
export type AlertFrequency = "INSTANT" | "DAILY" | "WEEKLY";

// Property image type enum
export type PropertyImageType =
  | "EXTERIOR"
  | "INTERIOR"
  | "KITCHEN"
  | "TERRACE"
  | "BATHROOM"
  | "STORAGE"
  | "FLOORPLAN"
  | "LOCATION"
  | "RENDER"
  | "OTHER";

/**
 * Property image for display
 */
export interface PropertyImage {
  id: string;
  originalUrl: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  type: PropertyImageType;
  caption?: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
}

/**
 * Property listing - main model
 */
export interface Property {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;

  // Location
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  province?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;

  // Pricing (in cents)
  priceType: PriceType;
  rentPrice?: number;
  rentPriceMin?: number;
  salePrice?: number;
  salePriceMin?: number;
  priceNegotiable: boolean;
  servicesCosts?: number;
  depositMonths?: number;

  // Dimensions (in m²)
  surfaceTotal: number;
  surfaceCommercial?: number;
  surfaceKitchen?: number;
  surfaceStorage?: number;
  surfaceTerrace?: number;
  surfaceBasement?: number;
  floors: number;
  ceilingHeight?: number;

  // Classification
  propertyType: PropertyType;
  status: PropertyStatus;

  // Horeca specifics
  seatingCapacityInside?: number;
  seatingCapacityOutside?: number;
  standingCapacity?: number;
  kitchenType?: string;
  hasBasement: boolean;
  hasStorage: boolean;
  hasTerrace: boolean;
  hasParking: boolean;
  parkingSpaces?: number;

  // Building info
  buildYear?: number;
  lastRenovation?: number;
  energyLabel?: string;

  // Scores
  horecaScore?: string;
  locationScore?: number;

  // Images
  images: PropertyImage[];

  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Counts
  viewCount: number;
  inquiryCount: number;
  savedCount: number;

  // Agency info (for display)
  agency?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

/**
 * Property card - minimal data for list display
 */
export interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  city: string;
  province?: string;
  priceType: PriceType;
  rentPrice?: number;
  salePrice?: number;
  surfaceTotal: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  hasTerrace: boolean;
  hasParking: boolean;
  primaryImage?: PropertyImage;
  horecaScore?: string;
  publishedAt?: Date;
  viewCount: number;
  isSaved?: boolean;
}

/**
 * Property list item for cards and grids (alternative format)
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
  hasTerrace: boolean;
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
 * Seeker profile preferences (simplified)
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
 * Full seeker profile with all fields
 */
export interface SeekerProfile {
  id: string;
  userId: string;
  businessType?: string;
  conceptDescription?: string;
  experienceYears?: number;
  hasBusinessPlan: boolean;
  budgetMin?: number;
  budgetMax?: number;
  preferredCities: string[];
  preferredProvinces: string[];
  preferredTypes: PropertyType[];
  minSurface?: number;
  maxSurface?: number;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  emailAlerts: boolean;
  pushAlerts: boolean;
  alertFrequency: AlertFrequency;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Search alert model
 */
export interface SearchAlert {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  cities: string[];
  provinces: string[];
  propertyTypes: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  priceType?: PriceType;
  mustHaveFeatures: string[];
  frequency: AlertFrequency;
  emailEnabled: boolean;
  pushEnabled: boolean;
  lastSentAt?: Date;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property view for recent history
 */
export interface PropertyView {
  id: string;
  propertyId: string;
  property?: PropertyCard;
  viewedAt: Date;
}

/**
 * Seeker recommendations response
 */
export interface SeekerRecommendations {
  recommended: PropertyListItem[] | PropertyCard[];
  recentlyViewed: PropertyListItem[] | PropertyCard[];
  newMatches: PropertyListItem[] | PropertyCard[];
  hasPreferences: boolean;
}

/**
 * Helper to format price in euros
 */
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCents / 100);
}

/**
 * Helper to format surface area
 */
export function formatSurface(surfaceInM2: number): string {
  return `${surfaceInM2} m²`;
}

/**
 * Helper to get property type label in Dutch
 */
export function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    RESTAURANT: "Restaurant",
    CAFE: "Café",
    BAR: "Bar",
    HOTEL: "Hotel",
    DARK_KITCHEN: "Dark Kitchen",
    NIGHTCLUB: "Nachtclub",
    FOOD_COURT: "Food Court",
    CATERING: "Catering",
    BAKERY: "Bakkerij",
    OTHER: "Overig",
  };
  return labels[type] || type;
}

/**
 * Helper to get price type label in Dutch
 */
export function getPriceTypeLabel(type: PriceType): string {
  const labels: Record<PriceType, string> = {
    RENT: "Te Huur",
    SALE: "Te Koop",
    RENT_OR_SALE: "Huur/Koop",
  };
  return labels[type] || type;
}

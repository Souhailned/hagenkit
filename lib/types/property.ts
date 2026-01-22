// Property types for the Horecagrond platform
// These types mirror the Prisma schema from DATABASE-DESIGN.md

export const PropertyType = {
  RESTAURANT: "RESTAURANT",
  CAFE: "CAFE",
  BAR: "BAR",
  HOTEL: "HOTEL",
  DARK_KITCHEN: "DARK_KITCHEN",
  NIGHTCLUB: "NIGHTCLUB",
  FOOD_COURT: "FOOD_COURT",
  CATERING: "CATERING",
  BAKERY: "BAKERY",
  OTHER: "OTHER",
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const PropertyStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  UNDER_OFFER: "UNDER_OFFER",
  RENTED: "RENTED",
  SOLD: "SOLD",
  ARCHIVED: "ARCHIVED",
  REJECTED: "REJECTED",
} as const;

export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const PriceType = {
  RENT: "RENT",
  SALE: "SALE",
  RENT_OR_SALE: "RENT_OR_SALE",
} as const;

export type PriceType = (typeof PriceType)[keyof typeof PriceType];

export const FeatureCategory = {
  LICENSE: "LICENSE",
  FACILITY: "FACILITY",
  UTILITY: "UTILITY",
  ACCESSIBILITY: "ACCESSIBILITY",
} as const;

export type FeatureCategory = (typeof FeatureCategory)[keyof typeof FeatureCategory];

export const PropertyImageType = {
  EXTERIOR: "EXTERIOR",
  INTERIOR: "INTERIOR",
  KITCHEN: "KITCHEN",
  TERRACE: "TERRACE",
  BATHROOM: "BATHROOM",
  STORAGE: "STORAGE",
  FLOORPLAN: "FLOORPLAN",
  LOCATION: "LOCATION",
  RENDER: "RENDER",
  OTHER: "OTHER",
} as const;

export type PropertyImageType = (typeof PropertyImageType)[keyof typeof PropertyImageType];

export interface PropertyImage {
  id: string;
  propertyId: string;
  originalUrl: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  largeUrl?: string | null;
  type: PropertyImageType;
  caption?: string | null;
  altText?: string | null;
  order: number;
  isPrimary: boolean;
  width?: number | null;
  height?: number | null;
}

export interface PropertyFeature {
  id: string;
  propertyId: string;
  category: FeatureCategory;
  key: string;
  value?: string | null;
  numericValue?: number | null;
  booleanValue?: boolean | null;
  verified: boolean;
  highlighted: boolean;
  displayOrder: number;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  verified: boolean;
}

export interface AgentProfile {
  id: string;
  userId: string;
  agencyId: string;
  title?: string | null;
  phone?: string | null;
  phonePublic: boolean;
  bio?: string | null;
  avatar?: string | null;
  specializations: PropertyType[];
  regions: string[];
  languages: string[];
  verified: boolean;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;

  // Location
  address: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  province?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  neighborhood?: string | null;

  // Pricing (in cents)
  priceType: PriceType;
  rentPrice?: number | null;
  rentPriceMin?: number | null;
  salePrice?: number | null;
  salePriceMin?: number | null;
  priceNegotiable: boolean;
  servicesCosts?: number | null;
  depositMonths?: number | null;

  // Dimensions
  surfaceTotal: number;
  surfaceCommercial?: number | null;
  surfaceKitchen?: number | null;
  surfaceStorage?: number | null;
  surfaceTerrace?: number | null;
  surfaceBasement?: number | null;
  floors: number;
  ceilingHeight?: number | null;

  // Classification
  propertyType: PropertyType;
  status: PropertyStatus;

  // Horeca specifics
  seatingCapacityInside?: number | null;
  seatingCapacityOutside?: number | null;
  standingCapacity?: number | null;
  kitchenType?: string | null;
  hasBasement: boolean;
  hasStorage: boolean;
  hasTerrace: boolean;
  hasParking: boolean;
  parkingSpaces?: number | null;

  // Building
  buildYear?: number | null;
  lastRenovation?: number | null;
  monumentStatus?: string | null;
  energyLabel?: string | null;

  // Scores
  horecaScore?: string | null;
  horecaScoreDetails?: Record<string, unknown> | null;
  locationScore?: number | null;
  footfallEstimate?: number | null;

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  featured: boolean;

  // Availability
  availableFrom?: Date | null;
  minimumLeaseTerm?: number | null;

  // Stats
  viewCount: number;
  inquiryCount: number;
  savedCount: number;

  // Timestamps
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  agencyId: string;
  createdById: string;
  images?: PropertyImage[];
  features?: PropertyFeature[];
  agency?: Agency;
  creator?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    agentProfile?: AgentProfile | null;
  };
}

// Labels for UI display
export const PropertyTypeLabels: Record<PropertyType, string> = {
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

export const PriceTypeLabels: Record<PriceType, string> = {
  RENT: "Te Huur",
  SALE: "Te Koop",
  RENT_OR_SALE: "Te Huur of Koop",
};

export const PropertyStatusLabels: Record<PropertyStatus, string> = {
  DRAFT: "Concept",
  PENDING_REVIEW: "In Review",
  ACTIVE: "Actief",
  UNDER_OFFER: "Onder Bod",
  RENTED: "Verhuurd",
  SOLD: "Verkocht",
  ARCHIVED: "Gearchiveerd",
  REJECTED: "Afgewezen",
};

export const FeatureCategoryLabels: Record<FeatureCategory, string> = {
  LICENSE: "Vergunningen",
  FACILITY: "Faciliteiten",
  UTILITY: "Voorzieningen",
  ACCESSIBILITY: "Bereikbaarheid",
};

// Common feature definitions with icons
export interface FeatureDefinition {
  key: string;
  label: string;
  category: FeatureCategory;
  valueType: "boolean" | "string" | "number";
  icon?: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Licenses
  { key: "alcohol_license", label: "Alcoholvergunning", category: "LICENSE", valueType: "boolean", icon: "Wine" },
  { key: "terrace_license", label: "Terrasvergunning", category: "LICENSE", valueType: "boolean", icon: "Sun" },
  { key: "night_license", label: "Nachtvergunning", category: "LICENSE", valueType: "boolean", icon: "Moon" },
  { key: "music_license", label: "Muziekvergunning", category: "LICENSE", valueType: "boolean", icon: "Music" },
  { key: "exploitation_license", label: "Exploitatievergunning", category: "LICENSE", valueType: "boolean", icon: "FileCheck" },

  // Facilities
  { key: "professional_kitchen", label: "Professionele Keuken", category: "FACILITY", valueType: "boolean", icon: "ChefHat" },
  { key: "extraction_system", label: "Afzuiginstallatie", category: "FACILITY", valueType: "boolean", icon: "Wind" },
  { key: "cold_storage", label: "Koeling", category: "FACILITY", valueType: "boolean", icon: "Snowflake" },
  { key: "storage_room", label: "Opslagruimte", category: "FACILITY", valueType: "boolean", icon: "Package" },
  { key: "basement", label: "Kelder", category: "FACILITY", valueType: "boolean", icon: "ArrowDown" },
  { key: "terrace", label: "Terras", category: "FACILITY", valueType: "boolean", icon: "Umbrella" },
  { key: "bar", label: "Bar", category: "FACILITY", valueType: "boolean", icon: "Beer" },
  { key: "toilets", label: "Toiletten", category: "FACILITY", valueType: "number", icon: "Bath" },

  // Utilities
  { key: "air_conditioning", label: "Airconditioning", category: "UTILITY", valueType: "boolean", icon: "Thermometer" },
  { key: "heating", label: "Verwarming", category: "UTILITY", valueType: "boolean", icon: "Flame" },
  { key: "wifi", label: "WiFi", category: "UTILITY", valueType: "boolean", icon: "Wifi" },
  { key: "alarm_system", label: "Alarmsysteem", category: "UTILITY", valueType: "boolean", icon: "Bell" },
  { key: "camera_system", label: "Camerasysteem", category: "UTILITY", valueType: "boolean", icon: "Camera" },
  { key: "pos_system", label: "Kassasysteem", category: "UTILITY", valueType: "boolean", icon: "CreditCard" },

  // Accessibility
  { key: "wheelchair_accessible", label: "Rolstoeltoegankelijk", category: "ACCESSIBILITY", valueType: "boolean", icon: "Accessibility" },
  { key: "parking", label: "Parkeerplaatsen", category: "ACCESSIBILITY", valueType: "number", icon: "Car" },
  { key: "public_transport", label: "OV Nabij", category: "ACCESSIBILITY", valueType: "boolean", icon: "Train" },
  { key: "loading_dock", label: "Laaddok", category: "ACCESSIBILITY", valueType: "boolean", icon: "Truck" },
];

// Helper to get feature definition
export function getFeatureDefinition(key: string): FeatureDefinition | undefined {
  return FEATURE_DEFINITIONS.find((f) => f.key === key);
}

// Helper to format price
export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return "Op aanvraag";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Helper to format surface
export function formatSurface(sqm: number | null | undefined): string {
  if (sqm == null) return "-";
  return `${sqm} m²`;
}

import { z } from "zod";

// Property enums based on PRD
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

export const PriceType = {
  RENT: "RENT",
  SALE: "SALE",
  RENT_OR_SALE: "RENT_OR_SALE",
} as const;

export const FeatureCategory = {
  LICENSE: "LICENSE",
  FACILITY: "FACILITY",
  UTILITY: "UTILITY",
  ACCESSIBILITY: "ACCESSIBILITY",
} as const;

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

// Zod enums
export const propertyTypeEnum = z.enum([
  "RESTAURANT",
  "CAFE",
  "BAR",
  "HOTEL",
  "DARK_KITCHEN",
  "NIGHTCLUB",
  "FOOD_COURT",
  "CATERING",
  "BAKERY",
  "OTHER",
]);

export const propertyStatusEnum = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "ACTIVE",
  "UNDER_OFFER",
  "RENTED",
  "SOLD",
  "ARCHIVED",
  "REJECTED",
]);

export const priceTypeEnum = z.enum(["RENT", "SALE", "RENT_OR_SALE"]);

export const featureCategoryEnum = z.enum([
  "LICENSE",
  "FACILITY",
  "UTILITY",
  "ACCESSIBILITY",
]);

export const propertyImageTypeEnum = z.enum([
  "EXTERIOR",
  "INTERIOR",
  "KITCHEN",
  "TERRACE",
  "BATHROOM",
  "STORAGE",
  "FLOORPLAN",
  "LOCATION",
  "RENDER",
  "OTHER",
]);

// Create property schema
export const createPropertySchema = z.object({
  title: z.string().min(5, "Titel moet minimaal 5 karakters zijn").max(200, "Titel mag maximaal 200 karakters zijn"),
  description: z.string().max(5000, "Beschrijving mag maximaal 5000 karakters zijn").optional(),
  shortDescription: z.string().max(200, "Korte beschrijving mag maximaal 200 karakters zijn").optional(),
  propertyType: propertyTypeEnum,
  priceType: priceTypeEnum,

  // Pricing (in cents)
  rentPrice: z.number().int().positive("Huurprijs moet positief zijn").optional(),
  rentPriceMin: z.number().int().positive().optional(),
  salePrice: z.number().int().positive("Verkoopprijs moet positief zijn").optional(),
  salePriceMin: z.number().int().positive().optional(),
  priceNegotiable: z.boolean().default(true),
  servicesCosts: z.number().int().nonnegative().optional(),
  depositMonths: z.number().int().nonnegative().optional(),

  // Location
  address: z.string().min(1, "Adres is verplicht"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Stad is verplicht"),
  postalCode: z.string().min(1, "Postcode is verplicht"),
  province: z.string().optional(),
  country: z.string().default("NL"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  neighborhood: z.string().optional(),

  // Dimensions
  surfaceTotal: z.number().int().positive("Totale oppervlakte is verplicht"),
  surfaceCommercial: z.number().int().positive().optional(),
  surfaceKitchen: z.number().int().positive().optional(),
  surfaceStorage: z.number().int().positive().optional(),
  surfaceTerrace: z.number().int().positive().optional(),
  surfaceBasement: z.number().int().positive().optional(),
  floors: z.number().int().positive().default(1),
  ceilingHeight: z.number().positive().optional(),

  // Horeca specifics
  seatingCapacityInside: z.number().int().nonnegative().optional(),
  seatingCapacityOutside: z.number().int().nonnegative().optional(),
  standingCapacity: z.number().int().nonnegative().optional(),
  kitchenType: z.string().optional(),
  hasBasement: z.boolean().default(false),
  hasStorage: z.boolean().default(false),
  hasTerrace: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  parkingSpaces: z.number().int().nonnegative().optional(),

  // Previous use
  previousUse: z.string().optional(),
  wasHoreca: z.boolean().optional(),
  previousHorecaType: propertyTypeEnum.optional(),
  yearsHoreca: z.number().int().nonnegative().optional(),

  // Building
  buildYear: z.number().int().min(1800).max(2030).optional(),
  lastRenovation: z.number().int().min(1800).max(2030).optional(),
  monumentStatus: z.boolean().optional(),
  energyLabel: z.string().optional(),

  // Availability
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  minimumLeaseTerm: z.number().int().positive().optional(),
});

// Update property schema (all fields optional)
export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().min(1, "Property ID is verplicht"),
});

// Property filter schema
export const propertyFilterSchema = z.object({
  cities: z.array(z.string()).optional(),
  propertyTypes: z.array(propertyTypeEnum).optional(),
  priceType: priceTypeEnum.optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().positive().optional(),
  surfaceMin: z.number().int().nonnegative().optional(),
  surfaceMax: z.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  hasTerrace: z.boolean().optional(),
  hasKitchen: z.boolean().optional(),
  hasParking: z.boolean().optional(),
});

// List properties schema
export const listPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "publishedAt", "rentPrice", "salePrice", "surfaceTotal", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  filters: propertyFilterSchema.optional(),
  search: z.string().optional(),
});

// Publish/unpublish schema
export const publishPropertySchema = z.object({
  id: z.string().min(1, "Property ID is verplicht"),
});

export const unpublishPropertySchema = z.object({
  id: z.string().min(1, "Property ID is verplicht"),
});

// Delete property schema
export const deletePropertySchema = z.object({
  id: z.string().min(1, "Property ID is verplicht"),
});

// Property image schema
export const propertyImageSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  originalUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  mediumUrl: z.string().url().optional(),
  largeUrl: z.string().url().optional(),
  enhancedUrl: z.string().url().optional(),
  type: propertyImageTypeEnum.default("INTERIOR"),
  caption: z.string().optional(),
  altText: z.string().optional(),
  order: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
  aiProcessed: z.boolean().default(false),
});

// Property feature schema
export const propertyFeatureSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  category: featureCategoryEnum,
  key: z.string(),
  value: z.string().optional(),
  numericValue: z.number().optional(),
  booleanValue: z.boolean().optional(),
  verified: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  highlighted: z.boolean().default(false),
});

// TypeScript types
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PriceType = z.infer<typeof priceTypeEnum>;
export type FeatureCategory = z.infer<typeof featureCategoryEnum>;
export type PropertyImageType = z.infer<typeof propertyImageTypeEnum>;

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;
export type PublishPropertyInput = z.infer<typeof publishPropertySchema>;
export type UnpublishPropertyInput = z.infer<typeof unpublishPropertySchema>;
export type DeletePropertyInput = z.infer<typeof deletePropertySchema>;
export type PropertyImage = z.infer<typeof propertyImageSchema>;
export type PropertyFeature = z.infer<typeof propertyFeatureSchema>;

// Full Property type (for display)
export interface Property {
  id: string;
  agencyId: string;
  createdById: string;

  // Basic info
  title: string;
  slug: string;
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

  // Dimensions
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

  // Previous use
  previousUse?: string;
  wasHoreca?: boolean;
  previousHorecaType?: PropertyType;
  yearsHoreca?: number;

  // Building
  buildYear?: number;
  lastRenovation?: number;
  monumentStatus?: boolean;
  energyLabel?: string;

  // Scores
  horecaScore?: string;
  horecaScoreDetails?: Record<string, unknown>;
  locationScore?: number;
  footfallEstimate?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  featuredUntil?: Date;
  boostUntil?: Date;

  // Availability
  availableFrom?: Date;
  availableUntil?: Date;
  minimumLeaseTerm?: number;

  // Publishing
  publishedAt?: Date;
  expiresAt?: Date;
  viewCount: number;
  inquiryCount: number;
  savedCount: number;

  // Admin
  adminNotes?: string;
  rejectionReason?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  images?: PropertyImage[];
  features?: PropertyFeature[];
  agency?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  createdBy?: {
    id: string;
    name?: string;
    email: string;
  };
}

// Helper for property type labels
export const propertyTypeLabels: Record<PropertyType, string> = {
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

// Helper for property status labels
export const propertyStatusLabels: Record<PropertyStatus, string> = {
  DRAFT: "Concept",
  PENDING_REVIEW: "In Review",
  ACTIVE: "Actief",
  UNDER_OFFER: "Onder Bod",
  RENTED: "Verhuurd",
  SOLD: "Verkocht",
  ARCHIVED: "Gearchiveerd",
  REJECTED: "Afgewezen",
};

// Helper for price type labels
export const priceTypeLabels: Record<PriceType, string> = {
  RENT: "Te Huur",
  SALE: "Te Koop",
  RENT_OR_SALE: "Te Huur / Te Koop",
};

// Helper for feature category labels
export const featureCategoryLabels: Record<FeatureCategory, string> = {
  LICENSE: "Vergunningen",
  FACILITY: "Faciliteiten",
  UTILITY: "Voorzieningen",
  ACCESSIBILITY: "Toegankelijkheid",
};

// Available features per category
export const availableFeatures: Record<FeatureCategory, Array<{ key: string; label: string; type: "boolean" | "string" | "number" }>> = {
  LICENSE: [
    { key: "alcohol_license", label: "Alcoholvergunning", type: "boolean" },
    { key: "alcohol_license_hours", label: "Alcoholvergunning tot", type: "string" },
    { key: "terrace_license", label: "Terrasvergunning", type: "boolean" },
    { key: "terrace_size", label: "Terrasomvang (m²)", type: "number" },
    { key: "music_license", label: "Muziekvergunning", type: "boolean" },
    { key: "late_night_license", label: "Nachtvergunning", type: "boolean" },
    { key: "food_license", label: "Horecavergunning", type: "boolean" },
    { key: "exploitation_license", label: "Exploitatievergunning", type: "boolean" },
  ],
  FACILITY: [
    { key: "professional_kitchen", label: "Professionele keuken", type: "boolean" },
    { key: "extraction_system", label: "Afzuigsysteem", type: "boolean" },
    { key: "cold_storage", label: "Koelcel", type: "boolean" },
    { key: "freezer_storage", label: "Vriezer", type: "boolean" },
    { key: "dishwasher", label: "Vaatwasmachine", type: "boolean" },
    { key: "bar_setup", label: "Bar opstelling", type: "boolean" },
    { key: "coffee_setup", label: "Koffie opstelling", type: "boolean" },
    { key: "sound_system", label: "Geluidssysteem", type: "boolean" },
  ],
  UTILITY: [
    { key: "air_conditioning", label: "Airconditioning", type: "boolean" },
    { key: "heating", label: "Verwarming", type: "boolean" },
    { key: "wifi", label: "WiFi", type: "boolean" },
    { key: "security_system", label: "Beveiligingssysteem", type: "boolean" },
    { key: "cctv", label: "Camerabewaking", type: "boolean" },
    { key: "pos_system", label: "Kassasysteem", type: "boolean" },
    { key: "delivery_door", label: "Leveranciersingang", type: "boolean" },
  ],
  ACCESSIBILITY: [
    { key: "wheelchair_accessible", label: "Rolstoeltoegankelijk", type: "boolean" },
    { key: "accessible_toilet", label: "Invalidentoilet", type: "boolean" },
    { key: "elevator", label: "Lift", type: "boolean" },
    { key: "ground_floor", label: "Begane grond", type: "boolean" },
    { key: "public_transport", label: "OV bereikbaar", type: "boolean" },
    { key: "parking_nearby", label: "Parkeren in de buurt", type: "boolean" },
  ],
};

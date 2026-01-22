import { z } from "zod";

// ============================================================================
// Property Enums (matching Prisma schema from PRD 1.1)
// ============================================================================

// Property type enum values
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

// Property status enum values
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

// Price type enum values
export const priceTypeEnum = z.enum(["RENT", "SALE", "RENT_OR_SALE"]);

// Feature category enum values
export const featureCategoryEnum = z.enum([
  "LICENSE",
  "FACILITY",
  "UTILITY",
  "ACCESSIBILITY",
]);

// Property image type enum values
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

// Sort options for property listings
export const propertySortByEnum = z.enum([
  "createdAt",
  "publishedAt",
  "rentPrice",
  "salePrice",
  "surfaceTotal",
  "viewCount",
  "title",
]);

// Sort order
export const sortOrderEnum = z.enum(["asc", "desc"]);

// ============================================================================
// TypeScript Types from Enums
// ============================================================================

export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PriceType = z.infer<typeof priceTypeEnum>;
export type FeatureCategory = z.infer<typeof featureCategoryEnum>;
export type PropertyImageType = z.infer<typeof propertyImageTypeEnum>;
export type PropertySortBy = z.infer<typeof propertySortByEnum>;
export type SortOrder = z.infer<typeof sortOrderEnum>;

// ============================================================================
// Create Property Schema
// ============================================================================

export const createPropertySchema = z.object({
  // Required fields
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  propertyType: propertyTypeEnum,
  priceType: priceTypeEnum,
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  surfaceTotal: z.number().int().positive("Surface total must be positive"),

  // Optional text fields
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  addressLine2: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default("NL"),
  neighborhood: z.string().optional(),

  // Optional pricing fields (in cents)
  rentPrice: z.number().int().positive("Rent price must be positive").optional(),
  rentPriceMin: z.number().int().positive().optional(),
  salePrice: z.number().int().positive("Sale price must be positive").optional(),
  salePriceMin: z.number().int().positive().optional(),
  priceNegotiable: z.boolean().default(true),
  servicesCosts: z.number().int().nonnegative().optional(),
  depositMonths: z.number().int().nonnegative().optional(),

  // Optional dimension fields
  surfaceCommercial: z.number().int().positive().optional(),
  surfaceKitchen: z.number().int().positive().optional(),
  surfaceStorage: z.number().int().positive().optional(),
  surfaceTerrace: z.number().int().positive().optional(),
  surfaceBasement: z.number().int().positive().optional(),
  floors: z.number().int().positive().default(1),
  ceilingHeight: z.number().positive().optional(),

  // Optional location fields
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Optional horeca specifics
  seatingCapacityInside: z.number().int().nonnegative().optional(),
  seatingCapacityOutside: z.number().int().nonnegative().optional(),
  standingCapacity: z.number().int().nonnegative().optional(),
  kitchenType: z.string().optional(),
  hasBasement: z.boolean().optional(),
  hasStorage: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  parkingSpaces: z.number().int().nonnegative().optional(),

  // Optional previous use fields
  previousUse: z.string().optional(),
  wasHoreca: z.boolean().optional(),
  previousHorecaType: propertyTypeEnum.optional(),
  yearsHoreca: z.number().int().nonnegative().optional(),

  // Optional building fields
  buildYear: z.number().int().min(1800).max(2100).optional(),
  lastRenovation: z.number().int().min(1800).max(2100).optional(),
  monumentStatus: z.string().optional(),
  energyLabel: z.string().optional(),

  // Optional scores
  horecaScore: z.string().optional(),
  horecaScoreDetails: z.record(z.unknown()).optional(),
  locationScore: z.number().int().min(0).max(100).optional(),
  footfallEstimate: z.number().int().nonnegative().optional(),

  // Optional SEO fields
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  featured: z.boolean().default(false),
  featuredUntil: z.date().optional(),
  boostUntil: z.date().optional(),

  // Optional availability fields
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  minimumLeaseTerm: z.number().int().positive().optional(),
});

// ============================================================================
// Update Property Schema (all fields optional)
// ============================================================================

export const updatePropertySchema = createPropertySchema.partial().extend({
  // Status can only be set via update (not create)
  status: propertyStatusEnum.optional(),
  // Admin-only fields
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
});

// ============================================================================
// Property Filter Schema
// ============================================================================

export const propertyFilterSchema = z.object({
  cities: z.array(z.string()).optional(),
  propertyTypes: z.array(propertyTypeEnum).optional(),
  priceType: priceTypeEnum.optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  surfaceMin: z.number().int().nonnegative().optional(),
  surfaceMax: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  hasTerrace: z.boolean().optional(),
  hasKitchen: z.boolean().optional(),
});

// ============================================================================
// List Properties Schema (with pagination, sorting, filters)
// ============================================================================

export const listPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: propertySortByEnum.default("createdAt"),
  sortOrder: sortOrderEnum.default("desc"),
  filters: propertyFilterSchema.optional(),
  search: z.string().optional(),
});

// ============================================================================
// TypeScript Types from Schemas
// ============================================================================

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;

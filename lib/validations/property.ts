import { z } from "zod";

// =============================================================================
// Property Enums
// =============================================================================

// Property type enum values (from PRD 1.1)
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

// Property status enum values (from PRD 1.1)
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

// Price type enum values (from PRD 1.1)
export const priceTypeEnum = z.enum(["RENT", "SALE", "RENT_OR_SALE"]);

// Feature category enum values (from PRD 1.1)
export const featureCategoryEnum = z.enum([
  "LICENSE",
  "FACILITY",
  "UTILITY",
  "ACCESSIBILITY",
]);

// Property image type enum values (from PRD 1.1)
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
]);

// Sort order
export const sortOrderEnum = z.enum(["asc", "desc"]);

// =============================================================================
// Create Property Schema
// =============================================================================

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
  surfaceTotal: z.number().int().positive("Surface must be a positive integer"),

  // Optional fields
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),

  // Pricing (in cents)
  rentPrice: z.number().int().positive().optional(),
  rentPriceMin: z.number().int().positive().optional(),
  salePrice: z.number().int().positive().optional(),
  salePriceMin: z.number().int().positive().optional(),
  priceNegotiable: z.boolean().optional(),
  servicesCosts: z.number().int().nonnegative().optional(),
  depositMonths: z.number().int().nonnegative().optional(),

  // Location
  addressLine2: z.string().optional(),
  province: z.string().optional(),
  country: z.string().default("NL"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  neighborhood: z.string().optional(),

  // Dimensions
  surfaceCommercial: z.number().int().positive().optional(),
  surfaceKitchen: z.number().int().positive().optional(),
  surfaceStorage: z.number().int().positive().optional(),
  surfaceTerrace: z.number().int().positive().optional(),
  surfaceBasement: z.number().int().positive().optional(),
  floors: z.number().int().positive().optional(),
  ceilingHeight: z.number().positive().optional(),

  // Horeca specifics
  seatingCapacityInside: z.number().int().nonnegative().optional(),
  seatingCapacityOutside: z.number().int().nonnegative().optional(),
  standingCapacity: z.number().int().nonnegative().optional(),
  kitchenType: z.string().optional(),
  hasBasement: z.boolean().optional(),
  hasStorage: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  parkingSpaces: z.number().int().nonnegative().optional(),

  // Previous use
  previousUse: z.string().optional(),
  wasHoreca: z.boolean().optional(),
  previousHorecaType: propertyTypeEnum.optional(),
  yearsHoreca: z.number().int().nonnegative().optional(),

  // Building
  buildYear: z.number().int().min(1800).max(2100).optional(),
  lastRenovation: z.number().int().min(1800).max(2100).optional(),
  monumentStatus: z.boolean().optional(),
  energyLabel: z.string().optional(),

  // Availability
  availableFrom: z.coerce.date().optional(),
  availableUntil: z.coerce.date().optional(),
  minimumLeaseTerm: z.string().optional(),

  // SEO & featuring
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  featured: z.boolean().optional(),
  featuredUntil: z.coerce.date().optional(),
  boostUntil: z.coerce.date().optional(),
});

// =============================================================================
// Update Property Schema (all fields optional)
// =============================================================================

export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().min(1, "Property ID is required"),
  status: propertyStatusEnum.optional(),
});

// =============================================================================
// Property Filter Schema
// =============================================================================

export const propertyFilterSchema = z.object({
  cities: z.array(z.string()).optional(),
  propertyTypes: z.array(propertyTypeEnum).optional(),
  priceType: priceTypeEnum.optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().positive().optional(),
  surfaceMin: z.number().int().positive().optional(),
  surfaceMax: z.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  hasTerrace: z.boolean().optional(),
  hasKitchen: z.boolean().optional(),
});

// =============================================================================
// List Properties Schema (with pagination and filters)
// =============================================================================

export const listPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: propertySortByEnum.optional(),
  sortOrder: sortOrderEnum.default("desc"),
  filters: propertyFilterSchema.optional(),
  search: z.string().optional(),
});

// =============================================================================
// TypeScript Types
// =============================================================================

export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PriceType = z.infer<typeof priceTypeEnum>;
export type FeatureCategory = z.infer<typeof featureCategoryEnum>;
export type PropertyImageType = z.infer<typeof propertyImageTypeEnum>;
export type PropertySortBy = z.infer<typeof propertySortByEnum>;
export type SortOrder = z.infer<typeof sortOrderEnum>;

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;

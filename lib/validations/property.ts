import { z } from "zod";

// Property type enum for validation
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

// Property status enum for validation
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

// Price type enum for validation
export const priceTypeEnum = z.enum(["RENT", "SALE", "RENT_OR_SALE"]);

// Feature category enum for validation
export const featureCategoryEnum = z.enum([
  "LICENSE",
  "FACILITY",
  "UTILITY",
  "ACCESSIBILITY",
]);

// Sort by options for property listings
export const propertySortByEnum = z.enum([
  "createdAt",
  "publishedAt",
  "rentPrice",
  "salePrice",
  "surfaceTotal",
  "viewCount",
  "inquiryCount",
]);

// Sort order
export const sortOrderEnum = z.enum(["asc", "desc"]);

// Schema for property filters
export const propertyFilterSchema = z.object({
  cities: z.array(z.string()).optional(),
  provinces: z.array(z.string()).optional(),
  propertyTypes: z.array(propertyTypeEnum).optional(),
  priceType: priceTypeEnum.optional(),
  priceMin: z.number().int().positive().optional(),
  priceMax: z.number().int().positive().optional(),
  surfaceMin: z.number().int().positive().optional(),
  surfaceMax: z.number().int().positive().optional(),
  features: z.array(z.string()).optional(),
  hasTerrace: z.boolean().optional(),
  hasKitchen: z.boolean().optional(),
  hasBasement: z.boolean().optional(),
  hasStorage: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  seatingCapacityMin: z.number().int().positive().optional(),
  seatingCapacityMax: z.number().int().positive().optional(),
});

// Schema for listing properties with pagination and sorting
export const listPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: propertySortByEnum.default("publishedAt"),
  sortOrder: sortOrderEnum.default("desc"),
  filters: propertyFilterSchema.optional(),
  search: z.string().max(200).optional(),
});

// Schema for creating a new property
export const createPropertySchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  propertyType: propertyTypeEnum,
  priceType: priceTypeEnum,
  rentPrice: z.number().int().positive().optional(),
  rentPriceMin: z.number().int().positive().optional(),
  salePrice: z.number().int().positive().optional(),
  salePriceMin: z.number().int().positive().optional(),
  priceNegotiable: z.boolean().default(true),
  servicesCosts: z.number().int().positive().optional(),
  depositMonths: z.number().int().positive().optional(),
  address: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  province: z.string().optional(),
  country: z.string().default("NL"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  neighborhood: z.string().optional(),
  surfaceTotal: z.number().int().positive("Surface area is required"),
  surfaceCommercial: z.number().int().positive().optional(),
  surfaceKitchen: z.number().int().positive().optional(),
  surfaceStorage: z.number().int().positive().optional(),
  surfaceTerrace: z.number().int().positive().optional(),
  surfaceBasement: z.number().int().positive().optional(),
  floors: z.number().int().positive().default(1),
  ceilingHeight: z.number().positive().optional(),
  seatingCapacityInside: z.number().int().positive().optional(),
  seatingCapacityOutside: z.number().int().positive().optional(),
  standingCapacity: z.number().int().positive().optional(),
  kitchenType: z.string().optional(),
  hasBasement: z.boolean().optional(),
  hasStorage: z.boolean().optional(),
  hasTerrace: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  parkingSpaces: z.number().int().positive().optional(),
  previousUse: z.string().optional(),
  wasHoreca: z.boolean().optional(),
  previousHorecaType: z.string().optional(),
  yearsHoreca: z.number().int().positive().optional(),
  buildYear: z.number().int().optional(),
  lastRenovation: z.number().int().optional(),
  energyLabel: z.string().optional(),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  minimumLeaseTerm: z.number().int().positive().optional(),
});

// Schema for updating a property (all fields optional)
export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().min(1, "Property ID is required"),
});

// TypeScript types derived from schemas
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PriceType = z.infer<typeof priceTypeEnum>;
export type FeatureCategory = z.infer<typeof featureCategoryEnum>;
export type PropertySortBy = z.infer<typeof propertySortByEnum>;
export type SortOrder = z.infer<typeof sortOrderEnum>;
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

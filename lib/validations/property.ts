import { z } from "zod";

// Property Type enum
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

// Property Status enum
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

// Price Type enum
export const priceTypeEnum = z.enum(["RENT", "SALE", "RENT_OR_SALE"]);

// Feature Category enum
export const featureCategoryEnum = z.enum([
  "LICENSE",
  "FACILITY",
  "UTILITY",
  "ACCESSIBILITY",
]);

// Sort options
export const sortByEnum = z.enum([
  "publishedAt",
  "rentPrice",
  "salePrice",
  "surfaceTotal",
  "viewCount",
]);

export const sortOrderEnum = z.enum(["asc", "desc"]);

// Property filter schema for search
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
  hasParking: z.boolean().optional(),
  hasStorage: z.boolean().optional(),
  hasBasement: z.boolean().optional(),
});

// List properties schema with pagination
export const listPropertiesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: sortByEnum.default("publishedAt"),
  sortOrder: sortOrderEnum.default("desc"),
  filters: propertyFilterSchema.optional(),
  search: z.string().optional(),
});

// Create property schema
export const createPropertySchema = z.object({
  title: z.string().min(5, "Titel moet minimaal 5 karakters zijn").max(200),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  propertyType: propertyTypeEnum,
  priceType: priceTypeEnum,
  rentPrice: z.number().int().positive().optional(),
  rentPriceMin: z.number().int().positive().optional(),
  salePrice: z.number().int().positive().optional(),
  salePriceMin: z.number().int().positive().optional(),
  servicesCosts: z.number().int().positive().optional(),
  depositMonths: z.number().int().positive().optional(),
  address: z.string().min(1, "Adres is verplicht"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "Stad is verplicht"),
  postalCode: z.string().min(1, "Postcode is verplicht"),
  province: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  neighborhood: z.string().optional(),
  surfaceTotal: z.number().int().positive("Oppervlakte is verplicht"),
  surfaceCommercial: z.number().int().positive().optional(),
  surfaceKitchen: z.number().int().positive().optional(),
  surfaceStorage: z.number().int().positive().optional(),
  surfaceTerrace: z.number().int().positive().optional(),
  surfaceBasement: z.number().int().positive().optional(),
  floors: z.number().int().positive().optional(),
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
});

// Update property schema (all optional)
export const updatePropertySchema = createPropertySchema.partial().extend({
  id: z.string().cuid(),
});

// TypeScript types
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type PropertyStatus = z.infer<typeof propertyStatusEnum>;
export type PriceType = z.infer<typeof priceTypeEnum>;
export type FeatureCategory = z.infer<typeof featureCategoryEnum>;
export type SortBy = z.infer<typeof sortByEnum>;
export type SortOrder = z.infer<typeof sortOrderEnum>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

// Helper constants for UI
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
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

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  RENT: "Te huur",
  SALE: "Te koop",
  RENT_OR_SALE: "Te huur of te koop",
};

// Common Dutch cities for filters
export const DUTCH_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
  "Breda",
  "Nijmegen",
  "Enschede",
  "Haarlem",
  "Arnhem",
  "Zaanstad",
  "Amersfoort",
  "Apeldoorn",
  "Hoofddorp",
  "Maastricht",
  "Leiden",
  "Dordrecht",
] as const;

// Popular features for filtering
export const POPULAR_FEATURES = [
  { key: "alcohol_license", label: "Alcoholvergunning", category: "LICENSE" },
  { key: "terrace_permit", label: "Terrasvergunning", category: "LICENSE" },
  { key: "extraction_system", label: "Afzuigsysteem", category: "FACILITY" },
  { key: "commercial_kitchen", label: "Professionele keuken", category: "FACILITY" },
  { key: "cold_storage", label: "Koelcel", category: "FACILITY" },
  { key: "wheelchair_accessible", label: "Rolstoeltoegankelijk", category: "ACCESSIBILITY" },
  { key: "air_conditioning", label: "Airconditioning", category: "UTILITY" },
  { key: "loading_dock", label: "Laaddok", category: "FACILITY" },
] as const;

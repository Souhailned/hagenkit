import { z } from "zod";

// Property type enum for horeca establishments
export const propertyTypeEnum = z.enum([
  "RESTAURANT",
  "CAFE",
  "BAR",
  "HOTEL",
  "NIGHTCLUB",
  "CATERING",
  "FOOD_TRUCK",
  "BAKERY",
  "OTHER",
]);

// Alert frequency enum
export const alertFrequencyEnum = z.enum([
  "INSTANT",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
]);

// Schema for updating seeker profile
export const updateSeekerProfileSchema = z.object({
  businessType: z.string().optional(),
  conceptDescription: z.string().max(2000, "Concept description must be at most 2000 characters").optional(),
  experienceYears: z.number().int().min(0, "Experience years must be at least 0").max(50, "Experience years must be at most 50").optional(),
  budgetMin: z.number().min(0, "Budget must be positive").optional(),
  budgetMax: z.number().min(0, "Budget must be positive").optional(),
  preferredCities: z.array(z.string()).default([]),
  preferredTypes: z.array(propertyTypeEnum).default([]),
  minSurface: z.number().min(0, "Surface must be positive").optional(),
  maxSurface: z.number().min(0, "Surface must be positive").optional(),
  mustHaveFeatures: z.array(z.string()).default([]),
  emailAlerts: z.boolean().default(false),
  alertFrequency: alertFrequencyEnum.optional(),
}).refine(
  (data) => {
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      return data.budgetMin <= data.budgetMax;
    }
    return true;
  },
  {
    message: "Minimum budget must be less than or equal to maximum budget",
    path: ["budgetMin"],
  }
).refine(
  (data) => {
    if (data.minSurface !== undefined && data.maxSurface !== undefined) {
      return data.minSurface <= data.maxSurface;
    }
    return true;
  },
  {
    message: "Minimum surface must be less than or equal to maximum surface",
    path: ["minSurface"],
  }
);

// Schema for creating a search alert
export const createSearchAlertSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  cities: z.array(z.string()).min(1, "At least one city is required"),
  propertyTypes: z.array(propertyTypeEnum).min(1, "At least one property type is required"),
  priceMin: z.number().min(0, "Price must be positive").optional(),
  priceMax: z.number().min(0, "Price must be positive").optional(),
  surfaceMin: z.number().min(0, "Surface must be positive").optional(),
  surfaceMax: z.number().min(0, "Surface must be positive").optional(),
  mustHaveFeatures: z.array(z.string()).default([]),
  frequency: alertFrequencyEnum,
}).refine(
  (data) => {
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  },
  {
    message: "Minimum price must be less than or equal to maximum price",
    path: ["priceMin"],
  }
).refine(
  (data) => {
    if (data.surfaceMin !== undefined && data.surfaceMax !== undefined) {
      return data.surfaceMin <= data.surfaceMax;
    }
    return true;
  },
  {
    message: "Minimum surface must be less than or equal to maximum surface",
    path: ["surfaceMin"],
  }
);

// Schema for updating a search alert (all fields optional + active)
export const updateSearchAlertSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").optional(),
  cities: z.array(z.string()).optional(),
  propertyTypes: z.array(propertyTypeEnum).optional(),
  priceMin: z.number().min(0, "Price must be positive").optional(),
  priceMax: z.number().min(0, "Price must be positive").optional(),
  surfaceMin: z.number().min(0, "Surface must be positive").optional(),
  surfaceMax: z.number().min(0, "Surface must be positive").optional(),
  mustHaveFeatures: z.array(z.string()).optional(),
  frequency: alertFrequencyEnum.optional(),
  active: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  },
  {
    message: "Minimum price must be less than or equal to maximum price",
    path: ["priceMin"],
  }
).refine(
  (data) => {
    if (data.surfaceMin !== undefined && data.surfaceMax !== undefined) {
      return data.surfaceMin <= data.surfaceMax;
    }
    return true;
  },
  {
    message: "Minimum surface must be less than or equal to maximum surface",
    path: ["surfaceMin"],
  }
);

// TypeScript types from schemas
export type PropertyType = z.infer<typeof propertyTypeEnum>;
export type AlertFrequency = z.infer<typeof alertFrequencyEnum>;
export type UpdateSeekerProfileInput = z.infer<typeof updateSeekerProfileSchema>;
export type CreateSearchAlertInput = z.infer<typeof createSearchAlertSchema>;
export type UpdateSearchAlertInput = z.infer<typeof updateSearchAlertSchema>;

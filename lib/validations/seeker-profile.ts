import { z } from "zod";

/**
 * Property type enum for horeca properties
 */
export const propertyTypeEnum = z.enum([
  "RESTAURANT",
  "CAFE",
  "BAR",
  "HOTEL",
  "NIGHTCLUB",
  "FAST_FOOD",
  "CATERING",
  "OTHER",
]);

export type PropertyType = z.infer<typeof propertyTypeEnum>;

/**
 * Alert frequency enum for email notifications
 */
export const alertFrequencyEnum = z.enum([
  "INSTANT",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
]);

export type AlertFrequency = z.infer<typeof alertFrequencyEnum>;

/**
 * Schema for updating a seeker profile
 */
export const updateSeekerProfileSchema = z.object({
  businessType: z.string().optional(),
  conceptDescription: z
    .string()
    .max(2000, "Concept description must be less than 2000 characters")
    .optional(),
  experienceYears: z
    .number()
    .int("Experience years must be a whole number")
    .min(0, "Experience years cannot be negative")
    .max(50, "Experience years cannot exceed 50")
    .optional(),
  budgetMin: z
    .number()
    .min(0, "Minimum budget cannot be negative")
    .optional(),
  budgetMax: z
    .number()
    .min(0, "Maximum budget cannot be negative")
    .optional(),
  preferredCities: z.array(z.string()).default([]),
  preferredTypes: z.array(propertyTypeEnum).default([]),
  minSurface: z
    .number()
    .min(0, "Minimum surface cannot be negative")
    .optional(),
  maxSurface: z
    .number()
    .min(0, "Maximum surface cannot be negative")
    .optional(),
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
    message: "Minimum budget cannot exceed maximum budget",
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
    message: "Minimum surface cannot exceed maximum surface",
    path: ["minSurface"],
  }
);

export type UpdateSeekerProfileInput = z.infer<typeof updateSeekerProfileSchema>;

/**
 * Schema for creating a search alert
 */
export const createSearchAlertSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  cities: z.array(z.string()).default([]),
  propertyTypes: z.array(propertyTypeEnum).default([]),
  priceMin: z
    .number()
    .min(0, "Minimum price cannot be negative")
    .optional(),
  priceMax: z
    .number()
    .min(0, "Maximum price cannot be negative")
    .optional(),
  surfaceMin: z
    .number()
    .min(0, "Minimum surface cannot be negative")
    .optional(),
  surfaceMax: z
    .number()
    .min(0, "Maximum surface cannot be negative")
    .optional(),
  mustHaveFeatures: z.array(z.string()).default([]),
  frequency: alertFrequencyEnum.default("DAILY"),
}).refine(
  (data) => {
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  },
  {
    message: "Minimum price cannot exceed maximum price",
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
    message: "Minimum surface cannot exceed maximum surface",
    path: ["surfaceMin"],
  }
);

export type CreateSearchAlertInput = z.infer<typeof createSearchAlertSchema>;

/**
 * Schema for updating a search alert (all fields optional plus active boolean)
 */
export const updateSearchAlertSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  cities: z.array(z.string()).optional(),
  propertyTypes: z.array(propertyTypeEnum).optional(),
  priceMin: z
    .number()
    .min(0, "Minimum price cannot be negative")
    .optional(),
  priceMax: z
    .number()
    .min(0, "Maximum price cannot be negative")
    .optional(),
  surfaceMin: z
    .number()
    .min(0, "Minimum surface cannot be negative")
    .optional(),
  surfaceMax: z
    .number()
    .min(0, "Maximum surface cannot be negative")
    .optional(),
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
    message: "Minimum price cannot exceed maximum price",
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
    message: "Minimum surface cannot exceed maximum surface",
    path: ["surfaceMin"],
  }
);

export type UpdateSearchAlertInput = z.infer<typeof updateSearchAlertSchema>;

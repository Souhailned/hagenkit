import { z } from "zod";
import { PropertyType, PropertyFeature, SortOption } from "@/types/property";

/**
 * Zod schemas for property search validation
 */

export const propertyFiltersSchema = z.object({
  cities: z.array(z.string()).optional(),
  types: z
    .array(z.enum(Object.values(PropertyType) as [string, ...string[]]))
    .optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  areaMin: z.coerce.number().min(0).optional(),
  areaMax: z.coerce.number().min(0).optional(),
  features: z
    .array(z.enum(Object.values(PropertyFeature) as [string, ...string[]]))
    .optional(),
});

export const searchPropertiesSchema = propertyFiltersSchema.extend({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(12),
  sortBy: z
    .enum(Object.values(SortOption) as [string, ...string[]])
    .default("newest"),
  search: z.string().optional(),
});

export type PropertyFiltersInput = z.infer<typeof propertyFiltersSchema>;
export type SearchPropertiesInput = z.infer<typeof searchPropertiesSchema>;

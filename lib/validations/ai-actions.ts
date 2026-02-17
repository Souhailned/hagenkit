import { z } from "zod";

// ============================================================================
// AI Checklist Generator
// ============================================================================

export const checklistInputSchema = z.object({
  type: z.string().min(1, "Type is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  hasExperience: z.boolean(),
  hasLocation: z.boolean(),
  hasFunding: z.boolean(),
});

export type ChecklistInput = z.infer<typeof checklistInputSchema>;

// ============================================================================
// AI Name Generator
// ============================================================================

export const nameInputSchema = z.object({
  type: z.string().min(1, "Type is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  vibe: z.enum(["klassiek", "modern", "gezellig", "chic", "stoer"]),
});

export type NameInput = z.infer<typeof nameInputSchema>;

// ============================================================================
// AI Pitch Generator
// ============================================================================

export const pitchInputSchema = z.object({
  conceptName: z.string().min(1, "Concept naam is verplicht").max(200),
  type: z.string().min(1, "Type is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  uniqueSellingPoint: z.string().min(1, "USP is verplicht").max(500),
  targetAudience: z.string().min(1, "Doelgroep is verplicht").max(200),
  investmentNeeded: z.number().min(0, "Investering moet positief zijn").max(100_000_000),
});

export type PitchInput = z.infer<typeof pitchInputSchema>;

// ============================================================================
// AI Revenue Predictor
// ============================================================================

export const revenueInputSchema = z.object({
  type: z.string().min(1, "Type is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  surface: z.number().min(1, "Oppervlakte moet minimaal 1 m2 zijn").max(10_000),
  seating: z.number().min(0, "Stoelen kan niet negatief zijn").max(5_000),
  priceRange: z.enum(["budget", "midden", "premium"]),
});

export type RevenueInput = z.infer<typeof revenueInputSchema>;

// ============================================================================
// AI Location Score
// ============================================================================

export const locationInputSchema = z.object({
  type: z.string().min(1, "Type is verplicht"),
  city: z.string().min(1, "Stad is verplicht"),
  buurt: z.string().min(1, "Buurt is verplicht").max(200),
});

export type LocationInput = z.infer<typeof locationInputSchema>;

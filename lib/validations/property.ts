import { z } from "zod";

// Property inquiry schema for contact form
export const propertyInquirySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn").max(100, "Naam is te lang"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(10, "Telefoonnummer moet minimaal 10 cijfers zijn").max(15, "Telefoonnummer is te lang").optional().or(z.literal("")),
  message: z.string().min(10, "Bericht moet minimaal 10 karakters zijn").max(2000, "Bericht is te lang"),
  conceptDescription: z.string().max(1000, "Concept beschrijving is te lang").optional().or(z.literal("")),
  budget: z.number().min(0, "Budget moet positief zijn").optional().nullable(),
  intendedUse: z.string().optional().or(z.literal("")),
});

// Schema for recording property views
export const propertyViewSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  deviceType: z.enum(["mobile", "desktop", "tablet"]).optional(),
});

// TypeScript types from schemas
export type PropertyInquiryInput = z.infer<typeof propertyInquirySchema>;
export type PropertyViewInput = z.infer<typeof propertyViewSchema>;

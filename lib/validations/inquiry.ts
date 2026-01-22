import { z } from "zod";

// Budget ranges for the inquiry form
export const BUDGET_RANGES = [
  { value: "0-2000", label: "Tot €2.000/maand" },
  { value: "2000-4000", label: "€2.000 - €4.000/maand" },
  { value: "4000-6000", label: "€4.000 - €6.000/maand" },
  { value: "6000-10000", label: "€6.000 - €10.000/maand" },
  { value: "10000+", label: "Meer dan €10.000/maand" },
  { value: "sale-250000", label: "Tot €250.000" },
  { value: "sale-500000", label: "€250.000 - €500.000" },
  { value: "sale-1000000", label: "€500.000 - €1.000.000" },
  { value: "sale-1000000+", label: "Meer dan €1.000.000" },
] as const;

// Concept types (intended use)
export const CONCEPT_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "bar", label: "Bar" },
  { value: "bistro", label: "Bistro" },
  { value: "lunchroom", label: "Lunchroom" },
  { value: "fastfood", label: "Fastfood" },
  { value: "takeaway", label: "Afhaal/Bezorging" },
  { value: "bakery", label: "Bakkerij" },
  { value: "hotel", label: "Hotel/B&B" },
  { value: "nightclub", label: "Nachtclub" },
  { value: "catering", label: "Catering" },
  { value: "other", label: "Anders" },
] as const;

export const createInquirySchema = z.object({
  propertyId: z.string().min(1, "Property ID is verplicht"),
  name: z
    .string()
    .min(2, "Naam moet minimaal 2 karakters bevatten")
    .max(100, "Naam mag maximaal 100 karakters bevatten"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(val),
      "Ongeldig telefoonnummer"
    ),
  message: z
    .string()
    .min(10, "Bericht moet minimaal 10 karakters bevatten")
    .max(2000, "Bericht mag maximaal 2000 karakters bevatten"),
  intendedUse: z.string().optional(),
  budget: z.string().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;

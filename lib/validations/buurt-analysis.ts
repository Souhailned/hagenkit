import { z } from "zod";

/**
 * Validation schemas for Buurtanalyse 2.0
 */

// Netherlands bounding box (approximate)
export const latSchema = z.number().min(50.5).max(53.7);
export const lngSchema = z.number().min(3.2).max(7.3);

/**
 * Concept string sanitizer:
 * - Strip control characters and non-printable Unicode
 * - Allow letters (incl. Dutch accented), digits, spaces, hyphens, underscores
 * - Collapse multiple spaces
 */
const conceptSchema = z
  .string()
  .min(2)
  .max(100)
  .trim()
  .transform((val) =>
    val
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, "") // strip control chars
      .replace(/[^\p{L}\p{N}\s\-_]/gu, "") // keep letters, digits, spaces, hyphens, underscores
      .replace(/\s+/g, " ") // collapse whitespace
      .trim(),
  )
  .pipe(z.string().min(2).max(100));

export const buurtAnalysisInputSchema = z.object({
  lat: latSchema,
  lng: lngSchema,
  radius: z.number().min(100).max(2000).default(500),
});

export const conceptCheckInputSchema = z.object({
  concept: conceptSchema,
  lat: latSchema,
  lng: lngSchema,
  radius: z.number().min(100).max(2000).default(500),
});

export type BuurtAnalysisInput = z.infer<typeof buurtAnalysisInputSchema>;
export type ConceptCheckInput = z.infer<typeof conceptCheckInputSchema>;

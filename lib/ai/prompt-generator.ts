/**
 * AI Prompt Generator for fal.ai Virtual Staging
 *
 * Generates optimized styling prompts based on property context.
 * Uses AI SDK 6 with GPT-4o-mini for intelligent prompt crafting,
 * with a static fallback if the AI call fails.
 */

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PandContext {
  pandType: string;
  ruimteType: string;
  stijl?: string;
  locatie?: string;
}

export interface GeneratedPrompt {
  prompt: string;
  negativePrompt: string;
}

// ---------------------------------------------------------------------------
// Schema for AI-generated output
// ---------------------------------------------------------------------------

const promptOutputSchema = z.object({
  prompt: z
    .string()
    .describe(
      "A detailed, comma-separated fal.ai image generation prompt describing the desired interior styling. Include lighting, materials, atmosphere, and specific design elements. English only."
    ),
  negativePrompt: z
    .string()
    .describe(
      "A comma-separated list of things to avoid in the generated image. Include common artifacts, unwanted styles, and quality issues. English only."
    ),
});

// ---------------------------------------------------------------------------
// Static fallback prompts
// ---------------------------------------------------------------------------

const FALLBACK_PROMPTS: Record<string, GeneratedPrompt> = {
  RESTAURANT: {
    prompt:
      "modern restaurant interior, warm ambient lighting, wooden tables and chairs, exposed brick walls, elegant table settings, plants and greenery, professional photography, high quality, 8k",
    negativePrompt:
      "blurry, low quality, distorted, people, text, watermark, oversaturated, cartoon, anime, painting",
  },
  CAFE: {
    prompt:
      "cozy cafe interior, natural light through large windows, coffee bar counter, comfortable seating, industrial chic design, hanging pendant lights, plants, professional photography, high quality, 8k",
    negativePrompt:
      "blurry, low quality, distorted, people, text, watermark, oversaturated, cartoon, anime, painting",
  },
  BAR: {
    prompt:
      "stylish bar interior, moody ambient lighting, long bar counter with bar stools, bottle display shelves, dark wood and brass accents, lounge seating area, professional photography, high quality, 8k",
    negativePrompt:
      "blurry, low quality, distorted, people, text, watermark, oversaturated, cartoon, anime, painting, bright daylight",
  },
  HOTEL: {
    prompt:
      "luxury hotel lobby interior, grand entrance, marble floors, elegant furniture, reception desk, chandelier, fresh flowers, warm lighting, professional photography, high quality, 8k",
    negativePrompt:
      "blurry, low quality, distorted, people, text, watermark, oversaturated, cartoon, anime, painting",
  },
  DEFAULT: {
    prompt:
      "modern commercial interior, clean design, professional lighting, contemporary furniture, neutral color palette, professional photography, high quality, 8k",
    negativePrompt:
      "blurry, low quality, distorted, people, text, watermark, oversaturated, cartoon, anime, painting",
  },
};

function getStaticFallback(pandType: string): GeneratedPrompt {
  return FALLBACK_PROMPTS[pandType.toUpperCase()] ?? FALLBACK_PROMPTS.DEFAULT;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

/**
 * Generate an optimized fal.ai styling prompt based on property context.
 *
 * Uses GPT-4o-mini via AI SDK to create a context-aware prompt.
 * Falls back to a static prompt if the AI call fails (no API key, rate limit, etc.).
 */
export async function generateStylingPrompt(
  context: PandContext
): Promise<GeneratedPrompt> {
  // If no OpenAI key is configured, skip the AI call entirely
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "[prompt-generator] OPENAI_API_KEY not set, using static fallback."
    );
    return getStaticFallback(context.pandType);
  }

  try {
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: promptOutputSchema,
      prompt: `You are an expert interior design prompt engineer for AI image generation (fal.ai / Stable Diffusion).

Generate an optimized prompt and negative prompt for virtual staging of a Dutch horeca property.

Property context:
- Type: ${context.pandType} (e.g., restaurant, cafe, bar, hotel, eetcafe, lunchroom)
- Room type: ${context.ruimteType} (e.g., main hall, kitchen, terrace, entrance, bar area)
${context.stijl ? `- Desired style: ${context.stijl}` : "- Desired style: modern, inviting"}
${context.locatie ? `- Location: ${context.locatie}` : ""}

Requirements for the prompt:
1. Be specific about materials, lighting, colors, and atmosphere
2. Include "professional photography, high quality, 8k" for quality
3. Match the style to what would work for a Dutch ${context.pandType.toLowerCase()}
4. The prompt should describe a realistic, aspirational interior
5. Keep it under 200 words
6. English only

Requirements for the negative prompt:
1. Always include: blurry, low quality, distorted, people, text, watermark
2. Add style-specific negatives (e.g., "bright daylight" for a bar)
3. Keep it under 50 words`,
      temperature: 0.7,
    });

    return result.object;
  } catch (error) {
    console.error("[prompt-generator] AI generation failed:", error);
    return getStaticFallback(context.pandType);
  }
}

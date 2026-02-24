/**
 * fal.ai image model via AI SDK 6 — `@ai-sdk/fal` provider.
 *
 * Usage:
 *   import { getFalImageModel } from "@/lib/ai/image-model";
 *   import { generateImage } from "ai";
 *
 *   const result = await generateImage({
 *     model: getFalImageModel("fal-ai/flux-general/inpainting"),
 *     prompt: { images: [sourceImageData], text: "..." },
 *   });
 */

import { createFal } from "@ai-sdk/fal";
import type { ImageModel } from "ai";

/**
 * Returns a fal.ai image model instance configured with the FAL_API_KEY.
 * Throws if the API key is missing so callers get a clear error.
 */
export function getFalImageModel(modelId: string): ImageModel {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[getFalImageModel] FAL_API_KEY is not configured. Set it in .env.local to use AI image generation."
    );
  }

  const provider = createFal({ apiKey });
  return provider.image(modelId);
}

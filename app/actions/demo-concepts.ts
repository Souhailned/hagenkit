"use server";

import prisma from "@/lib/prisma";
import { generateImage } from "ai";
import { getFalImageModel } from "@/lib/ai/image-model";
import { uploadImage, getExtensionFromContentType } from "@/lib/storage";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DEMO_CONCEPT_MODEL = "fal-ai/nano-banana-pro/edit";

/** Maps style IDs to descriptive prompts for the AI model */
const stylePrompts: Record<string, string> = {
  restaurant_modern:
    "A modern restaurant interior with sleek furniture, warm ambient lighting, minimalist table settings, and contemporary wall decor",
  restaurant_klassiek:
    "A classic elegant restaurant interior with wooden furniture, chandeliers, white tablecloths, and traditional decor",
  cafe_gezellig:
    "A cozy Dutch cafe interior with warm wood tones, comfortable seating, plants, and a welcoming atmosphere",
  bar_lounge:
    "A stylish lounge bar interior with mood lighting, modern bar counter, plush seating, and sophisticated cocktail atmosphere",
  hotel_boutique:
    "A boutique hotel lobby interior with designer furniture, statement lighting, art pieces, and luxury finishes",
  lunchroom_hip:
    "A trendy modern lunchroom interior with industrial touches, hanging plants, pastel colors, and Instagram-worthy decor",
};

/* -------------------------------------------------------------------------- */
/*  Server action                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Generate a demo concept image for a property using AI SDK 6 + fal.ai.
 *
 * This is a fire-and-forget action called on first publish.
 * It does NOT require a user session since it runs as a background task
 * triggered from another authenticated action (update-property-status).
 *
 * Flow:
 * 1. Validate style prompt exists
 * 2. Fetch source image bytes
 * 3. Call generateImage() with fal-ai/nano-banana-pro/edit
 * 4. Upload result to R2
 * 5. Upsert PropertyDemoConcept record
 * 6. Log AI usage
 */
export async function generateDemoConcept({
  propertyId,
  style,
  imageUrl,
}: {
  propertyId: string;
  style: string;
  imageUrl: string;
}): Promise<{ success: boolean; imageUrl?: string }> {
  const prompt = stylePrompts[style];
  if (!prompt) {
    throw new Error(`Unknown style: ${style}`);
  }

  // 1. Fetch source image as bytes
  const sourceResponse = await fetch(imageUrl);
  if (!sourceResponse.ok) {
    throw new Error(`Failed to fetch source image: ${sourceResponse.status}`);
  }
  const sourceBytes = new Uint8Array(await sourceResponse.arrayBuffer());

  // 2. Generate image via AI SDK 6 + fal.ai
  const model = getFalImageModel(DEMO_CONCEPT_MODEL);

  const result = await generateImage({
    model,
    prompt: {
      images: [sourceBytes],
      text: prompt,
    },
    providerOptions: {
      fal: {
        num_images: 1,
        output_format: "jpeg",
      },
    },
  });

  const generatedImage = result.image;
  if (!generatedImage) {
    throw new Error("No image returned from AI");
  }

  // 3. Upload result to R2
  const contentType = generatedImage.mediaType || "image/jpeg";
  const ext = getExtensionFromContentType(contentType);
  const storagePath = `demo-concepts/${propertyId}/${style}.${ext}`;

  const imageBuffer = Buffer.from(generatedImage.uint8Array);
  const publicUrl = await uploadImage(imageBuffer, storagePath, contentType);

  if (!publicUrl) {
    throw new Error("Failed to upload to R2");
  }

  // 4. Upsert PropertyDemoConcept
  await prisma.propertyDemoConcept.upsert({
    where: { propertyId_style: { propertyId, style } },
    update: {
      imageUrl: publicUrl,
      sourceUrl: imageUrl,
      generatedAt: new Date(),
      isActive: true,
    },
    create: {
      propertyId,
      style,
      imageUrl: publicUrl,
      sourceUrl: imageUrl,
    },
  });

  // 5. Log AI usage
  await prisma.aiUsageLog.create({
    data: {
      service: "fal-ai",
      model: DEMO_CONCEPT_MODEL,
      feature: "demo-concept",
      costCents: 3, // ~EUR 0.03 per generation
      status: "success",
      metadata: { propertyId, style },
    },
  });

  return { success: true, imageUrl: publicUrl };
}

/* -------------------------------------------------------------------------- */
/*  Batch generation with retry logic                                         */
/* -------------------------------------------------------------------------- */

/**
 * Generate all 6 demo concepts for a property with retry logic.
 *
 * Called on first publish. Runs sequentially with pauses between styles
 * to avoid rate limits on the fal.ai API.
 *
 * This is a fire-and-forget function — it does NOT require a user session
 * since it is triggered from another authenticated action.
 *
 * Flow per style:
 * 1. Upsert a pending record (status: "generating")
 * 2. Call generateDemoConcept (which upserts imageUrl + logs success)
 * 3. On success: update status to "completed"
 * 4. On failure: retry with exponential backoff, then mark "failed"
 */
export async function generateAllDemoConcepts(
  propertyId: string,
  sourceImageUrl: string
): Promise<{ total: number; succeeded: number; failed: number }> {
  const styles = Object.keys(stylePrompts);
  let succeeded = 0;
  let failed = 0;

  const MAX_RETRIES = 2;
  const BACKOFF_MS = [5_000, 15_000]; // 5s after 1st fail, 15s after 2nd
  const PAUSE_BETWEEN_STYLES_MS = 2_000;

  for (const style of styles) {
    // 1. Create/update pending record before generation starts
    await prisma.propertyDemoConcept.upsert({
      where: { propertyId_style: { propertyId, style } },
      update: { status: "generating", sourceUrl: sourceImageUrl },
      create: {
        propertyId,
        style,
        sourceUrl: sourceImageUrl,
        status: "generating",
      },
    });

    // 2. Attempt generation with retries
    let success = false;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Back off before retries (not before the first attempt)
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt - 1]));
        }

        const result = await generateDemoConcept({
          propertyId,
          style,
          imageUrl: sourceImageUrl,
        });

        if (result.success) {
          // generateDemoConcept already upserted imageUrl + generatedAt + logged usage.
          // We only need to set the status to "completed".
          await prisma.propertyDemoConcept.update({
            where: { propertyId_style: { propertyId, style } },
            data: { status: "completed" },
          });
          success = true;
          succeeded++;
          break;
        }
      } catch (error) {
        const isFinalAttempt = attempt === MAX_RETRIES;
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";

        // Update the record with retry count and error info
        await prisma.propertyDemoConcept.update({
          where: { propertyId_style: { propertyId, style } },
          data: {
            status: isFinalAttempt ? "failed" : "generating",
            retryCount: attempt + 1,
            errorMessage: errorMsg,
          },
        });

        // Log every failed attempt to AiUsageLog for cost/debugging visibility
        await prisma.aiUsageLog
          .create({
            data: {
              service: "fal-ai",
              model: DEMO_CONCEPT_MODEL,
              feature: "demo-concept",
              costCents: 0,
              status: "failed",
              metadata: {
                propertyId,
                style,
                attempt: attempt + 1,
                error: errorMsg,
              },
            },
          })
          .catch(() => {
            // Swallow logging errors — don't let them break the retry loop
          });
      }
    }

    if (!success) {
      failed++;
    }

    // 3. Pause between styles to respect rate limits
    await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_STYLES_MS));
  }

  return { total: styles.length, succeeded, failed };
}

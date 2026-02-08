import { task, logger } from "@trigger.dev/sdk";
import { fal } from "@fal-ai/client";
import prisma from "@/lib/prisma";
import {
  uploadImage,
  getExtensionFromContentType,
  generateImagePath,
} from "@/lib/supabase";
import { recomputeImageProjectCounters } from "@/lib/image-project-state";

fal.config({
  credentials: process.env.FAL_API_KEY!,
});

export interface ProcessImagePayload {
  imageId: string;
}

export const processImageTask = task({
  id: "process-image",
  maxDuration: 300,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload: ProcessImagePayload) => {
    const { imageId } = payload;

    logger.info("Starting image processing", { imageId });

    try {
      const image = await prisma.image.findUnique({
        where: { id: imageId },
        include: {
          project: {
            select: { id: true, workspaceId: true },
          },
        },
      });

      if (!image) {
        throw new Error(`Image not found: ${imageId}`);
      }

      if (image.status === "COMPLETED") {
        logger.info("Image already processed, skipping", { imageId });
        return { success: true, skipped: true };
      }

      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: "PROCESSING",
          metadata: {
            ...(image.metadata as object),
            startedAt: new Date().toISOString(),
            model: "fal-ai/nano-banana-pro",
          },
        },
      });

      const originalImageResponse = await fetch(image.originalImageUrl);
      if (!originalImageResponse.ok) {
        throw new Error(`Failed to fetch original image: ${originalImageResponse.status}`);
      }

      const originalImageBlob = await originalImageResponse.blob();
      const originalImageFile = new File([originalImageBlob], "original.jpg", {
        type: originalImageBlob.type || "image/jpeg",
      });

      const falImageUrl = await fal.storage.upload(originalImageFile);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (fal as any).subscribe("fal-ai/nano-banana-pro", {
        input: {
          prompt: image.prompt,
          image_urls: [falImageUrl],
          num_images: 1,
          output_format: "jpeg",
        },
        logs: true,
      });

      const output = (result as { data?: unknown }).data ?? result;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const images = ((output as any)?.images || (output as any)?.output || []) as
        | Array<{ url?: string; content_type?: string } | string>
        | undefined;

      if (!images?.length) {
        throw new Error("No result image generated");
      }

      const first = images[0];
      const resultImageUrl = typeof first === "string" ? first : first.url;
      const contentType =
        typeof first === "string" ? "image/jpeg" : first.content_type || "image/jpeg";

      if (!resultImageUrl) {
        throw new Error("Result image URL missing");
      }

      const resultResponse = await fetch(resultImageUrl);
      if (!resultResponse.ok) {
        throw new Error(`Failed to fetch result image: ${resultResponse.status}`);
      }

      const resultBlob = await resultResponse.blob();
      const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
      const normalizedContentType = resultBlob.type || contentType;
      const extension = getExtensionFromContentType(normalizedContentType);

      const resultPath = generateImagePath(
        image.project.workspaceId,
        image.project.id,
        imageId,
        "result",
        extension
      );

      const publicUrl = await uploadImage(resultBuffer, resultPath, normalizedContentType);
      if (!publicUrl) {
        throw new Error("Failed to upload result image to Supabase");
      }

      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: "COMPLETED",
          resultImageUrl: publicUrl,
          errorMessage: null,
          metadata: {
            ...(image.metadata as object),
            completedAt: new Date().toISOString(),
            status: "completed",
            model: "fal-ai/nano-banana-pro",
          },
        },
      });

      await recomputeImageProjectCounters(image.project.id);

      logger.info("Image processing completed", { imageId, resultUrl: publicUrl });

      return {
        success: true,
        imageId,
        resultImageUrl: publicUrl,
      };
    } catch (error) {
      logger.error("Image processing failed", {
        imageId,
        error: error instanceof Error ? error.message : String(error),
      });

      const failedImage = await prisma.image.update({
        where: { id: imageId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Processing failed",
          metadata: {
            failedAt: new Date().toISOString(),
          },
        },
        select: {
          projectId: true,
        },
      });

      await recomputeImageProjectCounters(failedImage.projectId);

      throw error;
    }
  },
});

import { task, logger } from "@trigger.dev/sdk";
import { fal } from "@fal-ai/client";
import prisma from "@/lib/prisma";
import { uploadImage, getExtensionFromContentType, generateImagePath } from "@/lib/supabase";

// Configure Fal.ai
fal.config({
  credentials: process.env.FAL_API_KEY!,
});

export interface ProcessImagePayload {
  imageId: string;
}

export const processImageTask = task({
  id: "process-image",
  maxDuration: 300, // 5 minutes
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
      // Step 1: Fetch image from database
      logger.info("Fetching image from database", { step: 1, progress: 10 });

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

      // Update status to processing
      await prisma.image.update({
        where: { id: imageId },
        data: { status: "PROCESSING" },
      });

      // Step 2: Upload original image to Fal.ai
      logger.info("Uploading image to Fal.ai", { step: 2, progress: 25 });

      const originalImageResponse = await fetch(image.originalImageUrl);
      if (!originalImageResponse.ok) {
        throw new Error("Failed to fetch original image");
      }

      const originalImageBlob = await originalImageResponse.blob();
      const originalImageFile = new File([originalImageBlob], "original.jpg", {
        type: originalImageBlob.type || "image/jpeg",
      });

      const falImageUrl = await fal.storage.upload(originalImageFile);

      // Step 3: Call AI model
      logger.info("Processing with AI model", { step: 3, progress: 50 });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (fal as any).subscribe("fal-ai/nano-banana-pro", {
        input: {
          prompt: image.prompt,
          image_urls: [falImageUrl],
          num_images: 1,
          output_format: "jpeg",
        },
        logs: true,
        onQueueUpdate: (update: { status: string; logs?: { message: string }[] }) => {
          if (update.status === "IN_PROGRESS") {
            logger.info("AI processing in progress", {
              logs: update.logs?.map((l) => l.message),
            });
          }
        },
      });

      // Handle response - could be wrapped or direct
      const resultData = "data" in result ? result.data : result;
      const images = resultData.images || resultData.output || [];

      if (!images || images.length === 0) {
        throw new Error("No result image generated");
      }

      const resultImage = images[0];
      const resultImageUrl =
        typeof resultImage === "string" ? resultImage : resultImage.url;

      // Step 4: Save result to Supabase
      logger.info("Saving result to Supabase", { step: 4, progress: 80 });

      const resultResponse = await fetch(resultImageUrl);
      if (!resultResponse.ok) {
        throw new Error("Failed to fetch result image");
      }

      const resultBlob = await resultResponse.blob();
      const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
      const contentType = resultBlob.type || "image/jpeg";
      const extension = getExtensionFromContentType(contentType);

      const resultPath = generateImagePath(
        image.project.workspaceId,
        image.project.id,
        imageId,
        "result",
        extension
      );

      const publicUrl = await uploadImage(resultBuffer, resultPath, contentType);

      if (!publicUrl) {
        throw new Error("Failed to upload result image to Supabase");
      }

      // Step 5: Update database
      logger.info("Updating database", { step: 5, progress: 100 });

      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: "COMPLETED",
          resultImageUrl: publicUrl,
          errorMessage: null,
          metadata: {
            ...(image.metadata as object),
            processedAt: new Date().toISOString(),
            status: "completed",
          },
        },
      });

      // Update project completed count
      await prisma.imageProject.update({
        where: { id: image.project.id },
        data: {
          completedCount: { increment: 1 },
        },
      });

      // Check if all images are completed
      const project = await prisma.imageProject.findUnique({
        where: { id: image.project.id },
        select: { imageCount: true, completedCount: true },
      });

      if (project && project.completedCount >= project.imageCount) {
        await prisma.imageProject.update({
          where: { id: image.project.id },
          data: { status: "COMPLETED" },
        });
      }

      logger.info("Image processing completed", {
        imageId,
        resultUrl: publicUrl,
      });

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

      // Update image status to failed
      await prisma.image.update({
        where: { id: imageId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Processing failed",
        },
      });

      throw error;
    }
  },
});

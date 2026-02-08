import { task, logger } from "@trigger.dev/sdk";
import { fal } from "@fal-ai/client";
import prisma from "@/lib/prisma";
import {
  uploadImage,
  getExtensionFromContentType,
  generateImagePath,
} from "@/lib/supabase";
import { recomputeImageProjectCounters } from "@/lib/image-project-state";

export type EditMode = "remove" | "add";

export interface InpaintImagePayload {
  imageId: string;
  newImageId: string;
  prompt: string;
  mode: EditMode;
  maskDataUrl?: string;
}

fal.config({
  credentials: process.env.FAL_API_KEY!,
});

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const binary = Buffer.from(b64, "base64");
  const blob = new Blob([binary], { type: mime });
  return new File([blob], filename, { type: mime });
}

export const inpaintImageTask = task({
  id: "inpaint-image",
  maxDuration: 300,
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload: InpaintImagePayload) => {
    const { imageId, newImageId, prompt, mode, maskDataUrl } = payload;

    try {
      const sourceImage = await prisma.image.findUnique({
        where: { id: imageId },
        include: {
          project: {
            select: { id: true, workspaceId: true },
          },
        },
      });

      if (!sourceImage) {
        throw new Error(`Source image not found: ${imageId}`);
      }

      const newImage = await prisma.image.findUnique({
        where: { id: newImageId },
      });

      if (!newImage) {
        throw new Error(`Target image version not found: ${newImageId}`);
      }

      const sourceUrl = sourceImage.resultImageUrl || sourceImage.originalImageUrl;
      const sourceResponse = await fetch(sourceUrl);
      if (!sourceResponse.ok) {
        throw new Error(`Failed to fetch source image: ${sourceResponse.status}`);
      }

      const sourceBlob = await sourceResponse.blob();
      const sourceFile = new File([sourceBlob], "source.jpg", {
        type: sourceBlob.type || "image/jpeg",
      });
      const falSourceUrl = await fal.storage.upload(sourceFile);

      let outputUrl: string | undefined;
      let outputContentType = "image/jpeg";

      if (mode === "remove") {
        if (!maskDataUrl) {
          throw new Error("Mask is required for remove mode");
        }

        const maskFile = dataUrlToFile(maskDataUrl, "mask.png");
        const falMaskUrl = await fal.storage.upload(maskFile);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (fal as any).subscribe("fal-ai/flux-pro/v1/fill", {
          input: {
            image_url: falSourceUrl,
            mask_url: falMaskUrl,
            prompt,
            output_format: "jpeg",
          },
          logs: true,
        });

        const output = (result as { data?: unknown }).data ?? result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const images = ((output as any)?.images || []) as
          | Array<{ url?: string; content_type?: string }>
          | undefined;

        outputUrl = images?.[0]?.url;
        outputContentType = images?.[0]?.content_type || "image/jpeg";
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (fal as any).subscribe("fal-ai/nano-banana-pro/edit", {
          input: {
            prompt,
            image_urls: [falSourceUrl],
            num_images: 1,
            output_format: "jpeg",
          },
          logs: true,
        });

        const output = (result as { data?: unknown }).data ?? result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const images = ((output as any)?.images || []) as
          | Array<{ url?: string; content_type?: string }>
          | undefined;

        outputUrl = images?.[0]?.url;
        outputContentType = images?.[0]?.content_type || "image/jpeg";
      }

      if (!outputUrl) {
        throw new Error("No edited image returned by model");
      }

      const editedResponse = await fetch(outputUrl);
      if (!editedResponse.ok) {
        throw new Error(`Failed to fetch edited image: ${editedResponse.status}`);
      }

      const editedBlob = await editedResponse.blob();
      const editedBuffer = Buffer.from(await editedBlob.arrayBuffer());
      const contentType = editedBlob.type || outputContentType || "image/jpeg";
      const extension = getExtensionFromContentType(contentType);

      const storagePath = generateImagePath(
        sourceImage.project.workspaceId,
        sourceImage.project.id,
        newImageId,
        "result",
        extension
      );

      const publicUrl = await uploadImage(editedBuffer, storagePath, contentType);
      if (!publicUrl) {
        throw new Error("Failed to upload edited image to Supabase");
      }

      await prisma.image.update({
        where: { id: newImageId },
        data: {
          status: "COMPLETED",
          resultImageUrl: publicUrl,
          errorMessage: null,
          metadata: {
            ...(newImage.metadata as object),
            completedAt: new Date().toISOString(),
            model:
              mode === "remove"
                ? "fal-ai/flux-pro/v1/fill"
                : "fal-ai/nano-banana-pro/edit",
          },
        },
      });

      await recomputeImageProjectCounters(sourceImage.project.id);

      return {
        success: true,
        imageId: newImageId,
        resultImageUrl: publicUrl,
      };
    } catch (error) {
      logger.error("Inpaint processing failed", {
        imageId,
        newImageId,
        error: error instanceof Error ? error.message : String(error),
      });

      const failed = await prisma.image.update({
        where: { id: newImageId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Image edit failed",
          metadata: {
            failedAt: new Date().toISOString(),
          },
        },
        select: {
          projectId: true,
        },
      });

      await recomputeImageProjectCounters(failed.projectId);
      throw error;
    }
  },
});

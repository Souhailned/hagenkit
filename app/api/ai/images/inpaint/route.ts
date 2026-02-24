import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { fal } from "@/lib/fal";
import prisma from "@/lib/prisma";
import {
  uploadImage,
  getExtensionFromContentType,
  generateImagePath,
} from "@/lib/storage";
import { recomputeImageProjectCounters } from "@/lib/image-project-state";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const inpaintRequestSchema = z.object({
  imageId: z.string().uuid(),
  newImageId: z.string().uuid(),
  prompt: z.string().min(1).max(2000),
  mode: z.enum(["remove", "add"]),
  maskDataUrl: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types for fal.ai response
// ---------------------------------------------------------------------------

interface FalImage {
  url?: string;
  content_type?: string;
}

interface FalSubscribeResult {
  data?: {
    images?: FalImage[];
  };
  images?: FalImage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const binary = Buffer.from(b64, "base64");
  const blob = new Blob([binary], { type: mime });
  return new File([blob], filename, { type: mime });
}

function extractFalImages(result: FalSubscribeResult): FalImage[] {
  const output = result.data ?? result;
  return (output as { images?: FalImage[] }).images ?? [];
}

// ---------------------------------------------------------------------------
// POST handler — SSE streaming inpaint
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = inpaintRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { imageId, newImageId, prompt, mode, maskDataUrl } = parsed.data;

  // 3. SSE streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(sseEvent(data)));
      }

      try {
        // ---------------------------------------------------------------
        // Fetch source image from DB
        // ---------------------------------------------------------------
        const sourceImage = await prisma.image.findUnique({
          where: { id: imageId },
          include: {
            project: {
              select: { id: true, workspaceId: true },
            },
          },
        });

        if (!sourceImage) {
          send({ type: "error", message: `Source image not found: ${imageId}` });
          controller.close();
          return;
        }

        const newImage = await prisma.image.findUnique({
          where: { id: newImageId },
        });

        if (!newImage) {
          send({ type: "error", message: `Target image version not found: ${newImageId}` });
          controller.close();
          return;
        }

        // ---------------------------------------------------------------
        // Upload source image to fal.ai storage
        // ---------------------------------------------------------------
        send({ type: "progress", step: "uploading", pct: 10 });

        const sourceUrl = sourceImage.resultImageUrl || sourceImage.originalImageUrl;
        const sourceResponse = await fetch(sourceUrl);
        if (!sourceResponse.ok) {
          send({ type: "error", message: `Failed to fetch source image: ${sourceResponse.status}` });
          controller.close();
          return;
        }

        const sourceBlob = await sourceResponse.blob();
        const sourceFile = new File([sourceBlob], "source.jpg", {
          type: sourceBlob.type || "image/jpeg",
        });
        const falSourceUrl = await fal.storage.upload(sourceFile);

        send({ type: "progress", step: "uploading", pct: 30 });

        // ---------------------------------------------------------------
        // Call fal.ai model
        // ---------------------------------------------------------------
        send({ type: "progress", step: "generating", pct: 40 });

        let outputUrl: string | undefined;
        let outputContentType = "image/jpeg";

        if (mode === "remove") {
          if (!maskDataUrl) {
            send({ type: "error", message: "Mask is required for remove mode" });
            controller.close();
            return;
          }

          const maskFile = dataUrlToFile(maskDataUrl, "mask.png");
          const falMaskUrl = await fal.storage.upload(maskFile);

          const result: FalSubscribeResult = await fal.subscribe(
            "fal-ai/flux-pro/v1/fill",
            {
              input: {
                image_url: falSourceUrl,
                mask_url: falMaskUrl,
                prompt,
                output_format: "jpeg",
              },
              logs: true,
            }
          );

          const images = extractFalImages(result);
          outputUrl = images[0]?.url;
          outputContentType = images[0]?.content_type || "image/jpeg";
        } else {
          // mode === "add"
          const result: FalSubscribeResult = await fal.subscribe(
            "fal-ai/nano-banana-pro/edit",
            {
              input: {
                prompt,
                image_urls: [falSourceUrl],
                num_images: 1,
                output_format: "jpeg",
              },
              logs: true,
            }
          );

          const images = extractFalImages(result);
          outputUrl = images[0]?.url;
          outputContentType = images[0]?.content_type || "image/jpeg";
        }

        send({ type: "progress", step: "generating", pct: 70 });

        if (!outputUrl) {
          throw new Error("No edited image returned by model");
        }

        // ---------------------------------------------------------------
        // Download result and save to R2
        // ---------------------------------------------------------------
        send({ type: "progress", step: "saving", pct: 80 });

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
          throw new Error("Failed to upload edited image to storage");
        }

        send({ type: "progress", step: "saving", pct: 90 });

        // ---------------------------------------------------------------
        // Update DB: mark as COMPLETED
        // ---------------------------------------------------------------
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

        // ---------------------------------------------------------------
        // Send done event
        // ---------------------------------------------------------------
        send({
          type: "done",
          imageId: newImageId,
          resultImageUrl: publicUrl,
        });

        controller.close();
      } catch (error) {
        // ---------------------------------------------------------------
        // Handle failure: update DB + send error event
        // ---------------------------------------------------------------
        const errorMessage =
          error instanceof Error ? error.message : "Image edit failed";

        console.error("[api/ai/images/inpaint] Processing failed:", {
          imageId,
          newImageId,
          error: errorMessage,
        });

        try {
          const failed = await prisma.image.update({
            where: { id: newImageId },
            data: {
              status: "FAILED",
              errorMessage,
              metadata: {
                failedAt: new Date().toISOString(),
              },
            },
            select: {
              projectId: true,
            },
          });

          await recomputeImageProjectCounters(failed.projectId);
        } catch (dbError) {
          console.error(
            "[api/ai/images/inpaint] Failed to update image status on error:",
            dbError
          );
        }

        send({ type: "error", message: errorMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { fal } from "@fal-ai/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  uploadImage,
  getExtensionFromContentType,
  generateImagePath,
} from "@/lib/storage";
import { recomputeImageProjectCounters } from "@/lib/image-project-state";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const processImageSchema = z.object({
  imageId: z.string().min(1, "imageId is required"),
});

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

type SSEProgressEvent = {
  type: "progress";
  step: "fetching" | "uploading" | "generating" | "saving";
  pct: number;
};

type SSEDoneEvent = {
  type: "done";
  imageId: string;
  resultImageUrl: string;
};

type SSEErrorEvent = {
  type: "error";
  message: string;
};

type SSEEvent = SSEProgressEvent | SSEDoneEvent | SSEErrorEvent;

function sseEvent(data: SSEEvent): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ---------------------------------------------------------------------------
// fal.ai result types
// ---------------------------------------------------------------------------

interface FalImageEntry {
  url?: string;
  content_type?: string;
}

type FalResultImages = Array<FalImageEntry | string> | undefined;

interface FalOutputShape {
  images?: FalResultImages;
  output?: FalResultImages;
}

// ---------------------------------------------------------------------------
// POST handler — SSE streaming image processing
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse & validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = processImageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { imageId } = parsed.data;

  // 3. Configure fal.ai credentials
  fal.config({
    credentials: process.env.FAL_API_KEY!,
  });

  // 4. Create SSE stream
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: SSEEvent) => {
        controller.enqueue(encoder.encode(sseEvent(data)));
      };

      try {
        // ---------------------------------------------------------------
        // Step 1: Fetch image from DB
        // ---------------------------------------------------------------
        send({ type: "progress", step: "fetching", pct: 10 });

        const image = await prisma.image.findUnique({
          where: { id: imageId },
          include: {
            project: {
              select: { id: true, workspaceId: true },
            },
          },
        });

        if (!image) {
          send({ type: "error", message: `Image not found: ${imageId}` });
          controller.close();
          return;
        }

        // Verify workspace membership
        const member = await prisma.workspaceMember.findFirst({
          where: {
            userId: session.user.id,
            workspaceId: image.project.workspaceId,
          },
        });

        if (!member) {
          send({ type: "error", message: "Not a workspace member" });
          controller.close();
          return;
        }

        // Skip already completed images
        if (image.status === "COMPLETED") {
          send({
            type: "done",
            imageId,
            resultImageUrl: image.resultImageUrl ?? "",
          });
          controller.close();
          return;
        }

        // ---------------------------------------------------------------
        // Step 2: Mark as PROCESSING
        // ---------------------------------------------------------------
        await prisma.image.update({
          where: { id: imageId },
          data: {
            status: "PROCESSING",
            metadata: {
              ...(image.metadata as Record<string, unknown>),
              startedAt: new Date().toISOString(),
              model: "fal-ai/nano-banana-pro",
            },
          },
        });

        // ---------------------------------------------------------------
        // Step 3: Download original image
        // ---------------------------------------------------------------
        send({ type: "progress", step: "uploading", pct: 30 });

        const originalImageResponse = await fetch(image.originalImageUrl);
        if (!originalImageResponse.ok) {
          throw new Error(
            `Failed to fetch original image: ${originalImageResponse.status}`
          );
        }

        const originalImageBlob = await originalImageResponse.blob();
        const originalImageFile = new File(
          [originalImageBlob],
          "original.jpg",
          { type: originalImageBlob.type || "image/jpeg" }
        );

        // ---------------------------------------------------------------
        // Step 4: Upload to fal.ai storage
        // ---------------------------------------------------------------
        const falImageUrl = await fal.storage.upload(originalImageFile);

        // ---------------------------------------------------------------
        // Step 5: Call fal.ai model
        // ---------------------------------------------------------------
        send({ type: "progress", step: "generating", pct: 50 });

        const result = await (fal as unknown as {
          subscribe: (
            model: string,
            options: {
              input: Record<string, unknown>;
              logs: boolean;
            }
          ) => Promise<{ data?: FalOutputShape } & FalOutputShape>;
        }).subscribe("fal-ai/nano-banana-pro", {
          input: {
            prompt: image.prompt,
            image_urls: [falImageUrl],
            num_images: 1,
            output_format: "jpeg",
          },
          logs: true,
        });

        const output: FalOutputShape =
          (result as { data?: FalOutputShape }).data ?? result;
        const images: FalResultImages =
          output?.images ?? output?.output ?? [];

        if (!images?.length) {
          throw new Error("No result image generated");
        }

        const first = images[0];
        const resultImageUrl =
          typeof first === "string" ? first : first?.url;
        const contentType =
          typeof first === "string"
            ? "image/jpeg"
            : first?.content_type || "image/jpeg";

        if (!resultImageUrl) {
          throw new Error("Result image URL missing");
        }

        // ---------------------------------------------------------------
        // Step 6: Download result & upload to R2
        // ---------------------------------------------------------------
        send({ type: "progress", step: "saving", pct: 80 });

        const resultResponse = await fetch(resultImageUrl);
        if (!resultResponse.ok) {
          throw new Error(
            `Failed to fetch result image: ${resultResponse.status}`
          );
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

        const publicUrl = await uploadImage(
          resultBuffer,
          resultPath,
          normalizedContentType
        );

        if (!publicUrl) {
          throw new Error("Failed to upload result image to storage");
        }

        // ---------------------------------------------------------------
        // Step 7: Update DB — COMPLETED
        // ---------------------------------------------------------------
        await prisma.image.update({
          where: { id: imageId },
          data: {
            status: "COMPLETED",
            resultImageUrl: publicUrl,
            errorMessage: null,
            metadata: {
              ...(image.metadata as Record<string, unknown>),
              completedAt: new Date().toISOString(),
              status: "completed",
              model: "fal-ai/nano-banana-pro",
            },
          },
        });

        await recomputeImageProjectCounters(image.project.id);

        // ---------------------------------------------------------------
        // Done
        // ---------------------------------------------------------------
        send({ type: "done", imageId, resultImageUrl: publicUrl });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Processing failed";

        console.error("[api/ai/images/process] Error:", errorMessage);

        // Update DB to FAILED
        try {
          const failedImage = await prisma.image.update({
            where: { id: imageId },
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

          await recomputeImageProjectCounters(failedImage.projectId);
        } catch (dbError) {
          console.error(
            "[api/ai/images/process] Failed to update error state:",
            dbError
          );
        }

        send({ type: "error", message: errorMessage });
      } finally {
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

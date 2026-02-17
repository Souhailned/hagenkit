"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import { checkRateLimit } from "@/lib/rate-limit";

/** Maps visual style IDs to descriptive prompts for the AI model */
const stylePrompts: Record<string, string> = {
  restaurant_modern:
    "A modern restaurant interior with sleek furniture, warm ambient lighting, minimalist table settings, and contemporary wall decor",
  restaurant_klassiek:
    "A classic elegant restaurant interior with wooden furniture, chandeliers, white tablecloths, and traditional decor",
  cafe_gezellig:
    "A cozy Dutch café interior with warm wood tones, comfortable seating, plants, and a welcoming atmosphere",
  bar_lounge:
    "A stylish lounge bar interior with mood lighting, modern bar counter, plush seating, and sophisticated cocktail atmosphere",
  hotel_boutique:
    "A boutique hotel lobby interior with designer furniture, statement lighting, art pieces, and luxury finishes",
  lunchroom_hip:
    "A trendy modern lunchroom interior with industrial touches, hanging plants, pastel colors, and Instagram-worthy decor",
  leeg: "An empty clean commercial space with white walls and natural light",
};

// Get current user's active workspace
async function getActiveWorkspace() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sessionData = session?.session as
    | { activeWorkspaceId?: string }
    | undefined;

  if (!session?.user?.id || !sessionData?.activeWorkspaceId) {
    return null;
  }

  return {
    userId: session.user.id,
    workspaceId: sessionData.activeWorkspaceId,
  };
}

interface VirtualStagingInput {
  propertyId: string;
  imageUrl: string;
  style: string;
}

/**
 * Triggers a virtual staging job via Trigger.dev.
 *
 * Flow:
 * 1. Find or create an ImageProject linked to the property
 * 2. Create a source Image record for the original photo
 * 3. Create a placeholder Image record for the result
 * 4. Trigger the inpaint task with "add" mode (virtual staging)
 * 5. Return the run ID + new image ID so the client can poll for completion
 */
export async function triggerVirtualStaging(
  input: VirtualStagingInput
): Promise<ActionResult<{ runId: string; newImageId: string }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Je moet ingelogd zijn" };
    }

    // Rate limit
    const rateLimitResult = await checkRateLimit(context.userId, "ai");
    if (!rateLimitResult.success) {
      return { success: false, error: "Rate limit exceeded. Try again later." };
    }

    const { propertyId, imageUrl, style } = input;

    // Validate style
    const prompt = stylePrompts[style];
    if (!prompt) {
      return { success: false, error: "Ongeldige stijl geselecteerd" };
    }

    // Find or create an ImageProject for this property
    let project = await prisma.imageProject.findFirst({
      where: {
        propertyId,
        workspaceId: context.workspaceId,
        name: "Virtual Staging",
      },
    });

    if (!project) {
      project = await prisma.imageProject.create({
        data: {
          workspaceId: context.workspaceId,
          userId: context.userId,
          propertyId,
          name: "Virtual Staging",
          styleTemplateId: style,
          status: "PROCESSING",
        },
      });
    }

    // Find or create the source image record
    let sourceImage = await prisma.image.findFirst({
      where: {
        projectId: project.id,
        originalImageUrl: imageUrl,
        parentId: null, // root image
      },
    });

    if (!sourceImage) {
      sourceImage = await prisma.image.create({
        data: {
          workspaceId: context.workspaceId,
          userId: context.userId,
          projectId: project.id,
          originalImageUrl: imageUrl,
          resultImageUrl: imageUrl, // source is already "complete"
          prompt: "Original property photo",
          version: 1,
          status: "COMPLETED",
        },
      });
    }

    // Determine next version
    const latestVersion = await prisma.image.findFirst({
      where: {
        projectId: project.id,
        OR: [{ id: sourceImage.id }, { parentId: sourceImage.id }],
      },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version || 1) + 1;

    // Create a placeholder for the result
    const placeholder = await prisma.image.create({
      data: {
        workspaceId: context.workspaceId,
        userId: context.userId,
        projectId: project.id,
        originalImageUrl: imageUrl,
        resultImageUrl: null,
        prompt,
        version: nextVersion,
        parentId: sourceImage.id,
        status: "PROCESSING",
        metadata: {
          virtualStaging: true,
          style,
          queuedAt: new Date().toISOString(),
        },
      },
    });

    // Trigger the inpaint task in "add" mode (virtual staging = adding furniture/decor)
    const { inpaintImageTask } = await import("@/trigger/inpaint-image");

    const handle = await inpaintImageTask.trigger({
      imageId: sourceImage.id,
      newImageId: placeholder.id,
      prompt,
      mode: "add",
    });

    // Update metadata with run ID
    await prisma.image.update({
      where: { id: placeholder.id },
      data: {
        metadata: {
          ...(placeholder.metadata as object),
          runId: handle.id,
          startedAt: new Date().toISOString(),
          model: "fal-ai/nano-banana-pro/edit",
        },
      },
    });

    revalidatePath(`/aanbod`);
    return {
      success: true,
      data: { runId: handle.id, newImageId: placeholder.id },
    };
  } catch (error) {
    console.error("[triggerVirtualStaging] Error:", error);
    return { success: false, error: "Kon de visualisatie niet starten" };
  }
}

/**
 * Poll the status of a virtual staging job.
 */
export async function getVirtualStagingStatus(
  newImageId: string
): Promise<ActionResult<{ status: string; resultUrl?: string }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Niet ingelogd" };
    }

    const image = await prisma.image.findFirst({
      where: {
        id: newImageId,
        workspaceId: context.workspaceId,
      },
      select: {
        status: true,
        resultImageUrl: true,
        errorMessage: true,
      },
    });

    if (!image) {
      return { success: false, error: "Afbeelding niet gevonden" };
    }

    if (image.status === "FAILED") {
      return {
        success: false,
        error: image.errorMessage || "Verwerking mislukt",
      };
    }

    return {
      success: true,
      data: {
        status: image.status,
        resultUrl: image.resultImageUrl || undefined,
      },
    };
  } catch (error) {
    console.error("[getVirtualStagingStatus] Error:", error);
    return { success: false, error: "Kon status niet ophalen" };
  }
}

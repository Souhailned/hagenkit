"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CreateInpaintPlaceholderInput {
  sourceImageId?: string;
  sourceConceptId?: string;
  sourceImageUrl?: string;
  prompt: string;
  mode: "remove" | "add";
  propertyId?: string;
}

/* -------------------------------------------------------------------------- */
/*  createInpaintPlaceholder                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Create a placeholder Image record for an inpaint operation.
 * The actual generation is done via the SSE endpoint /api/ai/images/inpaint.
 *
 * Supports three source types:
 * 1. sourceImageId  -- An existing Image record
 * 2. sourceConceptId -- A PropertyDemoConcept (creates Image record from it)
 * 3. sourceImageUrl  -- A raw URL (creates Image record from it)
 */
export async function createInpaintPlaceholder(
  input: CreateInpaintPlaceholderInput
): Promise<ActionResult<{ newImageId: string; sourceImageId: string }>> {
  try {
    // ---- Auth + permission check ----
    const authCheck = await requirePermission("ai:visualize");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error ?? "Geen toegang" };
    }
    const { userId } = authCheck.data!;

    // ---- Quota check ----
    const { canUserGenerate, incrementAiEditCount } = await import(
      "@/app/actions/ai-quota"
    );
    const quotaCheck = await canUserGenerate(userId);
    if (!quotaCheck.allowed) {
      return {
        success: false,
        error: "Je hebt je gratis AI bewerkingen opgebruikt.",
      };
    }

    // ---- Resolve workspace ----
    const member = await prisma.workspaceMember.findFirst({
      where: { userId },
      select: { workspaceId: true },
      orderBy: { joinedAt: "asc" },
    });
    const workspaceId = member?.workspaceId;
    if (!workspaceId) {
      return { success: false, error: "Geen actieve workspace" };
    }

    // ---- Resolve source image ----
    let sourceImage: {
      id: string;
      projectId: string;
      resultImageUrl: string | null;
      originalImageUrl: string;
      version: number;
    } | null = null;

    if (input.sourceImageId) {
      // Source is an existing Image record
      sourceImage = await prisma.image.findUnique({
        where: { id: input.sourceImageId },
        select: {
          id: true,
          projectId: true,
          resultImageUrl: true,
          originalImageUrl: true,
          version: true,
        },
      });
    } else if (input.sourceConceptId) {
      // Source is a PropertyDemoConcept -- find or create an Image record
      const concept = await prisma.propertyDemoConcept.findUnique({
        where: { id: input.sourceConceptId },
        select: { imageUrl: true, propertyId: true, style: true },
      });

      if (!concept?.imageUrl) {
        return { success: false, error: "Concept afbeelding niet gevonden" };
      }

      // Find or create an ImageProject for this property
      let project = await prisma.imageProject.findFirst({
        where: {
          propertyId: concept.propertyId,
          workspaceId,
          name: "AI Inpaint",
        },
      });
      if (!project) {
        project = await prisma.imageProject.create({
          data: {
            workspaceId,
            userId,
            propertyId: concept.propertyId,
            name: "AI Inpaint",
            status: "PROCESSING",
          },
        });
      }

      // Create source Image record from concept
      sourceImage = await prisma.image.create({
        data: {
          workspaceId,
          userId,
          projectId: project.id,
          originalImageUrl: concept.imageUrl,
          resultImageUrl: concept.imageUrl,
          prompt: `Demo concept: ${concept.style}`,
          version: 1,
          status: "COMPLETED",
        },
      });
    } else if (input.sourceImageUrl) {
      // Source is a raw URL -- find or create Image + project
      const propertyId = input.propertyId;
      let project = await prisma.imageProject.findFirst({
        where: {
          ...(propertyId ? { propertyId } : {}),
          workspaceId,
          name: "AI Inpaint",
        },
      });
      if (!project) {
        project = await prisma.imageProject.create({
          data: {
            workspaceId,
            userId,
            ...(propertyId ? { propertyId } : {}),
            name: "AI Inpaint",
            status: "PROCESSING",
          },
        });
      }

      sourceImage = await prisma.image.create({
        data: {
          workspaceId,
          userId,
          projectId: project.id,
          originalImageUrl: input.sourceImageUrl,
          resultImageUrl: input.sourceImageUrl,
          prompt: "Source image",
          version: 1,
          status: "COMPLETED",
        },
      });
    }

    if (!sourceImage) {
      return { success: false, error: "Bronafbeelding niet gevonden" };
    }

    // ---- Find next version number ----
    const latestVersion = await prisma.image.findFirst({
      where: {
        projectId: sourceImage.projectId,
        OR: [{ id: sourceImage.id }, { parentId: sourceImage.id }],
      },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (latestVersion?.version || 1) + 1;

    // ---- Create placeholder for result ----
    const placeholder = await prisma.image.create({
      data: {
        workspaceId,
        userId,
        projectId: sourceImage.projectId,
        originalImageUrl:
          sourceImage.resultImageUrl || sourceImage.originalImageUrl,
        resultImageUrl: null,
        prompt: input.prompt,
        version: nextVersion,
        parentId: sourceImage.id,
        status: "PROCESSING",
        metadata: {
          inpaint: true,
          mode: input.mode,
          queuedAt: new Date().toISOString(),
        },
      },
    });

    // Increment quota (fire and forget)
    incrementAiEditCount(userId).catch(() => {});

    return {
      success: true,
      data: { newImageId: placeholder.id, sourceImageId: sourceImage.id },
    };
  } catch (error) {
    console.error("[createInpaintPlaceholder] Error:", error);
    return { success: false, error: "Kon inpaint niet starten" };
  }
}

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import type { Image, ImageStatus, Prisma } from "@/generated/prisma/client";
import {
  createSignedUploadUrl,
  getPublicUrl,
  getExtensionFromContentType,
  generateImagePath,
  deleteImage as deleteStorageImage,
} from "@/lib/supabase";
import { generatePrompt, type StyleTemplateId, type RoomTypeId } from "@/lib/prompts";

// Get current user's active workspace
async function getActiveWorkspace() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Type assertion for custom session fields from Prisma schema
  const sessionData = session?.session as { activeWorkspaceId?: string } | undefined;

  if (!session?.user?.id || !sessionData?.activeWorkspaceId) {
    return null;
  }

  return {
    userId: session.user.id,
    workspaceId: sessionData.activeWorkspaceId,
  };
}

// Create signed upload URLs for direct client upload
export async function createSignedUploadUrls(
  projectId: string,
  files: { name: string; type: string }[]
): Promise<
  ActionResult<
    {
      signedUrl: string;
      token: string;
      path: string;
      imageId: string;
    }[]
  >
> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Verify project belongs to workspace
    const project = await prisma.imageProject.findFirst({
      where: {
        id: projectId,
        workspaceId: context.workspaceId,
      },
      select: {
        id: true,
        _count: {
          select: { images: { where: { parentId: null } } },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Check 10-image limit
    const currentCount = project._count.images;
    if (currentCount + files.length > 10) {
      return {
        success: false,
        error: `Cannot upload ${files.length} images. Project has ${currentCount}/10 images.`,
      };
    }

    // Generate signed URLs for each file
    const results = await Promise.all(
      files.map(async (file) => {
        const imageId = crypto.randomUUID();
        const extension = getExtensionFromContentType(file.type);
        const path = generateImagePath(
          context.workspaceId,
          projectId,
          imageId,
          "original",
          extension
        );

        const signedData = await createSignedUploadUrl(path);
        if (!signedData) {
          throw new Error("Failed to create signed URL");
        }

        return {
          ...signedData,
          imageId,
        };
      })
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("[createSignedUploadUrls] Error:", error);
    return { success: false, error: "Failed to create upload URLs" };
  }
}

// Record uploaded images in database
export async function recordUploadedImages(
  projectId: string,
  images: {
    imageId: string;
    path: string;
    originalFileName: string;
    contentType: string;
    roomType?: string;
  }[]
): Promise<ActionResult<{ recordedCount: number }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Get project with style template
    const project = await prisma.imageProject.findFirst({
      where: {
        id: projectId,
        workspaceId: context.workspaceId,
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    // Create image records
    const imageRecords = images.map((img) => {
      const roomType = img.roomType || project.roomType;
      const prompt = generatePrompt(
        project.styleTemplateId as StyleTemplateId,
        roomType as RoomTypeId | undefined
      );

      return {
        id: img.imageId,
        workspaceId: context.workspaceId,
        userId: context.userId,
        projectId,
        originalImageUrl: getPublicUrl(img.path),
        prompt,
        status: "PENDING" as ImageStatus,
        metadata: {
          templateId: project.styleTemplateId,
          roomType: roomType || null,
          originalFileName: img.originalFileName,
          contentType: img.contentType,
        },
      };
    });

    await prisma.image.createMany({
      data: imageRecords,
    });

    // Update project thumbnail and counts
    const firstImage = imageRecords[0];
    await prisma.imageProject.update({
      where: { id: projectId },
      data: {
        thumbnailUrl: project.thumbnailUrl || firstImage?.originalImageUrl,
        imageCount: { increment: images.length },
      },
    });

    revalidatePath(`/dashboard/images/${projectId}`);
    return { success: true, data: { recordedCount: images.length } };
  } catch (error) {
    console.error("[recordUploadedImages] Error:", error);
    return { success: false, error: "Failed to record images" };
  }
}

// Get all images for a project
export async function getProjectImages(projectId: string): Promise<ActionResult<Image[]>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const images = await prisma.image.findMany({
      where: {
        projectId,
        workspaceId: context.workspaceId,
      },
      orderBy: [{ version: "asc" }, { createdAt: "desc" }],
    });

    return { success: true, data: images };
  } catch (error) {
    console.error("[getProjectImages] Error:", error);
    return { success: false, error: "Failed to fetch images" };
  }
}

// Update image room type
export async function updateImageRoomType(
  imageId: string,
  roomType: string
): Promise<ActionResult<Image>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Get current image with project
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        workspaceId: context.workspaceId,
      },
      include: {
        project: {
          select: { styleTemplateId: true },
        },
      },
    });

    if (!image) {
      return { success: false, error: "Image not found" };
    }

    // Regenerate prompt with new room type
    const newPrompt = generatePrompt(
      image.project.styleTemplateId as StyleTemplateId,
      roomType as RoomTypeId
    );

    // Update image
    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: {
        prompt: newPrompt,
        metadata: {
          ...(image.metadata as object),
          roomType,
        },
      },
    });

    revalidatePath(`/dashboard/images/${image.projectId}`);
    return { success: true, data: updatedImage };
  } catch (error) {
    console.error("[updateImageRoomType] Error:", error);
    return { success: false, error: "Failed to update room type" };
  }
}

// Bulk update room types
export async function bulkUpdateImageRoomTypes(
  imageIds: string[],
  roomType: string
): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Get images with their projects
    const images = await prisma.image.findMany({
      where: {
        id: { in: imageIds },
        workspaceId: context.workspaceId,
      },
      include: {
        project: {
          select: { id: true, styleTemplateId: true },
        },
      },
    });

    // Update each image
    await Promise.all(
      images.map(async (image) => {
        const newPrompt = generatePrompt(
          image.project.styleTemplateId as StyleTemplateId,
          roomType as RoomTypeId
        );

        await prisma.image.update({
          where: { id: image.id },
          data: {
            prompt: newPrompt,
            metadata: {
              ...(image.metadata as object),
              roomType,
            },
          },
        });
      })
    );

    // Revalidate all affected projects
    const projectIds = [...new Set(images.map((img) => img.project.id))];
    projectIds.forEach((id) => revalidatePath(`/dashboard/images/${id}`));

    return { success: true, data: { updatedCount: images.length } };
  } catch (error) {
    console.error("[bulkUpdateImageRoomTypes] Error:", error);
    return { success: false, error: "Failed to update room types" };
  }
}

// Start processing for a project
export async function startProjectProcessing(
  projectId: string
): Promise<ActionResult<{ processedCount: number }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Get pending images
    const pendingImages = await prisma.image.findMany({
      where: {
        projectId,
        workspaceId: context.workspaceId,
        status: "PENDING",
        parentId: null, // Only root images
      },
    });

    if (pendingImages.length === 0) {
      return { success: true, data: { processedCount: 0 } };
    }

    // Validate all have room types
    const imagesWithoutRoomType = pendingImages.filter((img) => {
      const metadata = img.metadata as { roomType?: string } | null;
      return !metadata?.roomType;
    });

    if (imagesWithoutRoomType.length > 0) {
      return {
        success: false,
        error: `${imagesWithoutRoomType.length} image(s) need room types assigned`,
      };
    }

    // Import trigger task dynamically
    const { processImageTask } = await import("@/trigger/process-image");

    // Trigger processing for each image
    for (const image of pendingImages) {
      const handle = await processImageTask.trigger({ imageId: image.id });

      // Update image status
      await prisma.image.update({
        where: { id: image.id },
        data: {
          status: "PROCESSING",
          metadata: {
            ...(image.metadata as object),
            runId: handle.id,
          },
        },
      });
    }

    // Update project status
    await prisma.imageProject.update({
      where: { id: projectId },
      data: { status: "PROCESSING" },
    });

    revalidatePath(`/dashboard/images/${projectId}`);
    revalidatePath("/dashboard/images");

    return { success: true, data: { processedCount: pendingImages.length } };
  } catch (error) {
    console.error("[startProjectProcessing] Error:", error);
    return { success: false, error: "Failed to start processing" };
  }
}

// Retry failed image
export async function retryImageProcessing(
  imageId: string
): Promise<ActionResult<{ runId: string }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        workspaceId: context.workspaceId,
        status: "FAILED",
      },
    });

    if (!image) {
      return { success: false, error: "Image not found or not in failed state" };
    }

    // Import trigger task dynamically
    const { processImageTask } = await import("@/trigger/process-image");

    const handle = await processImageTask.trigger({ imageId });

    await prisma.image.update({
      where: { id: imageId },
      data: {
        status: "PROCESSING",
        errorMessage: null,
        metadata: {
          ...(image.metadata as object),
          runId: handle.id,
        },
      },
    });

    revalidatePath(`/dashboard/images/${image.projectId}`);
    return { success: true, data: { runId: handle.id } };
  } catch (error) {
    console.error("[retryImageProcessing] Error:", error);
    return { success: false, error: "Failed to retry processing" };
  }
}

// Delete image
export async function deleteProjectImage(
  imageId: string
): Promise<ActionResult<void>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        workspaceId: context.workspaceId,
      },
    });

    if (!image) {
      return { success: false, error: "Image not found" };
    }

    // Delete from storage
    const originalPath = new URL(image.originalImageUrl).pathname.replace(
      /^\/storage\/v1\/object\/public\/[^/]+\//,
      ""
    );
    await deleteStorageImage(originalPath);

    if (image.resultImageUrl) {
      const resultPath = new URL(image.resultImageUrl).pathname.replace(
        /^\/storage\/v1\/object\/public\/[^/]+\//,
        ""
      );
      await deleteStorageImage(resultPath);
    }

    // Delete from database
    await prisma.image.delete({
      where: { id: imageId },
    });

    // Update project counts
    await prisma.imageProject.update({
      where: { id: image.projectId },
      data: {
        imageCount: { decrement: 1 },
        completedCount:
          image.status === "COMPLETED" ? { decrement: 1 } : undefined,
      },
    });

    revalidatePath(`/dashboard/images/${image.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("[deleteProjectImage] Error:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

// Update image (for Trigger.dev callback)
export async function updateImage(
  imageId: string,
  data: Partial<{
    status: ImageStatus;
    resultImageUrl: string;
    errorMessage: string;
    metadata: Prisma.InputJsonValue;
  }>
): Promise<ActionResult<Image>> {
  try {
    const image = await prisma.image.update({
      where: { id: imageId },
      data: data as Prisma.ImageUpdateInput,
    });

    // If completed, update project counts
    if (data.status === "COMPLETED") {
      await prisma.imageProject.update({
        where: { id: image.projectId },
        data: {
          completedCount: { increment: 1 },
        },
      });

      // Check if all images are completed
      const project = await prisma.imageProject.findUnique({
        where: { id: image.projectId },
        select: { imageCount: true, completedCount: true },
      });

      if (project && project.completedCount >= project.imageCount) {
        await prisma.imageProject.update({
          where: { id: image.projectId },
          data: { status: "COMPLETED" },
        });
      }
    }

    revalidatePath(`/dashboard/images/${image.projectId}`);
    return { success: true, data: image };
  } catch (error) {
    console.error("[updateImage] Error:", error);
    return { success: false, error: "Failed to update image" };
  }
}

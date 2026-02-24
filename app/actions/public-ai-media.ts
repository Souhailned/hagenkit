"use server";

import prisma from "@/lib/prisma";

export interface PublishedAiImage {
  id: string;
  originalImageUrl: string;
  resultImageUrl: string;
  roomType: string | null;
}

export interface PublishedAiMedia {
  aiImages: PublishedAiImage[];
  videoUrl: string | null;
  videoThumbnailUrl: string | null;
}

/**
 * Fetch completed AI images and video for a property (public — no auth required).
 * Only returns COMPLETED images that have a resultImageUrl.
 */
export async function getPublishedAiMediaForProperty(
  propertyId: string
): Promise<PublishedAiMedia> {
  try {
    const [imageProjects, videoProject] = await Promise.all([
      prisma.imageProject.findMany({
        where: {
          propertyId,
          status: "COMPLETED",
        },
        select: {
          images: {
            where: {
              status: "COMPLETED",
              resultImageUrl: { not: null },
              parentId: null, // Only root images, not versions
            },
            select: {
              id: true,
              originalImageUrl: true,
              resultImageUrl: true,
              metadata: true,
            },
            orderBy: { createdAt: "asc" },
            take: 20,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.videoProject.findFirst({
        where: {
          propertyId,
          status: "completed",
          finalVideoUrl: { not: null },
        },
        select: {
          finalVideoUrl: true,
          thumbnailUrl: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Flatten all completed images across projects
    const aiImages: PublishedAiImage[] = imageProjects
      .flatMap((p) => p.images)
      .filter((img): img is typeof img & { resultImageUrl: string } =>
        img.resultImageUrl !== null
      )
      .map((img) => ({
        id: img.id,
        originalImageUrl: img.originalImageUrl,
        resultImageUrl: img.resultImageUrl,
        roomType: (img.metadata as { roomType?: string } | null)?.roomType ?? null,
      }))
      .slice(0, 12); // Max 12 images on public page

    return {
      aiImages,
      videoUrl: videoProject?.finalVideoUrl ?? null,
      videoThumbnailUrl: videoProject?.thumbnailUrl ?? null,
    };
  } catch {
    return { aiImages: [], videoUrl: null, videoThumbnailUrl: null };
  }
}

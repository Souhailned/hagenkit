/**
 * Video-related database queries
 */

import prisma from "@/lib/prisma";
import type { VideoProject, VideoClip, Prisma } from "@/generated/prisma";

// Note: MusicTrack model doesn't exist yet in the schema
export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  audioUrl: string;
  duration: number;
  mood?: string;
  category?: string;
}

/**
 * Get video project by ID with all clips
 */
export async function getVideoProjectById(id: string): Promise<{
  videoProject: VideoProject & { clips: VideoClip[] };
  musicTrack: MusicTrack | null;
} | null> {
  const videoProject = await prisma.videoProject.findUnique({
    where: { id },
    include: {
      clips: {
        orderBy: { sequenceOrder: 'asc' }
      }
    }
  });

  if (!videoProject) {
    return null;
  }

  return {
    videoProject,
    musicTrack: null
  };
}

/**
 * Get all clips for a video project, ordered by sequence
 */
export async function getVideoClips(videoProjectId: string): Promise<VideoClip[]> {
  return prisma.videoClip.findMany({
    where: { videoProjectId },
    orderBy: { sequenceOrder: 'asc' }
  });
}

/**
 * Get a single video clip by ID
 */
export async function getVideoClipById(id: string): Promise<VideoClip | null> {
  return prisma.videoClip.findUnique({
    where: { id }
  });
}

/**
 * Update a video project
 */
export async function updateVideoProject(
  id: string,
  data: Prisma.VideoProjectUpdateInput
): Promise<void> {
  await prisma.videoProject.update({
    where: { id },
    data
  });
}

/**
 * Update a video clip
 */
export async function updateVideoClip(
  id: string,
  data: Prisma.VideoClipUpdateInput
): Promise<void> {
  await prisma.videoClip.update({
    where: { id },
    data
  });
}

/**
 * Update video project counts based on clips
 */
export async function updateVideoProjectCounts(videoProjectId: string): Promise<void> {
  const clips = await prisma.videoClip.findMany({
    where: { videoProjectId }
  });

  const clipCount = clips.length;
  const completedCount = clips.filter(c => c.status === 'completed').length;
  const estimatedCost = clipCount * 10;

  await prisma.videoProject.update({
    where: { id: videoProjectId },
    data: {
      clipCount,
      estimatedCost,
      status: completedCount === clipCount && clipCount > 0 ? 'completed' : 'processing'
    }
  });
}

/**
 * Find a video clip by its associated image ID
 */
export async function getVideoClipByImageId(imageId: string): Promise<VideoClip | null> {
  return prisma.videoClip.findFirst({
    where: { imageId }
  });
}

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import type { VideoProject, Prisma } from "@/generated/prisma";
import { generateVideoTask } from "@/trigger/video-orchestrator";

// Get current user's active workspace
async function getActiveWorkspace() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  // Try session's activeWorkspaceId first
  const sessionData = session.session as { activeWorkspaceId?: string } | undefined;
  if (sessionData?.activeWorkspaceId) {
    return {
      userId: session.user.id,
      workspaceId: sessionData.activeWorkspaceId,
    };
  }

  // Fallback: get user's first workspace membership
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) {
    return null;
  }

  return {
    userId: session.user.id,
    workspaceId: membership.workspaceId,
  };
}

// Create a new video project
export async function createVideoProject(data: {
  clipCount?: number;
  aspectRatio?: string;
  generateNativeAudio?: boolean;
  musicVolume?: number;
  videoVolume?: number;
}): Promise<ActionResult<VideoProject>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const project = await prisma.videoProject.create({
      data: {
        workspaceId: context.workspaceId,
        clipCount: data.clipCount || 0,
        aspectRatio: data.aspectRatio || "16:9",
        generateNativeAudio: data.generateNativeAudio || false,
        musicVolume: data.musicVolume || 0.3,
        videoVolume: data.videoVolume || 1.0,
        status: "pending",
      },
    });

    revalidatePath("/dashboard/videos");
    return { success: true, data: project };
  } catch (error) {
    console.error("[createVideoProject] Error:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// Get all projects for the current workspace
export async function getVideoProjects(): Promise<ActionResult<VideoProject[]>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const projects = await prisma.videoProject.findMany({
      where: {
        workspaceId: context.workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error("[getVideoProjects] Error:", error);
    return { success: false, error: "Failed to fetch projects" };
  }
}

// Get a single project by ID with clips
export async function getVideoProject(
  projectId: string
): Promise<ActionResult<VideoProject & { clips: { id: string; status: string; sequenceOrder: number }[] }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const project = await prisma.videoProject.findFirst({
      where: {
        id: projectId,
        workspaceId: context.workspaceId,
      },
      include: {
        clips: {
          select: {
            id: true,
            status: true,
            sequenceOrder: true,
          },
          orderBy: {
            sequenceOrder: 'asc',
          },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    return { success: true, data: project };
  } catch (error) {
    console.error("[getVideoProject] Error:", error);
    return { success: false, error: "Failed to fetch project" };
  }
}

// Update project
export async function updateVideoProject(
  projectId: string,
  data: Prisma.VideoProjectUpdateInput
): Promise<ActionResult<VideoProject>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    const project = await prisma.videoProject.update({
      where: {
        id: projectId,
        workspaceId: context.workspaceId,
      },
      data,
    });

    revalidatePath("/dashboard/videos");
    revalidatePath(`/dashboard/videos/${projectId}`);
    return { success: true, data: project };
  } catch (error) {
    console.error("[updateVideoProject] Error:", error);
    return { success: false, error: "Failed to update project" };
  }
}

// Delete project
export async function deleteVideoProject(
  projectId: string
): Promise<ActionResult<void>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Delete project (cascades to clips in DB)
    await prisma.videoProject.delete({
      where: {
        id: projectId,
        workspaceId: context.workspaceId,
      },
    });

    revalidatePath("/dashboard/videos");
    return { success: true };
  } catch (error) {
    console.error("[deleteVideoProject] Error:", error);
    return { success: false, error: "Failed to delete project" };
  }
}

// Start video generation (trigger orchestrator)
export async function startVideoGeneration(
  projectId: string
): Promise<ActionResult<{ runId: string }>> {
  try {
    const context = await getActiveWorkspace();
    if (!context) {
      return { success: false, error: "Not authenticated or no active workspace" };
    }

    // Verify project exists and belongs to workspace
    const project = await prisma.videoProject.findFirst({
      where: {
        id: projectId,
        workspaceId: context.workspaceId,
      },
      include: { clips: { select: { id: true } } },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.clips.length === 0) {
      return { success: false, error: "No clips in this project" };
    }

    // Don't allow re-triggering if already processing
    if (["generating", "compiling"].includes(project.status)) {
      return { success: false, error: "Generation is already in progress" };
    }

    // Update status to processing
    await prisma.videoProject.update({
      where: { id: projectId },
      data: { status: "processing", errorMessage: null },
    });

    // Trigger the orchestrator task
    const handle = await generateVideoTask.trigger({
      videoProjectId: projectId,
    });

    revalidatePath(`/dashboard/videos/${projectId}`);
    revalidatePath("/dashboard/videos");

    return { success: true, data: { runId: handle.id } };
  } catch (error) {
    console.error("[startVideoGeneration] Error:", error);
    return { success: false, error: "Failed to start video generation" };
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { tasks } from "@trigger.dev/sdk/v3";
import {
  getVideoClips,
  getVideoProjectById,
  updateVideoProject,
  updateVideoProjectCounts,
} from "@/lib/db/queries";
import {
  calculateVideoCost,
  costToCents,
  VIDEO_DEFAULTS,
} from "@/lib/video/video-constants";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const startSchema = z.object({
  videoProjectId: z.string().min(1, "videoProjectId is required"),
});

// ---------------------------------------------------------------------------
// Route config — orchestration can take a long time (all clips + compile)
// ---------------------------------------------------------------------------

export const maxDuration = 300;

// ---------------------------------------------------------------------------
// POST /api/ai/videos/start
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { videoProjectId } = parsed.data;

    // 3. Fetch project and clips
    console.log("[video-start] Starting video generation", { videoProjectId });

    const projectData = await getVideoProjectById(videoProjectId);
    if (!projectData) {
      return Response.json(
        { success: false, error: `Video project not found: ${videoProjectId}` },
        { status: 404 }
      );
    }

    const { videoProject } = projectData;
    const clips = await getVideoClips(videoProjectId);

    if (clips.length === 0) {
      return Response.json(
        { success: false, error: "No clips to generate" },
        { status: 400 }
      );
    }

    // 4. Update project status to generating
    await updateVideoProject(videoProjectId, {
      status: "generating",
      clipCount: clips.length,
      estimatedCost: costToCents(
        calculateVideoCost(
          clips.length,
          VIDEO_DEFAULTS.CLIP_DURATION,
          videoProject.generateNativeAudio
        )
      ),
    });

    // 5. Extract provider from project metadata
    const projectMetadata = videoProject.metadata as {
      provider?: "fal" | "xai";
    } | null;
    const provider = projectMetadata?.provider ?? "fal";

    console.log("[video-start] Triggering clip generation", {
      clipCount: clips.length,
      provider,
    });

    // 6. Generate all clips in parallel via the generate-clip API route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cookieHeader = req.headers.get("cookie") || "";

    const clipPromises = clips.map(async (clip) => {
      try {
        const response = await fetch(`${baseUrl}/api/ai/videos/generate-clip`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
          body: JSON.stringify({
            clipId: clip.id,
            tailImageUrl: clip.endImageUrl || clip.sourceImageUrl,
            targetRoomLabel: clip.roomLabel || clip.roomType?.replace(/-/g, " "),
            provider,
          }),
        });

        const data = await response.json();
        return { clipId: clip.id, success: data.success === true, data };
      } catch (error) {
        console.error("[video-start] Clip generation failed", {
          clipId: clip.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return { clipId: clip.id, success: false, data: null };
      }
    });

    const clipResults = await Promise.all(clipPromises);

    // 7. Check results
    const successfulClips = clipResults.filter((r) => r.success);
    const failedClips = clipResults.filter((r) => !r.success);

    console.log("[video-start] Clip generation completed", {
      successful: successfulClips.length,
      failed: failedClips.length,
    });

    // Update counts
    await updateVideoProjectCounts(videoProjectId);

    // If all clips failed, mark as failed
    if (successfulClips.length === 0) {
      await updateVideoProject(videoProjectId, {
        status: "failed",
        errorMessage: "All clip generations failed",
      });
      return Response.json(
        { success: false, error: "All clip generations failed" },
        { status: 500 }
      );
    }

    if (failedClips.length > 0) {
      console.warn("[video-start] Some clips failed to generate", {
        failedCount: failedClips.length,
        failedClipIds: failedClips.map((r) => r.clipId),
      });
    }

    // 8. Update project status to compiling
    await updateVideoProject(videoProjectId, {
      status: "compiling",
    });

    // 9. Trigger Trigger.dev compile task (FFmpeg, stays on Trigger.dev)
    console.log("[video-start] Triggering video compilation", { videoProjectId });

    const handle = await tasks.trigger("compile-video", {
      videoProjectId,
    });

    console.log("[video-start] Compile task triggered", {
      runId: handle.id,
      videoProjectId,
    });

    // 10. Calculate actual cost
    const actualCost = costToCents(
      calculateVideoCost(
        successfulClips.length,
        VIDEO_DEFAULTS.CLIP_DURATION,
        videoProject.generateNativeAudio
      )
    );

    await updateVideoProject(videoProjectId, {
      actualCost,
    });

    return Response.json({
      success: true,
      runId: handle.id,
      successfulClips: successfulClips.length,
      failedClips: failedClips.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[video-start] Video generation failed", { error: errorMessage });

    // Try to update project status to failed
    try {
      const body = await req.clone().json().catch(() => null);
      if (body?.videoProjectId) {
        await updateVideoProject(body.videoProjectId, {
          status: "failed",
          errorMessage,
        });
      }
    } catch {
      // Best-effort failure update
    }

    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

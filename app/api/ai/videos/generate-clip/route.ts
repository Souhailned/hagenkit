import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  getVideoClipById,
  getVideoProjectById,
  updateVideoClip,
  updateVideoProjectCounts,
} from "@/lib/db/queries";
import type { VideoRoomType } from "@/lib/video/types";
import {
  fal,
  KLING_VIDEO_PRO,
  type KlingVideoInput,
  type KlingVideoOutput,
} from "@/lib/fal";
import { getVideoPath, uploadVideo } from "@/lib/storage";
import {
  DEFAULT_NEGATIVE_PROMPT,
  getMotionPrompt,
} from "@/lib/video/motion-prompts";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const generateClipSchema = z.object({
  clipId: z.string().min(1, "clipId is required"),
  tailImageUrl: z.string().url().optional(),
  targetRoomLabel: z.string().optional(),
  provider: z.enum(["fal", "xai"]).default("fal"),
});

// ---------------------------------------------------------------------------
// Route config — video generation can take up to 5 minutes
// ---------------------------------------------------------------------------

export const maxDuration = 300;

// ---------------------------------------------------------------------------
// POST /api/ai/videos/generate-clip
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
    const parsed = generateClipSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { clipId, tailImageUrl, targetRoomLabel, provider } = parsed.data;

    // 3. Fetch clip record
    console.log("[generate-clip] Fetching clip", { clipId, provider });

    const clip = await getVideoClipById(clipId);
    if (!clip) {
      return Response.json(
        { success: false, error: `Video clip not found: ${clipId}` },
        { status: 404 }
      );
    }

    // Skip if already completed
    if (clip.status === "completed" && clip.clipUrl) {
      console.log("[generate-clip] Clip already processed, skipping", { clipId });
      return Response.json({ success: true, clipUrl: clip.clipUrl });
    }

    // 4. Fetch video project to get aspect ratio and audio settings
    const videoProjectData = await getVideoProjectById(clip.videoProjectId);
    if (!videoProjectData) {
      return Response.json(
        { success: false, error: "Video project not found" },
        { status: 404 }
      );
    }

    // Update status to processing
    await updateVideoClip(clipId, { status: "processing" });

    // 5. Upload source image to Fal.ai storage
    console.log("[generate-clip] Uploading source image to Fal.ai storage", {
      clipId,
      sourceImageUrl: clip.sourceImageUrl,
    });

    const imageResponse = await fetch(clip.sourceImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch source image: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    const falImageUrl = await fal.storage.upload(
      new File([imageBlob], "source.jpg", { type: imageBlob.type })
    );

    console.log("[generate-clip] Uploaded source image to Fal.ai storage", { falImageUrl });

    // Upload tail image if provided, otherwise use source
    let falTailImageUrl = falImageUrl;
    if (tailImageUrl) {
      console.log("[generate-clip] Fetching tail image", { tailImageUrl });
      const tailResponse = await fetch(tailImageUrl);
      if (tailResponse.ok) {
        const tailBlob = await tailResponse.blob();
        falTailImageUrl = await fal.storage.upload(
          new File([tailBlob], "tail.jpg", { type: tailBlob.type })
        );
        console.log("[generate-clip] Uploaded tail image to Fal.ai storage", {
          falTailImageUrl,
        });
      } else {
        console.warn("[generate-clip] Failed to fetch tail image, falling back to source", {
          status: tailResponse.status,
        });
      }
    }

    // 6. Generate motion prompt
    let motionPrompt =
      clip.motionPrompt ||
      getMotionPrompt(
        clip.roomType as VideoRoomType,
        targetRoomLabel
      );

    // Handle native audio generation
    const generateAudio = videoProjectData.videoProject.generateNativeAudio;
    if (generateAudio) {
      const track = videoProjectData.musicTrack;
      const roomName = clip.roomLabel || clip.roomType?.replace(/-/g, " ");

      let audioPrompt = "";
      if (track) {
        const mood = track.mood ? `${track.mood} ` : "";
        audioPrompt = `Background audio: ${mood}${track.category} music inspired by "${track.name}".`;
      } else {
        audioPrompt = "Background cinematic ambient music.";
      }

      const ambientSounds = `Ambient environmental sounds of a ${roomName}.`;
      motionPrompt = `${motionPrompt} ${audioPrompt} ${ambientSounds}`;
    }

    // 7. Generate video with AI
    let resultVideoUrl: string;

    if (provider === "xai") {
      // ----- xAI Provider -----
      console.log("[generate-clip] Using xAI provider", {
        clipId,
        prompt: motionPrompt,
        duration: clip.duration || 5,
        aspectRatio: videoProjectData.videoProject.aspectRatio,
      });

      const {
        generateVideo: xaiGenerateVideo,
        pollVideoUntilComplete,
        mapAspectRatioToXAI,
      } = await import("@/lib/xai");

      const xaiAspectRatio = mapAspectRatioToXAI(
        videoProjectData.videoProject.aspectRatio as "16:9" | "9:16" | "1:1"
      );

      const submitResult = await xaiGenerateVideo({
        prompt: motionPrompt,
        image_url: clip.sourceImageUrl,
        duration: clip.duration || 5,
        aspect_ratio: xaiAspectRatio,
      });

      console.log("[generate-clip] xAI video generation submitted", {
        requestId: submitResult.request_id,
      });

      const pollResult = await pollVideoUntilComplete(submitResult.request_id);
      resultVideoUrl = pollResult.video_url || "";

      console.log("[generate-clip] xAI video generation completed", { resultVideoUrl });
    } else {
      // ----- Fal.ai Provider: Kling Video (default) -----
      console.log("[generate-clip] Using Fal.ai provider", {
        clipId,
        prompt: motionPrompt,
        duration: clip.duration?.toString() || "5",
        aspectRatio: videoProjectData.videoProject.aspectRatio,
        generate_audio: generateAudio,
      });

      const klingInput: KlingVideoInput = {
        image_url: falImageUrl,
        tail_image_url: falTailImageUrl,
        prompt: motionPrompt,
        duration: (clip.duration?.toString() || "5") as "5" | "10",
        aspect_ratio: videoProjectData.videoProject.aspectRatio as
          | "16:9"
          | "9:16"
          | "1:1",
        generate_audio: generateAudio,
        negative_prompt: DEFAULT_NEGATIVE_PROMPT,
      };

      const result = (await fal.subscribe(KLING_VIDEO_PRO, {
        input: klingInput,
        onQueueUpdate: (update) => {
          console.log("[generate-clip] Kling processing update", { status: update.status });
        },
      })) as unknown as KlingVideoOutput;

      console.log("[generate-clip] Kling result received");

      // Handle both direct and wrapped response
      const output = (result as { data?: KlingVideoOutput }).data || result;
      if (!output.video?.url) {
        console.error("[generate-clip] No video in response", { result });
        throw new Error("No video returned from Kling API");
      }

      resultVideoUrl = output.video.url;
    }

    // 8. Save to R2 storage
    console.log("[generate-clip] Downloading result video", { resultVideoUrl });

    const resultVideoResponse = await fetch(resultVideoUrl);
    if (!resultVideoResponse.ok) {
      throw new Error("Failed to download result video");
    }

    const resultVideoBuffer = await resultVideoResponse.arrayBuffer();

    const videoPath = getVideoPath(
      videoProjectData.videoProject.workspaceId,
      clip.videoProjectId,
      `${clipId}.mp4`
    );

    console.log("[generate-clip] Uploading to R2 storage", { videoPath });

    const storedVideoUrl = await uploadVideo(
      Buffer.from(resultVideoBuffer),
      videoPath,
      "video/mp4"
    );

    if (!storedVideoUrl) {
      throw new Error("Failed to upload video to storage");
    }

    // 9. Update clip record with result
    await updateVideoClip(clipId, {
      status: "completed",
      clipUrl: storedVideoUrl,
      errorMessage: null,
    });

    // 10. Update project counts
    await updateVideoProjectCounts(clip.videoProjectId);

    console.log("[generate-clip] Video clip generation completed", {
      clipId,
      clipUrl: storedVideoUrl,
    });

    return Response.json({ success: true, clipUrl: storedVideoUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-clip] Video clip generation failed", { error: errorMessage });

    // Try to update clip status to failed
    try {
      const body = await req.clone().json().catch(() => null);
      if (body?.clipId) {
        await updateVideoClip(body.clipId, {
          status: "failed",
          errorMessage,
        });

        const clip = await getVideoClipById(body.clipId);
        if (clip) {
          await updateVideoProjectCounts(clip.videoProjectId);
        }
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

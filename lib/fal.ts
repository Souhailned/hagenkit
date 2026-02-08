import { fal } from "@fal-ai/client";

// Configure Fal.ai client with API key
fal.config({
  credentials: process.env.FAL_API_KEY!,
});

export { fal };

// ============================================================================
// Image Processing Models
// ============================================================================

// Nano Banana Pro - Image editing
export const NANO_BANANA_PRO_EDIT = "fal-ai/nano-banana-pro/edit";

export interface NanoBananaProInput {
  prompt: string;
  image_urls: string[]; // NOTE: Array, not single string!
  num_images?: number; // 1-4, default 1
  aspect_ratio?:
    | "21:9"
    | "16:9"
    | "3:2"
    | "4:3"
    | "5:4"
    | "1:1"
    | "4:5"
    | "3:4"
    | "2:3"
    | "9:16";
  resolution?: "1K" | "2K" | "4K";
  output_format?: "jpeg" | "png" | "webp";
  sync_mode?: boolean;
}

export interface NanoBananaProOutput {
  images: Array<{
    url: string;
    file_name: string;
    content_type: string;
    file_size: number;
    width: number;
    height: number;
  }>;
  description?: string;
}

// ============================================================================
// Qwen Image Edit Inpaint - Better inpainting model
// ============================================================================

export const QWEN_IMAGE_EDIT_INPAINT = "fal-ai/qwen-image-edit/inpaint";

export interface QwenInpaintInput {
  prompt: string;
  image_url: string;
  mask_url: string;
  num_inference_steps?: number; // Default 30
  guidance_scale?: number; // Default 4
  seed?: number;
  output_format?: "jpeg" | "png";
  negative_prompt?: string;
  strength?: number; // Default 0.93
  acceleration?: "none" | "regular" | "high"; // Default "regular"
  enable_safety_checker?: boolean;
  num_images?: number;
}

export interface QwenInpaintOutput {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  timings?: {
    inference?: number;
  };
  seed: number;
  has_nsfw_concepts: boolean[];
  prompt: string;
}

// ============================================================================
// Kling Video v2.6 Pro - Image to Video
// ============================================================================

export const KLING_VIDEO_PRO = "fal-ai/kling-video/v2.6/pro/image-to-video";

export interface KlingVideoInput {
  image_url: string;
  tail_image_url?: string; // Optional end frame
  prompt: string; // Motion description
  duration?: "5" | "10"; // Seconds
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  generate_audio?: boolean;
  negative_prompt?: string;
  cfg_scale?: number; // 0-1
}

export interface KlingVideoOutput {
  video: {
    url: string;
    content_type?: string;
    file_size?: number;
  };
  seed?: number;
}

---
name: fal-ai-processing
description: Image and video processing with fal.ai. Use when working with image uploads, virtual staging, inpainting, or video generation.
allowed-tools: Read, Write, Bash
---

# fal.ai Image & Video Processing

## Available Models

### Image Processing
| Model | Endpoint | Use Case |
|-------|----------|----------|
| Nano Banana Pro | `fal-ai/nano-banana-pro` | General image processing |
| Nano Banana Pro Edit | `fal-ai/nano-banana-pro/edit` | Image editing with prompts |
| Qwen Inpaint | `fal-ai/qwen-image-edit/inpaint` | Inpainting with masks (recommended) |
| Flux Pro Fill | `fal-ai/flux-pro/v1/fill` | Alternative inpainting |

### Video Generation
| Model | Endpoint | Use Case |
|-------|----------|----------|
| Kling Video Pro | `fal-ai/kling-video/v2.6/pro/image-to-video` | Image-to-video, 5-10 seconds |

## Code Patterns

### Basic fal.ai Setup
```typescript
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_API_KEY!,
});
```

### Inpainting with Qwen
```typescript
const result = await fal.subscribe("fal-ai/qwen-image-edit/inpaint", {
  input: {
    prompt: "Modern minimalist living room",
    image_url: sourceUrl,
    mask_url: maskUrl,
    acceleration: "regular", // none | regular | high
    strength: 0.93,
  },
});
```

### Video Generation with Kling
```typescript
const result = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
  input: {
    image_url: sourceUrl,
    prompt: "Gentle camera dolly forward, natural lighting",
    duration: "5", // or "10"
    aspect_ratio: "16:9",
    generate_audio: false,
  },
});
```

## File Locations
- Trigger jobs: `trigger/*.ts`
- fal.ai types: `lib/fal.ts`
- Motion prompts: `lib/video/motion-prompts.ts`

## Integration with Trigger.dev
All fal.ai processing runs as Trigger.dev background jobs for reliability:
- `inpaint-image.ts` - Virtual staging
- `process-image.ts` - Basic processing
- `video-orchestrator.ts` - Video generation pipeline

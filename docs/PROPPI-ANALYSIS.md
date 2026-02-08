# Proppi vs Horecagrond - AI Image Processing Analysis

**Date:** 2026-02-08  
**Source:** https://github.com/Codehagen/Proppi (fresh clone)

---

## 📊 Feature Matrix

| Feature | Horecagrond | Proppi | Status |
|---------|-------------|--------|--------|
| **Image Processing** | `nano-banana-pro` | `nano-banana-pro` | ✅ Same |
| **Image Editing** | `nano-banana-pro/edit` | `nano-banana-pro/edit` | ✅ Same |
| **Inpainting** | `flux-pro/v1/fill` | `qwen-image-edit/inpaint` | ⚠️ Upgrade available |
| **Video Generation** | ❌ None | `kling-video/v2.6/pro` | 🆕 Missing |
| **Video Transitions** | ❌ None | Custom transition clips | 🆕 Missing |
| **Video Compilation** | ❌ None | FFmpeg + Remotion | 🆕 Missing |

---

## 🆕 Nieuwe Proppi Features

### 1. Video Generation Pipeline 🎬

Complete image-to-video workflow:

```
Property Images → Kling Video Pro → Transition Clips → FFmpeg Compile → Final Video
```

**Files:**
- `trigger/video-orchestrator.ts` - Main orchestration
- `trigger/generate-video-clip.ts` - Per-clip generation  
- `trigger/generate-transition-clip.ts` - Transitions
- `trigger/compile-video.ts` - Final compilation

**Key Features:**
- Kling Video Pro v2.6 (fal.ai)
- Support voor fal.ai EN xAI providers
- Motion prompts per kamer type
- Native audio generation optie
- Queue management (concurrency limits)
- Retry logic met exponential backoff

### 2. Qwen Image Edit Inpaint

Nieuwer inpainting model met meer opties:

```typescript
// Proppi gebruikt:
export const QWEN_IMAGE_EDIT_INPAINT = "fal-ai/qwen-image-edit/inpaint";

// Wij gebruiken:
"fal-ai/flux-pro/v1/fill"
```

**Voordelen Qwen:**
- `acceleration` parameter (none/regular/high)
- `strength` parameter voor fine-tuning
- Betere guidance_scale control

---

## 📁 Proppi Folder Structure (relevant)

```
trigger/
├── compile-video.ts          # FFmpeg video compilation
├── generate-transition-clip.ts # Transition effects
├── generate-video-clip.ts    # Kling Video Pro integration
├── inpaint-image.ts          # Qwen inpainting
├── process-image.ts          # Basic image processing
└── video-orchestrator.ts     # Pipeline orchestration

lib/
├── fal.ts                    # fal.ai client + model definitions
├── video/
│   ├── motion-prompts.ts     # Per-room motion descriptions
│   └── video-constants.ts    # Duration, costs, defaults
└── providers/
    └── types.ts              # AIProvider type (fal | xai)
```

---

## 🔧 Implementation Recommendations

### Priority 1: Video Generation (High Impact)

**Why:** Proppi's biggest differentiator. Property videos are highly engaging.

**Steps:**
1. Copy `lib/fal.ts` (Kling Video Pro types)
2. Copy `trigger/video-*.ts` files
3. Copy `lib/video/` folder (motion prompts, constants)
4. Add database models: `videoProject`, `videoClip`
5. Add API routes for video generation

**Effort:** 2-3 dagen

### Priority 2: Qwen Inpainting Upgrade (Medium Impact)

**Why:** Potentially better quality inpainting with more control.

**Steps:**
1. Add Qwen types to our fal integration
2. Update `trigger/inpaint-image.ts` to use Qwen
3. Add acceleration/strength parameters to UI

**Effort:** 0.5 dag

### Priority 3: Multi-Provider Support (Low Priority)

**Why:** Proppi supports both fal.ai and xAI. Useful for fallback.

**Steps:**
1. Add provider abstraction layer
2. Implement xAI client
3. Add provider selection to settings

**Effort:** 1 dag

---

## 📋 Code Snippets

### Kling Video Pro Integration

```typescript
// From Proppi lib/fal.ts
export const KLING_VIDEO_PRO = "fal-ai/kling-video/v2.6/pro/image-to-video";

export interface KlingVideoInput {
  image_url: string;
  tail_image_url?: string;  // End frame image
  prompt: string;           // Motion description
  duration?: "5" | "10";    // Seconds
  aspect_ratio?: "16:9" | "9:16" | "1:1";
  generate_audio?: boolean;
  negative_prompt?: string;
  cfg_scale?: number;       // 0-1
}
```

### Motion Prompts per Room Type

```typescript
// From Proppi lib/video/motion-prompts.ts
export function getMotionPrompt(roomType: VideoRoomType): string {
  const prompts: Record<VideoRoomType, string> = {
    living_room: "Gentle camera dolly forward, soft natural lighting...",
    kitchen: "Smooth pan across countertops, natural sunlight...",
    bedroom: "Slow push in toward bed, warm ambient lighting...",
    bathroom: "Steady reveal of fixtures, clean white lighting...",
    // ... more room types
  };
  return prompts[roomType] || DEFAULT_MOTION_PROMPT;
}
```

### Qwen Inpainting

```typescript
// From Proppi lib/fal.ts
export interface QwenInpaintInput {
  prompt: string;
  image_url: string;
  mask_url: string;
  num_inference_steps?: number;  // Default 30
  guidance_scale?: number;       // Default 4
  strength?: number;             // Default 0.93
  acceleration?: "none" | "regular" | "high";
}
```

---

## 🎯 Action Items

1. [ ] **Copy Kling Video Pro integration** → `lib/fal.ts`
2. [ ] **Add video trigger jobs** → `trigger/video-*.ts`
3. [ ] **Create video database models** → Prisma schema
4. [ ] **Build video generation UI** → Property detail page
5. [ ] **Upgrade inpainting** → Switch to Qwen model
6. [ ] **Add motion prompts** → `lib/video/motion-prompts.ts`

---

## 📈 Impact Assessment

| Upgrade | User Value | Dev Effort | Priority |
|---------|------------|------------|----------|
| Video Generation | ⭐⭐⭐⭐⭐ | 2-3 days | 🔴 HIGH |
| Qwen Inpainting | ⭐⭐⭐ | 0.5 day | 🟡 MEDIUM |
| Multi-Provider | ⭐⭐ | 1 day | 🟢 LOW |

**Recommendation:** Start met video generation - het is de grootste feature gap en heeft de hoogste user impact voor property marketing.

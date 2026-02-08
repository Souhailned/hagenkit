# Video Integration - Proppi Features

**Date:** 2026-02-08  
**Status:** Partial - Types ready, jobs need Prisma schema

---

## ✅ Wat is Geïntegreerd

### 1. fal.ai Types (`lib/fal.ts`)
- `NanoBananaProInput/Output` - Image editing
- `QwenInpaintInput/Output` - Better inpainting
- `KlingVideoInput/Output` - Video generation

### 2. Video Utilities (`lib/video/`)
- `motion-prompts.ts` - Per-room motion descriptions
- `video-constants.ts` - Duration, costs, defaults
- `video-templates.ts` - Video templates
- `room-sequence.ts` - Room sequencing
- `types.ts` - VideoRoomType, status types

### 3. Provider Types (`lib/providers/types.ts`)
- `AIProvider` type (fal | xai)
- Provider capabilities

### 4. Database Stubs (`lib/db/queries.ts`)
- VideoProject, VideoClip, MusicTrack interfaces
- Stub query functions (TODO: implement with Prisma)

### 5. Supabase Video Support (`lib/supabase.ts`)
- `getVideoPath()` - Generate video storage path
- `uploadVideo()` - Upload video files
- `deleteVideo()` - Delete video files

---

## 🚧 WIP: Trigger Jobs

These files need Prisma schema updates before they work:

```
trigger/
├── compile-video.ts.wip       # FFmpeg compilation
├── generate-transition-clip.ts.wip  # Transition effects
├── generate-video-clip.ts.wip  # Kling Video Pro
└── video-orchestrator.ts.wip  # Pipeline orchestration
```

---

## 📋 Next Steps

### 1. Add Prisma Schema
```prisma
model VideoProject {
  id                 String   @id @default(cuid())
  workspaceId        String
  status             String   @default("pending")
  clipCount          Int      @default(0)
  estimatedCost      Int      @default(0)
  generateNativeAudio Boolean @default(false)
  musicVolume        Float    @default(0.3)
  videoVolume        Float    @default(1.0)
  aspectRatio        String   @default("16:9")
  finalVideoUrl      String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  clips              VideoClip[]
}

model VideoClip {
  id               String   @id @default(cuid())
  videoProjectId   String
  imageId          String
  sourceImageUrl   String
  roomLabel        String?
  roomType         String?
  status           String   @default("pending")
  clipUrl          String?
  transitionType   String?
  transitionClipUrl String?
  duration         Float    @default(5)
  sequenceOrder    Int      @default(0)
  
  videoProject     VideoProject @relation(fields: [videoProjectId], references: [id])
}
```

### 2. Implement Queries
Replace stubs in `lib/db/queries.ts` with actual Prisma queries.

### 3. Rename WIP Files
```bash
cd trigger
mv compile-video.ts.wip compile-video.ts
mv generate-transition-clip.ts.wip generate-transition-clip.ts
mv generate-video-clip.ts.wip generate-video-clip.ts
mv video-orchestrator.ts.wip video-orchestrator.ts
```

### 4. Add API Routes
- POST `/api/video/generate` - Start video generation
- GET `/api/video/[id]/status` - Check progress
- GET `/api/video/[id]` - Get video details

---

## 🎯 How to Use (After Full Integration)

### Generate Video from Property Images
```typescript
import { generateVideoTask } from "@/trigger/video-orchestrator";

// Start video generation
await generateVideoTask.trigger({
  videoProjectId: "project-123",
});
```

### Check Video Status
```typescript
import { getVideoProjectById } from "@/lib/db/queries";

const { videoProject } = await getVideoProjectById(id);
console.log(videoProject.status); // "completed"
console.log(videoProject.finalVideoUrl); // Supabase URL
```

---

## 📦 Dependencies

Already installed:
- `@fal-ai/client` ✅
- `@trigger.dev/sdk` ✅
- `@supabase/supabase-js` ✅

May need:
- FFmpeg (for video compilation) - Install on server

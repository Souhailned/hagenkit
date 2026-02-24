# Backend Dev Memory

## Prisma 7 CLI Changes
- `--to-schema-datamodel` was removed, use `--to-schema` instead
- `--shadow-database-url` flag removed from CLI; must use `shadowDatabaseUrl` in `prisma.config.ts`
- `env()` in prisma.config.ts will error if the env var is not set (no optional support)
- When using `migrate diff --from-migrations`, a shadow database is required
- Shadow DB can be created temporarily, used for diff, then dropped

## Database Setup
- PostgreSQL at `localhost:5435`, database `hagenkit`
- Credentials: `postgres:postgres`
- Prisma config: `prisma.config.ts` with `defineConfig`
- Generated client: `generated/prisma/` (v7.3.0)

## Migration Workflow
- Initial migration: `20260204192922_initial_database_setup`
- Drift fix migration: `20260205000000_sync_schema_drift` (382 lines)
- For multi-machine sync: `npx prisma migrate deploy`

## Storage
- R2 adapter: `lib/storage.ts` (Cloudflare R2, S3-compatible)
- Legacy Supabase: `lib/supabase.ts` (still used by trigger/compile-video.ts)
- Both export same interface: `uploadVideo`, `getVideoPath`, `uploadImage`, etc.
- New code should use `lib/storage.ts` (R2); compile-video stays on Supabase

## Video Pipeline Architecture
- `app/api/ai/videos/generate-clip/route.ts` — generates a single video clip (Next.js API route)
- `app/api/ai/videos/start/route.ts` — orchestrator: parallel clip gen + triggers compile task
- `trigger/compile-video.ts` — FFmpeg compilation, stays on Trigger.dev (needs filesystem)
- `trigger/video-orchestrator.ts` — OLD orchestrator (Trigger.dev), no longer imported
- `trigger/generate-video-clip.ts` — OLD clip gen (Trigger.dev), no longer imported
- DB queries: `lib/db/queries.ts` — getVideoClipById, updateVideoClip, updateVideoProjectCounts, etc.
- Fal.ai: `lib/fal.ts` — Kling Video Pro model, storage upload
- xAI: `lib/xai.ts` — stub, not yet implemented
- `tasks.trigger("compile-video", payload)` from `@trigger.dev/sdk/v3` for fire-and-forget

## Trigger.dev SDK
- `@trigger.dev/sdk/v3` exports: `task`, `tasks`, `logger`, `metadata`
- `tasks.trigger(taskId, payload)` — fire-and-forget (returns handle with .id)
- `tasks.batchTriggerAndWait(...)` — parallel execution with await
- Config: `trigger.config.ts` at project root

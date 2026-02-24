# AI Engineer Memory

## AI SDK 6 Notes
- Installed: `ai@^6.0.79`, `@ai-sdk/groq@^3.0.22`, `@ai-sdk/openai@^3.0.27`, `@ai-sdk/react@^3.0.81`
- **maxTokens renamed to maxOutputTokens** in AI SDK 6 (breaking change from v5)
- Use `generateText()` for plain text, `generateObject()` with Zod schema for structured JSON
- Provider pattern: dynamic import `createGroq`/`createOpenAI` based on env var availability
- Chat route `app/api/chat/route.ts` uses `streamText()` + `toUIMessageStreamResponse()`
- **`toDataStreamResponse` does NOT exist in SDK 6** -- use `toUIMessageStreamResponse()` for `useChat()`
- `useChat()` in SDK 6: returns `sendMessage({text})`, `status`, `messages` (UIMessage[])
- UIMessage has `parts` array (TextUIPart, ToolUIPart, etc.) -- NOT a `content` string
- `status` values: `"streaming"` | `"submitted"` | `"ready"` | `"error"`
- No `input`/`handleInputChange` in SDK 6 `useChat()` -- manage input state manually
- **`tool()` uses `inputSchema` NOT `parameters`** (breaking change from v5)
- **`maxSteps` replaced by `stopWhen: stepCountIs(N)`** in generateText/streamText
- **Token usage**: `usage.inputTokens` / `usage.outputTokens` (NOT promptTokens/completionTokens)
- `stepCountIs` and `hasToolCall` are exported from `"ai"` for stop conditions
- Agent pattern: `generateText()` + `tools` + `stopWhen` for multi-step tool calling

## fal.ai Integration
- Client config: `lib/fal.ts` exports configured `fal` instance and model constants
- Models: `fal-ai/flux-pro/v1/fill` (inpaint/remove), `fal-ai/nano-banana-pro/edit` (add/staging)
- Trigger.dev job: `trigger/inpaint-image.ts` handles full pipeline (fetch source -> fal -> upload to Supabase -> update DB)

## Image Processing Pattern
- `ImageProject` -> `Image` (parent-child versioning via `parentId`)
- `getActiveWorkspace()` helper in `app/actions/images.ts` (not exported, duplicated where needed)
- Trigger pattern: create placeholder Image (PROCESSING) -> trigger task -> poll for COMPLETED status
- Storage: Supabase via `lib/supabase.ts` helpers

## Build Notes
- Pre-existing Turbopack Lodash module resolution errors (480 errors) -- not our issue
- TypeScript `tsc --noEmit` is the reliable check for type correctness

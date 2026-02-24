# QA Reviewer Memory — Horecagrond

## Key Conventions Verified

### ActionResult<T> Type Definition
- Defined in `/types/actions.ts` as `{ success: boolean; data?: T; error?: string }`
- This is NOT a discriminated union — `data` is optional even on success
- This means `result.data!` non-null assertions appear in client code after `success === true` checks
- Recommendation to team: tighten to discriminated union pattern from `typescript-strict` skill

### Auth Pattern in Server Actions
- Standard: `auth.api.getSession({ headers: await headers() })`
- RBAC: use `requirePermission("permission:string")` from `lib/session.ts`
- `ai-visualize.ts` uses a local `getActiveWorkspace()` helper instead of `requirePermission()` — deviates from project standard
- `lib/session.ts` is the canonical guard; direct `auth.api.getSession` calls bypass the RBAC layer

### Property Ownership Verification Pattern
- Property belongs to an Agency (via `agencyId`)
- Agency has members via `AgencyMember` join table
- Correct authorization: verify `property.agencyId` matches user's agency membership
- `ai-visualize.ts` does NOT verify that the propertyId belongs to the authenticated user's workspace/agency — critical gap

### Next.js Server Action Timeout
- Default Vercel limit: 10s (hobby), 60s (pro), 300s (enterprise)
- No `export const maxDuration` set in `ai-visualize.ts`
- fal.ai `generateImage()` can take 30-60s — timeout risk without explicit `maxDuration`
- Pattern for long-running actions: add `export const maxDuration = 300;` at file level

### Memory / Buffer Risk Pattern
- `generateImage()` returns `uint8Array` (full image in server memory)
- Then `Buffer.from(generatedImage.uint8Array)` creates a second copy
- Typical fal.ai image output: 1-4 MB. At 10 concurrent requests = 40-80 MB RSS spike
- Not a production blocker for MVP but worth noting for scale

### Orphaned File Risk Pattern
- If R2 upload succeeds but DB update fails, the file remains in storage with no DB record
- No cleanup/rollback mechanism in current implementation
- Pattern to fix: use a transaction wrapper or a cleanup job

### SSRF Risk Pattern
- `fetch(imageUrl)` where `imageUrl` is user-supplied (Zod validates as URL format only)
- An attacker could pass `http://internal-service/admin` or `file://` — SSRF vector
- Fix: allowlist domains in Zod schema (restrict to known R2/CDN domains)

### Unoptimized `<img>` in Client Components
- `components/property/ai-interieur-section.tsx` uses raw `<img>` for published AI gallery (line 315)
- `next/image` with `unoptimized` prop used for dynamic thumbnails — acceptable tradeoff
- Raw `<img>` should be `<Image>` from `next/image` for layout stability and LCP

### Rate Limiting Behavior
- `checkRateLimit` fails open when Redis is unavailable (dev + production Redis outages)
- "ai" tier: 10 requests / 1 minute per userId — reasonable for virtual staging
- Rate limit key is `userId` — good, prevents per-user abuse

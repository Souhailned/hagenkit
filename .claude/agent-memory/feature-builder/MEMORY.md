# Feature Builder Memory

## Key Patterns

### Auth Session in Server Components
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
const reqHeaders = await headers();
const session = await auth.api.getSession({ headers: reqHeaders });
```

### fal.ai Integration Pattern
- Config: `fal.config({ credentials: process.env.FAL_API_KEY! })`
- Model: `fal-ai/nano-banana-pro/edit` for image editing
- Subscribe pattern with `(fal as any).subscribe(...)` due to type issues
- Result extraction: `result.data ?? result` then `.images[0].url`
- Upload: `fal.storage.upload(File)` to get fal URL

### Supabase Storage
- `uploadImage(buffer, path, contentType)` returns public URL or null
- `getExtensionFromContentType(contentType)` for file extensions
- Bucket: `aistudio-bucket`

### Rate Limiting
- `checkRateLimit(identifier, tier)` from `@/lib/rate-limit`
- Tiers: `ai`, `export`, `api`, `dream-guest`
- `dream-guest`: 1 per 24h (fixed window)
- Gracefully degrades when Redis unavailable

### ActionResult Type
```typescript
type ActionResult<T = void> = { success: boolean; data?: T; error?: string }
```

### Dynamic Import in Client Components
```typescript
const Component = dynamic(
  () => import("@/components/path").then((m) => m.Component),
  { ssr: false }
);
```

## Property Detail Page Structure
- File: `app/(marketing)/aanbod/[slug]/page.tsx` (server) + `property-detail.tsx` (client)
- property-detail.tsx is ~900 lines, "use client"
- Layout: Breadcrumbs > Gallery > Content Grid (Left: info + tabs, Right: sidebar)
- Dream Slider inserted between quick stats grid and Tabs component

## Prisma Compound Unique
- PropertyDemoConcept: `@@unique([propertyId, style])` -> `propertyId_style`
- Use in upsert: `where: { propertyId_style: { propertyId, style } }`

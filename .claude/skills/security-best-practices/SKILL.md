---
name: security-best-practices
description: Security patterns for SaaS applications. Use when handling auth, data access, input validation, or API security.
allowed-tools: Read, Write, Bash
---

# Security Best Practices

## Authentication & Authorization (RBAC)

Use the centralized RBAC system — NEVER write inline `role === "admin"` checks.

```typescript
// Server actions — use requirePermission()
import { requirePermission } from "@/lib/session";

const authCheck = await requirePermission("users:manage");
if (!authCheck.success) return { success: false, error: authCheck.error };
const { userId, role } = authCheck.data!;

// Server pages — use requirePagePermission() (auto-redirects)
import { requirePagePermission } from "@/lib/session";
const { userId, role } = await requirePagePermission("users:manage");

// Client components — use usePermissions()
import { usePermissions } from "@/hooks/use-permissions";
const { can, isAdmin } = usePermissions();
```

See `rbac-permissions` skill for full documentation.

## Authorization — Multi-tenant
```typescript
// Check workspace membership before data access
async function authorizeWorkspace(userId: string, workspaceId: string) {
  const member = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
  });
  if (!member) throw new Error("Geen toegang");
  return member;
}

// Check property ownership
async function authorizeProperty(userId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, agency: { members: { some: { userId } } } },
  });
  if (!property) throw new Error("Geen toegang");
  return property;
}
```

## Input Validation
```typescript
// ALWAYS validate with Zod before DB operations
const schema = z.object({
  title: z.string().min(1).max(200).trim(),
  email: z.string().email(),
  price: z.number().int().min(0).max(100_000_000), // max 1M euro in centen
  slug: z.string().regex(/^[a-z0-9-]+$/),
});
```

## SQL Injection Prevention
```typescript
// ✅ Prisma parameterized queries (safe)
await prisma.property.findMany({ where: { city: userInput } });

// ❌ NEVER raw SQL with user input
await prisma.$queryRawUnsafe(`SELECT * FROM property WHERE city = '${userInput}'`);

// ✅ If raw SQL needed, use parameterized
await prisma.$queryRaw`SELECT * FROM property WHERE city = ${userInput}`;
```

## XSS Prevention
```typescript
// React auto-escapes JSX — safe by default
<p>{userContent}</p> // ✅ safe

// ❌ NEVER use dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userContent }} /> // XSS risk
```

## Rate Limiting (public endpoints)
```typescript
// For contact forms, inquiries, sign-up
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1m"), // 5 per minute
});
```

## Environment Variables
```typescript
// ❌ NEVER expose server secrets to client
// Client-side env vars MUST start with NEXT_PUBLIC_
const apiKey = process.env.API_KEY; // server only ✅
const publicKey = process.env.NEXT_PUBLIC_APP_URL; // client ok ✅
```

## File Upload Security
- Validate file type (MIME + extension)
- Limit file size (max 10MB for images)
- Store in cloud storage (S3/R2), never local filesystem
- Generate unique filenames, never use user-provided names
- Scan for malware if possible

## Data Exposure
- Never return full user objects (strip password hash, internal fields)
- Use Prisma `select` to limit returned fields
- Separate public/private API responses
- Log access to sensitive data (financials, omzet)

## Checklist
- [ ] Auth check on every server action
- [ ] Workspace/tenant isolation
- [ ] Zod validation on all inputs
- [ ] No raw SQL with user input
- [ ] No dangerouslySetInnerHTML
- [ ] Rate limiting on public forms
- [ ] Environment variables properly scoped
- [ ] File uploads validated and size-limited
- [ ] Sensitive data not exposed in API responses

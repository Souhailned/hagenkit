# Code Review Checklist - Horecagrond

## File Structure

```
app/                    # Next.js 16 app router
  (auth)/               # Auth group (login, register)
  (dashboard)/          # Dashboard group (protected)
  api/                  # API routes
    auth/[...all]/      # Better Auth catch-all
  actions/              # Server actions
  layout.tsx            # Root layout
components/
  ui/                   # shadcn/ui primitives
  forms/                # Form components
  [feature]/            # Feature-specific components
lib/
  auth.ts               # Better Auth config
  auth-client.ts        # Auth client
  prisma.ts             # Prisma client singleton
  utils.ts              # Shared utilities
  validations/          # Zod schemas
types/                  # TypeScript type definitions
prisma/
  schema.prisma         # Database schema
```

## Import Rules

```typescript
// ✅ CORRECT - Always use @/ aliases
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { PropertySchema } from "@/lib/validations/property";

// ❌ WRONG - No relative imports across directories
import { Button } from "../../../components/ui/button";
import { prisma } from "../../lib/prisma";
```

**Exception:** Relative imports within the same directory are OK:
```typescript
import { columns } from "./columns"; // ✅ OK
```

## TypeScript Strictness

```typescript
// ✅ Explicit return types on exported functions
export function calculateRent(price: number, months: number): number {
  return price * months;
}

// ✅ No `any` — use `unknown` and narrow
function handleError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// ✅ Proper null checks
const user = session?.user;
if (!user) throw new Error("Unauthorized");

// ❌ NEVER
const data: any = await fetch(...);
// @ts-ignore
```

## Naming Conventions

### Dutch UI, English Code

```typescript
// ✅ Component names: English
export function PropertyCard({ property }: Props) {
  return (
    // ✅ UI text: Dutch
    <Card>
      <CardTitle>Pand details</CardTitle>
      <p>Adres: {property.address}</p>
      <Button>Opslaan</Button>
      <Button variant="outline">Annuleren</Button>
    </Card>
  );
}

// ✅ Variables, functions, types: English
interface Property {
  id: string;
  name: string;
  address: string;
}

// ❌ WRONG: Dutch variable names
const pandNaam = "test"; // Should be propertyName
```

### File Naming

```
components/property-card.tsx    ✅ kebab-case
components/PropertyCard.tsx     ❌ PascalCase files
lib/auth-client.ts              ✅ kebab-case
lib/authClient.ts               ❌ camelCase files
```

## Component Patterns

### Server Components (default)

```typescript
// app/(dashboard)/properties/page.tsx
// NO "use client" — server by default in Next.js 16
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PropertiesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");

  const properties = await prisma.property.findMany({
    where: { workspaceId: session.user.activeWorkspaceId },
  });

  return <PropertyList properties={properties} />;
}
```

### Client Components (only when needed)

```typescript
// components/forms/property-form.tsx
"use client"; // ← Only for interactivity (forms, state, effects)

import { useState } from "react";
import { useForm } from "react-hook-form";

export function PropertyForm() {
  const form = useForm();
  // ...
}
```

**Use `"use client"` only when:**
- Using hooks (useState, useEffect, useForm)
- Event handlers (onClick, onChange)
- Browser APIs (window, document)

## Error Handling

```typescript
// ✅ API routes: proper error responses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({ data: parsed.data });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Failed to create property:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ Server actions: return result objects
export async function createProperty(formData: FormData) {
  "use server";
  try {
    // ... validate and create
    return { success: true, data: property };
  } catch (error) {
    return { success: false, error: "Kon pand niet aanmaken" };
  }
}
```

## Security Checklist

1. **Auth on every protected route** — check session before data access
2. **Workspace scoping** — always filter by `workspaceId` in queries
3. **Input validation** — Zod schemas on all inputs (API + server actions)
4. **No secrets in client code** — only `NEXT_PUBLIC_*` env vars in client
5. **SQL injection** — use Prisma (parameterized by default), never raw SQL
6. **XSS** — React escapes by default, avoid `dangerouslySetInnerHTML`
7. **CSRF** — Better Auth handles this for auth routes
8. **Rate limiting** — on auth endpoints and public APIs

## Logging

```typescript
// ❌ No console.log in production code
console.log("debug:", data);

// ✅ Use structured logging or remove debug logs
// For now: console.error for actual errors only
console.error("Failed to create property:", error);
```

## Prisma Patterns

```typescript
// ✅ Select only needed fields
const properties = await prisma.property.findMany({
  where: { workspaceId },
  select: { id: true, name: true, address: true },
});

// ✅ Use transactions for multi-step operations
await prisma.$transaction(async (tx) => {
  const property = await tx.property.create({ data });
  await tx.audit.create({ data: { action: "CREATE", propertyId: property.id } });
});

// ❌ Don't fetch everything
const all = await prisma.property.findMany(); // No filter!
```

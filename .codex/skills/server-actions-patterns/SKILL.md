---
name: server-actions-patterns
description: Next.js Server Actions patterns. Use when building API endpoints, server actions, data mutations, or form handling.
allowed-tools: Read, Write, Bash
---

# Server Actions Patterns

## File Convention
```
app/actions/
├── properties.ts    # Property CRUD
├── video-projects.ts # Video CRUD
├── user.ts          # User actions
└── workstreams.ts   # Workstream actions
```

## Basic Pattern
```typescript
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { ActionResult } from "@/types/actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const createPropertySchema = z.object({
  title: z.string().min(3),
  city: z.string().min(1),
  propertyType: z.nativeEnum(PropertyType),
});

export async function createProperty(
  input: z.infer<typeof createPropertySchema>
): Promise<ActionResult<Property>> {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Niet ingelogd" };
    }

    // 2. Validate input
    const validated = createPropertySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    // 3. Authorization check
    const workspace = await getActiveWorkspace(session.user.id);
    if (!workspace) {
      return { success: false, error: "Geen actieve workspace" };
    }

    // 4. Database operation
    const property = await prisma.property.create({
      data: {
        ...validated.data,
        slug: generateSlug(validated.data.title),
        agencyId: workspace.id,
        createdById: session.user.id,
      },
    });

    // 5. Revalidate cache
    revalidatePath("/dashboard/properties");

    return { success: true, data: property };
  } catch (error) {
    console.error("createProperty error:", error);
    return { success: false, error: "Er is een fout opgetreden" };
  }
}
```

## Search/List Pattern (with pagination)
```typescript
export async function searchProperties(
  params: SearchInput
): Promise<ActionResult<PaginatedResult<Property>>> {
  const { page = 1, pageSize = 12, search, types, cities } = params;

  const where: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(types?.length && { propertyType: { in: types } }),
    ...(cities?.length && { city: { in: cities } }),
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    success: true,
    data: {
      items: properties,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

## Error Handling Rules
1. **Always return ActionResult** — never throw from server actions
2. **Validate ALL input** with Zod
3. **Check auth** before any mutation
4. **Check authorization** (workspace membership, ownership)
5. **Log errors** server-side, return user-friendly messages
6. **Revalidate paths** after mutations
7. **Use transactions** for multi-table operations:
```typescript
const result = await prisma.$transaction(async (tx) => {
  const property = await tx.property.create({ data: propertyData });
  await tx.propertyFinancials.create({ data: { propertyId: property.id, ...financialData } });
  return property;
});
```

## Security
- Never expose internal IDs in errors
- Always check workspace/agency membership
- Rate limit public actions (inquiries, contact forms)
- Sanitize user input (XSS prevention)
- Use CSRF tokens (Next.js handles via server actions)

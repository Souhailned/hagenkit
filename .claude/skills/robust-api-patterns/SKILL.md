---
name: robust-api-patterns
description: Build robust Next.js API routes and server actions with proper error handling, validation, rate limiting, and middleware.
allowed-tools: Read, Write, Bash
---

# Robust API Patterns for Next.js 16

## API Route Structure

### Basic Template
```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = await rateLimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // 2. Authentication
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Validation
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    // 4. Business logic
    const data = await processData(result.data);

    // 5. Response
    return NextResponse.json({ data }, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Server Actions (Preferred)

```typescript
// app/actions/create-property.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
});

export async function createProperty(formData: FormData) {
  // Auth check
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    return { error: "Unauthorized" };
  }

  // Validate
  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse({
    title: raw.title,
    price: Number(raw.price),
  });

  if (!parsed.success) {
    return { error: "Invalid data", issues: parsed.error.flatten() };
  }

  try {
    const property = await prisma.property.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/properties");
    return { data: property };

  } catch (error) {
    console.error("Create property failed:", error);
    return { error: "Failed to create property" };
  }
}
```

## Middleware Patterns

### Auth Middleware
```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/dashboard", "/api/protected"];
const authRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users
  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

// Usage in API route
const { success, limit, remaining } = await rateLimit.limit(identifier);
```

## Error Handling Utility

```typescript
// lib/api-utils.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", issues: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Resource already exists" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## Best Practices Checklist

- [ ] Always validate input with Zod
- [ ] Check authentication before processing
- [ ] Implement rate limiting for public endpoints
- [ ] Use try/catch with proper error responses
- [ ] Log errors with context
- [ ] Return consistent error format
- [ ] Use appropriate HTTP status codes
- [ ] Prefer server actions over API routes
- [ ] Revalidate cache after mutations

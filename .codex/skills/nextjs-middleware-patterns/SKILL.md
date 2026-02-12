---
name: nextjs-middleware-patterns
description: Next.js middleware patterns for auth, rate limiting, logging, and request handling.
allowed-tools: Read, Write
---

# Next.js 16 Middleware Patterns

## Basic Middleware Setup

```typescript
// middleware.ts (root level)
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Your middleware logic
  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

## Authentication Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/", "/login", "/register", "/api/auth"];
const authRoutes = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // But redirect logged-in users away from auth pages
    if (authRoutes.some(route => pathname.startsWith(route))) {
      const session = await auth.api.getSession({ headers: req.headers });
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // Check auth for protected routes
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

## Role-Based Access Control

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/dashboard/settings": ["ADMIN", "MANAGER"],
  "/dashboard/properties/new": ["ADMIN", "MANAGER", "AGENT"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Find matching role requirement
  const matchingRoute = Object.entries(roleRoutes).find(([route]) =>
    pathname.startsWith(route)
  );

  if (matchingRoute) {
    const [, allowedRoles] = matchingRoute;
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const userRole = (session.user as any).role;
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}
```

## Rate Limiting Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
});

export async function middleware(req: NextRequest) {
  // Only rate limit API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
    const ip = req.headers.get("x-forwarded-for") ?? 
               req.headers.get("x-real-ip") ?? 
               "127.0.0.1";
    
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}
```

## Logging Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const start = Date.now();
  
  // Add request ID
  const requestId = crypto.randomUUID();
  const response = NextResponse.next();
  
  // Add headers
  response.headers.set("x-request-id", requestId);
  
  // Log request (in production, use proper logging service)
  const duration = Date.now() - start;
  console.log({
    requestId,
    method: req.method,
    path: req.nextUrl.pathname,
    duration: `${duration}ms`,
    userAgent: req.headers.get("user-agent"),
  });

  return response;
}
```

## Geolocation & Localization

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const locales = ["nl", "en", "de"];
const defaultLocale = "nl";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if locale is in path
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Detect locale from header or geo
  const country = req.geo?.country ?? "NL";
  const locale = country === "DE" ? "de" : country === "NL" ? "nl" : "en";

  // Redirect to localized path
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, req.url)
  );
}
```

## Maintenance Mode

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";
const ALLOWED_IPS = (process.env.MAINTENANCE_ALLOWED_IPS ?? "").split(",");

export function middleware(req: NextRequest) {
  if (MAINTENANCE_MODE) {
    // Allow certain IPs (developers)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "";
    
    if (!ALLOWED_IPS.includes(ip)) {
      // Rewrite to maintenance page
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }
  }

  return NextResponse.next();
}
```

## Combining Multiple Middlewares

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Middleware chain
type MiddlewareFunction = (
  req: NextRequest,
  res: NextResponse
) => Promise<NextResponse | undefined>;

const middlewares: MiddlewareFunction[] = [
  loggingMiddleware,
  rateLimitMiddleware,
  authMiddleware,
];

export async function middleware(req: NextRequest) {
  let response = NextResponse.next();

  for (const mw of middlewares) {
    const result = await mw(req, response);
    if (result) return result; // Early return if middleware redirects/blocks
  }

  return response;
}

// Individual middleware functions
async function loggingMiddleware(req: NextRequest, res: NextResponse) {
  console.log(`${req.method} ${req.nextUrl.pathname}`);
  return undefined; // Continue to next middleware
}

async function rateLimitMiddleware(req: NextRequest, res: NextResponse) {
  // Rate limit logic...
  return undefined;
}

async function authMiddleware(req: NextRequest, res: NextResponse) {
  // Auth logic...
  return undefined;
}
```

## Best Practices

1. **Keep middleware fast** - It runs on every request
2. **Use edge runtime** - Middleware runs at the edge by default
3. **Avoid heavy operations** - No database queries if possible
4. **Use matcher config** - Exclude static files
5. **Handle errors gracefully** - Don't crash on middleware errors
6. **Log appropriately** - Use structured logging in production

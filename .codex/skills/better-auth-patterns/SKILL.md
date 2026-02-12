# Better Auth Patterns - Horecagrond

## Setup

Better Auth with Next.js 16, email+password authentication.

### Auth Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
  },
});
```

### Catch-All Route (`app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**Important:** The route MUST be `[...all]` not `[...nextauth]`.

### Auth Client (`lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Session in Server Components

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  // Workspace fallback: use first workspace if none selected
  const workspace = session.user.activeWorkspaceId
    ? await getWorkspace(session.user.activeWorkspaceId)
    : await getFirstWorkspace(session.user.id);

  return <Dashboard workspace={workspace} />;
}
```

### Session in Client Components

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export function UserNav() {
  const { data: session, isPending } = useSession();

  if (isPending) return <Skeleton />;
  if (!session) return <LoginButton />;

  return <span>{session.user.name}</span>;
}
```

### Middleware (`middleware.ts`)

```typescript
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### Sign In/Up Actions

```typescript
// Email + password sign in
await signIn.email({
  email: "user@example.com",
  password: "password123",
  callbackURL: "/dashboard",
});

// Sign up
await signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "User Name",
  callbackURL: "/dashboard",
});
```

## Common Pitfalls

1. **Always pass `headers`** to `auth.api.getSession()` in server context
2. **Use `await headers()`** in Next.js 16 (headers is async now)
3. **Workspace fallback** — always handle case where user has no active workspace
4. **baseURL** in auth client must match your deployment URL
5. **Prisma adapter** — ensure User/Session/Account models match Better Auth schema

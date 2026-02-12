---
name: nextjs-saas-structure
description: Clean project structure for Next.js 16 SaaS applications with TypeScript, Prisma, BetterAuth, and shadcn/ui. Use when creating new projects, organizing code, or refactoring structure.
---

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group (unprotected)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── api/               # API routes
│   │   ├── auth/[...all]/ # BetterAuth handler
│   │   └── webhooks/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                # shadcn/ui components (auto-generated)
│   ├── forms/             # Form components with react-hook-form
│   ├── layout/            # Layout components (nav, sidebar, footer)
│   └── shared/            # Shared/reusable components
├── lib/
│   ├── auth.ts            # BetterAuth server config
│   ├── auth-client.ts     # BetterAuth client
│   ├── db.ts              # Prisma client singleton
│   ├── ai.ts              # AI SDK config
│   └── utils.ts           # Utility functions (cn, formatters)
├── server/
│   ├── actions/           # Server actions ("use server")
│   └── services/          # Business logic layer
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types and interfaces
├── styles/               # Global styles (globals.css)
└── config/               # App configuration constants
prisma/
├── schema.prisma
└── migrations/
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserById` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Constants | SCREAMING_SNAKE_CASE | `API_URL` |
| Server Actions | camelCase with verb | `createUser`, `deletePost` |

## File Organization Rules

1. **Colocate related files**: Keep component, test, and styles together
2. **Barrel exports**: Use `index.ts` for clean imports from folders
3. **Client components**: Mark with `"use client"` at top
4. **Server actions**: Place in `server/actions/` with `"use server"`
5. **No relative imports**: Use `@/` path alias

## Import Order
```typescript
// 1. React/Next
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. Third-party
import { z } from "zod"

// 3. Internal lib
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

// 4. Components
import { Button } from "@/components/ui/button"

// 5. Types
import type { User } from "@/types"
```

## Key File Templates

### lib/db.ts (Prisma)
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

### lib/auth.ts (BetterAuth)
```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { db } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
})
```

### Server Action Pattern
```typescript
"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPost(data: CreatePostInput) {
  const post = await db.post.create({ data })
  revalidatePath("/dashboard")
  return post
}
```

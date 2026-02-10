---
name: prisma-patterns
description: Prisma ORM 7 patterns for Horecagrond. Use when working with database queries, schema changes, migrations, or Prisma Client.
allowed-tools: Read, Write, Bash
---

# Prisma 7 Patterns (Horecagrond)

## Setup
- **Version**: Prisma 7.3.0
- **Database**: PostgreSQL (port 5433)
- **Schema**: `prisma/schema.prisma`
- **Config**: `prisma.config.ts` (project root)
- **Generated Client**: `generated/prisma/client`
- **Driver Adapter**: `@prisma/adapter-pg` (PrismaPg)
- **Runtime**: Bun (auto-loads .env, no dotenv needed)

## Key Differences from Prisma 5/6

### Generator
```prisma
generator client {
  provider = "prisma-client"       // NOT "prisma-client-js"
  output   = "../generated/prisma" // REQUIRED in v7
}
```

### Datasource (schema.prisma)
```prisma
datasource db {
  provider = "postgresql"
  // NO url here — configured in prisma.config.ts
}
```

### prisma.config.ts
```typescript
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### Client Instantiation (Driver Adapter Required)
```typescript
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

### Imports — ALWAYS from generated path
```typescript
// ✅ Correct (v7)
import { PrismaClient, Prisma } from '@/generated/prisma/client'
import type { Property, PropertyType } from '@/generated/prisma/client'

// ❌ Wrong (v5/v6 style)
import { PrismaClient } from '@prisma/client'
```

## Client Usage

```typescript
import prisma from "@/lib/prisma";

// Query with relations
const property = await prisma.property.findUnique({
  where: { id },
  include: {
    images: true,
    workspace: true,
  },
});
```

## Schema Changes Workflow (v7)

1. **Edit schema**: `prisma/schema.prisma`
2. **Generate client**: `bunx prisma generate` (NOT automatic anymore!)
3. **Push to DB**: `bunx prisma db push` (dev only, does NOT auto-generate)
4. **Create migration**: `bunx prisma migrate dev` (does NOT auto-generate or auto-seed)
5. **Seed**: `bunx prisma db seed` (must run explicitly)

⚠️ **CRITICAL**: `prisma generate` must be run explicitly after schema changes. It no longer runs automatically after `db push` or `migrate dev`.

## Common Patterns

### Upsert
```typescript
await prisma.property.upsert({
  where: { id },
  update: { status: "ACTIVE" },
  create: { id, status: "ACTIVE", ...data },
});
```

### Transaction
```typescript
await prisma.$transaction([
  prisma.property.update({ where: { id }, data: { status: "SOLD" } }),
  prisma.notification.create({ data: { type: "PROPERTY_SOLD", propertyId: id } }),
]);
```

### Client Extensions (replaces $use middleware)
```typescript
// ❌ Removed in v7
prisma.$use(async (params, next) => { ... })

// ✅ Use Client Extensions instead
const prismaWithLogging = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const start = Date.now()
        const result = await query(args)
        console.log(`${model}.${operation}: ${Date.now() - start}ms`)
        return result
      },
    },
  },
})
```

### Soft Delete via Extension
```typescript
const prismaWithSoftDelete = prisma.$extends({
  query: {
    $allModels: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deletedAt: null }
        return query(args)
      },
    },
  },
})
```

### Custom Model Methods
```typescript
const xprisma = prisma.$extends({
  model: {
    property: {
      async findActive() {
        return prisma.property.findMany({
          where: { status: 'ACTIVE', deletedAt: null },
        })
      },
    },
  },
})

// Usage: const props = await xprisma.property.findActive()
```

## Type Safety

### Enums & Types from Generated Client
```typescript
import type { Property, PropertyType, PropertyStatus } from '@/generated/prisma/client'
import { Prisma } from '@/generated/prisma/client'

// Use Prisma namespace for input types
type PropertyCreateInput = Prisma.PropertyCreateInput
type PropertyWhereInput = Prisma.PropertyWhereInput
```

### Partial Record for enum maps
```typescript
// Not all 31 PropertyTypes need an entry
const icons: Partial<Record<PropertyType, ReactNode>> = {
  RESTAURANT: <UtensilsCrossed />,
  CAFE: <Coffee />,
  BAR: <Wine />,
}
```

## Database Connection
```
DATABASE_URL=postgresql://postgres:hagenkit_dev_password_123@localhost:5433/hagenkit
```

## Commands
```bash
bunx prisma generate     # Generate client (MUST run explicitly)
bunx prisma db push      # Push schema to DB (dev only)
bunx prisma db seed      # Run seed (MUST run explicitly)
bunx prisma migrate dev  # Create migration
bunx prisma studio       # Open Prisma Studio
```

## Agent Best Practices (from Prisma official)

1. **Always use context7 MCP** to look up latest Prisma docs before making changes
2. **Never assume v5/v6 patterns** — always import from generated path
3. **After ANY schema change**: run `bunx prisma generate` before building
4. **Driver adapter is mandatory** — no more direct PrismaClient() without adapter
5. **ESM compatible** — avoid CommonJS requires
6. **No $use middleware** — use Client Extensions for query hooks
7. **Env vars**: Bun auto-loads .env, no dotenv needed
8. **MongoDB not supported** in Prisma 7 — stay on v6 for MongoDB

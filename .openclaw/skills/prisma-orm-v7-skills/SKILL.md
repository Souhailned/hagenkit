---
name: prisma-orm-v7-skills
description: Prisma ORM 7 best practices, patterns, and agent guidelines. Use when generating Prisma code, upgrading, or troubleshooting.
---

## Links

- Upgrade guide (v7): https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma Config reference: https://www.prisma.io/docs/orm/reference/prisma-config-reference
- Prisma Client Extensions: https://www.prisma.io/docs/orm/prisma-client/client-extensions
- Prisma 7 migration prompt (AI agents): https://www.prisma.io/docs/ai/prompts/prisma-7

## Upgrade

```sh
# Upgrade packages
bun add @prisma/client@7 @prisma/adapter-pg pg
bun add -D prisma@7 @types/pg
```

## Breaking Changes (v7)

### Minimum versions
- Node.js: 20.19.0+ (and 22.x)
- TypeScript: 5.4.0+

### Prisma is now ESM
- Prisma ORM ships as ES modules.
- Set `"type": "module"` in `package.json` (or use a bundler like Next.js that handles ESM).
- TypeScript projects must compile/resolve ESM.

### Schema + Generation Changes
- Generator provider: `prisma-client-js` → `prisma-client`
- `output` is **required** in `generator client`
- Prisma Client is no longer generated into `node_modules`
- After `prisma generate`, import from your generated output path

### Datasource Config Moved
- `url`, `directUrl`, `shadowDatabaseUrl` in `schema.prisma` are **deprecated**
- Move datasource config to `prisma.config.ts`

### Driver Adapters Required
- Prisma Client creation now requires a driver adapter for all databases
- Postgres: `@prisma/adapter-pg` → `PrismaPg`
- SQLite: `@prisma/adapter-better-sqlite3`
- MySQL: `@prisma/adapter-mariadb`

### Env Vars Not Auto-Loaded
- Prisma CLI no longer auto-loads `.env` files
- Bun users: no change required (Bun auto-loads `.env`)
- Node users: add `import 'dotenv/config'` in `prisma.config.ts`

### CLI Config → prisma.config.ts
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

### Client Middleware Removed
- `prisma.$use(...)` is removed
- Migrate to Prisma Client Extensions

### Migrate/Seed/Generate Behavior
- Auto-seeding after `migrate dev` / `migrate reset` **removed**
- `prisma generate` no longer runs automatically after `db push` / `migrate dev`
- Run `prisma generate` and `prisma db seed` **explicitly**

### Removed Env Vars
- `PRISMA_CLI_QUERY_ENGINE_TYPE`, `PRISMA_CLIENT_ENGINE_TYPE`
- `PRISMA_QUERY_ENGINE_BINARY`, `PRISMA_QUERY_ENGINE_LIBRARY`
- `PRISMA_GENERATE_SKIP_AUTOINSTALL`, `PRISMA_SKIP_POSTINSTALL_GENERATE`
- `PRISMA_MIGRATE_SKIP_GENERATE`, `PRISMA_MIGRATE_SKIP_SEED`

## v7 Client Instantiation Pattern

```typescript
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## Client Extensions (replaces $use)

### Logging Extension
```typescript
const prisma = new PrismaClient({ adapter }).$extends({
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

### Soft Delete Extension
```typescript
const prisma = new PrismaClient({ adapter }).$extends({
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
const prisma = new PrismaClient({ adapter }).$extends({
  model: {
    user: {
      async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } })
      },
    },
  },
})
```

## Agent Rules (Official Prisma Guidelines)

1. **Never introduce Prisma Accelerate or HTTP/WebSocket drivers** unless already present
2. **Always load env explicitly** using `dotenv` — unless runtime is Bun (skip dotenv)
3. **Keep TypeScript ESM compatible** — avoid CommonJS requires
4. **Favor additive, reversible edits** — do not remove user logic
5. **If schema uses MongoDB** → stop and remain on Prisma v6
6. **After ANY schema change** → run `prisma generate` before building
7. **Use context7 MCP** to look up latest docs when uncertain
8. **Import from generated path** — never from `@prisma/client` directly

## Upgrade Checklist

- [ ] Upgrade packages; confirm Node/TypeScript versions
- [ ] Update `schema.prisma` generator to `provider = "prisma-client"` + set `output`
- [ ] Remove `url` from datasource block in schema
- [ ] Create `prisma.config.ts` with datasource URL and seed config
- [ ] Run `prisma generate` and update all imports to generated output path
- [ ] Update Prisma Client instantiation with driver adapter
- [ ] Replace any `$use()` middleware with Client Extensions
- [ ] Update scripts: `prisma generate` and `prisma db seed` explicitly
- [ ] Test: `prisma db push` + `bun run build`
- [ ] Remove `prisma.seed` from `package.json` (now in `prisma.config.ts`)

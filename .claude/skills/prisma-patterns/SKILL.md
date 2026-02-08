---
name: prisma-patterns
description: Prisma ORM patterns for Horecagrond. Use when working with database queries, schema changes, or migrations.
allowed-tools: Read, Write, Bash
---

# Prisma Patterns

## Setup
- **Version**: Prisma 5.22
- **Database**: PostgreSQL (port 5433)
- **Schema**: `prisma/schema.prisma`

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

## Schema Changes Workflow

1. **Edit schema**: `prisma/schema.prisma`
2. **Generate client**: `bun run prisma:generate`
3. **Push to DB**: `bun run prisma:push` (dev only)
4. **Create migration**: `bun run prisma:migrate` (production)

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

### Soft Delete Pattern
```typescript
// Schema
model Property {
  deletedAt DateTime?
}

// Query (exclude deleted)
await prisma.property.findMany({
  where: { deletedAt: null },
});
```

## Type Safety with Better Auth

When using Prisma with Better Auth session data:
```typescript
// Cast session user to your type
const user = session.user as unknown as CurrentUser;
```

## Database Connection
```
DATABASE_URL=postgresql://postgres:hagenkit_dev_password_123@localhost:5433/hagenkit
```

## Commands
```bash
bun run prisma:generate  # Generate client
bun run prisma:push      # Push schema to DB
bun run prisma:studio    # Open Prisma Studio
```

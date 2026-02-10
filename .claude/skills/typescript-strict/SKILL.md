---
name: typescript-strict
description: TypeScript strict mode patterns. Use when writing types, handling nulls, or fixing type errors.
allowed-tools: Read, Write, Bash
---

# TypeScript Strict Patterns

## Strict Null Checks
```typescript
// ❌ BAD - might be null
const user = await getUser(id);
console.log(user.name); // TypeError if null

// ✅ GOOD - handle null
const user = await getUser(id);
if (!user) {
  notFound(); // or throw
}
console.log(user.name); // safe
```

## Discriminated Unions for Action Results
```typescript
// ✅ Project pattern
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Usage
const result = await createProperty(data);
if (!result.success) {
  return { error: result.error };
}
// result.data is typed here
```

## Prisma Types — Use Generated Types
```typescript
// ❌ BAD - manual types that drift
interface Property {
  id: string;
  title: string;
}

// ✅ GOOD - derive from Prisma
import { Property, Prisma } from "@prisma/client";

// For updates
type PropertyUpdate = Prisma.PropertyUpdateInput;

// For queries with relations
type PropertyWithImages = Prisma.PropertyGetPayload<{
  include: { images: true; features: true };
}>;
```

## Zod Validation
```typescript
import { z } from "zod";

const createPropertySchema = z.object({
  title: z.string().min(3, "Titel moet minstens 3 tekens zijn"),
  city: z.string().min(1, "Stad is verplicht"),
  propertyType: z.nativeEnum(PropertyType),
  rentPrice: z.number().int().positive().optional(),
  surfaceTotal: z.number().int().positive(),
});

type CreatePropertyInput = z.infer<typeof createPropertySchema>;
```

## Enums — Use Prisma Enums
```typescript
// ❌ BAD - duplicate enum
enum PropertyType {
  RESTAURANT = "RESTAURANT",
}

// ✅ GOOD - re-export from Prisma
import { PropertyType } from "@prisma/client";
export { PropertyType };
```

## Type Guards
```typescript
function isPropertyType(value: string): value is PropertyType {
  return Object.values(PropertyType).includes(value as PropertyType);
}
```

## Generics for Reusable Components
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
}

function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // ...
}
```

## Rules
1. **Never use `any`** — use `unknown` and narrow
2. **Never use `as` casts** unless absolutely necessary (and comment why)
3. **Always handle null/undefined** — no optional chaining without fallback
4. **Use `satisfies`** for type checking without widening
5. **Prefer `const` assertions** for literal types
6. **Export types** from where they're defined, import with `type` keyword
7. **Prices in CENTEN** — always Int, never Float for money

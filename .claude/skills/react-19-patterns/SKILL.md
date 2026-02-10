---
name: react-19-patterns
description: React 19 patterns and best practices. Use when building components, handling state, forms, and server/client boundaries.
allowed-tools: Read, Write, Bash
---

# React 19 Patterns

## Server vs Client Components

### Default = Server Component
```tsx
// app/dashboard/page.tsx — Server Component (default)
import { getProperties } from "@/app/actions/properties";

export default async function DashboardPage() {
  const result = await getProperties();
  return <PropertyList properties={result.data} />;
}
```

### Client Component — Only When Needed
```tsx
"use client";
// Use ONLY for: interactivity, hooks, browser APIs, event handlers
import { useState } from "react";

export function PropertyFilter({ onFilter }: { onFilter: (q: string) => void }) {
  const [query, setQuery] = useState("");
  return <input value={query} onChange={(e) => { setQuery(e.target.value); onFilter(e.target.value); }} />;
}
```

### Rules
- Server Components: data fetching, DB access, sensitive logic
- Client Components: useState, useEffect, onClick, onChange, browser APIs
- Push "use client" as LOW as possible in the tree
- Pass server data DOWN to client components as props

## React 19 Form Actions

```tsx
"use client";
import { useActionState } from "react";
import { createProperty } from "@/app/actions/properties";

export function CreatePropertyForm() {
  const [state, action, isPending] = useActionState(createProperty, null);
  
  return (
    <form action={action}>
      <input name="title" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Bezig..." : "Opslaan"}
      </button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```

## useOptimistic

```tsx
"use client";
import { useOptimistic } from "react";

export function PropertyList({ properties }: { properties: Property[] }) {
  const [optimistic, addOptimistic] = useOptimistic(
    properties,
    (state, newProperty: Property) => [...state, newProperty]
  );

  async function handleCreate(formData: FormData) {
    const temp = { id: "temp", title: formData.get("title") as string };
    addOptimistic(temp);
    await createProperty(formData);
  }

  return optimistic.map(p => <PropertyCard key={p.id} property={p} />);
}
```

## use() Hook (React 19)

```tsx
import { use } from "react";

// Unwrap promises in render
function PropertyDetail({ propertyPromise }: { propertyPromise: Promise<Property> }) {
  const property = use(propertyPromise);
  return <h1>{property.title}</h1>;
}

// Unwrap context
function useTheme() {
  return use(ThemeContext);
}
```

## Suspense Boundaries

```tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<PropertyGridSkeleton />}>
      <PropertyGrid />
    </Suspense>
  );
}
```

## Error Handling

```tsx
"use client";

export default function ErrorBoundary({
  error, reset,
}: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2>Er ging iets mis</h2>
      <p>{error.message}</p>
      <Button onClick={reset}>Probeer opnieuw</Button>
    </div>
  );
}
```

## Key Rules
1. **No async client components** — use server components for async
2. **No `useEffect` for data fetching** — use server components or React Query
3. **Colocate** — keep components close to their routes
4. **Composition over inheritance** — use children/slots pattern
5. **Key prop** — always use stable, unique keys (not index)
6. **Memoization** — React 19 compiler handles most cases, avoid manual useMemo/useCallback unless measured

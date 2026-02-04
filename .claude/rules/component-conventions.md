# Component Conventions

## File Organization

```
components/
├── ui/                    # Shadcn primitives (don't modify)
├── dashboard/             # Dashboard-specific components
│   ├── page-container.tsx # Page wrapper (ALWAYS use this)
│   ├── empty-state.tsx    # Empty state component
│   └── empty-state-pro.tsx
├── admin/                 # Admin-specific components
├── data-table/            # Table components (@tanstack/react-table)
├── marketing/             # Marketing page components
└── auth/                  # Authentication components
```

## Component Patterns

### Server Components (Default)
```typescript
// No 'use client' directive
export default async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components
```typescript
'use client';

import { useState } from 'react';

export function ClientComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

## Import Conventions

### Path Aliases
```typescript
// ✅ Use aliases
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/dashboard/page-container";

// ❌ Don't use relative paths for deep imports
import { Button } from "../../../components/ui/button";
```

### Icon Imports
```typescript
import { UserPlus, Settings, ChevronRight } from "lucide-react";
```

### Type Imports
```typescript
import type { User } from "@/generated/prisma/client";
```

## Props Patterns

### With TypeScript Interface
```typescript
interface FeatureProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Feature({ title, description, children }: FeatureProps) {
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
```

### With cn() for Conditional Classes
```typescript
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-lg border bg-card", className)} {...props} />
  );
}
```

## Data Table Pattern

```typescript
import { DataTable } from "@/components/data-table/data-table";
import { columns } from "./columns";

export function FeatureTable({ data }) {
  return <DataTable columns={columns} data={data} />;
}
```

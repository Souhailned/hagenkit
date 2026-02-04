---
paths: app/dashboard/**/*.tsx
---

# Dashboard Page Development Rules

These rules apply to all files in `app/dashboard/`.

## Required Structure

Every dashboard page MUST use the **ContentCard** pattern to match the reference design:

1. **Import ContentCard components**
   ```typescript
   import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
   ```

2. **Use ContentCard as root wrapper**
   ```typescript
   export default async function PageName() {
     return (
       <ContentCard>
         <ContentCardHeader title="Page Title" actions={<OptionalActions />} />
         <ContentCardBody className="p-4">
           {/* content */}
         </ContentCardBody>
       </ContentCard>
     );
   }
   ```

3. **Provide title prop** - Always required for consistency

4. **Use theme tokens** - Never hardcode colors

## ContentCard Components

| Component | Purpose |
|-----------|---------|
| `ContentCard` | Main wrapper with border, rounded corners, margin |
| `ContentCardHeader` | Header with sidebar trigger, title, and optional actions |
| `ContentCardBody` | Scrollable content area |

## Anti-Patterns to Avoid

❌ Direct `<div>` wrappers without ContentCard
❌ Hardcoded pixel heights (`min-h-[500px]`)
❌ Custom layouts that bypass the standard structure
❌ Inline hex colors instead of theme tokens
❌ Using the old PageContainer component

## Empty States

For placeholder content during development:
```typescript
import { DashboardProEmptyState } from "@/components/dashboard/empty-state-pro";

<ContentCard>
  <ContentCardHeader title="Feature Name" />
  <ContentCardBody className="flex items-center justify-center">
    <DashboardProEmptyState />
  </ContentCardBody>
</ContentCard>
```

## Data Fetching Pattern

Dashboard pages are async Server Components:
```typescript
export default async function FeaturePage() {
  const data = await fetchData();

  return (
    <ContentCard>
      <ContentCardHeader title="Feature" />
      <ContentCardBody className="p-4">
        <FeatureContent data={data} />
      </ContentCardBody>
    </ContentCard>
  );
}
```

## Header with Actions

To add buttons or controls to the header:
```typescript
<ContentCardHeader
  title="Projects"
  actions={
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      New Project
    </Button>
  }
/>
```

## Header with Filter Row

For pages with filters/tabs below the title:
```typescript
<ContentCardHeader title="Projects">
  {/* Children appear below the title bar */}
  <div className="flex items-center gap-2">
    <FilterDropdown />
    <SortDropdown />
  </div>
</ContentCardHeader>
```

## Loading States

Use Suspense with skeleton fallbacks:
```typescript
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

<ContentCardBody>
  <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
    <AsyncContent />
  </Suspense>
</ContentCardBody>
```

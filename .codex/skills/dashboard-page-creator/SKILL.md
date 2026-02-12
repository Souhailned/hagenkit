---
name: dashboard-page-creator
description: Create new dashboard or admin pages following HagenKit patterns. Use when creating dashboard pages, implementing new dashboard features, adding pages under app/dashboard/ or app/(admin)/, or when the user asks to "create a page", "add a new page", or "make a dashboard page".
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Dashboard Page Creator Skill

This skill helps create consistent dashboard and admin pages following HagenKit's established patterns.

## When to Use

- User asks to create a new dashboard page
- User wants to add a feature page to the dashboard
- User asks to create an admin page
- User mentions "new page" in context of dashboard/admin

## Page Template

When creating a new dashboard page, ALWAYS use this structure:

```typescript
import { PageContainer } from "@/components/dashboard/page-container";
import { DashboardProEmptyState } from "@/components/dashboard/empty-state-pro";

export default async function FeatureNamePage() {
  return (
    <PageContainer
      title="Feature Name"
      description="Brief description of what this page does"
    >
      <div className="flex items-center justify-center min-h-[var(--content-full-height)]">
        <DashboardProEmptyState />
      </div>
    </PageContainer>
  );
}
```

## Admin Page Template

For admin pages under `app/(admin)/admin/`:

```typescript
import { PageContainer } from "@/components/dashboard/page-container";
import { AdminEmptyState } from "@/components/admin/empty-state";

export default async function AdminFeaturePage() {
  return (
    <PageContainer
      title="Admin Feature"
      description="Manage feature settings"
    >
      <div className="flex items-center justify-center min-h-[var(--content-full-height)]">
        <AdminEmptyState />
      </div>
    </PageContainer>
  );
}
```

## Page with Actions

When the page needs header actions (buttons):

```typescript
import { PageContainer } from "@/components/dashboard/page-container";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function FeaturePage() {
  return (
    <PageContainer
      title="Features"
      description="Manage your features"
      actions={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      }
    >
      {/* Content */}
    </PageContainer>
  );
}
```

## Page with Data Fetching

When the page fetches data:

```typescript
import { Suspense } from "react";
import { PageContainer } from "@/components/dashboard/page-container";
import { getFeatures } from "@/app/actions/features";
import { FeatureList } from "@/components/dashboard/feature-list";
import { Skeleton } from "@/components/ui/skeleton";

async function FeatureContent() {
  const result = await getFeatures();

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-destructive">
        {result.error || "Failed to load features"}
      </div>
    );
  }

  return <FeatureList data={result.data} />;
}

export default function FeaturesPage() {
  return (
    <PageContainer
      title="Features"
      description="View and manage features"
    >
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <FeatureContent />
      </Suspense>
    </PageContainer>
  );
}
```

## File Naming Convention

- Dashboard: `app/dashboard/[feature]/page.tsx`
- Admin: `app/(admin)/admin/[feature]/page.tsx`
- Use lowercase with hyphens for folder names

## Checklist After Creation

✅ PageContainer is the root wrapper
✅ Title prop is provided
✅ Description prop is provided (optional but recommended)
✅ Uses CSS variable `var(--content-full-height)` for full-height content
✅ Uses appropriate empty state component
✅ File is in correct directory
✅ Page is async if it fetches data

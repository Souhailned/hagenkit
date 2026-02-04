---
paths: app/dashboard/admin/**/*.tsx
---

# Admin Page Development Rules

Admin pages now live inside the dashboard: `app/dashboard/admin/`.

## Route Structure

Admin routes are under `/dashboard/admin/`:
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/users` - User management
- `/dashboard/admin/workspaces` - Workspace management
- `/dashboard/admin/impersonate` - User impersonation
- `/dashboard/admin/audit-logs` - Audit logs
- `/dashboard/admin/settings` - System settings

## Access Control

1. **Dashboard layout** handles authentication (redirects to sign-in)
2. **Admin layout** (`app/dashboard/admin/layout.tsx`) checks admin role:
   ```typescript
   if (currentUser?.role !== "admin") {
     redirect("/dashboard");
   }
   ```

## Required Structure

Every admin page MUST use **ContentCard** pattern:

```typescript
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";

export default function AdminPageName() {
  return (
    <ContentCard>
      <ContentCardHeader title="Page Title" />
      <ContentCardBody className="p-4">
        {/* content */}
      </ContentCardBody>
    </ContentCard>
  );
}
```

## Icon Library

Use **Phosphor Icons** for consistency:

```typescript
import { Users, Gear, FileText } from "@phosphor-icons/react/dist/ssr";

<Users className="h-4 w-4" weight="bold" />
```

## Admin-Specific Components

Located in `@/components/admin/`:
- `KpiCard` - Dashboard metrics
- `RecentActivity` - Activity feed
- `UsersDataTable` - User management table
- `UserCreateDialog` - Create user dialog
- `WorkspacesDataTable` - Workspace table
- `WorkspaceCreateDialog` - Create workspace dialog
- `ImpersonateUsersDataTable` - Impersonation table

## Sidebar Integration

Admin navigation is integrated in the main `AppSidebar`:
- Collapsible "Admin Console" section
- Only visible to users with `role === "admin"`
- Uses violet/purple accent colors for visual distinction
- Auto-expands when on `/dashboard/admin/*` routes

## Links Within Admin

Always use full dashboard paths:
```typescript
// ✅ Correct
<Link href="/dashboard/admin/users">Manage Users</Link>

// ❌ Wrong (old paths)
<Link href="/admin/users">Manage Users</Link>
```

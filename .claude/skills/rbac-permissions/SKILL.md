---
name: rbac-permissions
description: RBAC permission system for Horecagrond. Use when working with permissions, access control, role checks, admin guards, or EditableDataTable canEdit. Covers server actions, page guards, and client-side permission hooks.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# RBAC Permission System

## Architecture

```
lib/rbac.ts (SOURCE OF TRUTH)
  ROLE_PERMISSIONS    — which permissions each role has
  TABLE_COLUMN_PERMISSIONS — which permission is needed per table column
  hasPermission(role, perm) → boolean
  canEditColumn(role, resource, columnId) → boolean

lib/session.ts (SERVER-SIDE GUARDS)
  getSessionWithRole() → { userId, role, session } | null
  requirePermission(perm) → ActionResult<{ userId, role }>
  requirePagePermission(perm) → { userId, role } (redirects on fail)

hooks/use-permissions.ts (CLIENT-SIDE HOOK)
  usePermissions() → { role, userId, can, canEdit, isAdmin, isAgent, isSeeker }
```

## Roles

| Role | Description |
|------|-------------|
| `admin` | Platform owner — full access |
| `agent` | Makelaar — own properties, leads, agency |
| `seeker` | Ondernemer — search, favorites, inquiries |

## Permission Strings

Defined in `lib/rbac.ts` → `ROLE_PERMISSIONS`:

| Permission | admin | agent | seeker |
|-----------|:-----:|:-----:|:------:|
| `platform:manage` | x | | |
| `users:manage` | x | | |
| `users:change-role` | x | | |
| `properties:manage-all` | x | | |
| `properties:create` | x | x | |
| `properties:edit-own` | x | x | |
| `leads:view-all` | x | | |
| `leads:view-own` | x | x | |
| `analytics:platform` | x | | |
| `analytics:own` | x | x | |
| `agency:manage` | | x | |

## Usage Patterns

### 1. Server Action — `requirePermission()`

```typescript
"use server";
import { requirePermission } from "@/lib/session";

export async function updateUser(input: UpdateUserInput): Promise<ActionResult<any>> {
  const authCheck = await requirePermission("users:manage");
  if (!authCheck.success) return { success: false, error: authCheck.error };

  const { userId, role } = authCheck.data!;
  // ... business logic
}
```

**IMPORTANT:** Always destructure the error — `return { success: false, error: authCheck.error }` — never `return authCheck` directly (type mismatch with the function's generic return type).

### 2. Server Page — `requirePagePermission()`

```typescript
import { requirePagePermission } from "@/lib/session";

export default async function AdminUsersPage() {
  // Redirects to /sign-in if not logged in, /dashboard if no permission
  const { userId, role } = await requirePagePermission("users:manage");

  // Pass userId to client components that need it
  return <UsersDataTable currentUserId={userId} data={...} />;
}
```

### 3. Client Component — `usePermissions()`

```typescript
"use client";
import { usePermissions } from "@/hooks/use-permissions";

function AdminPanel() {
  const { can, isAdmin, role } = usePermissions();

  if (!can("users:manage")) return null;

  return <div>Admin content</div>;
}
```

### 4. EditableDataTable — Per-Cell `canEdit`

```typescript
"use client";
import { usePermissions } from "@/hooks/use-permissions";
import { EditableDataTable } from "@/components/data-table/editable";

function UsersTable({ data, currentUserId }) {
  const { canEdit: canEditCol } = usePermissions();

  const canEdit = useCallback((row, columnId) => {
    // Prevent self-role-edit
    if (columnId === "role" && row.original.id === currentUserId) return false;
    return canEditCol("admin-users", columnId);
  }, [currentUserId, canEditCol]);

  return (
    <EditableDataTable
      table={table}
      onCellSave={handleCellSave}
      canEdit={canEdit}
    />
  );
}
```

## Adding Permissions to a New Resource

### Step 1: Define column permissions in `lib/rbac.ts`

```typescript
export const TABLE_COLUMN_PERMISSIONS: Record<string, string> = {
  // ... existing entries
  // New resource
  "my-resource:fieldName": "required:permission",
};
```

### Step 2: Guard the server action

```typescript
const authCheck = await requirePermission("required:permission");
if (!authCheck.success) return { success: false, error: authCheck.error };
```

### Step 3: Guard the page (if admin-only)

```typescript
const { userId } = await requirePagePermission("required:permission");
```

### Step 4: Wire the client table

```typescript
const { canEdit: canEditCol } = usePermissions();
const canEdit = useCallback(
  (_row, columnId) => canEditCol("my-resource", columnId),
  [canEditCol]
);
```

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| `role === "admin"` string comparison | Scattered, no matrix | Use `can("permission:string")` |
| Local `checkAdmin()` in action files | Duplicate, extra DB query | Use `requirePermission()` |
| `prisma.user.findUnique({ select: { role } })` for auth | Session already has role | Use `getSessionWithRole()` |
| `return authCheck` in typed actions | Generic type mismatch | `return { success: false, error: authCheck.error }` |
| `disabled={true}` on whole table | All-or-nothing | Use `canEdit` callback for per-cell control |

## File Reference

| File | Purpose |
|------|---------|
| `lib/rbac.ts` | Permission matrix, column permissions, helpers |
| `lib/session.ts` | `requirePermission()`, `requirePagePermission()`, `getSessionWithRole()` |
| `hooks/use-permissions.ts` | Client hook: `usePermissions()` |
| `components/data-table/editable/editable-data-table.tsx` | `canEdit` prop (per-cell permission) |
| `types/actions.ts` | `ActionResult<T>` type definition |

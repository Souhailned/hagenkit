# Task Components

Components for the My Tasks page (`/dashboard/lifecycle`).

## Components

| Component | Description |
|-----------|-------------|
| `MyTasksContent` | Main client component that orchestrates the tasks view |
| `TaskWeekBoardView` | Week-based kanban board with drag-drop support |
| `TaskListView` | List view grouped by project with collapsible sections |
| `TaskBoardCard` | Card component for board view with drag-drop |
| `TaskRowBase` | Row component for list view |
| `TaskQuickCreateModal` | Create/edit task dialog |
| `TaskFilterPopover` | Filter controls with status, priority, tag, assignee |
| `TaskViewOptions` | View settings (list/board, grouping, sorting) |

## Usage

```tsx
import { MyTasksContent } from "@/components/tasks";
import { listMyTasks } from "@/app/actions/tasks";

export default async function LifecyclePage() {
  const result = await listMyTasks();
  return <MyTasksContent initialGroups={result.data ?? []} />;
}
```

## Features

- **Week Board View**: Navigate weeks, drag tasks between days
- **List View**: Grouped by project with progress indicators
- **Filtering**: Status, priority, tag, assignee
- **CRUD**: Create, update, delete tasks
- **Optimistic Updates**: Instant UI feedback

## Related Files

- `app/actions/tasks.ts` - Server actions
- `lib/validations/task.ts` - Zod schemas
- `types/task.ts` - TypeScript types

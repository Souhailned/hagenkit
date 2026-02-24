"use client"

import type { TaskGroup, TaskDetail } from "@/types/task"
import { TaskRow } from "./task-row"
import { Button } from "@/components/ui/button"
import { FolderSimple, Plus, ChartBar } from "@phosphor-icons/react/dist/ssr"
import { ProgressCircle } from "@/components/progress-circle"

function getProjectStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "in_progress":
      return "In Progress"
    case "completed":
    case "done":
      return "Completed"
    case "planned":
      return "Planned"
    case "cancelled":
      return "Cancelled"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }
}

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

interface TaskProjectSectionProps {
  group: TaskGroup
  onToggleStatus: (taskId: string, currentStatus: string) => void
  onEditTask: (task: TaskDetail) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: () => void
}

export function TaskProjectSection({ group, onToggleStatus, onEditTask, onDeleteTask, onAddTask }: TaskProjectSectionProps) {
  const total = group.stats.total
  const done = group.stats.completed
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <section className="max-w-6xl mx-auto rounded-3xl border border-border bg-muted shadow-[var(--shadow-workstream)] p-3 space-y-2">
      {/* Header row */}
      <header className="flex items-center justify-between gap-4 px-0 py-1">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
          <FolderSimple className="h-5 w-5" weight="regular" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <span className="text-sm font-semibold leading-tight">{group.project.name}</span>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {group.project.priority && (
              <span className="inline-flex items-center gap-1">
                <ChartBar className="h-3 w-3" weight="regular" />
                <span className="font-medium">{capitalize(group.project.priority)}</span>
              </span>
            )}
            <div className="h-4 w-px bg-border/70 hidden sm:inline" />
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium hidden sm:inline">
              {getProjectStatusLabel(group.project.status)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <span className="font-medium">{done}/{total}</span>
          <ProgressCircle progress={percent} size={18} />
          <div className="h-4 w-px bg-border/80" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-full text-muted-foreground hover:bg-transparent"
            aria-label="Add task"
            onClick={(e) => { e.stopPropagation(); onAddTask() }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Task list inside white card */}
      <div className="space-y-1 px-2 py-3 bg-background rounded-2xl border border-border">
        {group.tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggleStatus={onToggleStatus}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </section>
  )
}

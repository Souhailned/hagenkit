"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

import {
  listMyTasks,
  toggleTaskStatus as toggleTaskStatusAction,
  createTask,
  updateTask,
  deleteTask,
  getWorkspaceMembers,
  getWorkspaceProjects,
} from "@/app/actions/tasks"
import type { TaskGroup, TaskDetail } from "@/types/task"
import { DEFAULT_VIEW_OPTIONS, type ViewOptions } from "@/lib/view-options"
import type { CreateMyTaskInput, UpdateMyTaskInput } from "@/lib/validations/task"

import { TaskProjectSection } from "./task-project-section"
import { TaskWeekBoard } from "./task-week-board"
import { TaskCreateDialog } from "./task-create-dialog"
import { FilterPopover, type FilterChip } from "@/components/dashboard/filter-popover"
import { ChipOverflow } from "@/components/dashboard/chip-overflow"
import { ViewOptionsPopover } from "@/components/dashboard/view-options-popover"

export function MyTasksContent() {
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Filter + View state
  const [filters, setFilters] = useState<FilterChip[]>([])
  const [viewOptions, setViewOptions] = useState<ViewOptions>(DEFAULT_VIEW_OPTIONS)

  // Create/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null)

  // Workspace data for dropdowns
  const [members, setMembers] = useState<Array<{ id: string; name: string | null; email: string; image: string | null }>>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string; status: string }>>([])

  const fetchTasks = useCallback(async () => {
    const result = await listMyTasks({ includeCompleted: showCompleted })
    if (result.success && result.data) {
      setGroups(result.data)
    }
    setLoading(false)
  }, [showCompleted])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  useEffect(() => {
    getWorkspaceMembers().then(r => r.success && r.data && setMembers(r.data))
    getWorkspaceProjects().then(r => r.success && r.data && setProjects(r.data))
  }, [])

  const handleToggleStatus = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    // Optimistic update
    setGroups(prev => prev.map(g => ({
      ...g,
      tasks: g.tasks.map(t => t.id === taskId ? { ...t, status: newStatus as TaskDetail["status"] } : t),
      stats: {
        ...g.stats,
        completed: g.stats.completed + (newStatus === "DONE" ? 1 : -1),
      }
    })))
    startTransition(async () => {
      const result = await toggleTaskStatusAction({ id: taskId, status: newStatus as TaskDetail["status"] })
      if (!result.success) {
        toast.error(result.error || "Failed to update task")
        fetchTasks()
      }
    })
  }

  const handleCreateTask = async (input: CreateMyTaskInput) => {
    const result = await createTask(input)
    if (result.success) {
      toast.success("Task created")
      fetchTasks()
      setDialogOpen(false)
    } else {
      toast.error(result.error || "Failed to create task")
    }
    return result.success
  }

  const handleUpdateTask = async (input: UpdateMyTaskInput) => {
    const result = await updateTask(input)
    if (result.success) {
      toast.success("Task updated")
      fetchTasks()
      setDialogOpen(false)
      setEditingTask(null)
    } else {
      toast.error(result.error || "Failed to update task")
    }
    return result.success
  }

  const handleDeleteTask = async (taskId: string) => {
    const result = await deleteTask({ id: taskId })
    if (result.success) {
      toast.success("Task deleted")
      fetchTasks()
    } else {
      toast.error(result.error || "Failed to delete task")
    }
  }

  const handleEditTask = (task: TaskDetail) => {
    setEditingTask(task)
    setDialogOpen(true)
  }

  const allTasks = groups.flatMap(g => g.tasks)

  return (
    <div className="flex flex-1 flex-col min-h-0 bg-background mx-2 my-2 border border-border rounded-lg min-w-0">
      {/* Header */}
      <header className="flex flex-col border-b border-border/40">
        {/* Top row: sidebar trigger + title + new task button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
            <p className="text-base font-medium text-foreground">Tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setEditingTask(null); setDialogOpen(true) }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Bottom row: filters + view options */}
        <div className="flex items-center justify-between px-4 pb-3 pt-3">
          <div className="flex items-center gap-2">
            <FilterPopover
              initialChips={filters}
              onApply={setFilters}
              onClear={() => setFilters([])}
            />
            <ChipOverflow
              chips={filters}
              onRemove={(key, value) =>
                setFilters((prev) => prev.filter((chip) => !(chip.key === key && chip.value === value)))
              }
              maxVisible={6}
            />
          </div>
          <div className="flex items-center gap-2">
            <ViewOptionsPopover
              options={viewOptions}
              onChange={setViewOptions}
              allowedViewTypes={["list", "board"]}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex-1 p-4 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <div className="space-y-2 pl-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">No tasks yet. Create your first task to get started.</p>
          <Button size="sm" onClick={() => { setEditingTask(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            Create Task
          </Button>
        </div>
      ) : viewOptions.viewType === "list" ? (
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-4 py-4">
          {groups.map((group) => (
            <TaskProjectSection
              key={group.project.id}
              group={group}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={() => { setEditingTask(null); setDialogOpen(true) }}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <TaskWeekBoard
            tasks={allTasks}
            viewOptions={viewOptions}
            onToggleStatus={handleToggleStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddTask={() => { setEditingTask(null); setDialogOpen(true) }}
          />
        </div>
      )}

      <TaskCreateDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingTask(null) }}
        task={editingTask}
        projects={projects}
        members={members}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
      />
    </div>
  )
}

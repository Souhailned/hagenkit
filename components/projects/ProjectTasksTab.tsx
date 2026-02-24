"use client"

import { useState, useMemo } from "react"
import { createProjectTask, updateProjectTask } from "@/app/actions/projects"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Plus, ListFilter } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskData {
  id: string
  name: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority?: "NO_PRIORITY" | "LOW" | "MEDIUM" | "HIGH" | "URGENT" | null
  assigneeId: string | null
  workstreamId: string | null
  assignee: { id: string; name: string | null; image: string | null } | null
  endDate: Date | null
  order: number
}

interface WorkstreamInfo {
  id: string
  name: string
}

interface ProjectTasksTabProps {
  projectId: string
  tasks: TaskData[]
  workstreams: WorkstreamInfo[]
  members: { id: string; name: string | null; image: string | null }[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-50",
  DONE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-50",
}

function formatDate(date: Date | null): string | null {
  if (!date) return null
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProjectTasksTab({
  projectId,
  tasks,
  workstreams,
  members,
}: ProjectTasksTabProps) {
  const router = useRouter()

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL")

  // New task dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("TODO")
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)

  // Workstream lookup
  const workstreamMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const ws of workstreams) {
      map.set(ws.id, ws.name)
    }
    return map
  }, [workstreams])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (statusFilter !== "ALL") count++
    if (assigneeFilter !== "ALL") count++
    return count
  }, [statusFilter, assigneeFilter])

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false
      if (assigneeFilter !== "ALL" && task.assigneeId !== assigneeFilter)
        return false
      return true
    })
  }, [tasks, statusFilter, assigneeFilter])

  // Toggle task done / undone
  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    const result = await updateProjectTask({ id: taskId, status: newStatus as TaskStatus })
    if (result.success) router.refresh()
    else toast.error(result.error || "Failed to update task")
  }

  // Create a new task
  const handleCreate = async () => {
    if (!newTaskName.trim()) return
    setIsCreating(true)
    const result = await createProjectTask({
      projectId,
      name: newTaskName.trim(),
      status: newTaskStatus,
      assigneeId: newTaskAssigneeId,
      order: tasks.length, // Add to end of list
    })
    if (result.success) {
      setNewTaskName("")
      setNewTaskStatus("TODO")
      setNewTaskAssigneeId(undefined)
      setDialogOpen(false)
      router.refresh()
      toast.success("Task created")
    } else {
      toast.error(result.error || "Failed to create task")
    }
    setIsCreating(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---------------------------------------------------------------- */}
      {/* Header row: filters + new task button                            */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListFilter className="size-4 text-muted-foreground" />

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee filter */}
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name || "Unnamed"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active filter count badge */}
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 px-1.5 text-[10px]"
            >
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {/* New task button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              New Task
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-name">Task name</Label>
                <Input
                  id="task-name"
                  placeholder="Enter task name..."
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isCreating) handleCreate()
                  }}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={newTaskStatus}
                  onValueChange={(v) => setNewTaskStatus(v as TaskStatus)}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select
                  value={newTaskAssigneeId ?? "unassigned"}
                  onValueChange={(v) => setNewTaskAssigneeId(v === "unassigned" ? undefined : v)}
                >
                  <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name || "Unnamed"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating || !newTaskName.trim()}
                className="mt-1"
              >
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Task list                                                        */}
      {/* ---------------------------------------------------------------- */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No tasks yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Create your first task to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl bg-card shadow-[var(--shadow-workstream)] border border-border">
          {filteredTasks.map((task) => {
            const isDone = task.status === "DONE"
            const workstreamName = task.workstreamId
              ? workstreamMap.get(task.workstreamId) ?? null
              : null

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isDone}
                  onCheckedChange={() => toggleTask(task.id, task.status)}
                  className={cn(
                    isDone &&
                      "data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                  )}
                />

                {/* Task name */}
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    isDone && "text-muted-foreground line-through"
                  )}
                >
                  {task.name}
                </span>

                {/* Workstream badge */}
                {workstreamName && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {workstreamName}
                  </span>
                )}

                {/* Status badge */}
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-none text-[11px] font-medium",
                    STATUS_COLORS[task.status]
                  )}
                >
                  {STATUS_LABELS[task.status]}
                </Badge>

                {/* Due date */}
                {task.endDate && (
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(task.endDate)}
                  </span>
                )}

                {/* Assignee avatar */}
                {task.assignee && (
                  <Avatar className="size-6">
                    {task.assignee.image && (
                      <AvatarImage
                        src={task.assignee.image}
                        alt={task.assignee.name || "Assignee"}
                      />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {getInitials(task.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

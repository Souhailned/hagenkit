"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CaretDown } from "@phosphor-icons/react/dist/ssr"
import { Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { createWorkstream, updateWorkstream, deleteWorkstream } from "@/app/actions/workstreams"
import { updateProjectTask } from "@/app/actions/projects"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ProgressCircle } from "@/components/progress-circle"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskData {
  id: string
  name: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  assigneeId: string | null
  assignee: { id: string; name: string | null; image: string | null } | null
  endDate: Date | null
  order: number
  workstreamId: string | null
}

interface WorkstreamData {
  id: string
  name: string
  order: number
  tasks: TaskData[]
}

interface WorkstreamTabProps {
  projectId: string
  workstreams: WorkstreamData[]
  allTasks: TaskData[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function statusLabel(status: "TODO" | "IN_PROGRESS" | "DONE") {
  switch (status) {
    case "TODO":
      return "To Do"
    case "IN_PROGRESS":
      return "In Progress"
    case "DONE":
      return "Done"
  }
}

function statusVariant(status: "TODO" | "IN_PROGRESS" | "DONE") {
  switch (status) {
    case "DONE":
      return "default" as const
    case "IN_PROGRESS":
      return "secondary" as const
    case "TODO":
      return "outline" as const
  }
}

// ---------------------------------------------------------------------------
// TaskRow
// ---------------------------------------------------------------------------

function TaskRow({
  task,
  onToggle,
}: {
  task: TaskData
  onToggle: (taskId: string, currentStatus: string) => void
}) {
  const isDone = task.status === "DONE"

  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={isDone}
        onCheckedChange={() => onToggle(task.id, task.status)}
        className={cn(
          isDone &&
            "data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
        )}
      />

      <span
        className={cn(
          "flex-1 text-sm truncate",
          isDone && "line-through text-muted-foreground"
        )}
      >
        {task.name}
      </span>

      {task.endDate && (
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDate(task.endDate)}
        </span>
      )}

      {task.assignee && (
        <Avatar className="size-6">
          {task.assignee.image && (
            <AvatarImage
              src={task.assignee.image}
              alt={task.assignee.name ?? ""}
            />
          )}
          <AvatarFallback className="text-[10px]">
            {getInitials(task.assignee.name)}
          </AvatarFallback>
        </Avatar>
      )}

      <Badge
        variant={statusVariant(task.status)}
        className="text-[10px] px-1.5 py-0"
      >
        {statusLabel(task.status)}
      </Badge>
    </div>
  )
}

// ---------------------------------------------------------------------------
// WorkstreamTab (main export)
// ---------------------------------------------------------------------------

export function WorkstreamTab({
  projectId,
  workstreams,
  allTasks,
}: WorkstreamTabProps) {
  const router = useRouter()

  // Inline add workstream state
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Editable workstream name state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  // Delete confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // ---- Actions ----

  const handleRenameWorkstream = async () => {
    if (!editingId || !editingName.trim()) {
      setEditingId(null)
      return
    }
    // Find original name to skip no-op renames
    const ws = workstreams.find((w) => w.id === editingId)
    if (ws && ws.name === editingName.trim()) {
      setEditingId(null)
      return
    }
    const result = await updateWorkstream({ id: editingId, name: editingName.trim() })
    if (result.success) {
      router.refresh()
      toast.success("Workstream renamed")
    } else {
      toast.error(result.error || "Failed to rename workstream")
    }
    setEditingId(null)
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE"
    const result = await updateProjectTask({ id: taskId, status: newStatus })
    if (result.success) {
      router.refresh()
    } else {
      toast.error(result.error || "Failed to update task")
    }
  }

  const handleCreateWorkstream = async () => {
    if (!newName.trim()) return
    setIsCreating(true)
    const result = await createWorkstream({ projectId, name: newName.trim() })
    if (result.success) {
      setNewName("")
      setIsAdding(false)
      router.refresh()
      toast.success("Workstream created")
    } else {
      toast.error(result.error || "Failed to create workstream")
    }
    setIsCreating(false)
  }

  // ---- Derived data ----

  const unassignedTasks = allTasks.filter((t) => !t.workstreamId)
  const sortedWorkstreams = [...workstreams].sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Workstreams</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus />
          Add Workstream
        </Button>
      </div>

      {/* Inline add form */}
      {isAdding && (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder="Workstream name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateWorkstream()
              if (e.key === "Escape") {
                setIsAdding(false)
                setNewName("")
              }
            }}
            disabled={isCreating}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            onClick={handleCreateWorkstream}
            disabled={isCreating || !newName.trim()}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false)
              setNewName("")
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Empty state */}
      {sortedWorkstreams.length === 0 &&
        unassignedTasks.length === 0 &&
        !isAdding && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No workstreams yet. Create one to organize your tasks.
            </p>
          </div>
        )}

      {/* Workstream accordions */}
      {sortedWorkstreams.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted shadow-[var(--shadow-workstream)] p-3 space-y-3">
          <div className="flex items-center justify-between gap-3 px-2">
            <h4 className="text-sm font-semibold tracking-normal text-foreground uppercase">
              Workstream Breakdown
            </h4>
          </div>

          <Accordion
            type="multiple"
            defaultValue={sortedWorkstreams.map((ws) => ws.id)}
            className="w-full space-y-2"
          >
            {sortedWorkstreams.map((ws) => {
              const doneTasks = ws.tasks.filter((t) => t.status === "DONE")
              const totalTasks = ws.tasks.length
              const progress =
                totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0
              const sortedTasks = [...ws.tasks].sort((a, b) => a.order - b.order)

              return (
                <AccordionItem
                  key={ws.id}
                  value={ws.id}
                  className="overflow-hidden rounded-xl border border-border bg-background last:border-b"
                >
                  <AccordionTrigger
                    className={cn(
                      "items-center gap-3 px-3 py-3 hover:no-underline hover:bg-muted/50 bg-background",
                      "[&>svg:last-child]:hidden"
                    )}
                  >
                    <CaretDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />

                    {editingId === ws.id ? (
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRenameWorkstream()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleRenameWorkstream()
                          }
                          if (e.key === "Escape") setEditingId(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-sm font-medium"
                      />
                    ) : (
                      <span
                        className="flex-1 truncate text-left text-sm font-medium text-foreground"
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          setEditingId(ws.id)
                          setEditingName(ws.name)
                        }}
                      >
                        {ws.name}
                      </span>
                    )}

                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 shrink-0"
                    >
                      {doneTasks.length}/{totalTasks}
                    </Badge>

                    {/* Delete workstream */}
                    {confirmDeleteId === ws.id ? (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          onClick={async (e) => {
                            e.stopPropagation()
                            const result = await deleteWorkstream({ id: ws.id })
                            if (result.success) {
                              toast.success("Workstream deleted")
                              router.refresh()
                            } else {
                              toast.error(result.error || "Failed to delete")
                            }
                            setConfirmDeleteId(null)
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteId(null)
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(ws.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <ProgressCircle
                      progress={progress}
                      size={22}
                      strokeWidth={2.5}
                    />
                  </AccordionTrigger>

                  <AccordionContent className="px-2 pb-2">
                    {sortedTasks.length === 0 ? (
                      <p className="py-3 text-xs text-muted-foreground text-center">
                        No tasks in this workstream.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {sortedTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                          />
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      )}

      {/* Unassigned tasks */}
      {unassignedTasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unassigned
            </span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {unassignedTasks.length}
            </Badge>
          </div>
          <div className="flex flex-col gap-0.5">
            {[...unassignedTasks]
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <TaskRow key={task.id} task={task} onToggle={toggleTask} />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import type { TaskDetail } from "@/types/task"
import { getTaskTagConfig } from "@/types/task"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FolderSimple,
  CalendarBlank,
  Tag as TagIcon,
  DotsThree,
} from "@phosphor-icons/react/dist/ssr"
import { format } from "date-fns"

interface TaskBoardCardProps {
  task: TaskDetail
  onToggleStatus: (taskId: string, currentStatus: string) => void
  onEdit: (task: TaskDetail) => void
  onDelete?: (taskId: string) => void
  isDragging?: boolean
  visibleProperties?: string[]
}

const DEFAULT_VISIBLE_PROPERTIES = ["title", "status", "assignee", "dueDate"]

export function TaskBoardCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isDragging: isDraggingProp,
  visibleProperties = DEFAULT_VISIBLE_PROPERTIES,
}: TaskBoardCardProps) {
  const isDone = task.status === "DONE"
  const tagConfig = getTaskTagConfig(task.tag)
  const showProperty = (prop: string) => visibleProperties.includes(prop)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const initials = task.assignee?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-2xl border border-border bg-card p-4",
        "hover:shadow-lg/5 transition-shadow cursor-grab active:cursor-grabbing",
        isDone && "opacity-70",
        (isDraggingProp || isSortableDragging) && "ring-2 ring-primary shadow-lg scale-[0.98]",
      )}
    >
      {/* Top row: project badge + actions + avatar */}
      <div className="flex items-center justify-between">
        <span className="text-xs max-w-[160px] truncate text-muted-foreground">
          {task.project.name}
        </span>
        <div className="flex items-center gap-1">
          {/* More menu - visible on hover */}
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "shrink-0 h-6 w-6 rounded flex items-center justify-center",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                  )}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <DotsThree className="h-4 w-4" weight="bold" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Avatar */}
          {showProperty("assignee") && task.assignee ? (
            <Avatar className="size-6 border border-border">
              {task.assignee.image ? (
                <AvatarImage src={task.assignee.image} alt={task.assignee.name ?? ""} />
              ) : (
                <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
              )}
            </Avatar>
          ) : showProperty("assignee") ? (
            <Avatar className="size-6 border border-border">
              <AvatarFallback>
                <FolderSimple className="h-4 w-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </div>

      {/* Middle row: checkbox + title */}
      <div className="flex items-start gap-3 mt-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggleStatus(task.id, task.status)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="rounded-full border-border bg-background data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 hover:cursor-pointer mt-0.5 shrink-0"
          aria-label={`Mark ${task.name} as ${isDone ? "todo" : "done"}`}
        />
        <p
          className={cn(
            "text-sm font-medium leading-5 flex-1 min-w-0 line-clamp-2",
            isDone && "line-through text-muted-foreground",
          )}
        >
          {task.name}
        </p>
      </div>

      {/* Bottom row: chips */}
      {(showProperty("status") || showProperty("dueDate")) && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {/* Project chip */}
          <div className="bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1">
            <FolderSimple className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
              {task.project.name}
            </span>
          </div>

          {/* Date chip */}
          {showProperty("dueDate") && (
            <div className="bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1">
              <CalendarBlank className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {task.endDate ? format(task.endDate, "MMM d") : "No date"}
              </span>
            </div>
          )}

          {/* Tag chip */}
          {showProperty("status") && tagConfig && (
            <div className="bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1">
              <TagIcon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{tagConfig.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

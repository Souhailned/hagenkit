"use client"

import { cn } from "@/lib/utils"
import type { TaskDetail } from "@/types/task"
import { getTaskStatusConfig, getTaskTagConfig } from "@/types/task"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr"
import { format } from "date-fns"

function getStatusTextColor(status: string): string {
  switch (status) {
    case "DONE":
      return "text-emerald-500"
    case "IN_PROGRESS":
      return "text-amber-500"
    default:
      return "text-muted-foreground"
  }
}

interface TaskRowProps {
  task: TaskDetail
  onToggleStatus: (taskId: string, currentStatus: string) => void
  onEdit: (task: TaskDetail) => void
  onDelete: (taskId: string) => void
}

export function TaskRow({ task, onToggleStatus, onEdit, onDelete }: TaskRowProps) {
  const statusConfig = getTaskStatusConfig(task.status)
  const tagConfig = getTaskTagConfig(task.tag)
  const isDone = task.status === "DONE"
  const initials = task.assignee?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 group">
      {/* Rounded-full checkbox matching reference */}
      <Checkbox
        checked={isDone}
        onCheckedChange={() => onToggleStatus(task.id, task.status)}
        className="rounded-full border-border bg-background data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 hover:cursor-pointer"
      />

      {/* Title area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex-1 truncate text-left",
            isDone && "line-through text-muted-foreground"
          )}>
            {task.name}
          </span>
        </div>
      </div>

      {/* Meta area */}
      <div className="flex items-center gap-3 text-xs shrink-0 ml-2">
        {/* Status as colored text */}
        <span className={cn("font-medium", getStatusTextColor(task.status))}>
          {statusConfig.label}
        </span>

        {/* Start date */}
        {task.startDate && (
          <span className="text-muted-foreground hidden sm:inline">
            Start: {format(task.startDate, "dd/MM")}
          </span>
        )}

        {/* Due date */}
        {task.endDate && (
          <span className="text-muted-foreground hidden sm:inline">
            {format(task.endDate, "MMM d")}
          </span>
        )}

        {/* Priority pill */}
        {task.priority && task.priority !== "NO_PRIORITY" && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground hidden sm:inline">
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase().replace("_", " ")}
          </span>
        )}

        {/* Tag badge */}
        {tagConfig && (
          <Badge variant="outline" className="whitespace-nowrap text-[11px] hidden sm:inline">
            {tagConfig.label}
          </Badge>
        )}

        {/* Assignee */}
        {task.assignee && (
          <Avatar className="size-6">
            {task.assignee.image && (
              <AvatarImage src={task.assignee.image} alt={task.assignee.name ?? ""} />
            )}
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        )}

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <DotsThreeVertical className="h-4 w-4" weight="regular" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <PencilSimple className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task.id)}>
              <Trash className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

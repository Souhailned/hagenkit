"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Calendar, Flag } from "lucide-react";
import type { TaskDetail } from "@/types/task";
import { getTaskTagConfig, getTaskPriorityConfig } from "@/types/task";
import { formatTaskDate } from "./task-helpers";

interface TaskRowBaseProps {
  task: TaskDetail;
  onToggleStatus: (taskId: string, newStatus: "TODO" | "DONE") => void;
  onEdit: (task: TaskDetail) => void;
  onDelete: (taskId: string) => void;
  showProject?: boolean;
  visibleProperties?: string[];
  className?: string;
}

const DEFAULT_VISIBLE_PROPERTIES = ["title", "status", "assignee", "dueDate"];

export function TaskRowBase({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  showProject = true,
  visibleProperties = DEFAULT_VISIBLE_PROPERTIES,
  className,
}: TaskRowBaseProps) {
  const isDone = task.status === "DONE";
  const tagConfig = getTaskTagConfig(task.tag);
  const priorityConfig = getTaskPriorityConfig(task.priority);
  const showProp = (prop: string) => visibleProperties.includes(prop);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-accent/50 cursor-pointer",
        isDone && "opacity-60",
        className
      )}
      onClick={() => onEdit(task)}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isDone}
        onCheckedChange={(checked) => {
          onToggleStatus(task.id, checked ? "DONE" : "TODO");
        }}
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Task name */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {task.name}
        </p>
      </div>

      {/* Project badge */}
      {showProject && (
        <Badge variant="secondary" className="shrink-0 text-xs hidden sm:flex">
          {task.project.name}
        </Badge>
      )}

      {/* Due date */}
      {showProp("dueDate") && task.endDate && (
        <span className="shrink-0 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatTaskDate(task.endDate)}
        </span>
      )}

      {/* Priority */}
      {showProp("status") && task.priority && task.priority !== "NO_PRIORITY" && (
        <span
          className={cn(
            "shrink-0 hidden lg:flex items-center gap-1 text-xs",
            priorityConfig.color
          )}
        >
          <Flag className="h-3 w-3" />
        </span>
      )}

      {/* Tag */}
      {showProp("status") && tagConfig && (
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 hidden lg:flex text-xs",
            tagConfig.color,
            tagConfig.bg
          )}
        >
          {tagConfig.label}
        </Badge>
      )}

      {/* Assignee */}
      {showProp("assignee") && task.assignee && (
        <Avatar className="h-6 w-6 shrink-0">
          <AvatarImage src={task.assignee.image || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(task.assignee.name)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "shrink-0 h-6 w-6 rounded flex items-center justify-center",
              "text-muted-foreground hover:text-foreground hover:bg-accent",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
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
    </div>
  );
}

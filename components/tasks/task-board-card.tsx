"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Calendar,
  Folder,
  Tag,
  ChevronDown,
} from "lucide-react";
import type { TaskDetail } from "@/types/task";
import { getTaskTagConfig } from "@/types/task";
import { formatTaskDate } from "./task-helpers";

interface TaskBoardCardProps {
  task: TaskDetail;
  onToggleStatus: (taskId: string, newStatus: "TODO" | "DONE") => void;
  onEdit: (task: TaskDetail) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
  visibleProperties?: string[];
}

const DEFAULT_VISIBLE_PROPERTIES = ["title", "status", "assignee", "dueDate"];

export function TaskBoardCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isDragging,
  visibleProperties = DEFAULT_VISIBLE_PROPERTIES,
}: TaskBoardCardProps) {
  const isDone = task.status === "DONE";
  const showProperty = (prop: string) => visibleProperties.includes(prop);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const tagConfig = getTaskTagConfig(task.tag);

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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative rounded-2xl border border-border bg-card p-4",
        "hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing",
        isDone && "opacity-70",
        isDragging && "ring-2 ring-primary shadow-lg scale-[0.98]"
      )}
    >
      {/* Top row: Project badge + Avatar */}
      <div className="flex items-center justify-between">
        <span className="text-xs max-w-[160px] truncate text-muted-foreground">
          {task.project.name}
        </span>
        <div className="flex items-center gap-1">
          {/* More menu - visible on hover */}
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

          {/* Avatar - only show if assignee property is visible */}
          {showProperty("assignee") && task.assignee && (
            <Avatar className="size-6 border border-border">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-[10px] bg-muted">
                {getInitials(task.assignee.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Middle row: Checkbox + Title */}
      <div className="flex items-start gap-3 mt-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={(checked) => {
            onToggleStatus(task.id, checked ? "DONE" : "TODO");
          }}
          className="task-checkbox rounded-full border-border mt-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
        <p
          className={cn(
            "text-sm font-medium leading-5 flex-1 min-w-0 line-clamp-2",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {task.name}
        </p>
      </div>

      {/* Bottom row: Metadata chips - only show if status property is visible */}
      {(showProperty("status") || showProperty("dueDate")) && (
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {/* Project chip - always show for context */}
          <div className="bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1">
            <Folder className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
              {task.project.name}
            </span>
          </div>

          {/* Date chip - only if dueDate property is visible */}
          {showProperty("dueDate") && task.endDate && (
            <div className="bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatTaskDate(task.endDate)}
              </span>
            </div>
          )}

          {/* Tag dropdown - only if status property is visible */}
          {showProperty("status") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="bg-background border border-border rounded-md px-2 py-1 flex items-center gap-1 text-xs text-muted-foreground hover:bg-accent transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tag className="h-3 w-3" />
                  <span>{tagConfig?.label || "Task"}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Change tag...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

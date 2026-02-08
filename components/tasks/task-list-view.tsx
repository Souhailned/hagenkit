"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { FolderSimple, ChartBar, Plus } from "@phosphor-icons/react/dist/ssr";
import type { TaskDetail, TaskGroup } from "@/types/task";
import type { TaskViewMode } from "@/lib/view-options";
import { TaskRowBase } from "./task-row-base";
import { getCompletionPercentage } from "./task-helpers";
import { ProgressCircle } from "@/components/dashboard/progress-circle";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface TaskListViewProps {
  groups: TaskGroup[];
  tasksMode?: TaskViewMode;
  visibleProperties?: string[];
  onToggleStatus: (taskId: string, newStatus: "TODO" | "DONE") => void;
  onEdit: (task: TaskDetail) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (projectId?: string) => void;
}

interface ProjectGroupProps {
  group: TaskGroup;
  visibleProperties?: string[];
  onToggleStatus: (taskId: string, newStatus: "TODO" | "DONE") => void;
  onEdit: (task: TaskDetail) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (projectId: string) => void;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getProjectStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "in_progress":
      return "In Progress";
    case "planned":
      return "Planned";
    case "backlog":
      return "Backlog";
    case "completed":
    case "done":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return capitalize(status);
  }
}

function ProjectGroup({
  group,
  visibleProperties,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddTask,
}: ProjectGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const completionPercent = getCompletionPercentage(
    group.stats.total,
    group.stats.completed
  );

  return (
    <section className="max-w-6xl mx-auto rounded-3xl border border-border bg-muted shadow-[var(--shadow-workstream)] p-3 space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <header className="flex items-center justify-between gap-4 px-0 py-1 cursor-pointer">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
              <FolderSimple className="h-5 w-5" weight="regular" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-sm font-semibold leading-tight">{group.project.name}</span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ChartBar className="h-3 w-3" weight="regular" />
                  <span className="font-medium">{capitalize(group.project.priority)}</span>
                </span>
                <div className="h-4 w-px bg-border/70 hidden sm:inline" />
                <span className="rounded-full bg-muted px-2 py-0.5 font-medium hidden sm:inline">
                  {getProjectStatusLabel(group.project.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium">
                {group.stats.completed}/{group.stats.total}
              </span>
              <ProgressCircle progress={completionPercent} color="var(--chart-2)" size={18} />
              <div className="h-4 w-px bg-border/80" />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 rounded-full text-muted-foreground hover:bg-transparent"
                aria-label="Add task"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTask(group.project.id);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </header>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-1 px-2 py-3 bg-background rounded-2xl border border-border">
            <SortableContext items={group.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {group.tasks.map((task) => (
                <TaskRowBase
                  key={task.id}
                  task={task}
                  onToggleStatus={onToggleStatus}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showProject={false}
                  visibleProperties={visibleProperties}
                />
              ))}
            </SortableContext>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

export function TaskListView({
  groups,
  tasksMode = "collapsed",
  visibleProperties,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddTask,
}: TaskListViewProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No tasks yet</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => onAddTask()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add your first task
        </Button>
      </div>
    );
  }

  // Flat mode: show all tasks in a single list without group headers
  if (tasksMode === "flat") {
    const allTasks = groups.flatMap((g) => g.tasks);
    return (
      <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-muted shadow-[var(--shadow-workstream)] p-3">
        <div className="space-y-1 px-2 py-3 bg-background rounded-2xl border border-border">
          <SortableContext items={allTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {allTasks.map((task) => (
              <TaskRowBase
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
                onDelete={onDelete}
                showProject={true}
                visibleProperties={visibleProperties}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    );
  }

  // Indented mode: show tasks with hierarchy indentation (simulated with project context)
  if (tasksMode === "indented") {
    return (
      <div className="space-y-4">
        {groups.map((group) => (
          <section key={group.project.id} className="max-w-6xl mx-auto">
            {/* Project header (not collapsible) */}
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground">
              <FolderSimple className="h-4 w-4" weight="regular" />
              <span>{group.project.name}</span>
              <span className="text-xs">({group.stats.completed}/{group.stats.total})</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 rounded-full text-muted-foreground hover:bg-transparent ml-auto"
                aria-label="Add task"
                onClick={() => onAddTask(group.project.id)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* Indented tasks */}
            <div className="space-y-1 ml-6 pl-3 border-l border-border/50">
              <SortableContext items={group.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                {group.tasks.map((task) => (
                  <TaskRowBase
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    showProject={false}
                    visibleProperties={visibleProperties}
                  />
                ))}
              </SortableContext>
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Collapsed mode (default): show groups with collapsible headers
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <ProjectGroup
          key={group.project.id}
          group={group}
          visibleProperties={visibleProperties}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
}

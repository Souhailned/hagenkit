/**
 * Types for My Tasks page
 */

import type {
  PMTaskPriority,
  PMTaskTag,
  PMTaskStatus,
} from "@/lib/validations/task";

// Re-export ViewOptions from the canonical source
export type {
  ViewOptions,
  ViewType,
  TaskViewMode,
  Ordering,
  GroupBy,
} from "@/lib/view-options";
export { DEFAULT_VIEW_OPTIONS } from "@/lib/view-options";

// ============================================
// TASK DETAIL (with project and assignee)
// ============================================

export interface TaskProject {
  id: string;
  name: string;
  status: string;
  priority: string;
}

export interface TaskAssignee {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface TaskDetail {
  id: string;
  projectId: string;
  project: TaskProject;
  name: string;
  description: string | null;
  status: PMTaskStatus;
  priority: PMTaskPriority | null;
  tag: PMTaskTag | null;
  startDate: Date | null;
  endDate: Date | null;
  order: number;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TASK GROUPS (grouped by project)
// ============================================

export interface TaskGroup {
  project: TaskProject;
  tasks: TaskDetail[];
  stats: {
    total: number;
    completed: number;
  };
}

// ============================================
// FILTER/VIEW TYPES
// ============================================

// FilterChip for filter popover (different from view-options FilterChip)
export interface FilterChip {
  type: "status" | "priority" | "tag" | "assignee";
  value: string;
  label: string;
}

export type ViewMode = "list" | "board";

export type SortOrder = "manual" | "date" | "alpha" | "priority";

// Legacy interface for task-week-board-view compatibility
export interface LegacyViewOptions {
  mode: ViewMode;
  groupBy: "none" | "status" | "assignee" | "tags" | "project";
  sortOrder: SortOrder;
  showCompleted: boolean;
  showWeekends: boolean;
}

// ============================================
// FILTER COUNTS (for filter popover)
// ============================================

export interface FilterCounts {
  status?: Record<string, number>;
  priority?: Record<string, number>;
  tags?: Record<string, number>;
  members?: Record<string, number>;
}

// ============================================
// WEEK BOARD TYPES
// ============================================

export interface DayColumn {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  tasks: TaskDetail[];
}

export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayColumn[];
  weekNumber: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get display label for task status
 */
export function getTaskStatusLabel(status: PMTaskStatus): string {
  const labels: Record<PMTaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  };
  return labels[status];
}

/**
 * Get display label for task priority
 */
export function getTaskPriorityLabel(priority: PMTaskPriority | null): string {
  if (!priority) return "No Priority";
  const labels: Record<PMTaskPriority, string> = {
    NO_PRIORITY: "No Priority",
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };
  return labels[priority];
}

/**
 * Get display label for task tag
 */
export function getTaskTagLabel(tag: PMTaskTag | null): string {
  if (!tag) return "";
  const labels: Record<PMTaskTag, string> = {
    FEATURE: "Feature",
    BUG: "Bug",
    INTERNAL: "Internal",
  };
  return labels[tag];
}

/**
 * Get task status styling config
 */
export function getTaskStatusConfig(status: PMTaskStatus) {
  const configs: Record<
    PMTaskStatus,
    { label: string; dot: string; bg: string; text: string }
  > = {
    TODO: {
      label: "To Do",
      dot: "bg-zinc-400",
      bg: "bg-zinc-100",
      text: "text-zinc-700",
    },
    IN_PROGRESS: {
      label: "In Progress",
      dot: "bg-blue-500",
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    DONE: {
      label: "Done",
      dot: "bg-green-500",
      bg: "bg-green-100",
      text: "text-green-700",
    },
  };
  return configs[status];
}

/**
 * Get task priority styling config
 */
export function getTaskPriorityConfig(priority: PMTaskPriority | null) {
  const configs: Record<
    PMTaskPriority,
    { label: string; color: string; bg: string }
  > = {
    NO_PRIORITY: { label: "No Priority", color: "text-muted-foreground", bg: "bg-muted" },
    LOW: { label: "Low", color: "text-slate-600", bg: "bg-slate-100" },
    MEDIUM: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
    HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
    URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-100" },
  };
  return configs[priority ?? "NO_PRIORITY"];
}

/**
 * Get task tag styling config
 */
export function getTaskTagConfig(tag: PMTaskTag | null) {
  if (!tag) return null;
  const configs: Record<PMTaskTag, { label: string; color: string; bg: string }> = {
    FEATURE: { label: "Feature", color: "text-purple-600", bg: "bg-purple-100" },
    BUG: { label: "Bug", color: "text-red-600", bg: "bg-red-100" },
    INTERNAL: { label: "Internal", color: "text-gray-600", bg: "bg-gray-100" },
  };
  return configs[tag];
}

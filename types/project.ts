/**
 * Types for Project Management
 */

import type {
  PMProjectStatus,
  PMPriority,
  PMDeadlineType,
  PMProjectIntent,
  PMSuccessType,
  PMWorkStructure,
  PMProjectRole,
  PMAccessLevel,
  PMTaskStatus,
  PMScopeType,
  PMFeaturePriority,
  PMFileType,
} from "@/lib/validations/project";

// ============================================
// CORE PROJECT TYPES
// ============================================

export interface ProjectMember {
  id: string;
  userId: string;
  role: PMProjectRole;
  access: PMAccessLevel;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string | null;
  status: PMTaskStatus;
  startDate: Date | null;
  endDate: Date | null;
  order: number;
  assigneeId: string | null;
  workstreamId: string | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  dueDate: Date | null;
  completed: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMetric {
  id: string;
  name: string;
  target: string | null;
  current: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectScopeItem {
  id: string;
  type: PMScopeType;
  content: string;
  order: number;
  createdAt: Date;
}

export interface ProjectFeature {
  id: string;
  priority: PMFeaturePriority;
  content: string;
  order: number;
  createdAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: PMFileType;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ProjectTag {
  id: string;
  name: string;
  color: string | null;
}

// ============================================
// PROJECT LIST ITEM (for cards/list views)
// ============================================

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  status: PMProjectStatus;
  priority: PMPriority;
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  typeLabel: string | null;
  clientName: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Counts
  _count: {
    tasks: number;
    members: number;
  };
  // Computed task stats
  taskStats?: {
    total: number;
    completed: number;
  };
  // Tags (simplified)
  tags: ProjectTag[];
  // Members (simplified for avatars)
  members: {
    id: string;
    role: PMProjectRole;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }[];
}

// ============================================
// WORKSTREAM & NOTE TYPES
// ============================================

export interface ProjectWorkstream {
  id: string;
  name: string;
  order: number;
  tasks: ProjectTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectNote {
  id: string;
  title: string;
  content: string | null;
  noteType: "GENERAL" | "MEETING" | "AUDIO";
  status: "COMPLETED" | "PROCESSING";
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

// ============================================
// PROJECT DETAIL (full project data)
// ============================================

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: PMProjectStatus;
  priority: PMPriority;
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  estimate: string | null;
  deadlineType: PMDeadlineType;
  intent: PMProjectIntent | null;
  successType: PMSuccessType;
  structure: PMWorkStructure | null;
  typeLabel: string | null;
  groupLabel: string | null;
  label: string | null;
  clientName: string | null;
  location: string | null;
  sprints: string | null;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Creator
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  // Relations
  members: ProjectMember[];
  tasks: ProjectTask[];
  deliverables: ProjectDeliverable[];
  metrics: ProjectMetric[];
  scopeItems: ProjectScopeItem[];
  features: ProjectFeature[];
  files: ProjectFile[];
  tags: ProjectTag[];
  workstreams: ProjectWorkstream[];
  notes: ProjectNote[];
}

// ============================================
// PAGINATED RESPONSE
// ============================================

export interface PaginatedProjects {
  items: ProjectListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// ============================================
// FILTER/SORT TYPES
// ============================================

export interface ProjectFilters {
  status?: PMProjectStatus;
  priority?: PMPriority;
  search?: string;
  includeCompleted?: boolean;
}

export interface ProjectSort {
  sortBy: "name" | "createdAt" | "updatedAt" | "startDate" | "endDate" | "priority" | "status";
  sortOrder: "asc" | "desc";
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get display label for project status
 */
export function getStatusLabel(status: PMProjectStatus): string {
  const labels: Record<PMProjectStatus, string> = {
    ACTIVE: "Active",
    PLANNED: "Planned",
    BACKLOG: "Backlog",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status];
}

/**
 * Get display label for priority
 */
export function getPriorityLabel(priority: PMPriority): string {
  const labels: Record<PMPriority, string> = {
    URGENT: "Urgent",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };
  return labels[priority];
}

/**
 * Get status styling config
 */
export function getStatusConfig(status: PMProjectStatus) {
  const configs: Record<PMProjectStatus, { label: string; dot: string; pill: string }> = {
    ACTIVE: {
      label: "Active",
      dot: "bg-teal-600",
      pill: "text-teal-700 border-teal-200 bg-teal-50",
    },
    PLANNED: {
      label: "Planned",
      dot: "bg-zinc-900",
      pill: "text-zinc-900 border-zinc-200 bg-zinc-50",
    },
    BACKLOG: {
      label: "Backlog",
      dot: "bg-orange-600",
      pill: "text-orange-700 border-orange-200 bg-orange-50",
    },
    COMPLETED: {
      label: "Completed",
      dot: "bg-blue-600",
      pill: "text-blue-700 border-blue-200 bg-blue-50",
    },
    CANCELLED: {
      label: "Cancelled",
      dot: "bg-rose-600",
      pill: "text-rose-700 border-rose-200 bg-rose-50",
    },
  };
  return configs[status];
}

/**
 * Get priority styling config
 */
export function getPriorityConfig(priority: PMPriority) {
  const configs: Record<PMPriority, { label: string; color: string }> = {
    URGENT: { label: "Urgent", color: "text-red-600" },
    HIGH: { label: "High", color: "text-orange-600" },
    MEDIUM: { label: "Medium", color: "text-yellow-600" },
    LOW: { label: "Low", color: "text-gray-500" },
  };
  return configs[priority];
}

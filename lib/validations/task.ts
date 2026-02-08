import { z } from "zod";

// ============================================
// TASK-SPECIFIC ENUMS
// ============================================

export const pmTaskPriorityEnum = z.enum([
  "NO_PRIORITY",
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const pmTaskTagEnum = z.enum(["FEATURE", "BUG", "INTERNAL"]);

export const pmTaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

// ============================================
// MY TASKS SCHEMAS
// ============================================

/**
 * Schema for creating a task from the My Tasks view
 */
export const createMyTaskSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  name: z.string().min(1, "Task name is required").max(500, "Name is too long"),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().optional(),
  status: pmTaskStatusEnum.default("TODO"),
  priority: pmTaskPriorityEnum.optional(),
  tag: pmTaskTagEnum.optional(),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
});

/**
 * Schema for updating a task
 */
export const updateMyTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  projectId: z.string().min(1).optional(),
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional().or(z.null()),
  assigneeId: z.string().optional().or(z.null()),
  status: pmTaskStatusEnum.optional(),
  priority: pmTaskPriorityEnum.optional().or(z.null()),
  tag: pmTaskTagEnum.optional().or(z.null()),
  startDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  endDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  order: z.number().int().min(0).optional(),
});

/**
 * Schema for deleting a task
 */
export const deleteMyTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});

/**
 * Schema for toggling task status
 */
export const toggleTaskStatusSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  status: pmTaskStatusEnum,
});

/**
 * Schema for moving a task to a different date
 */
export const moveTaskDateSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  endDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
});

/**
 * Schema for batch reordering tasks
 */
export const reorderTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
      endDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
    })
  ),
});

/**
 * Schema for filtering tasks
 */
export const taskFiltersSchema = z.object({
  status: z.array(pmTaskStatusEnum).optional(),
  priority: z.array(pmTaskPriorityEnum).optional(),
  tag: z.array(pmTaskTagEnum).optional(),
  assigneeId: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

/**
 * Schema for listing my tasks
 */
export const listMyTasksSchema = z.object({
  filters: taskFiltersSchema.optional(),
  includeCompleted: z.boolean().default(false),
});

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type PMTaskPriority = z.infer<typeof pmTaskPriorityEnum>;
export type PMTaskTag = z.infer<typeof pmTaskTagEnum>;
export type PMTaskStatus = z.infer<typeof pmTaskStatusEnum>;

export type CreateMyTaskInput = z.infer<typeof createMyTaskSchema>;
export type UpdateMyTaskInput = z.infer<typeof updateMyTaskSchema>;
export type DeleteMyTaskInput = z.infer<typeof deleteMyTaskSchema>;
export type ToggleTaskStatusInput = z.infer<typeof toggleTaskStatusSchema>;
export type MoveTaskDateInput = z.infer<typeof moveTaskDateSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
export type ListMyTasksInput = z.infer<typeof listMyTasksSchema>;

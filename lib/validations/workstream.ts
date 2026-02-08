import { z } from "zod";

// ============================================
// WORKSTREAM SCHEMAS
// ============================================

export const createWorkstreamSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Workstream name is required").max(200, "Name is too long"),
});

export const updateWorkstreamSchema = z.object({
  id: z.string().min(1, "Workstream ID is required"),
  name: z.string().min(1, "Workstream name is required").max(200, "Name is too long"),
});

export const deleteWorkstreamSchema = z.object({
  id: z.string().min(1, "Workstream ID is required"),
});

export const reorderWorkstreamsSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  orderedIds: z.array(z.string().min(1)),
});

export const moveTaskToWorkstreamSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  workstreamId: z.string().min(1).nullable(),
  order: z.number().int().min(0).default(0),
});

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type CreateWorkstreamInput = z.infer<typeof createWorkstreamSchema>;
export type UpdateWorkstreamInput = z.infer<typeof updateWorkstreamSchema>;
export type DeleteWorkstreamInput = z.infer<typeof deleteWorkstreamSchema>;
export type ReorderWorkstreamsInput = z.infer<typeof reorderWorkstreamsSchema>;
export type MoveTaskToWorkstreamInput = z.infer<typeof moveTaskToWorkstreamSchema>;

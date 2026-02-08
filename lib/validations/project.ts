import { z } from "zod";

// ============================================
// ENUMS (matching Prisma enums)
// ============================================

export const pmProjectStatusEnum = z.enum([
  "ACTIVE",
  "PLANNED",
  "BACKLOG",
  "COMPLETED",
  "CANCELLED",
]);

export const pmPriorityEnum = z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]);

export const pmDeadlineTypeEnum = z.enum(["NONE", "TARGET", "FIXED"]);

export const pmProjectIntentEnum = z.enum(["DELIVERY", "EXPERIMENT", "INTERNAL"]);

export const pmSuccessTypeEnum = z.enum(["DELIVERABLE", "METRIC", "UNDEFINED"]);

export const pmWorkStructureEnum = z.enum(["LINEAR", "MILESTONES", "MULTISTREAM"]);

export const pmProjectRoleEnum = z.enum([
  "OWNER",
  "PIC",
  "CONTRIBUTOR",
  "STAKEHOLDER",
  "SUPPORT",
]);

export const pmAccessLevelEnum = z.enum(["FULL_ACCESS", "CAN_EDIT", "CAN_VIEW"]);

export const pmTaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const pmScopeTypeEnum = z.enum(["IN_SCOPE", "OUT_OF_SCOPE", "EXPECTED_OUTCOME"]);

export const pmFeaturePriorityEnum = z.enum(["P0", "P1", "P2"]);

export const pmFileTypeEnum = z.enum(["PDF", "ZIP", "FIGMA", "DOC", "IMAGE", "OTHER"]);

// ============================================
// PROJECT SCHEMAS
// ============================================

// Schema for creating a new project
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(200, "Name is too long"),
  description: z.string().max(10000, "Description is too long").optional(),
  status: pmProjectStatusEnum.default("BACKLOG"),
  priority: pmPriorityEnum.default("MEDIUM"),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  estimate: z.string().max(50).optional(),
  deadlineType: pmDeadlineTypeEnum.default("NONE"),
  intent: pmProjectIntentEnum.optional(),
  successType: pmSuccessTypeEnum.default("UNDEFINED"),
  structure: pmWorkStructureEnum.optional(),
  typeLabel: z.string().max(50).optional(),
  groupLabel: z.string().max(100).optional(),
  label: z.string().max(50).optional(),
  clientName: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  sprints: z.string().max(100).optional(),
});

// Schema for updating a project
export const updateProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  name: z
    .string()
    .min(1, "Project name is required")
    .max(200, "Name is too long")
    .optional(),
  description: z.string().max(10000, "Description is too long").optional(),
  status: pmProjectStatusEnum.optional(),
  priority: pmPriorityEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  endDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  estimate: z.string().max(50).optional(),
  deadlineType: pmDeadlineTypeEnum.optional(),
  intent: pmProjectIntentEnum.optional().or(z.null()),
  successType: pmSuccessTypeEnum.optional(),
  structure: pmWorkStructureEnum.optional().or(z.null()),
  typeLabel: z.string().max(50).optional(),
  groupLabel: z.string().max(100).optional(),
  label: z.string().max(50).optional(),
  clientName: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  sprints: z.string().max(100).optional(),
});

// Schema for deleting a project
export const deleteProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
});

// Schema for getting a project by ID
export const getProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
});

// ============================================
// PROJECT MEMBER SCHEMAS
// ============================================

export const addProjectMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  userId: z.string().min(1, "User ID is required"),
  role: pmProjectRoleEnum.default("CONTRIBUTOR"),
  access: pmAccessLevelEnum.default("CAN_EDIT"),
});

export const updateProjectMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  userId: z.string().min(1, "User ID is required"),
  role: pmProjectRoleEnum.optional(),
  access: pmAccessLevelEnum.optional(),
});

export const removeProjectMemberSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// ============================================
// PROJECT TASK SCHEMAS
// ============================================

export const createProjectTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Task name is required").max(500, "Name is too long"),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().optional(),
  workstreamId: z.string().optional().or(z.null()),
  status: pmTaskStatusEnum.default("TODO"),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
});

export const updateProjectTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().optional().or(z.null()),
  workstreamId: z.string().optional().or(z.null()),
  status: pmTaskStatusEnum.optional(),
  startDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  endDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  order: z.number().int().min(0).optional(),
});

export const deleteProjectTaskSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
});

// ============================================
// PROJECT DELIVERABLE SCHEMAS
// ============================================

export const createProjectDeliverableSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(500),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
});

export const updateProjectDeliverableSchema = z.object({
  id: z.string().min(1, "Deliverable ID is required"),
  title: z.string().min(1).max(500).optional(),
  dueDate: z.string().datetime().optional().or(z.literal("")).or(z.null()),
  completed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const deleteProjectDeliverableSchema = z.object({
  id: z.string().min(1, "Deliverable ID is required"),
});

// ============================================
// PROJECT SCOPE ITEM SCHEMAS
// ============================================

export const createProjectScopeItemSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  type: pmScopeTypeEnum,
  content: z.string().min(1, "Content is required").max(1000),
  order: z.number().int().min(0).default(0),
});

export const deleteProjectScopeItemSchema = z.object({
  id: z.string().min(1, "Scope item ID is required"),
});

// ============================================
// PROJECT FEATURE SCHEMAS
// ============================================

export const createProjectFeatureSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  priority: pmFeaturePriorityEnum,
  content: z.string().min(1, "Content is required").max(1000),
  order: z.number().int().min(0).default(0),
});

export const deleteProjectFeatureSchema = z.object({
  id: z.string().min(1, "Feature ID is required"),
});

// ============================================
// PROJECT TAG SCHEMAS
// ============================================

export const createProjectTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")
    .optional(),
});

export const assignProjectTagSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  tagId: z.string().min(1, "Tag ID is required"),
});

export const removeProjectTagSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  tagId: z.string().min(1, "Tag ID is required"),
});

// ============================================
// LIST/FILTER SCHEMAS
// ============================================

export const listProjectsSchema = z.object({
  status: pmProjectStatusEnum.optional(),
  priority: pmPriorityEnum.optional(),
  search: z.string().max(200).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["name", "createdAt", "updatedAt", "startDate", "endDate", "priority", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeCompleted: z.boolean().default(false),
});

// ============================================
// TYPESCRIPT TYPES
// ============================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;
export type GetProjectInput = z.infer<typeof getProjectSchema>;

export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type UpdateProjectMemberInput = z.infer<typeof updateProjectMemberSchema>;
export type RemoveProjectMemberInput = z.infer<typeof removeProjectMemberSchema>;

export type CreateProjectTaskInput = z.infer<typeof createProjectTaskSchema>;
export type UpdateProjectTaskInput = z.infer<typeof updateProjectTaskSchema>;
export type DeleteProjectTaskInput = z.infer<typeof deleteProjectTaskSchema>;

export type CreateProjectDeliverableInput = z.infer<typeof createProjectDeliverableSchema>;
export type UpdateProjectDeliverableInput = z.infer<typeof updateProjectDeliverableSchema>;
export type DeleteProjectDeliverableInput = z.infer<typeof deleteProjectDeliverableSchema>;

export type CreateProjectScopeItemInput = z.infer<typeof createProjectScopeItemSchema>;
export type DeleteProjectScopeItemInput = z.infer<typeof deleteProjectScopeItemSchema>;

export type CreateProjectFeatureInput = z.infer<typeof createProjectFeatureSchema>;
export type DeleteProjectFeatureInput = z.infer<typeof deleteProjectFeatureSchema>;

export type CreateProjectTagInput = z.infer<typeof createProjectTagSchema>;
export type AssignProjectTagInput = z.infer<typeof assignProjectTagSchema>;
export type RemoveProjectTagInput = z.infer<typeof removeProjectTagSchema>;

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

// ============================================
// ENUM TYPES
// ============================================

export type PMProjectStatus = z.infer<typeof pmProjectStatusEnum>;
export type PMPriority = z.infer<typeof pmPriorityEnum>;
export type PMDeadlineType = z.infer<typeof pmDeadlineTypeEnum>;
export type PMProjectIntent = z.infer<typeof pmProjectIntentEnum>;
export type PMSuccessType = z.infer<typeof pmSuccessTypeEnum>;
export type PMWorkStructure = z.infer<typeof pmWorkStructureEnum>;
export type PMProjectRole = z.infer<typeof pmProjectRoleEnum>;
export type PMAccessLevel = z.infer<typeof pmAccessLevelEnum>;
export type PMTaskStatus = z.infer<typeof pmTaskStatusEnum>;
export type PMScopeType = z.infer<typeof pmScopeTypeEnum>;
export type PMFeaturePriority = z.infer<typeof pmFeaturePriorityEnum>;
export type PMFileType = z.infer<typeof pmFileTypeEnum>;

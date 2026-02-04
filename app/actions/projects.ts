"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ActionResult } from "@/types/actions";
import type {
  ProjectListItem,
  ProjectDetail,
  PaginatedProjects,
} from "@/types/project";
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getProjectSchema,
  listProjectsSchema,
  addProjectMemberSchema,
  removeProjectMemberSchema,
  createProjectTaskSchema,
  updateProjectTaskSchema,
  deleteProjectTaskSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type DeleteProjectInput,
  type ListProjectsInput,
  type AddProjectMemberInput,
  type RemoveProjectMemberInput,
  type CreateProjectTaskInput,
  type UpdateProjectTaskInput,
  type DeleteProjectTaskInput,
} from "@/lib/validations/project";

// ============================================
// HELPER FUNCTIONS
// ============================================

type SessionContextResult =
  | { success: true; data: { userId: string; workspaceId: string; workspaceRole: string } }
  | { success: false; error: string };

/**
 * Get current user's session and active workspace
 */
async function getSessionContext(): Promise<SessionContextResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "No active session" };
    }

    // Get user's active workspace or first workspace
    const member = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    });

    if (!member) {
      return { success: false, error: "User has no workspace membership" };
    }

    return {
      success: true,
      data: {
        userId: session.user.id,
        workspaceId: member.workspace.id,
        workspaceRole: member.role,
      },
    };
  } catch (error) {
    console.error("getSessionContext error:", error);
    return { success: false, error: "Session context error" };
  }
}

/**
 * Check if user has permission to modify a project
 */
async function canModifyProject(
  userId: string,
  projectId: string
): Promise<{ allowed: boolean; isOwner: boolean }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      createdById: true,
      members: {
        where: { userId },
        select: { role: true, access: true },
      },
    },
  });

  if (!project) {
    return { allowed: false, isOwner: false };
  }

  const isCreator = project.createdById === userId;
  const membership = project.members[0];

  // Creator always has access
  if (isCreator) {
    return { allowed: true, isOwner: true };
  }

  // Check member role
  if (membership) {
    const canEdit =
      membership.access === "FULL_ACCESS" || membership.access === "CAN_EDIT";
    const isOwnerOrPIC =
      membership.role === "OWNER" || membership.role === "PIC";
    return { allowed: canEdit || isOwnerOrPIC, isOwner: isOwnerOrPIC };
  }

  return { allowed: false, isOwner: false };
}

// ============================================
// PROJECT CRUD OPERATIONS
// ============================================

/**
 * Create a new project
 */
export async function createProject(
  input: CreateProjectInput
): Promise<ActionResult<ProjectDetail>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    // Validate input
    const validatedData = createProjectSchema.parse(input);

    // Create project with creator as OWNER member
    const project = await prisma.project.create({
      data: {
        workspaceId: ctx.workspaceId,
        createdById: ctx.userId,
        name: validatedData.name,
        description: validatedData.description || null,
        status: validatedData.status,
        priority: validatedData.priority,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        estimate: validatedData.estimate || null,
        deadlineType: validatedData.deadlineType,
        intent: validatedData.intent || null,
        successType: validatedData.successType,
        structure: validatedData.structure || null,
        typeLabel: validatedData.typeLabel || null,
        groupLabel: validatedData.groupLabel || null,
        label: validatedData.label || null,
        clientName: validatedData.clientName || null,
        location: validatedData.location || null,
        sprints: validatedData.sprints || null,
        // Add creator as OWNER member
        members: {
          create: {
            userId: ctx.userId,
            role: "OWNER",
            access: "FULL_ACCESS",
          },
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        deliverables: true,
        metrics: true,
        scopeItems: true,
        features: true,
        files: {
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    // Transform to response type
    const result: ProjectDetail = {
      ...project,
      tags: project.tags.map((t) => t.tag),
    };

    revalidatePath("/dashboard/projects");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating project:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to create project" };
  }
}

/**
 * Update a project
 */
export async function updateProject(
  input: UpdateProjectInput
): Promise<ActionResult<ProjectDetail>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    // Validate input
    const validatedData = updateProjectSchema.parse(input);

    // Check permission
    const { allowed } = await canModifyProject(ctx.userId, validatedData.id);
    if (!allowed) {
      return { success: false, error: "Permission denied" };
    }

    // Build update data
    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
    if (validatedData.progress !== undefined) updateData.progress = validatedData.progress;
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }
    if (validatedData.estimate !== undefined) updateData.estimate = validatedData.estimate || null;
    if (validatedData.deadlineType !== undefined) updateData.deadlineType = validatedData.deadlineType;
    if (validatedData.intent !== undefined) updateData.intent = validatedData.intent || null;
    if (validatedData.successType !== undefined) updateData.successType = validatedData.successType;
    if (validatedData.structure !== undefined) updateData.structure = validatedData.structure || null;
    if (validatedData.typeLabel !== undefined) updateData.typeLabel = validatedData.typeLabel || null;
    if (validatedData.groupLabel !== undefined) updateData.groupLabel = validatedData.groupLabel || null;
    if (validatedData.label !== undefined) updateData.label = validatedData.label || null;
    if (validatedData.clientName !== undefined) updateData.clientName = validatedData.clientName || null;
    if (validatedData.location !== undefined) updateData.location = validatedData.location || null;
    if (validatedData.sprints !== undefined) updateData.sprints = validatedData.sprints || null;

    const project = await prisma.project.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        deliverables: true,
        metrics: true,
        scopeItems: true,
        features: true,
        files: {
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    const result: ProjectDetail = {
      ...project,
      tags: project.tags.map((t) => t.tag),
    };

    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${validatedData.id}`);

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error updating project:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to update project" };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(
  input: DeleteProjectInput
): Promise<ActionResult<void>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    // Validate input
    const validatedData = deleteProjectSchema.parse(input);

    // Check permission (only owner can delete)
    const { isOwner } = await canModifyProject(ctx.userId, validatedData.id);
    if (!isOwner) {
      return { success: false, error: "Only project owner can delete" };
    }

    await prisma.project.delete({
      where: { id: validatedData.id },
    });

    revalidatePath("/dashboard/projects");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting project:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to delete project" };
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(
  id: string
): Promise<ActionResult<ProjectDetail>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    // Validate
    const validatedData = getProjectSchema.parse({ id });

    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.id,
        workspaceId: ctx.workspaceId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { order: "asc" },
        },
        deliverables: {
          orderBy: { order: "asc" },
        },
        metrics: {
          orderBy: { createdAt: "asc" },
        },
        scopeItems: {
          orderBy: [{ type: "asc" }, { order: "asc" }],
        },
        features: {
          orderBy: [{ priority: "asc" }, { order: "asc" }],
        },
        files: {
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { uploadedAt: "desc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    const result: ProjectDetail = {
      ...project,
      tags: project.tags.map((t) => t.tag),
    };

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error getting project:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to load project" };
  }
}

/**
 * List projects with pagination and filters
 */
export async function listProjects(
  input?: Partial<ListProjectsInput>
): Promise<ActionResult<PaginatedProjects>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    // Validate and apply defaults
    const validatedData = listProjectsSchema.parse(input || {});

    // Build where clause
    const where: any = {
      workspaceId: ctx.workspaceId,
    };

    // Status filter
    if (validatedData.status) {
      where.status = validatedData.status;
    } else if (!validatedData.includeCompleted) {
      where.status = { notIn: ["COMPLETED", "CANCELLED"] };
    }

    // Priority filter
    if (validatedData.priority) {
      where.priority = validatedData.priority;
    }

    // Search filter
    if (validatedData.search) {
      where.OR = [
        { name: { contains: validatedData.search, mode: "insensitive" } },
        { clientName: { contains: validatedData.search, mode: "insensitive" } },
        { description: { contains: validatedData.search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.project.count({ where });

    // Get paginated results
    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true, members: true },
        },
        tasks: {
          select: { status: true },
        },
        tags: {
          include: { tag: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          take: 5, // Limit for avatar display
          orderBy: { joinedAt: "asc" },
        },
      },
      orderBy: { [validatedData.sortBy]: validatedData.sortOrder },
      skip: (validatedData.page - 1) * validatedData.pageSize,
      take: validatedData.pageSize,
    });

    // Transform results
    const items: ProjectListItem[] = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      startDate: p.startDate,
      endDate: p.endDate,
      typeLabel: p.typeLabel,
      clientName: p.clientName,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      _count: p._count,
      taskStats: {
        total: p.tasks.length,
        completed: p.tasks.filter((t) => t.status === "DONE").length,
      },
      tags: p.tags.map((t) => t.tag),
      members: p.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
    }));

    const pageCount = Math.ceil(total / validatedData.pageSize);

    return {
      success: true,
      data: {
        items,
        total,
        page: validatedData.page,
        pageSize: validatedData.pageSize,
        pageCount,
      },
    };
  } catch (error: any) {
    console.error("Error listing projects:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    // Return more specific error message for debugging
    const errorMessage = error?.message || error?.code || "Unknown error";
    return { success: false, error: `Failed to load projects: ${errorMessage}` };
  }
}

// ============================================
// PROJECT TASK OPERATIONS
// ============================================

/**
 * Create a task in a project
 */
export async function createProjectTask(
  input: CreateProjectTaskInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    const validatedData = createProjectTaskSchema.parse(input);

    // Check permission
    const { allowed } = await canModifyProject(ctx.userId, validatedData.projectId);
    if (!allowed) {
      return { success: false, error: "Permission denied" };
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: validatedData.projectId,
        name: validatedData.name,
        description: validatedData.description || null,
        assigneeId: validatedData.assigneeId || null,
        status: validatedData.status,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        order: validatedData.order,
      },
    });

    revalidatePath(`/dashboard/projects/${validatedData.projectId}`);

    return { success: true, data: { id: task.id } };
  } catch (error: any) {
    console.error("Error creating task:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to create task" };
  }
}

/**
 * Update a task
 */
export async function updateProjectTask(
  input: UpdateProjectTaskInput
): Promise<ActionResult<void>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    const validatedData = updateProjectTaskSchema.parse(input);

    // Get task to check project permission
    const task = await prisma.projectTask.findUnique({
      where: { id: validatedData.id },
      select: { projectId: true },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const { allowed } = await canModifyProject(ctx.userId, task.projectId);
    if (!allowed) {
      return { success: false, error: "Permission denied" };
    }

    // Build update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description || null;
    if (validatedData.assigneeId !== undefined) updateData.assigneeId = validatedData.assigneeId || null;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }
    if (validatedData.order !== undefined) updateData.order = validatedData.order;

    await prisma.projectTask.update({
      where: { id: validatedData.id },
      data: updateData,
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating task:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to update task" };
  }
}

/**
 * Delete a task
 */
export async function deleteProjectTask(
  input: DeleteProjectTaskInput
): Promise<ActionResult<void>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    const validatedData = deleteProjectTaskSchema.parse(input);

    // Get task to check project permission
    const task = await prisma.projectTask.findUnique({
      where: { id: validatedData.id },
      select: { projectId: true },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    const { allowed } = await canModifyProject(ctx.userId, task.projectId);
    if (!allowed) {
      return { success: false, error: "Permission denied" };
    }

    await prisma.projectTask.delete({
      where: { id: validatedData.id },
    });

    revalidatePath(`/dashboard/projects/${task.projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting task:", error);

    return { success: false, error: "Failed to delete task" };
  }
}

// ============================================
// PROJECT MEMBER OPERATIONS
// ============================================

/**
 * Add a member to a project
 */
export async function addProjectMember(
  input: AddProjectMemberInput
): Promise<ActionResult<void>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    const validatedData = addProjectMemberSchema.parse(input);

    // Check permission (only owner/PIC can add members)
    const { isOwner } = await canModifyProject(ctx.userId, validatedData.projectId);
    if (!isOwner) {
      return { success: false, error: "Only project owner can add members" };
    }

    // Check if user exists in workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: validatedData.userId,
        workspace: {
          projects: {
            some: { id: validatedData.projectId },
          },
        },
      },
    });

    if (!workspaceMember) {
      return { success: false, error: "User not found in workspace" };
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: validatedData.projectId,
          userId: validatedData.userId,
        },
      },
    });

    if (existingMember) {
      return { success: false, error: "User is already a project member" };
    }

    await prisma.projectMember.create({
      data: {
        projectId: validatedData.projectId,
        userId: validatedData.userId,
        role: validatedData.role,
        access: validatedData.access,
      },
    });

    revalidatePath(`/dashboard/projects/${validatedData.projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error adding project member:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: error.errors[0]?.message ?? "Validation failed",
      };
    }

    return { success: false, error: "Failed to add member" };
  }
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(
  input: RemoveProjectMemberInput
): Promise<ActionResult<void>> {
  try {
    const ctxResult = await getSessionContext();
    if (!ctxResult.success) {
      return { success: false, error: ctxResult.error };
    }
    const ctx = ctxResult.data;

    const validatedData = removeProjectMemberSchema.parse(input);

    // Check permission
    const { isOwner } = await canModifyProject(ctx.userId, validatedData.projectId);
    if (!isOwner) {
      return { success: false, error: "Only project owner can remove members" };
    }

    // Prevent removing the only owner
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      select: { createdById: true },
    });

    if (project?.createdById === validatedData.userId) {
      return { success: false, error: "Cannot remove the project creator" };
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: validatedData.projectId,
          userId: validatedData.userId,
        },
      },
    });

    revalidatePath(`/dashboard/projects/${validatedData.projectId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error removing project member:", error);

    return { success: false, error: "Failed to remove member" };
  }
}

// ============================================
// QUICK ACTIONS
// ============================================

/**
 * Update project status quickly
 */
export async function updateProjectStatus(
  projectId: string,
  status: "ACTIVE" | "PLANNED" | "BACKLOG" | "COMPLETED" | "CANCELLED"
): Promise<ActionResult<void>> {
  const result = await updateProject({ id: projectId, status });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true };
}

/**
 * Update project progress
 */
export async function updateProjectProgress(
  projectId: string,
  progress: number
): Promise<ActionResult<void>> {
  const result = await updateProject({ id: projectId, progress: Math.min(100, Math.max(0, progress)) });
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true };
}

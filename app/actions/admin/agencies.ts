"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";
import type { AdminAgency, AdminAgencyDetail, AgencyPlan } from "@/types/admin";
import { z } from "zod";

// Validation schemas for agency admin operations
const updateAgencyPlanSchema = z.object({
  id: z.string().min(1, "Agency ID is required"),
  plan: z.enum(["FREE", "PRO", "ENTERPRISE"]),
});

const updateAgencyVerifiedSchema = z.object({
  id: z.string().min(1, "Agency ID is required"),
  verified: z.boolean(),
});

export type UpdateAgencyPlanInput = z.infer<typeof updateAgencyPlanSchema>;
export type UpdateAgencyVerifiedInput = z.infer<typeof updateAgencyVerifiedSchema>;

// Helper to check if user is admin
async function checkAdmin(): Promise<ActionResult<boolean>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized - Not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    return { success: true, data: true };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { success: false, error: "Failed to verify permissions" };
  }
}

/**
 * Get paginated agencies with search, sort, and filters
 * Currently uses Workspace model - will be updated when Agency model is added
 */
export async function getAgencies(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  verified?: string;
  plan?: string;
}): Promise<ActionResult<{ agencies: AdminAgency[]; total: number; pageCount: number }>> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.workspace.count({ where });

    // Get workspaces with pagination and include owner (first OWNER member)
    const workspaces = await prisma.workspace.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { role: "OWNER" },
          take: 1,
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: params?.sortBy
        ? { [params.sortBy]: params.sortOrder ?? "asc" }
        : { createdAt: "desc" },
    });

    // Transform workspaces to agency format
    // Note: verified and plan fields are simulated since Workspace doesn't have them
    // These will be real fields when Agency model is added
    const agencies: AdminAgency[] = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      image: workspace.image,
      // Simulated fields - will be replaced when Agency model exists
      verified: false,
      verifiedAt: null,
      plan: "FREE" as AgencyPlan,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      owner: workspace.members[0]?.user ?? null,
      _count: {
        members: workspace._count.members,
        listings: 0, // Will be populated when Property model is linked
        invitations: workspace._count.invitations,
      },
    }));

    // Apply client-side filters for simulated fields
    let filteredAgencies = agencies;
    if (params?.verified !== undefined && params.verified !== "") {
      const verifiedFilter = params.verified === "true";
      filteredAgencies = filteredAgencies.filter((a) => a.verified === verifiedFilter);
    }
    if (params?.plan) {
      filteredAgencies = filteredAgencies.filter((a) => a.plan === params.plan);
    }

    const pageCount = Math.ceil(total / pageSize);

    return {
      success: true,
      data: { agencies: filteredAgencies, total, pageCount },
    };
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return { success: false, error: "Failed to fetch agencies" };
  }
}

/**
 * Get single agency by ID with detailed information
 */
export async function getAgencyById(id: string): Promise<ActionResult<AdminAgencyDetail>> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: "Agency not found" };
    }

    // Find owner
    const owner = workspace.members.find((m) => m.role === "OWNER")?.user ?? null;

    // Build recent activity from member joins
    // In a real implementation, this would come from an activity log table
    const recentActivity = workspace.members.slice(0, 5).map((member) => ({
      id: member.id,
      type: "member_joined" as const,
      description: `${member.user.name || member.user.email} joined as ${member.role}`,
      timestamp: member.joinedAt,
    }));

    const agency: AdminAgencyDetail = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      image: workspace.image,
      verified: false,
      verifiedAt: null,
      plan: "FREE" as AgencyPlan,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      owner,
      _count: {
        members: workspace._count.members,
        listings: 0,
        invitations: workspace._count.invitations,
      },
      members: workspace.members,
      recentActivity,
    };

    return { success: true, data: agency };
  } catch (error) {
    console.error("Error fetching agency:", error);
    return { success: false, error: "Failed to fetch agency details" };
  }
}

/**
 * Update agency verification status
 * Note: This is a placeholder until Agency model with verified field exists
 */
export async function updateAgencyVerified(
  input: UpdateAgencyVerifiedInput
): Promise<ActionResult<AdminAgency>> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const validatedData = updateAgencyVerifiedSchema.parse(input);

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: validatedData.id },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { role: "OWNER" },
          take: 1,
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: "Agency not found" };
    }

    // Note: When Agency model exists, this will update the verified field
    // For now, we just return the workspace data with the requested verified status
    const agency: AdminAgency = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      image: workspace.image,
      verified: validatedData.verified,
      verifiedAt: validatedData.verified ? new Date() : null,
      plan: "FREE" as AgencyPlan,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      owner: workspace.members[0]?.user ?? null,
      _count: {
        members: workspace._count.members,
        listings: 0,
        invitations: workspace._count.invitations,
      },
    };

    revalidatePath("/admin/agencies");

    return { success: true, data: agency };
  } catch (error) {
    console.error("Error updating agency verified status:", error);
    return { success: false, error: "Failed to update verification status" };
  }
}

/**
 * Update agency plan
 * Note: This is a placeholder until Agency model with plan field exists
 */
export async function updateAgencyPlan(
  input: UpdateAgencyPlanInput
): Promise<ActionResult<AdminAgency>> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const validatedData = updateAgencyPlanSchema.parse(input);

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: validatedData.id },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { role: "OWNER" },
          take: 1,
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            invitations: true,
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: "Agency not found" };
    }

    // Note: When Agency model exists, this will update the plan field
    // For now, we just return the workspace data with the requested plan
    const agency: AdminAgency = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      image: workspace.image,
      verified: false,
      verifiedAt: null,
      plan: validatedData.plan,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      owner: workspace.members[0]?.user ?? null,
      _count: {
        members: workspace._count.members,
        listings: 0,
        invitations: workspace._count.invitations,
      },
    };

    revalidatePath("/admin/agencies");

    return { success: true, data: agency };
  } catch (error) {
    console.error("Error updating agency plan:", error);
    return { success: false, error: "Failed to update plan" };
  }
}

/**
 * Get owner user ID for impersonation
 */
export async function getAgencyOwnerId(agencyId: string): Promise<ActionResult<string>> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const owner = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: agencyId,
        role: "OWNER",
      },
      select: {
        userId: true,
      },
    });

    if (!owner) {
      return { success: false, error: "Agency owner not found" };
    }

    return { success: true, data: owner.userId };
  } catch (error) {
    console.error("Error fetching agency owner:", error);
    return { success: false, error: "Failed to fetch agency owner" };
  }
}

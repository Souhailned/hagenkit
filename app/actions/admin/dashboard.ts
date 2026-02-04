"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { ActionResult } from "@/types/actions";

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
      return {
        success: false,
        error: "Unauthorized - Admin access required",
      };
    }

    return { success: true, data: true };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { success: false, error: "Failed to verify permissions" };
  }
}

export interface DashboardStats {
  users: {
    total: number;
    new: number; // Last 30 days
    active: number; // Last 30 days with login
    trend: number; // Percentage change vs previous period
  };
  workspaces: {
    total: number;
    new: number; // Last 30 days
  };
  invitations: {
    pending: number;
  };
  activeNow: number; // Users with active session (last 24h)
}

export interface RecentUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
}

export interface ActivityItem {
  id: string;
  type: "user_registered" | "workspace_created" | "user_status_changed";
  description: string;
  timestamp: Date;
  metadata?: any;
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<
  ActionResult<DashboardStats>
> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      totalUsers,
      newUsersLast30Days,
      newUsersPrevious30Days,
      activeUsers,
      activeSessionUsers,
      totalWorkspaces,
      newWorkspaces,
      pendingInvitations,
    ] = await Promise.all([
      // Total users (excluding deleted)
      prisma.user.count({
        where: { status: { not: "DELETED" } },
      }),
      // New users last 30 days
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      // New users previous 30 days (for comparison)
      prisma.user.count({
        where: {
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: { lastLoginAt: { gte: thirtyDaysAgo } },
      }),
      // Users with active session (last 24h) - distinct user IDs
      prisma.session.findMany({
        where: {
          updatedAt: { gte: twentyFourHoursAgo },
          expiresAt: { gt: now },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      // Total workspaces
      prisma.workspace.count(),
      // New workspaces last 30 days
      prisma.workspace.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      // Pending invitations (not accepted, not expired)
      prisma.workspaceInvitation.count({
        where: {
          acceptedAt: null,
          expiresAt: { gt: now },
        },
      }),
    ]);

    // Calculate user trend
    const userTrend =
      newUsersPrevious30Days === 0
        ? newUsersLast30Days > 0
          ? 100
          : 0
        : ((newUsersLast30Days - newUsersPrevious30Days) /
            newUsersPrevious30Days) *
          100;

    const stats: DashboardStats = {
      users: {
        total: totalUsers,
        new: newUsersLast30Days,
        active: activeUsers,
        trend: Math.round(userTrend * 10) / 10,
      },
      workspaces: {
        total: totalWorkspaces,
        new: newWorkspaces,
      },
      invitations: {
        pending: pendingInvitations,
      },
      activeNow: activeSessionUsers.length,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

// Get recent users (last 5)
export async function getRecentUsers(): Promise<ActionResult<RecentUser[]>> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return { success: false, error: "Failed to fetch recent users" };
  }
}

// Get recent activity feed
export async function getRecentActivity(): Promise<
  ActionResult<ActivityItem[]>
> {
  const authCheck = await checkAdmin();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Get recent workspaces
    const recentWorkspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Combine and format activities
    const activities: ActivityItem[] = [
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: "user_registered" as const,
        description: `User "${user.name || user.email}" registered`,
        timestamp: user.createdAt,
      })),
      ...recentWorkspaces.map((workspace) => ({
        id: `workspace-${workspace.id}`,
        type: "workspace_created" as const,
        description: `Workspace "${workspace.name}" created`,
        timestamp: workspace.createdAt,
      })),
    ];

    // Sort by timestamp and take 5
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return { success: true, data: activities.slice(0, 5) };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return { success: false, error: "Failed to fetch recent activity" };
  }
}

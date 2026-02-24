"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ActionResult } from "@/types/actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActivityEntry = {
  id: string;
  actorId: string;
  actorName: string | null;
  actorImage: string | null;
  action: string;
  entity: string;
  entityName: string | null;
  description: string;
  createdAt: Date;
};

// ---------------------------------------------------------------------------
// Internal helper — called from other server actions
// ---------------------------------------------------------------------------

export async function logActivity(params: {
  projectId: string;
  actorId: string;
  action: string;
  entity: string;
  entityName?: string | null;
  description: string;
}): Promise<void> {
  try {
    await prisma.projectActivity.create({
      data: {
        projectId: params.projectId,
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityName: params.entityName ?? null,
        description: params.description,
      },
    });
  } catch (err) {
    // Never throw — logging should never break the main action
    console.error("[logActivity] Failed to log activity:", err);
  }
}

// ---------------------------------------------------------------------------
// Public — fetch activity feed for a project
// ---------------------------------------------------------------------------

export async function getProjectActivity(
  projectId: string,
  limit = 50
): Promise<ActionResult<ActivityEntry[]>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const activities = await prisma.projectActivity.findMany({
      where: { projectId },
      include: {
        actor: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const result: ActivityEntry[] = activities.map((a) => ({
      id: a.id,
      actorId: a.actorId,
      actorName: a.actor.name,
      actorImage: a.actor.image,
      action: a.action,
      entity: a.entity,
      entityName: a.entityName,
      description: a.description,
      createdAt: a.createdAt,
    }));

    return { success: true, data: result };
  } catch (err) {
    console.error("[getProjectActivity] Error:", err);
    return { success: false, error: "Failed to load activity" };
  }
}

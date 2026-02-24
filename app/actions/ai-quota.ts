"use server";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface AiQuotaData {
  freeEditsUsed: number;
  freeEditsLimit: number;
  remaining: number;
  totalEdits: number;
}

/* -------------------------------------------------------------------------- */
/*  getUserAiQuota                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Get or create the AI quota for a user.
 * Uses upsert so a row is created lazily on first access.
 */
export async function getUserAiQuota(userId: string): Promise<AiQuotaData> {
  const quota = await prisma.userAiQuota.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  return {
    freeEditsUsed: quota.freeEditsUsed,
    freeEditsLimit: quota.freeEditsLimit,
    remaining: Math.max(0, quota.freeEditsLimit - quota.freeEditsUsed),
    totalEdits: quota.totalEdits,
  };
}

/* -------------------------------------------------------------------------- */
/*  canUserGenerate                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Check if a user can generate AI content.
 * - admin and agent roles bypass the limit (unlimited).
 * - seeker role is subject to the free-edits quota.
 *
 * Returns `remaining: -1` for unlimited users.
 */
export async function canUserGenerate(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return { allowed: false, remaining: 0 };

  // Admin and agent have unlimited AI generation
  const role = user.role as string;
  if (role === "admin" || role === "agent") {
    return { allowed: true, remaining: -1 };
  }

  // Seekers: enforce free-edits quota
  const quota = await getUserAiQuota(userId);
  return {
    allowed: quota.remaining > 0,
    remaining: quota.remaining,
  };
}

/* -------------------------------------------------------------------------- */
/*  incrementAiEditCount                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Increment the AI edit count for a user.
 * Uses upsert so it works even if no quota row exists yet.
 */
export async function incrementAiEditCount(
  userId: string
): Promise<AiQuotaData> {
  const quota = await prisma.userAiQuota.upsert({
    where: { userId },
    update: {
      freeEditsUsed: { increment: 1 },
      totalEdits: { increment: 1 },
      lastEditAt: new Date(),
    },
    create: {
      userId,
      freeEditsUsed: 1,
      totalEdits: 1,
      lastEditAt: new Date(),
    },
  });

  return {
    freeEditsUsed: quota.freeEditsUsed,
    freeEditsLimit: quota.freeEditsLimit,
    remaining: Math.max(0, quota.freeEditsLimit - quota.freeEditsUsed),
    totalEdits: quota.totalEdits,
  };
}

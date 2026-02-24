"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

export interface AiCostSummary {
  totalCostCents: number;
  totalCalls: number;
  avgCostPerCallCents: number;
  byService: Array<{ service: string; costCents: number; calls: number }>;
  byFeature: Array<{ feature: string; costCents: number; calls: number }>;
}

export interface WorkspaceCost {
  workspaceId: string | null;
  workspaceName: string;
  costCents: number;
  calls: number;
}

export interface DailyCost {
  date: string;
  costCents: number;
  calls: number;
}

export async function getAiCostSummary(
  days: number = 30
): Promise<ActionResult<AiCostSummary>> {
  const authCheck = await requirePermission("analytics:platform");
  if (!authCheck.success) return { success: false, error: authCheck.error };

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [aggregate, byService, byFeature] = await Promise.all([
      prisma.aiUsageLog.aggregate({
        _sum: { costCents: true },
        _count: true,
        where: { createdAt: { gte: startDate } },
      }),
      prisma.aiUsageLog.groupBy({
        by: ["service"],
        _sum: { costCents: true },
        _count: true,
        where: { createdAt: { gte: startDate } },
        orderBy: { _sum: { costCents: "desc" } },
      }),
      prisma.aiUsageLog.groupBy({
        by: ["feature"],
        _sum: { costCents: true },
        _count: true,
        where: { createdAt: { gte: startDate } },
        orderBy: { _sum: { costCents: "desc" } },
      }),
    ]);

    const totalCostCents = aggregate._sum.costCents || 0;
    const totalCalls = aggregate._count;

    return {
      success: true,
      data: {
        totalCostCents,
        totalCalls,
        avgCostPerCallCents:
          totalCalls > 0 ? Math.round(totalCostCents / totalCalls) : 0,
        byService: byService.map((s) => ({
          service: s.service,
          costCents: s._sum.costCents || 0,
          calls: s._count,
        })),
        byFeature: byFeature.map((f) => ({
          feature: f.feature,
          costCents: f._sum.costCents || 0,
          calls: f._count,
        })),
      },
    };
  } catch (error) {
    console.error("[getAiCostSummary] Error:", error);
    return { success: false, error: "Kon AI kosten niet ophalen" };
  }
}

export async function getAiCostByWorkspace(
  days: number = 30
): Promise<ActionResult<WorkspaceCost[]>> {
  const authCheck = await requirePermission("analytics:platform");
  if (!authCheck.success) return { success: false, error: authCheck.error };

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const grouped = await prisma.aiUsageLog.groupBy({
      by: ["workspaceId"],
      _sum: { costCents: true },
      _count: true,
      where: { createdAt: { gte: startDate } },
      orderBy: { _sum: { costCents: "desc" } },
      take: 10,
    });

    const workspaceIds = grouped
      .map((g) => g.workspaceId)
      .filter(Boolean) as string[];

    const workspaces = await prisma.workspace.findMany({
      where: { id: { in: workspaceIds } },
      select: { id: true, name: true },
    });

    const wsMap = new Map(workspaces.map((w) => [w.id, w.name]));

    return {
      success: true,
      data: grouped.map((g) => ({
        workspaceId: g.workspaceId,
        workspaceName: g.workspaceId
          ? wsMap.get(g.workspaceId) || "Onbekend"
          : "Publiek",
        costCents: g._sum.costCents || 0,
        calls: g._count,
      })),
    };
  } catch (error) {
    console.error("[getAiCostByWorkspace] Error:", error);
    return { success: false, error: "Kon workspace kosten niet ophalen" };
  }
}

export async function getDailyAiCosts(
  days: number = 30
): Promise<ActionResult<DailyCost[]>> {
  const authCheck = await requirePermission("analytics:platform");
  if (!authCheck.success) return { success: false, error: authCheck.error };

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    // Use raw query for date truncation (Prisma groupBy doesn't support date functions)
    const rows = await prisma.$queryRaw<
      Array<{ date: Date; cost: bigint; calls: bigint }>
    >`
      SELECT
        DATE_TRUNC('day', created_at) as date,
        SUM(cost_cents)::bigint as cost,
        COUNT(*)::bigint as calls
      FROM ai_usage_log
      WHERE created_at >= ${startDate}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

    return {
      success: true,
      data: rows.map((r) => ({
        date: r.date.toISOString().split("T")[0],
        costCents: Number(r.cost),
        calls: Number(r.calls),
      })),
    };
  } catch (error) {
    console.error("[getDailyAiCosts] Error:", error);
    return { success: false, error: "Kon dagelijkse kosten niet ophalen" };
  }
}

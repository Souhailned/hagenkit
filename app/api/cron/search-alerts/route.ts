import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { matchAndNotifySearchAlerts } from "@/lib/search-alerts/matcher";

/**
 * Cron endpoint: find properties published in the last 24 hours that
 * have not yet been processed for search-alert matching, and run the
 * matcher for each.
 *
 * Protected by CRON_SECRET bearer token.
 */
export async function GET(request: Request) {
  try {
    // 1. Auth — verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[cron/search-alerts] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Find properties published in the last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const properties = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        publishedAt: { gte: since },
      },
      select: { id: true, title: true },
      orderBy: { publishedAt: "desc" },
    });

    // 3. Run matcher for each property
    const results: Array<{ propertyId: string; matched: number }> = [];

    for (const property of properties) {
      const result = await matchAndNotifySearchAlerts(property.id);
      results.push({ propertyId: property.id, matched: result.matched });
    }

    const totalMatched = results.reduce((sum, r) => sum + r.matched, 0);

    console.log("[cron/search-alerts] completed", {
      properties: properties.length,
      totalMatched,
    });

    return NextResponse.json({
      success: true,
      processed: properties.length,
      totalMatched,
      results,
    });
  } catch (error) {
    console.error("[cron/search-alerts] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

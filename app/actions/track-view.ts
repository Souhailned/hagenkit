"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createHash } from "crypto";

export async function trackPropertyView(propertyId: string) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  // Hash IP for privacy
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

  const userAgent = h.get("user-agent") || "";
  const deviceType = /mobile/i.test(userAgent) ? "mobile" : /tablet/i.test(userAgent) ? "tablet" : "desktop";

  // Prevent duplicate views in same session (check last 30 min)
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const recentView = await prisma.propertyView.findFirst({
    where: {
      propertyId,
      ipHash,
      viewedAt: { gte: thirtyMinAgo },
    },
  });

  if (recentView) {
    // Update duration instead of creating new view
    return { tracked: false, reason: "recent" };
  }

  await prisma.propertyView.create({
    data: {
      propertyId,
      userId: session?.user?.id || null,
      ipHash,
      deviceType,
      source: "direct",
    },
  });

  // Increment cached view count
  await prisma.property.update({
    where: { id: propertyId },
    data: { viewCount: { increment: 1 } },
  });

  return { tracked: true };
}

"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getPropertyAnalytics(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const property = await prisma.property.findFirst({
    where: { id: propertyId, createdById: session.user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      inquiryCount: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      _count: {
        select: {
          inquiries: true,
          favorites: true,
          views: true,
        },
      },
    },
  });

  if (!property) return null;

  // Get views over last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentViews = await prisma.propertyView.groupBy({
    by: ["viewedAt"],
    where: {
      propertyId,
      viewedAt: { gte: sevenDaysAgo },
    },
    _count: true,
  });

  // Conversion rate
  const conversionRate = property.viewCount > 0
    ? ((property._count.inquiries / property.viewCount) * 100).toFixed(1)
    : "0";

  return {
    ...property,
    recentViewCount: recentViews.length,
    conversionRate,
    daysOnline: property.publishedAt
      ? Math.floor((Date.now() - new Date(property.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  };
}

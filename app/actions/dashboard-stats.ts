"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Parallel queries
  const [
    totalProperties,
    activeProperties,
    totalViews,
    totalInquiries,
    totalFavorites,
    recentInquiries,
  ] = await Promise.all([
    prisma.property.count({ where: { createdById: userId } }),
    prisma.property.count({ where: { createdById: userId, status: "ACTIVE" } }),
    prisma.property.aggregate({
      where: { createdById: userId },
      _sum: { viewCount: true },
    }),
    prisma.propertyInquiry.count({
      where: { property: { createdById: userId } },
    }),
    prisma.favoriteProperty.count({
      where: { property: { createdById: userId } },
    }),
    prisma.propertyInquiry.count({
      where: {
        property: { createdById: userId },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    totalProperties,
    activeProperties,
    totalViews: totalViews._sum.viewCount || 0,
    totalInquiries,
    totalFavorites,
    recentInquiries,
  };
}

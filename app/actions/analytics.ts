"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type DailyViewData = {
  date: string; // "ma", "di", etc. or "2026-02-10"
  views: number;
  inquiries: number;
};

export type AnalyticsOverview = {
  totalViews: number;
  totalInquiries: number;
  totalFavorites: number;
  conversionRate: number;
  weeklyViews: number;
  weeklyInquiries: number;
  dailyData: DailyViewData[];
  topProperties: {
    id: string;
    title: string;
    slug: string;
    city: string;
    status: string;
    viewCount: number;
    inquiryCount: number;
    favoriteCount: number;
    daysOnline: number;
  }[];
  deviceBreakdown: { device: string; count: number }[];
  sourceBreakdown: { source: string; count: number }[];
};

const dayNames = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export async function getAnalyticsOverview(): Promise<AnalyticsOverview | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Parallel queries
  const [properties, recentViews, recentInquiries, viewsByDay, deviceData, sourceData] = await Promise.all([
    // Properties with counts
    prisma.property.findMany({
      where: { createdById: session.user.id },
      select: {
        id: true, title: true, slug: true, city: true, status: true,
        viewCount: true, inquiryCount: true, savedCount: true, createdAt: true,
        _count: { select: { favorites: true } },
      },
      orderBy: { viewCount: "desc" },
    }),
    // Weekly views count
    prisma.propertyView.count({
      where: { property: { createdById: session.user.id }, viewedAt: { gte: weekAgo } },
    }),
    // Weekly inquiries count
    prisma.propertyInquiry.count({
      where: { property: { createdById: session.user.id }, createdAt: { gte: weekAgo } },
    }),
    // Daily views for last 7 days
    prisma.propertyView.findMany({
      where: { property: { createdById: session.user.id }, viewedAt: { gte: weekAgo } },
      select: { viewedAt: true },
    }),
    // Device breakdown (last 30 days)
    prisma.propertyView.groupBy({
      by: ["deviceType"],
      where: { property: { createdById: session.user.id }, viewedAt: { gte: monthAgo } },
      _count: true,
    }),
    // Source breakdown (last 30 days)
    prisma.propertyView.groupBy({
      by: ["source"],
      where: { property: { createdById: session.user.id }, viewedAt: { gte: monthAgo } },
      _count: true,
    }),
  ]);

  // Also get daily inquiries
  const inquiriesByDay = await prisma.propertyInquiry.findMany({
    where: { property: { createdById: session.user.id }, createdAt: { gte: weekAgo } },
    select: { createdAt: true },
  });

  // Aggregate views by day
  const dailyMap = new Map<string, { views: number; inquiries: number }>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = dayNames[d.getDay()];
    dailyMap.set(key, { views: 0, inquiries: 0 });
  }

  for (const v of viewsByDay) {
    const key = dayNames[new Date(v.viewedAt).getDay()];
    const entry = dailyMap.get(key);
    if (entry) entry.views++;
  }

  for (const inq of inquiriesByDay) {
    const key = dayNames[new Date(inq.createdAt).getDay()];
    const entry = dailyMap.get(key);
    if (entry) entry.inquiries++;
  }

  const dailyData: DailyViewData[] = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));

  const totalViews = properties.reduce((s, p) => s + p.viewCount, 0);
  const totalInquiries = properties.reduce((s, p) => s + p.inquiryCount, 0);
  const totalFavorites = properties.reduce((s, p) => s + p._count.favorites, 0);

  return {
    totalViews,
    totalInquiries,
    totalFavorites,
    conversionRate: totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0,
    weeklyViews: recentViews,
    weeklyInquiries: recentInquiries,
    dailyData,
    topProperties: properties.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      city: p.city,
      status: p.status,
      viewCount: p.viewCount,
      inquiryCount: p.inquiryCount,
      favoriteCount: p._count.favorites,
      daysOnline: Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    })),
    deviceBreakdown: deviceData.map((d) => ({
      device: d.deviceType || "Onbekend",
      count: d._count,
    })),
    sourceBreakdown: sourceData.map((s) => ({
      source: s.source || "Direct",
      count: s._count,
    })),
  };
}

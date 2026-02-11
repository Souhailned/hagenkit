"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface AgentAnalytics {
  // Overview
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalInquiries: number;
  
  // Trends (vs previous period)
  viewsTrend: number; // percentage change
  inquiriesTrend: number;
  
  // Top performers
  topProperties: {
    id: string;
    title: string;
    slug: string;
    views: number;
    inquiries: number;
    conversionRate: number;
  }[];
  
  // Recent activity
  recentInquiries: {
    id: string;
    propertyTitle: string;
    contactName: string;
    contactEmail: string;
    createdAt: Date;
    status: string;
  }[];
  
  // Performance
  avgViewsPerListing: number;
  avgDaysOnMarket: number;
  overallConversionRate: number;
}

export async function getAgentAnalytics(): Promise<{
  success: boolean;
  data?: AgentAnalytics;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: "Niet ingelogd" };

    const userId = session.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get user's properties
    const properties = await prisma.property.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    const propertyIds = properties.map((p) => p.id);
    const totalProperties = properties.length;
    const activeProperties = properties.filter((p) => p.status === "ACTIVE").length;

    if (propertyIds.length === 0) {
      return {
        success: true,
        data: {
          totalProperties: 0,
          activeProperties: 0,
          totalViews: 0,
          totalInquiries: 0,
          viewsTrend: 0,
          inquiriesTrend: 0,
          topProperties: [],
          recentInquiries: [],
          avgViewsPerListing: 0,
          avgDaysOnMarket: 0,
          overallConversionRate: 0,
        },
      };
    }

    // Views last 30 days
    const viewsLast30 = await prisma.propertyView.count({
      where: { propertyId: { in: propertyIds }, viewedAt: { gte: thirtyDaysAgo } },
    });
    const viewsPrev30 = await prisma.propertyView.count({
      where: { propertyId: { in: propertyIds }, viewedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });
    const viewsTrend = viewsPrev30 > 0 ? Math.round(((viewsLast30 - viewsPrev30) / viewsPrev30) * 100) : 0;

    // Inquiries last 30 days
    const inquiriesLast30 = await prisma.propertyInquiry.count({
      where: { propertyId: { in: propertyIds }, createdAt: { gte: thirtyDaysAgo } },
    });
    const inquiriesPrev30 = await prisma.propertyInquiry.count({
      where: { propertyId: { in: propertyIds }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });
    const inquiriesTrend = inquiriesPrev30 > 0 ? Math.round(((inquiriesLast30 - inquiriesPrev30) / inquiriesPrev30) * 100) : 0;

    // Total views & inquiries (all time)
    const totalViews = await prisma.propertyView.count({
      where: { propertyId: { in: propertyIds } },
    });
    const totalInquiries = await prisma.propertyInquiry.count({
      where: { propertyId: { in: propertyIds } },
    });

    // Top 5 properties by views
    const viewsByProperty = await prisma.propertyView.groupBy({
      by: ["propertyId"],
      where: { propertyId: { in: propertyIds } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const inquiriesByProperty = await prisma.propertyInquiry.groupBy({
      by: ["propertyId"],
      where: { propertyId: { in: propertyIds } },
      _count: { id: true },
    });

    const inquiryMap = Object.fromEntries(
      inquiriesByProperty.map((i) => [i.propertyId, i._count.id])
    );

    const topProperties = viewsByProperty.map((v) => {
      const prop = properties.find((p) => p.id === v.propertyId);
      const inquiries = inquiryMap[v.propertyId] || 0;
      return {
        id: v.propertyId,
        title: prop?.title || "",
        slug: prop?.slug || "",
        views: v._count.id,
        inquiries,
        conversionRate: v._count.id > 0 ? Math.round((inquiries / v._count.id) * 100) : 0,
      };
    });

    // Recent inquiries
    const recentInquiries = await prisma.propertyInquiry.findMany({
      where: { propertyId: { in: propertyIds } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Averages
    const avgViewsPerListing = activeProperties > 0 ? Math.round(totalViews / activeProperties) : 0;
    const avgDaysOnMarket = properties
      .filter((p) => p.publishedAt)
      .reduce((sum, p) => {
        const days = Math.ceil((now.getTime() - (p.publishedAt?.getTime() || p.createdAt.getTime())) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / Math.max(properties.filter((p) => p.publishedAt).length, 1);

    const overallConversionRate = totalViews > 0 ? Math.round((totalInquiries / totalViews) * 100 * 10) / 10 : 0;

    return {
      success: true,
      data: {
        totalProperties,
        activeProperties,
        totalViews,
        totalInquiries,
        viewsTrend,
        inquiriesTrend,
        topProperties,
        recentInquiries: recentInquiries.map((i) => ({
          id: i.id,
          propertyTitle: i.property.title,
          contactName: i.name,
          contactEmail: i.email,
          createdAt: i.createdAt,
          status: i.status,
        })),
        avgViewsPerListing,
        avgDaysOnMarket: Math.round(avgDaysOnMarket),
        overallConversionRate,
      },
    };
  } catch (error) {
    console.error("Agent analytics failed:", error);
    return { success: false, error: "Kon analytics niet laden" };
  }
}

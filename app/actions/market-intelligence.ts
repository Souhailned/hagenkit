"use server";

import prisma from "@/lib/prisma";

interface MarketOverview {
  totalActiveListings: number;
  avgRentPrice: number;
  medianRentPrice: number;
  avgSurface: number;
  
  // By city
  topCities: { city: string; count: number; avgPrice: number }[];
  
  // By type
  topTypes: { type: string; count: number; avgPrice: number }[];
  
  // Recent trends
  newListingsLast7Days: number;
  newListingsLast30Days: number;
  
  // Price ranges
  priceDistribution: { range: string; count: number }[];
}

export async function getMarketOverview(): Promise<{
  success: boolean;
  data?: MarketOverview;
  error?: string;
}> {
  try {
    // Active listings count
    const totalActiveListings = await prisma.property.count({
      where: { status: "ACTIVE" },
    });

    // Price stats
    const priceStats = await prisma.property.aggregate({
      where: { status: "ACTIVE", rentPrice: { gt: 0 } },
      _avg: { rentPrice: true, surfaceTotal: true },
    });

    // All active prices for median
    const prices = await prisma.property.findMany({
      where: { status: "ACTIVE", rentPrice: { gt: 0 } },
      select: { rentPrice: true },
      orderBy: { rentPrice: "asc" },
    });
    const medianRentPrice = prices.length > 0
      ? prices[Math.floor(prices.length / 2)].rentPrice!
      : 0;

    // Top cities
    const cityGroups = await prisma.property.groupBy({
      by: ["city"],
      where: { status: "ACTIVE" },
      _count: { id: true },
      _avg: { rentPrice: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });
    const topCities = cityGroups.map((c) => ({
      city: c.city,
      count: c._count.id,
      avgPrice: Math.round(c._avg.rentPrice || 0),
    }));

    // Top types
    const typeGroups = await prisma.property.groupBy({
      by: ["propertyType"],
      where: { status: "ACTIVE" },
      _count: { id: true },
      _avg: { rentPrice: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });
    const topTypes = typeGroups.map((t) => ({
      type: t.propertyType,
      count: t._count.id,
      avgPrice: Math.round(t._avg.rentPrice || 0),
    }));

    // New listings
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newListingsLast7Days = await prisma.property.count({
      where: { status: "ACTIVE", createdAt: { gte: sevenDaysAgo } },
    });
    const newListingsLast30Days = await prisma.property.count({
      where: { status: "ACTIVE", createdAt: { gte: thirtyDaysAgo } },
    });

    // Price distribution
    const priceRanges = [
      { range: "< €1.000", min: 0, max: 100000 },
      { range: "€1.000 - €2.500", min: 100000, max: 250000 },
      { range: "€2.500 - €5.000", min: 250000, max: 500000 },
      { range: "€5.000 - €10.000", min: 500000, max: 1000000 },
      { range: "> €10.000", min: 1000000, max: 999999999 },
    ];

    const priceDistribution = await Promise.all(
      priceRanges.map(async (r) => ({
        range: r.range,
        count: await prisma.property.count({
          where: { status: "ACTIVE", rentPrice: { gte: r.min, lt: r.max } },
        }),
      }))
    );

    return {
      success: true,
      data: {
        totalActiveListings,
        avgRentPrice: Math.round(priceStats._avg.rentPrice || 0),
        medianRentPrice,
        avgSurface: Math.round(priceStats._avg.surfaceTotal || 0),
        topCities,
        topTypes,
        newListingsLast7Days,
        newListingsLast30Days,
        priceDistribution,
      },
    };
  } catch (error) {
    console.error("Market intelligence failed:", error);
    return { success: false, error: "Kon marktdata niet laden" };
  }
}

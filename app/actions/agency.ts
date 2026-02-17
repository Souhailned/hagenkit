"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { ActionResult } from "@/types/actions";
import type { Property, AgencyWithDetails } from "@/types/agency";

// Types for Agency Statistics
export interface AgencyStats {
  activeProperties: {
    count: number;
    trend: number; // percentage change vs previous period
  };
  newLeadsToday: {
    count: number;
  };
  viewsThisWeek: {
    count: number;
    previousWeek: number;
  };
  averageResponseTime: {
    minutes: number;
    formatted: string;
  };
}

// Types for Property Inquiry (Lead)
export type InquiryStatus =
  | "NEW"
  | "VIEWED"
  | "CONTACTED"
  | "VIEWING_SCHEDULED"
  | "NEGOTIATING"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "SPAM";

export type InquiryPriority = "hot" | "warm" | "cold";

export interface PropertyInquiry {
  id: string;
  propertyName: string;
  contactName: string;
  contactEmail: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  createdAt: Date;
}

// Types for Top Property
export interface TopProperty {
  id: string;
  name: string;
  views: number;
  inquiries: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

// Helper to check authenticated user
async function checkAuth(): Promise<ActionResult<{ userId: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized - Not authenticated" };
    }

    return { success: true, data: { userId: session.user.id } };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { success: false, error: "Failed to verify authentication" };
  }
}

// Helper to find the user's agency
async function getUserAgencyId(userId: string): Promise<string | null> {
  const membership = await prisma.agencyMember.findFirst({
    where: { userId },
    select: { agencyId: true },
  });
  return membership?.agencyId ?? null;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Get agency statistics for the dashboard
 * Returns active properties, new leads, views, and response time
 */
export async function getAgencyStats(): Promise<ActionResult<AgencyStats>> {
  const authCheck = await checkAuth();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const userId = authCheck.data!.userId;
    const agencyId = await getUserAgencyId(userId);

    if (!agencyId) {
      // User is not part of any agency — return zeroed stats
      return {
        success: true,
        data: {
          activeProperties: { count: 0, trend: 0 },
          newLeadsToday: { count: 0 },
          viewsThisWeek: { count: 0, previousWeek: 0 },
          averageResponseTime: { minutes: 0, formatted: "0 min" },
        },
      };
    }

    const now = new Date();

    // Start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of this week (Monday)
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfThisWeek.setHours(0, 0, 0, 0);

    // Start of previous week
    const startOfPreviousWeek = new Date(startOfThisWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

    // Previous period for trend calculation (same duration as current)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Get property IDs for this agency
    const agencyPropertyIds = await prisma.property.findMany({
      where: { agencyId },
      select: { id: true },
    });
    const propertyIds = agencyPropertyIds.map((p) => p.id);

    const [
      activeCount,
      previousActiveCount,
      newLeadsToday,
      viewsThisWeek,
      viewsPreviousWeek,
      avgResponseTime,
    ] = await Promise.all([
      // Active properties now
      prisma.property.count({
        where: { agencyId, status: "ACTIVE" },
      }),

      // Active properties 30 days ago (approximate via createdAt)
      prisma.property.count({
        where: {
          agencyId,
          status: "ACTIVE",
          createdAt: { lte: thirtyDaysAgo },
        },
      }),

      // New leads today
      prisma.propertyInquiry.count({
        where: {
          propertyId: { in: propertyIds },
          createdAt: { gte: startOfToday },
        },
      }),

      // Views this week
      prisma.propertyView.count({
        where: {
          propertyId: { in: propertyIds },
          viewedAt: { gte: startOfThisWeek },
        },
      }),

      // Views previous week
      prisma.propertyView.count({
        where: {
          propertyId: { in: propertyIds },
          viewedAt: { gte: startOfPreviousWeek, lt: startOfThisWeek },
        },
      }),

      // Average response time from agent profiles
      prisma.agentProfile.findFirst({
        where: { agencyId },
        select: { avgResponseMinutes: true },
      }),
    ]);

    // Calculate trend percentage
    const trend =
      previousActiveCount > 0
        ? Math.round(
            ((activeCount - previousActiveCount) / previousActiveCount) * 100 * 10
          ) / 10
        : 0;

    const avgMinutes = avgResponseTime?.avgResponseMinutes ?? 0;

    const stats: AgencyStats = {
      activeProperties: {
        count: activeCount,
        trend,
      },
      newLeadsToday: {
        count: newLeadsToday,
      },
      viewsThisWeek: {
        count: viewsThisWeek,
        previousWeek: viewsPreviousWeek,
      },
      averageResponseTime: {
        minutes: avgMinutes,
        formatted: avgMinutes > 0 ? `${avgMinutes} min` : "N/A",
      },
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching agency stats:", error);
    return { success: false, error: "Failed to fetch agency statistics" };
  }
}

/**
 * Get agency by slug
 */
export async function getAgency(
  slug: string
): Promise<ActionResult<AgencyWithDetails>> {
  try {
    const agency = await prisma.agency.findUnique({
      where: { slug },
      include: {
        agents: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!agency) {
      return {
        success: false,
        error: "Agency not found",
      };
    }

    // Map Prisma result to AgencyWithDetails type
    const result: AgencyWithDetails = {
      id: agency.id,
      name: agency.name,
      slug: agency.slug,
      description: agency.description,
      logo: agency.logo,
      email: agency.email,
      phone: agency.phone,
      website: agency.website,
      address: agency.address,
      city: agency.city,
      postalCode: agency.postalCode,
      province: agency.province,
      country: agency.country,
      kvkNumber: agency.kvkNumber,
      vatNumber: agency.vatNumber,
      verified: agency.verified,
      verifiedAt: agency.verifiedAt,
      plan: agency.plan,
      activeListings: agency.activeListings,
      totalDeals: agency.totalDeals,
      createdAt: agency.createdAt,
      updatedAt: agency.updatedAt,
      agents: agency.agents.map((agent) => ({
        id: agent.id,
        userId: agent.userId,
        agencyId: agent.agencyId,
        title: agent.title,
        phone: agent.phone,
        phonePublic: agent.phonePublic,
        bio: agent.bio,
        avatar: agent.avatar,
        specializations: agent.specializations,
        regions: agent.regions,
        languages: agent.languages,
        verified: agent.verified,
        dealsClosedCount: agent.dealsClosedCount,
        activeListings: agent.activeListings,
        rating: agent.rating,
        createdAt: agent.createdAt,
        user: agent.user,
      })),
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error fetching agency:", error);
    return {
      success: false,
      error: "Failed to fetch agency",
    };
  }
}

/**
 * List recent property inquiries (leads)
 * Returns the most recent inquiries with property and contact info
 */
export async function listInquiries(
  limit: number = 5
): Promise<ActionResult<PropertyInquiry[]>> {
  const authCheck = await checkAuth();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const userId = authCheck.data!.userId;
    const agencyId = await getUserAgencyId(userId);

    if (!agencyId) {
      return { success: true, data: [] };
    }

    const inquiries = await prisma.propertyInquiry.findMany({
      where: {
        property: { agencyId },
      },
      include: {
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const mapped: PropertyInquiry[] = inquiries.map((inq) => ({
      id: inq.id,
      propertyName: inq.property.title,
      contactName: inq.name,
      contactEmail: inq.email,
      status: inq.status as InquiryStatus,
      priority: (inq.priority as InquiryPriority) ?? "cold",
      createdAt: inq.createdAt,
    }));

    return { success: true, data: mapped };
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return { success: false, error: "Failed to fetch inquiries" };
  }
}

/**
 * Get all properties for an agency
 */
export async function getPropertiesByAgency(
  agencyId: string,
  options?: {
    status?: "ACTIVE" | "ALL";
    limit?: number;
  }
): Promise<ActionResult<Property[]>> {
  try {
    const properties = await prisma.property.findMany({
      where: {
        agencyId,
        ...(options?.status === "ACTIVE" ? { status: "ACTIVE" } : {}),
      },
      include: {
        images: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            originalUrl: true,
            altText: true,
            order: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: options?.limit,
    });

    // Map Prisma result to the Property type from types/agency.ts
    const mapped: Property[] = properties.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      shortDescription: p.shortDescription,
      description: p.description,
      propertyType: p.propertyType,
      status: p.status,
      priceType: p.priceType,
      rentPrice: p.rentPrice,
      salePrice: p.salePrice,
      servicesCosts: p.servicesCosts,
      address: p.address,
      city: p.city,
      postalCode: p.postalCode,
      province: p.province,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      surfaceTotal: p.surfaceTotal,
      surfaceCommercial: p.surfaceCommercial,
      seatingCapacityInside: p.seatingCapacityInside,
      seatingCapacityOutside: p.seatingCapacityOutside,
      hasKitchen: p.kitchenType !== "none" && p.kitchenType !== null,
      hasTerrace: p.hasTerrace,
      hasParking: p.hasParking,
      hasBasement: p.hasBasement,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.originalUrl,
        alt: img.altText,
        order: img.order,
      })),
      agencyId: p.agencyId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      publishedAt: p.publishedAt,
    }));

    return {
      success: true,
      data: mapped,
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return {
      success: false,
      error: "Failed to fetch properties",
    };
  }
}

/**
 * Get top performing properties by views and inquiries
 */
export async function getTopProperties(
  limit: number = 5
): Promise<ActionResult<TopProperty[]>> {
  const authCheck = await checkAuth();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    const userId = authCheck.data!.userId;
    const agencyId = await getUserAgencyId(userId);

    if (!agencyId) {
      return { success: true, data: [] };
    }

    const properties = await prisma.property.findMany({
      where: { agencyId, status: "ACTIVE" },
      orderBy: [{ viewCount: "desc" }, { inquiryCount: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        viewCount: true,
        inquiryCount: true,
      },
    });

    const mapped: TopProperty[] = properties.map((p) => ({
      id: p.id,
      name: p.title,
      views: p.viewCount,
      inquiries: p.inquiryCount,
    }));

    return { success: true, data: mapped };
  } catch (error) {
    console.error("Error fetching top properties:", error);
    return { success: false, error: "Failed to fetch top properties" };
  }
}

/**
 * Get all agency slugs for static generation
 */
export async function getAllAgencySlugs(): Promise<string[]> {
  try {
    const agencies = await prisma.agency.findMany({
      where: { verified: true },
      select: { slug: true },
    });
    return agencies.map((a) => a.slug);
  } catch (error) {
    console.error("Error fetching agency slugs:", error);
    return [];
  }
}

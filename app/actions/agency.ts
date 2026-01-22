"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { ActionResult } from "@/types/actions";

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

/**
 * Get agency statistics for the dashboard
 * Returns active properties, new leads, views, and response time
 */
export async function getAgencyStats(): Promise<ActionResult<AgencyStats>> {
  const authCheck = await checkAuth();
  if (!authCheck.success) return { success: false, error: authCheck.error };

  try {
    // TODO: Replace with actual database queries when Property/Inquiry models are added
    // For now, return realistic mock data to demonstrate the component
    const stats: AgencyStats = {
      activeProperties: {
        count: 24,
        trend: 12.5, // +12.5% vs previous period
      },
      newLeadsToday: {
        count: 7,
      },
      viewsThisWeek: {
        count: 1284,
        previousWeek: 1156,
      },
      averageResponseTime: {
        minutes: 45,
        formatted: "45 min",
      },
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching agency stats:", error);
    return { success: false, error: "Failed to fetch agency statistics" };
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
    // TODO: Replace with actual database queries when PropertyInquiry model is added
    // For now, return realistic mock data to demonstrate the component
    const now = new Date();
    const inquiries: PropertyInquiry[] = [
      {
        id: "inq_1",
        propertyName: "Grand Café De Kroon",
        contactName: "Jan de Vries",
        contactEmail: "jan@example.com",
        status: "NEW",
        priority: "hot",
        createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
      },
      {
        id: "inq_2",
        propertyName: "Restaurant Amstel",
        contactName: "Maria Jansen",
        contactEmail: "maria@example.com",
        status: "CONTACTED",
        priority: "warm",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "inq_3",
        propertyName: "Brasserie Zuid",
        contactName: "Peter Bakker",
        contactEmail: "peter@example.com",
        status: "VIEWING_SCHEDULED",
        priority: "hot",
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        id: "inq_4",
        propertyName: "Café Het Hoekje",
        contactName: "Linda Smit",
        contactEmail: "linda@example.com",
        status: "NEW",
        priority: "warm",
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: "inq_5",
        propertyName: "Pizzeria Napoli",
        contactName: "Marco Rossi",
        contactEmail: "marco@example.com",
        status: "NEGOTIATING",
        priority: "hot",
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      },
    ];

    return { success: true, data: inquiries.slice(0, limit) };
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return { success: false, error: "Failed to fetch inquiries" };
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
    // TODO: Replace with actual database queries when Property model is added
    // For now, return realistic mock data to demonstrate the component
    const properties: TopProperty[] = [
      {
        id: "prop_1",
        name: "Grand Café De Kroon",
        views: 342,
        inquiries: 12,
      },
      {
        id: "prop_2",
        name: "Restaurant Amstel",
        views: 289,
        inquiries: 8,
      },
      {
        id: "prop_3",
        name: "Brasserie Zuid",
        views: 234,
        inquiries: 6,
      },
      {
        id: "prop_4",
        name: "Café Het Hoekje",
        views: 198,
        inquiries: 5,
      },
      {
        id: "prop_5",
        name: "Pizzeria Napoli",
        views: 167,
        inquiries: 4,
      },
    ];

    return { success: true, data: properties.slice(0, limit) };
  } catch (error) {
    console.error("Error fetching top properties:", error);
    return { success: false, error: "Failed to fetch top properties" };
  }
}

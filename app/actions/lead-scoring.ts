"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calculateLeadScore, type LeadScore, type LeadSignals } from "@/lib/lead-scoring";

export type ScoredLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  createdAt: Date;
  status: string;
  source: string;
  propertyTitle: string;
  propertySlug: string;
  score: LeadScore;
};

/**
 * Get all leads for the current agent's properties, with lead scores
 */
export async function getScoredLeads(): Promise<ScoredLead[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  // Get all inquiries for this agent's properties
  const inquiries = await prisma.propertyInquiry.findMany({
    where: {
      property: { createdById: session.user.id },
    },
    include: {
      property: { select: { title: true, slug: true } },
      seeker: {
        select: {
          id: true,
          onboardingCompleted: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Score each lead
  const scoredLeads = await Promise.all(
    inquiries.map(async (inquiry) => {
      const signals = await buildSignals(inquiry, session.user.id);
      const score = calculateLeadScore(signals);

      return {
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        company: inquiry.company,
        message: inquiry.message,
        createdAt: inquiry.createdAt,
        status: inquiry.status,
        source: inquiry.source,
        propertyTitle: inquiry.property.title,
        propertySlug: inquiry.property.slug,
        score,
      };
    })
  );

  // Sort by score descending (hottest leads first)
  return scoredLeads.sort((a, b) => b.score.score - a.score.score);
}

/**
 * Get lead score for a specific inquiry
 */
export async function getLeadScore(inquiryId: string): Promise<LeadScore | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const inquiry = await prisma.propertyInquiry.findFirst({
    where: {
      id: inquiryId,
      property: { createdById: session.user.id },
    },
    include: {
      property: { select: { title: true, slug: true } },
      seeker: {
        select: {
          id: true,
          onboardingCompleted: true,
          createdAt: true,
        },
      },
    },
  });

  if (!inquiry) return null;

  const signals = await buildSignals(inquiry, session.user.id);
  return calculateLeadScore(signals);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildSignals(inquiry: any, agentUserId: string): Promise<LeadSignals> {
  const seekerId = inquiry.seekerId;
  const propertyId = inquiry.propertyId;
  const now = new Date();

  // Default signals for anonymous/non-logged-in users
  if (!seekerId) {
    return {
      hasPhone: !!inquiry.phone,
      hasCompany: !!inquiry.company,
      hasConcept: !!inquiry.conceptDescription,
      hasBudget: !!inquiry.budget,
      hasTimeline: !!inquiry.timeline,
      timelineUrgency: parseTimeline(inquiry.timeline),
      inquiryLength: inquiry.message?.length || 0,
      totalPropertyViews: 0,
      uniquePropertiesViewed: 0,
      viewsOnThisProperty: 0,
      viewedImages: false,
      viewedMap: false,
      viewedContact: true, // They did submit the form
      avgViewDuration: 0,
      totalFavorites: 0,
      favoritedThisProperty: false,
      comparedProperties: 0,
      hasCompletedOnboarding: false,
      accountAgeDays: 0,
      lastActiveHoursAgo: hoursAgo(inquiry.createdAt, now),
    };
  }

  // Fetch engagement data in parallel
  const [views, favorites, allViews] = await Promise.all([
    // Views on this specific property
    prisma.propertyView.findMany({
      where: { userId: seekerId, propertyId },
      select: { viewedImages: true, viewedMap: true, viewedContact: true, duration: true },
    }),
    // Favorites
    prisma.favoriteProperty.findMany({
      where: { userId: seekerId },
      select: { propertyId: true },
    }),
    // All views (for unique properties count)
    prisma.propertyView.groupBy({
      by: ["propertyId"],
      where: { userId: seekerId },
      _count: true,
    }),
  ]);

  const favoritedPropertyIds = favorites.map((f) => f.propertyId);
  const avgDuration = views.length > 0
    ? views.reduce((sum, v) => sum + (v.duration || 0), 0) / views.length
    : 0;

  const accountAge = inquiry.seeker?.createdAt
    ? (now.getTime() - new Date(inquiry.seeker.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : 0;

  return {
    hasPhone: !!inquiry.phone,
    hasCompany: !!inquiry.company,
    hasConcept: !!inquiry.conceptDescription,
    hasBudget: !!inquiry.budget,
    hasTimeline: !!inquiry.timeline,
    timelineUrgency: parseTimeline(inquiry.timeline),
    inquiryLength: inquiry.message?.length || 0,
    totalPropertyViews: allViews.reduce((sum, v) => sum + v._count, 0),
    uniquePropertiesViewed: allViews.length,
    viewsOnThisProperty: views.length,
    viewedImages: views.some((v) => v.viewedImages),
    viewedMap: views.some((v) => v.viewedMap),
    viewedContact: true,
    avgViewDuration: avgDuration,
    totalFavorites: favorites.length,
    favoritedThisProperty: favoritedPropertyIds.includes(propertyId),
    comparedProperties: 0, // Compare is localStorage-based, not tracked server-side
    hasCompletedOnboarding: inquiry.seeker?.onboardingCompleted ?? false,
    accountAgeDays: Math.floor(accountAge),
    lastActiveHoursAgo: hoursAgo(inquiry.createdAt, now),
  };
}

function parseTimeline(timeline: string | null): LeadSignals["timelineUrgency"] {
  if (!timeline) return "unknown";
  const lower = timeline.toLowerCase();
  if (lower.includes("asap") || lower.includes("direct") || lower.includes("zo snel")) return "asap";
  if (lower.includes("1-3") || lower.includes("1 tot 3")) return "1-3months";
  if (lower.includes("3-6") || lower.includes("3 tot 6")) return "3-6months";
  if (lower.includes("6") || lower.includes("jaar")) return "6months+";
  return "unknown";
}

function hoursAgo(date: Date, now: Date): number {
  return (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60);
}

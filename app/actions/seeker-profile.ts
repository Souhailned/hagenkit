"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";
import type { SeekerProfile, SeekerRecommendations } from "@/types/property";

/**
 * Get the current user's seeker profile
 * Creates a default profile if one doesn't exist
 */
export async function getSeekerProfile(
  userId?: string
): Promise<ActionResult<SeekerProfile | null>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const targetUserId = userId || session.user.id;

    // Only allow users to view their own profile unless admin
    if (targetUserId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // TODO: Once Prisma schema is updated with SeekerProfile model,
    // uncomment and use the following:
    /*
    const profile = await prisma.seekerProfile.findUnique({
      where: { userId: targetUserId },
    });

    if (!profile) {
      // Create default profile
      const newProfile = await prisma.seekerProfile.create({
        data: {
          userId: targetUserId,
          preferredCities: [],
          preferredProvinces: [],
          preferredTypes: [],
          mustHaveFeatures: [],
          niceToHaveFeatures: [],
          emailAlerts: true,
          pushAlerts: false,
          alertFrequency: "DAILY",
          hasBusinessPlan: false,
        },
      });
      return { success: true, data: newProfile };
    }

    return { success: true, data: profile };
    */

    // Temporary: Return null until database models are created
    return { success: true, data: null };
  } catch (error) {
    console.error("Error getting seeker profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get profile",
    };
  }
}

/**
 * Update the seeker profile
 */
export async function updateSeekerProfile(
  _data: Partial<SeekerProfile>
): Promise<ActionResult<SeekerProfile>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // TODO: Once Prisma schema is updated with SeekerProfile model,
    // implement the update logic using _data
    /*
    const profile = await prisma.seekerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ..._data,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        ..._data,
        preferredCities: _data.preferredCities || [],
        preferredProvinces: _data.preferredProvinces || [],
        preferredTypes: _data.preferredTypes || [],
        mustHaveFeatures: _data.mustHaveFeatures || [],
        niceToHaveFeatures: _data.niceToHaveFeatures || [],
        emailAlerts: _data.emailAlerts ?? true,
        pushAlerts: _data.pushAlerts ?? false,
        alertFrequency: _data.alertFrequency || "DAILY",
        hasBusinessPlan: _data.hasBusinessPlan ?? false,
      },
    });

    return { success: true, data: profile };
    */

    return { success: false, error: "Profile update not yet implemented" };
  } catch (error) {
    console.error("Error updating seeker profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

/**
 * Complete seeker onboarding with initial profile data
 */
export async function completeSeekerOnboarding(
  _data: Partial<SeekerProfile>
): Promise<ActionResult<void>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // TODO: Once Prisma schema is updated, implement using _data:
    // 1. Update user role to 'seeker'
    // 2. Create SeekerProfile with provided _data
    // 3. Set onboardingCompleted to true
    /*
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "seeker",
          onboardingCompleted: true,
        },
      }),
      prisma.seekerProfile.create({
        data: {
          userId: session.user.id,
          ..._data,
        },
      }),
    ]);
    */

    return { success: true };
  } catch (error) {
    console.error("Error completing seeker onboarding:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to complete onboarding",
    };
  }
}

/**
 * Get personalized recommendations for a seeker
 * Based on their profile preferences, search history, and saved alerts
 */
export async function getSeekerRecommendations(): Promise<
  ActionResult<SeekerRecommendations>
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // TODO: Once Prisma schema is updated with all models, implement full logic:
    /*
    // 1. Get seeker profile for preferences
    const profile = await prisma.seekerProfile.findUnique({
      where: { userId: session.user.id },
    });

    // 2. Get recently viewed properties
    const recentViews = await prisma.propertyView.findMany({
      where: { userId: session.user.id },
      orderBy: { viewedAt: "desc" },
      take: 6,
      include: {
        property: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    // 3. Get search alerts and find new matches
    const alerts = await prisma.searchAlert.findMany({
      where: {
        userId: session.user.id,
        active: true,
      },
    });

    // 4. Search for recommended properties based on profile
    let recommended: PropertyCard[] = [];
    if (profile && (profile.preferredCities.length > 0 || profile.preferredTypes.length > 0)) {
      const properties = await prisma.property.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { city: { in: profile.preferredCities } },
            { propertyType: { in: profile.preferredTypes } },
          ],
          ...(profile.budgetMin || profile.budgetMax
            ? {
                OR: [
                  {
                    rentPrice: {
                      gte: profile.budgetMin,
                      lte: profile.budgetMax,
                    },
                  },
                  {
                    salePrice: {
                      gte: profile.budgetMin,
                      lte: profile.budgetMax,
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      });
      recommended = properties.map(mapPropertyToCard);
    }

    // 5. Get new matches from alerts (properties published since last alert sent)
    let newMatches: PropertyCard[] = [];
    for (const alert of alerts) {
      const matches = await prisma.property.findMany({
        where: {
          status: "ACTIVE",
          publishedAt: { gt: alert.lastSentAt || alert.createdAt },
          ...(alert.cities.length > 0 ? { city: { in: alert.cities } } : {}),
          ...(alert.propertyTypes.length > 0
            ? { propertyType: { in: alert.propertyTypes } }
            : {}),
          ...(alert.priceMin || alert.priceMax
            ? {
                OR: [
                  { rentPrice: { gte: alert.priceMin, lte: alert.priceMax } },
                  { salePrice: { gte: alert.priceMin, lte: alert.priceMax } },
                ],
              }
            : {}),
        },
        take: 4,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      });
      newMatches.push(...matches.map(mapPropertyToCard));
    }

    // Dedupe and limit new matches
    newMatches = [...new Map(newMatches.map((p) => [p.id, p])).values()].slice(0, 6);

    return {
      success: true,
      data: {
        recommended,
        recentlyViewed: recentViews.map((v) => mapPropertyToCard(v.property)),
        newMatches,
        hasPreferences: profile !== null && (
          profile.preferredCities.length > 0 ||
          profile.preferredTypes.length > 0 ||
          profile.budgetMin !== null ||
          profile.budgetMax !== null
        ),
      },
    };
    */

    // Temporary: Return mock data for UI development
    // This allows the dashboard to be built and tested before the database models exist
    const mockRecommendations: SeekerRecommendations = {
      recommended: [],
      recentlyViewed: [],
      newMatches: [],
      hasPreferences: false,
    };

    return { success: true, data: mockRecommendations };
  } catch (error) {
    console.error("Error getting seeker recommendations:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get recommendations",
    };
  }
}

/**
 * Check if a property is saved by the current user
 */
export async function isPropertySaved(
  _propertyId: string
): Promise<ActionResult<boolean>> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: true, data: false };
    }

    // TODO: Once Prisma schema is updated, use _propertyId:
    /*
    const saved = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId: _propertyId,
        },
      },
    });

    return { success: true, data: !!saved };
    */

    return { success: true, data: false };
  } catch (error) {
    console.error("Error checking saved property:", error);
    return { success: true, data: false };
  }
}

"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types/actions";
import type {
  PropertyListItem,
  SeekerRecommendations,
  SeekerPreferences,
  SeekerProfile,
} from "@/types/property";

/**
 * Helper to get current session
 */
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user ?? null;
}

/**
 * Mock property data for development
 * Will be replaced with real Prisma queries when models are available
 */
const mockProperties: PropertyListItem[] = [
  {
    id: "prop_1",
    title: "Karakteristiek Café in Jordaan",
    slug: "karakteristiek-cafe-jordaan",
    shortDescription:
      "Authentiek bruin café met originele details en trouwe klantenkring",
    propertyType: "CAFE",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 350000, // €3,500/month in cents
    salePrice: null,
    city: "Amsterdam",
    province: "Noord-Holland",
    neighborhood: "Jordaan",
    surfaceTotal: 85,
    seatingCapacityInside: 45,
    seatingCapacityOutside: 20,
    hasTerrace: true,
    hasKitchen: false,
    horecaScore: "A",
    featured: true,
    publishedAt: new Date("2025-01-15"),
    viewCount: 234,
    savedCount: 18,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
      altText: "Karakteristiek café interieur",
    },
    agency: {
      id: "agency_1",
      name: "Horeca Makelaars Amsterdam",
      slug: "horeca-makelaars-amsterdam",
    },
  },
  {
    id: "prop_2",
    title: "Modern Restaurant met Terras",
    slug: "modern-restaurant-terras-rotterdam",
    shortDescription:
      "Volledig uitgeruste restaurantruimte in opkomende wijk met groot terras",
    propertyType: "RESTAURANT",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 525000, // €5,250/month
    salePrice: null,
    city: "Rotterdam",
    province: "Zuid-Holland",
    neighborhood: "Katendrecht",
    surfaceTotal: 180,
    seatingCapacityInside: 80,
    seatingCapacityOutside: 40,
    hasTerrace: true,
    hasKitchen: true,
    horecaScore: "A+",
    featured: true,
    publishedAt: new Date("2025-01-10"),
    viewCount: 456,
    savedCount: 32,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      altText: "Modern restaurant interieur",
    },
    agency: {
      id: "agency_2",
      name: "Horeca Partners Zuid",
      slug: "horeca-partners-zuid",
    },
  },
  {
    id: "prop_3",
    title: "Dark Kitchen Hub",
    slug: "dark-kitchen-hub-utrecht",
    shortDescription:
      "Professionele dark kitchen met meerdere werkstations en uitstekende logistiek",
    propertyType: "DARK_KITCHEN",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 280000, // €2,800/month
    salePrice: null,
    city: "Utrecht",
    province: "Utrecht",
    neighborhood: "Leidsche Rijn",
    surfaceTotal: 120,
    seatingCapacityInside: null,
    seatingCapacityOutside: null,
    hasTerrace: false,
    hasKitchen: true,
    horecaScore: "B",
    featured: false,
    publishedAt: new Date("2025-01-18"),
    viewCount: 89,
    savedCount: 7,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      altText: "Professionele keuken setup",
    },
    agency: {
      id: "agency_3",
      name: "Horeca Vastgoed Midden",
      slug: "horeca-vastgoed-midden",
    },
  },
  {
    id: "prop_4",
    title: "Trendy Cocktailbar",
    slug: "trendy-cocktailbar-den-haag",
    shortDescription:
      "Stijlvolle bar met complete inventaris en uitstekende drankvergunning",
    propertyType: "BAR",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 420000, // €4,200/month
    salePrice: null,
    city: "Den Haag",
    province: "Zuid-Holland",
    neighborhood: "Centrum",
    surfaceTotal: 95,
    seatingCapacityInside: 50,
    seatingCapacityOutside: 15,
    hasTerrace: true,
    hasKitchen: false,
    horecaScore: "A",
    featured: false,
    publishedAt: new Date("2025-01-20"),
    viewCount: 156,
    savedCount: 12,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=300&fit=crop",
      altText: "Stijlvolle cocktailbar",
    },
    agency: {
      id: "agency_2",
      name: "Horeca Partners Zuid",
      slug: "horeca-partners-zuid",
    },
  },
  {
    id: "prop_5",
    title: "Bakkerij met Winkelruimte",
    slug: "bakkerij-winkelruimte-haarlem",
    shortDescription:
      "Complete bakkerij met moderne apparatuur en drukbezochte winkel aan straat",
    propertyType: "BAKERY",
    status: "ACTIVE",
    priceType: "SALE",
    rentPrice: null,
    salePrice: 45000000, // €450,000
    city: "Haarlem",
    province: "Noord-Holland",
    neighborhood: "Centrum",
    surfaceTotal: 140,
    seatingCapacityInside: 20,
    seatingCapacityOutside: 8,
    hasTerrace: true,
    hasKitchen: true,
    horecaScore: "B+",
    featured: true,
    publishedAt: new Date("2025-01-12"),
    viewCount: 312,
    savedCount: 24,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      altText: "Bakkerij met vers brood",
    },
    agency: {
      id: "agency_1",
      name: "Horeca Makelaars Amsterdam",
      slug: "horeca-makelaars-amsterdam",
    },
  },
  {
    id: "prop_6",
    title: "Bistro aan het Water",
    slug: "bistro-aan-water-leiden",
    shortDescription:
      "Sfeervolle bistro met uitzicht op de gracht en eigen aanlegsteiger",
    propertyType: "RESTAURANT",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 480000, // €4,800/month
    salePrice: null,
    city: "Leiden",
    province: "Zuid-Holland",
    neighborhood: "Centrum",
    surfaceTotal: 110,
    seatingCapacityInside: 55,
    seatingCapacityOutside: 30,
    hasTerrace: true,
    hasKitchen: true,
    horecaScore: "A",
    featured: false,
    publishedAt: new Date("2025-01-08"),
    viewCount: 278,
    savedCount: 19,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=300&fit=crop",
      altText: "Bistro aan het water",
    },
    agency: {
      id: "agency_2",
      name: "Horeca Partners Zuid",
      slug: "horeca-partners-zuid",
    },
  },
];

/**
 * Get the current user's seeker profile
 * Creates a default profile if one doesn't exist
 */
export async function getSeekerProfile(
  userId?: string
): Promise<ActionResult<SeekerProfile | null>> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const targetUserId = userId || user.id;

    // Only allow users to view their own profile unless admin
    if (targetUserId !== user.id) {
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
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // TODO: Once Prisma schema is updated with SeekerProfile model,
    // implement the update logic using _data
    /*
    const profile = await prisma.seekerProfile.upsert({
      where: { userId: user.id },
      update: {
        ..._data,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
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
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // TODO: Once Prisma schema is updated, implement using _data:
    // 1. Update user role to 'seeker'
    // 2. Create SeekerProfile with provided _data
    // 3. Set onboardingCompleted to true
    /*
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          role: "seeker",
          onboardingCompleted: true,
        },
      }),
      prisma.seekerProfile.create({
        data: {
          userId: user.id,
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
 * Get seeker recommendations based on user preferences
 * Returns recommended properties, recently viewed, and new matches
 */
export async function getSeekerRecommendations(): Promise<
  ActionResult<SeekerRecommendations>
> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Je moet ingelogd zijn om aanbevelingen te zien",
      };
    }

    // TODO: When SeekerProfile model is available, fetch real preferences:
    // const seekerProfile = await prisma.seekerProfile.findUnique({
    //   where: { userId: user.id },
    // });

    // For now, simulate a user with preferences
    // In production, this would come from the database
    const hasPreferences = true; // Set to false to test empty state

    if (!hasPreferences) {
      return {
        success: true,
        data: {
          recommended: [],
          recentlyViewed: [],
          newMatches: [],
          hasPreferences: false,
        },
      };
    }

    // Mock preferences (would come from SeekerProfile)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _preferences: SeekerPreferences = {
      budgetMin: 200000, // €2,000
      budgetMax: 600000, // €6,000
      preferredCities: ["Amsterdam", "Rotterdam", "Utrecht"],
      preferredProvinces: ["Noord-Holland", "Zuid-Holland"],
      preferredTypes: ["RESTAURANT", "CAFE", "BAR"],
      minSurface: 50,
      maxSurface: 200,
      mustHaveFeatures: ["terrace", "kitchen"],
      niceToHaveFeatures: ["parking"],
    };

    // TODO: When models are available, filter properties based on preferences:
    // const recommended = await prisma.property.findMany({
    //   where: {
    //     status: 'ACTIVE',
    //     city: { in: preferences.preferredCities },
    //     propertyType: { in: preferences.preferredTypes },
    //     OR: [
    //       { rentPrice: { gte: preferences.budgetMin, lte: preferences.budgetMax } },
    //       { salePrice: { gte: preferences.budgetMin, lte: preferences.budgetMax } },
    //     ],
    //   },
    //   include: {
    //     images: { where: { isPrimary: true }, take: 1 },
    //     agency: { select: { id: true, name: true, slug: true } },
    //   },
    //   orderBy: { publishedAt: 'desc' },
    //   take: 6,
    // });

    // For now, return mock data
    const recommended = mockProperties.slice(0, 4);
    const recentlyViewed = mockProperties.slice(2, 5);
    const newMatches = mockProperties.slice(1, 4);

    return {
      success: true,
      data: {
        recommended,
        recentlyViewed,
        newMatches,
        hasPreferences: true,
      },
    };
  } catch (error) {
    console.error("Error fetching seeker recommendations:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het ophalen van aanbevelingen",
    };
  }
}

/**
 * Get seeker profile preferences
 * Returns the user's search preferences
 */
export async function getSeekerPreferences(): Promise<
  ActionResult<SeekerPreferences | null>
> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Je moet ingelogd zijn",
      };
    }

    // TODO: Fetch from database when model is available
    // const profile = await prisma.seekerProfile.findUnique({
    //   where: { userId: user.id },
    // });

    // Mock response - return null to simulate no preferences
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Error fetching seeker preferences:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het ophalen van voorkeuren",
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
    const user = await getCurrentUser();

    if (!user?.id) {
      return { success: true, data: false };
    }

    // TODO: Once Prisma schema is updated, use _propertyId:
    /*
    const saved = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
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

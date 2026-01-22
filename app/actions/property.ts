"use server";

import type { ActionResult } from "@/types/actions";
import type {
  Property,
  PropertyImage,
  PropertyFeature,
  UpdatePropertyInput,
} from "@/lib/validations/property";
import { updatePropertySchema } from "@/lib/validations/property";

// Mock data for development until database schema is ready
const mockImages: PropertyImage[] = [
  {
    id: "img-1",
    propertyId: "prop-1",
    originalUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200",
    type: "INTERIOR",
    caption: "Restaurant interieur",
    order: 0,
    isPrimary: true,
    aiProcessed: false,
  },
  {
    id: "img-2",
    propertyId: "prop-1",
    originalUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200",
    type: "KITCHEN",
    caption: "Professionele keuken",
    order: 1,
    isPrimary: false,
    aiProcessed: false,
  },
  {
    id: "img-3",
    propertyId: "prop-1",
    originalUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=200",
    type: "TERRACE",
    caption: "Terras",
    order: 2,
    isPrimary: false,
    aiProcessed: false,
  },
  {
    id: "img-4",
    propertyId: "prop-1",
    originalUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200",
    type: "EXTERIOR",
    caption: "Gevel",
    order: 3,
    isPrimary: false,
    aiProcessed: false,
  },
];

const mockFeatures: PropertyFeature[] = [
  {
    id: "feat-1",
    propertyId: "prop-1",
    category: "LICENSE",
    key: "alcohol_license",
    booleanValue: true,
    verified: true,
    displayOrder: 0,
    highlighted: true,
  },
  {
    id: "feat-2",
    propertyId: "prop-1",
    category: "LICENSE",
    key: "terrace_license",
    booleanValue: true,
    verified: true,
    displayOrder: 1,
    highlighted: true,
  },
  {
    id: "feat-3",
    propertyId: "prop-1",
    category: "FACILITY",
    key: "professional_kitchen",
    booleanValue: true,
    verified: false,
    displayOrder: 0,
    highlighted: true,
  },
  {
    id: "feat-4",
    propertyId: "prop-1",
    category: "FACILITY",
    key: "extraction_system",
    booleanValue: true,
    verified: false,
    displayOrder: 1,
    highlighted: false,
  },
  {
    id: "feat-5",
    propertyId: "prop-1",
    category: "UTILITY",
    key: "air_conditioning",
    booleanValue: true,
    verified: false,
    displayOrder: 0,
    highlighted: false,
  },
  {
    id: "feat-6",
    propertyId: "prop-1",
    category: "ACCESSIBILITY",
    key: "wheelchair_accessible",
    booleanValue: true,
    verified: true,
    displayOrder: 0,
    highlighted: true,
  },
];

const mockProperty: Property = {
  id: "prop-1",
  agencyId: "agency-1",
  createdById: "user-1",

  // Basic info
  title: "Karakteristiek Grand Café in Hartje Amsterdam",
  slug: "karakteristiek-grand-cafe-amsterdam",
  description: `Een unieke kans om een gevestigd grand café over te nemen in het historische centrum van Amsterdam. Dit karakteristieke pand combineert authentieke elementen met moderne faciliteiten.

De locatie aan een van de drukste pleinen van de stad garandeert een constante stroom van zowel toeristen als lokale bezoekers. Het terras met 40 zitplaatsen is een van de meest gewilde in de buurt.

De volledig uitgeruste professionele keuken biedt alle mogelijkheden voor een uitgebreid menu. De bestaande vergunningen, inclusief alcoholvergunning tot 01:00 en terrasvergunning, maken een vlotte overname mogelijk.`,
  shortDescription: "Gevestigd grand café met terras op toplocatie in Amsterdam centrum",

  // Location
  address: "Dam 1",
  city: "Amsterdam",
  postalCode: "1012 JS",
  province: "Noord-Holland",
  country: "NL",
  latitude: 52.373,
  longitude: 4.893,
  neighborhood: "Centrum",

  // Pricing (in cents)
  priceType: "RENT",
  rentPrice: 850000, // €8.500
  priceNegotiable: true,
  servicesCosts: 45000, // €450
  depositMonths: 3,

  // Dimensions
  surfaceTotal: 285,
  surfaceCommercial: 180,
  surfaceKitchen: 45,
  surfaceStorage: 30,
  surfaceTerrace: 60,
  floors: 2,
  ceilingHeight: 3.5,

  // Classification
  propertyType: "CAFE",
  status: "ACTIVE",

  // Horeca specifics
  seatingCapacityInside: 85,
  seatingCapacityOutside: 40,
  standingCapacity: 120,
  kitchenType: "Professioneel, gas",
  hasBasement: true,
  hasStorage: true,
  hasTerrace: true,
  hasParking: false,

  // Previous use
  wasHoreca: true,
  previousHorecaType: "CAFE",
  yearsHoreca: 15,

  // Building
  buildYear: 1890,
  lastRenovation: 2019,
  monumentStatus: true,
  energyLabel: "C",

  // Scores
  horecaScore: "A",
  locationScore: 95,
  footfallEstimate: 15000,

  // SEO
  featured: true,
  featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

  // Availability
  availableFrom: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  minimumLeaseTerm: 60,

  // Publishing
  publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  viewCount: 1247,
  inquiryCount: 23,
  savedCount: 89,

  // Timestamps
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),

  // Relations
  images: mockImages,
  features: mockFeatures,
  agency: {
    id: "agency-1",
    name: "Horeca Makelaardij Amsterdam",
    slug: "horeca-makelaardij-amsterdam",
    logo: "https://ui-avatars.com/api/?name=HMA&background=0D8ABC&color=fff",
  },
  createdBy: {
    id: "user-1",
    name: "Jan de Vries",
    email: "jan@horecamakelaardij.nl",
  },
};

// Second mock property (draft)
const mockPropertyDraft: Property = {
  id: "prop-2",
  agencyId: "agency-1",
  createdById: "user-1",

  title: "Restaurant aan het Water",
  slug: "restaurant-aan-het-water",
  description: "Een prachtig restaurant met uitzicht over de haven.",

  address: "Havenstraat 12",
  city: "Rotterdam",
  postalCode: "3011 AB",
  province: "Zuid-Holland",
  country: "NL",

  priceType: "SALE",
  salePrice: 45000000, // €450.000
  priceNegotiable: true,

  surfaceTotal: 150,
  surfaceCommercial: 100,
  surfaceKitchen: 30,
  floors: 1,

  propertyType: "RESTAURANT",
  status: "DRAFT",

  seatingCapacityInside: 50,
  hasTerrace: true,
  hasStorage: true,
  hasBasement: false,
  hasParking: true,
  parkingSpaces: 5,

  featured: false,
  viewCount: 0,
  inquiryCount: 0,
  savedCount: 0,

  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),

  images: [],
  features: [],
  agency: {
    id: "agency-1",
    name: "Horeca Makelaardij Amsterdam",
    slug: "horeca-makelaardij-amsterdam",
  },
};

// In-memory store for updates during development
const propertyStore = new Map<string, Property>([
  ["prop-1", mockProperty],
  ["prop-2", mockPropertyDraft],
]);

/**
 * Get a property by ID with all relations
 */
export async function getProperty(id: string): Promise<ActionResult<Property>> {
  try {
    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const property = propertyStore.get(id);

    if (!property) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    return {
      success: true,
      data: property,
    };
  } catch (error) {
    console.error("Error fetching property:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het ophalen van het pand",
    };
  }
}

/**
 * Update a property
 */
export async function updateProperty(
  input: UpdatePropertyInput
): Promise<ActionResult<Property>> {
  try {
    // Validate input
    const validated = updatePropertySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Validatie mislukt",
      };
    }

    const { id, ...updates } = validated.data;

    // Get existing property
    const existing = propertyStore.get(id);
    if (!existing) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    // Merge updates
    const updated: Property = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    // Store updated property
    propertyStore.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Error updating property:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het bijwerken van het pand",
    };
  }
}

/**
 * Publish a property (set status to ACTIVE)
 */
export async function publishProperty(id: string): Promise<ActionResult<Property>> {
  try {
    const existing = propertyStore.get(id);
    if (!existing) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    // Check required fields for publishing
    if (!existing.title || !existing.address || !existing.city || !existing.surfaceTotal) {
      return {
        success: false,
        error: "Niet alle verplichte velden zijn ingevuld",
      };
    }

    const updated: Property = {
      ...existing,
      status: "ACTIVE",
      publishedAt: new Date(),
      updatedAt: new Date(),
    };

    propertyStore.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Error publishing property:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het publiceren",
    };
  }
}

/**
 * Unpublish a property (set status to DRAFT)
 */
export async function unpublishProperty(id: string): Promise<ActionResult<Property>> {
  try {
    const existing = propertyStore.get(id);
    if (!existing) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    const updated: Property = {
      ...existing,
      status: "DRAFT",
      publishedAt: undefined,
      updatedAt: new Date(),
    };

    propertyStore.set(id, updated);

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Error unpublishing property:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het depubliceren",
    };
  }
}

/**
 * Delete a property (set status to ARCHIVED)
 */
export async function deleteProperty(id: string): Promise<ActionResult<void>> {
  try {
    const existing = propertyStore.get(id);
    if (!existing) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    const updated: Property = {
      ...existing,
      status: "ARCHIVED",
      updatedAt: new Date(),
    };

    propertyStore.set(id, updated);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting property:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het verwijderen",
    };
  }
}

/**
 * Get property statistics for charts
 */
export async function getPropertyStats(
  id: string
): Promise<ActionResult<{
  viewsByDay: Array<{ date: string; views: number; inquiries: number }>;
  totalViews: number;
  totalInquiries: number;
  totalSaves: number;
  conversionRate: number;
}>> {
  try {
    const property = propertyStore.get(id);
    if (!property) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    // Generate mock stats for last 30 days
    const viewsByDay = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        views: Math.floor(Math.random() * 80) + 20,
        inquiries: Math.floor(Math.random() * 3),
      };
    });

    return {
      success: true,
      data: {
        viewsByDay,
        totalViews: property.viewCount,
        totalInquiries: property.inquiryCount,
        totalSaves: property.savedCount,
        conversionRate: property.viewCount > 0
          ? Math.round((property.inquiryCount / property.viewCount) * 10000) / 100
          : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching property stats:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het ophalen van statistieken",
    };
  }
}

/**
 * Update property images
 */
export async function updatePropertyImages(
  propertyId: string,
  images: PropertyImage[]
): Promise<ActionResult<PropertyImage[]>> {
  try {
    const existing = propertyStore.get(propertyId);
    if (!existing) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    const updated: Property = {
      ...existing,
      images,
      updatedAt: new Date(),
    };

    propertyStore.set(propertyId, updated);

    return {
      success: true,
      data: images,
    };
  } catch (error) {
    console.error("Error updating property images:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het bijwerken van afbeeldingen",
    };
  }
}

/**
 * Update property features
 */
export async function updatePropertyFeatures(
  propertyId: string,
  features: PropertyFeature[]
): Promise<ActionResult<PropertyFeature[]>> {
  try {
    const existing = propertyStore.get(propertyId);
    if (!existing) {
      return {
        success: false,
        error: "Pand niet gevonden",
      };
    }

    const updated: Property = {
      ...existing,
      features,
      updatedAt: new Date(),
    };

    propertyStore.set(propertyId, updated);

    return {
      success: true,
      data: features,
    };
  } catch (error) {
    console.error("Error updating property features:", error);
    return {
      success: false,
      error: "Er ging iets mis bij het bijwerken van kenmerken",
    };
  }
}

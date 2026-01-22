"use server";

import type { Property } from "@/lib/types/property";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// Mock property data for development
// TODO: Replace with actual Prisma queries when database models are ready
const MOCK_PROPERTY: Property = {
  id: "prop_001",
  title: "Sfeervolle Horecalocatie in Historisch Centrum",
  slug: "sfeervolle-horecalocatie-historisch-centrum-amsterdam",
  description: `Deze unieke horecalocatie bevindt zich in het hart van Amsterdam, op een van de meest gewilde plekken van de stad. Het pand biedt een perfecte combinatie van historische charme en moderne mogelijkheden.

De ruime commerciële ruimte van 180 m² is verdeeld over twee verdiepingen en beschikt over hoge plafonds met authentieke balken. De volledig uitgeruste professionele keuken is recent gerenoveerd en voldoet aan alle moderne HACCP-normen.

Het pand beschikt over een vergunning voor alcoholverkoop en heeft een terrasvergunning voor 24 zitplaatsen op het aangrenzende plein. De locatie heeft een uitstekende zichtbaarheid met grote etalageruiten aan de straatzijde.

Ideaal voor een restaurant, bistro of café concept. De huidige huurder vertrekt per 1 maart 2026.`,
  shortDescription: "Karakteristiek horecapand met terras in het historische centrum van Amsterdam",

  // Location
  address: "Nieuwendijk 123",
  addressLine2: null,
  city: "Amsterdam",
  postalCode: "1012 MD",
  province: "Noord-Holland",
  country: "NL",
  latitude: 52.3747,
  longitude: 4.8986,
  neighborhood: "Centrum",

  // Pricing
  priceType: "RENT",
  rentPrice: 450000, // €4.500/month in cents
  rentPriceMin: null,
  salePrice: null,
  salePriceMin: null,
  priceNegotiable: true,
  servicesCosts: 35000, // €350/month
  depositMonths: 3,

  // Dimensions
  surfaceTotal: 180,
  surfaceCommercial: 120,
  surfaceKitchen: 35,
  surfaceStorage: 15,
  surfaceTerrace: 40,
  surfaceBasement: 25,
  floors: 2,
  ceilingHeight: 3.2,

  // Classification
  propertyType: "RESTAURANT",
  status: "ACTIVE",

  // Horeca specifics
  seatingCapacityInside: 45,
  seatingCapacityOutside: 24,
  standingCapacity: 60,
  kitchenType: "Professioneel met afzuiging",
  hasBasement: true,
  hasStorage: true,
  hasTerrace: true,
  hasParking: false,
  parkingSpaces: null,

  // Building
  buildYear: 1890,
  lastRenovation: 2022,
  monumentStatus: "Beschermd stadsgezicht",
  energyLabel: "C",

  // Scores
  horecaScore: "A",
  horecaScoreDetails: {
    location: 95,
    facilities: 88,
    licenses: 100,
    condition: 85,
  },
  locationScore: 95,
  footfallEstimate: 15000,

  // SEO
  metaTitle: "Restaurant te huur Amsterdam Centrum - 180m² met terras",
  metaDescription: "Uniek horecapand te huur in Amsterdam centrum. 180m², professionele keuken, terras 24 plaatsen, alcoholvergunning. Direct beschikbaar.",
  featured: true,

  // Availability
  availableFrom: new Date("2026-03-01"),
  minimumLeaseTerm: 60, // 5 years

  // Stats
  viewCount: 847,
  inquiryCount: 23,
  savedCount: 156,

  // Timestamps
  publishedAt: new Date("2025-12-01"),
  createdAt: new Date("2025-11-15"),
  updatedAt: new Date("2025-12-20"),

  // Relations
  agencyId: "agency_001",
  createdById: "user_001",
  images: [
    {
      id: "img_001",
      propertyId: "prop_001",
      originalUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
      thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
      mediumUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      largeUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
      type: "INTERIOR",
      caption: "Sfeervolle hoofdruimte met authentieke details",
      altText: "Restaurant interieur met houten balken en warme verlichting",
      order: 0,
      isPrimary: true,
      width: 1200,
      height: 800,
    },
    {
      id: "img_002",
      propertyId: "prop_001",
      originalUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
      thumbnailUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
      mediumUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      largeUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200",
      type: "INTERIOR",
      caption: "Bar en zitgedeelte",
      altText: "Stijlvolle bar met barkrukken",
      order: 1,
      isPrimary: false,
      width: 1200,
      height: 800,
    },
    {
      id: "img_003",
      propertyId: "prop_001",
      originalUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200",
      thumbnailUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
      mediumUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800",
      largeUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200",
      type: "KITCHEN",
      caption: "Professionele keuken",
      altText: "Volledig uitgeruste professionele keuken",
      order: 2,
      isPrimary: false,
      width: 1200,
      height: 800,
    },
    {
      id: "img_004",
      propertyId: "prop_001",
      originalUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200",
      thumbnailUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400",
      mediumUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800",
      largeUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200",
      type: "TERRACE",
      caption: "Terras aan het plein",
      altText: "Zonnig terras met uitzicht op het plein",
      order: 3,
      isPrimary: false,
      width: 1200,
      height: 800,
    },
    {
      id: "img_005",
      propertyId: "prop_001",
      originalUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200",
      thumbnailUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400",
      mediumUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800",
      largeUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200",
      type: "EXTERIOR",
      caption: "Gevel bij avond",
      altText: "Uitnodigende gevel met sfeerverlichting",
      order: 4,
      isPrimary: false,
      width: 1200,
      height: 800,
    },
  ],
  features: [
    // Licenses
    { id: "feat_001", propertyId: "prop_001", category: "LICENSE", key: "alcohol_license", value: "Ja", booleanValue: true, numericValue: null, verified: true, highlighted: true, displayOrder: 0 },
    { id: "feat_002", propertyId: "prop_001", category: "LICENSE", key: "terrace_license", value: "24 plaatsen", booleanValue: true, numericValue: 24, verified: true, highlighted: true, displayOrder: 1 },
    { id: "feat_003", propertyId: "prop_001", category: "LICENSE", key: "exploitation_license", value: "Ja", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 2 },
    { id: "feat_004", propertyId: "prop_001", category: "LICENSE", key: "music_license", value: "Tot 23:00", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 3 },

    // Facilities
    { id: "feat_005", propertyId: "prop_001", category: "FACILITY", key: "professional_kitchen", value: "Volledig uitgerust", booleanValue: true, numericValue: null, verified: true, highlighted: true, displayOrder: 0 },
    { id: "feat_006", propertyId: "prop_001", category: "FACILITY", key: "extraction_system", value: "2022 geïnstalleerd", booleanValue: true, numericValue: null, verified: true, highlighted: true, displayOrder: 1 },
    { id: "feat_007", propertyId: "prop_001", category: "FACILITY", key: "cold_storage", value: "Walk-in koeling + vriezer", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 2 },
    { id: "feat_008", propertyId: "prop_001", category: "FACILITY", key: "storage_room", value: "15m²", booleanValue: true, numericValue: 15, verified: true, highlighted: false, displayOrder: 3 },
    { id: "feat_009", propertyId: "prop_001", category: "FACILITY", key: "basement", value: "25m² opslag", booleanValue: true, numericValue: 25, verified: true, highlighted: false, displayOrder: 4 },
    { id: "feat_010", propertyId: "prop_001", category: "FACILITY", key: "bar", value: "6 meter", booleanValue: true, numericValue: 6, verified: false, highlighted: false, displayOrder: 5 },
    { id: "feat_011", propertyId: "prop_001", category: "FACILITY", key: "toilets", value: "3 stuks", booleanValue: null, numericValue: 3, verified: true, highlighted: false, displayOrder: 6 },

    // Utilities
    { id: "feat_012", propertyId: "prop_001", category: "UTILITY", key: "air_conditioning", value: "Ja", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 0 },
    { id: "feat_013", propertyId: "prop_001", category: "UTILITY", key: "heating", value: "CV gas", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 1 },
    { id: "feat_014", propertyId: "prop_001", category: "UTILITY", key: "wifi", value: "Glasvezel aanwezig", booleanValue: true, numericValue: null, verified: false, highlighted: false, displayOrder: 2 },
    { id: "feat_015", propertyId: "prop_001", category: "UTILITY", key: "alarm_system", value: "Ja", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 3 },

    // Accessibility
    { id: "feat_016", propertyId: "prop_001", category: "ACCESSIBILITY", key: "wheelchair_accessible", value: "Begane grond", booleanValue: true, numericValue: null, verified: true, highlighted: false, displayOrder: 0 },
    { id: "feat_017", propertyId: "prop_001", category: "ACCESSIBILITY", key: "public_transport", value: "CS 5 min lopen", booleanValue: true, numericValue: null, verified: false, highlighted: true, displayOrder: 1 },
  ],
  agency: {
    id: "agency_001",
    name: "Horeca Vastgoed Partners",
    slug: "horeca-vastgoed-partners",
    description: "Gespecialiseerd in horecavastgoed in de Randstad. Met meer dan 20 jaar ervaring helpen wij ondernemers aan de perfecte locatie.",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200",
    email: "info@horecavastgoedpartners.nl",
    phone: "+31 20 123 4567",
    website: "https://horecavastgoedpartners.nl",
    address: "Herengracht 500",
    city: "Amsterdam",
    postalCode: "1017 CB",
    province: "Noord-Holland",
    verified: true,
  },
  creator: {
    id: "user_001",
    name: "Jan de Vries",
    email: "jan@horecavastgoedpartners.nl",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    agentProfile: {
      id: "agent_001",
      userId: "user_001",
      agencyId: "agency_001",
      title: "Senior Makelaar",
      phone: "+31 6 1234 5678",
      phonePublic: true,
      bio: "Meer dan 15 jaar ervaring in horecavastgoed. Gespecialiseerd in restaurants en cafés in Amsterdam en omgeving.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      specializations: ["RESTAURANT", "CAFE", "BAR"],
      regions: ["Amsterdam", "Haarlem", "Utrecht"],
      languages: ["Nederlands", "Engels", "Duits"],
      verified: true,
      user: {
        id: "user_001",
        name: "Jan de Vries",
        email: "jan@horecavastgoedpartners.nl",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      },
    },
  },
};

// Mock similar properties
const MOCK_SIMILAR_PROPERTIES: Property[] = [
  {
    ...MOCK_PROPERTY,
    id: "prop_002",
    title: "Grand Café aan de Gracht",
    slug: "grand-cafe-gracht-amsterdam",
    shortDescription: "Karakteristiek grand café met prachtig uitzicht over de gracht",
    city: "Amsterdam",
    neighborhood: "Jordaan",
    rentPrice: 550000,
    surfaceTotal: 220,
    propertyType: "CAFE",
    viewCount: 562,
    images: [
      {
        id: "img_s001",
        propertyId: "prop_002",
        originalUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
        mediumUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
        largeUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200",
        type: "INTERIOR",
        caption: "Grand café interieur",
        altText: "Ruim café interieur met hoge ramen",
        order: 0,
        isPrimary: true,
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    ...MOCK_PROPERTY,
    id: "prop_003",
    title: "Trendy Restaurant De Pijp",
    slug: "trendy-restaurant-de-pijp",
    shortDescription: "Modern restaurant in de bruisende Pijp buurt",
    city: "Amsterdam",
    neighborhood: "De Pijp",
    rentPrice: 380000,
    surfaceTotal: 140,
    propertyType: "RESTAURANT",
    viewCount: 421,
    images: [
      {
        id: "img_s002",
        propertyId: "prop_003",
        originalUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
        mediumUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
        largeUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200",
        type: "INTERIOR",
        caption: "Modern restaurant interieur",
        altText: "Strak restaurant design met open keuken",
        order: 0,
        isPrimary: true,
        width: 1200,
        height: 800,
      },
    ],
  },
  {
    ...MOCK_PROPERTY,
    id: "prop_004",
    title: "Intiem Wijncafé Binnenstad",
    slug: "intiem-wijncafe-binnenstad",
    shortDescription: "Gezellig wijncafé op A-locatie in de binnenstad",
    city: "Amsterdam",
    neighborhood: "Centrum",
    rentPrice: 320000,
    surfaceTotal: 85,
    propertyType: "BAR",
    viewCount: 298,
    images: [
      {
        id: "img_s003",
        propertyId: "prop_004",
        originalUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200",
        thumbnailUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400",
        mediumUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800",
        largeUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200",
        type: "INTERIOR",
        caption: "Sfeervol wijncafé",
        altText: "Intiem wijncafé met houten interieur",
        order: 0,
        isPrimary: true,
        width: 1200,
        height: 800,
      },
    ],
  },
];

/**
 * Get property by slug (public, only ACTIVE status)
 * Also increments view count
 */
export async function getPropertyBySlug(
  slug: string
): Promise<ActionResult<Property>> {
  try {
    // TODO: Replace with Prisma query when models are ready
    // const property = await prisma.property.findUnique({
    //   where: { slug, status: "ACTIVE" },
    //   include: {
    //     images: { orderBy: { order: "asc" } },
    //     features: { orderBy: { displayOrder: "asc" } },
    //     agency: true,
    //     creator: {
    //       include: { agentProfile: true },
    //     },
    //   },
    // });

    // For now, use mock data
    if (slug === MOCK_PROPERTY.slug || slug === "demo") {
      return { success: true, data: MOCK_PROPERTY };
    }

    return { success: false, error: "Property not found" };
  } catch (error) {
    console.error("Error fetching property:", error);
    return { success: false, error: "Failed to fetch property" };
  }
}

/**
 * Get similar properties based on type, city, and price range
 */
export async function getSimilarProperties(
  propertyId: string,
  limit: number = 3
): Promise<ActionResult<Property[]>> {
  try {
    // TODO: Replace with actual Prisma query
    // const property = await prisma.property.findUnique({ where: { id: propertyId } });
    // const similar = await prisma.property.findMany({
    //   where: {
    //     id: { not: propertyId },
    //     status: "ACTIVE",
    //     OR: [
    //       { propertyType: property.propertyType },
    //       { city: property.city },
    //     ],
    //   },
    //   include: { images: { where: { isPrimary: true } } },
    //   take: limit,
    // });

    // Return mock similar properties
    return {
      success: true,
      data: MOCK_SIMILAR_PROPERTIES.slice(0, limit),
    };
  } catch (error) {
    console.error("Error fetching similar properties:", error);
    return { success: false, error: "Failed to fetch similar properties" };
  }
}

"use server";

import type { ActionResult } from "@/types/actions";
import type { Property, AgencyWithDetails } from "@/types/agency";

// ============================================================================
// Mock Data - Replace with Prisma queries when models are available
// ============================================================================

const mockAgencies: AgencyWithDetails[] = [
  {
    id: "agency-1",
    name: "Horecagrond Makelaars",
    slug: "horecagrond-makelaars",
    description:
      "Al meer dan 15 jaar de specialist in horecapanden in heel Nederland. Wij helpen ondernemers bij het vinden van de perfecte locatie voor hun horecadroom.",
    logo: "/images/agencies/horecagrond-logo.jpg",
    email: "info@horecagrond-makelaars.nl",
    phone: "+31 20 123 4567",
    website: "https://horecagrond-makelaars.nl",
    address: "Herengracht 123",
    city: "Amsterdam",
    postalCode: "1015 BA",
    province: "Noord-Holland",
    country: "Nederland",
    kvkNumber: "12345678",
    vatNumber: "NL123456789B01",
    verified: true,
    verifiedAt: new Date("2023-01-15"),
    plan: "ENTERPRISE",
    activeListings: 24,
    totalDeals: 156,
    createdAt: new Date("2020-03-01"),
    updatedAt: new Date("2024-01-15"),
    agents: [
      {
        id: "agent-1",
        userId: "user-1",
        agencyId: "agency-1",
        firstName: "Jan",
        lastName: "de Vries",
        email: "jan@horecagrond-makelaars.nl",
        phone: "+31 6 1234 5678",
        avatar: "/images/agents/jan-de-vries.jpg",
        bio: "Gespecialiseerd in restaurantpanden in de Randstad. Met 10 jaar ervaring help ik u graag aan de perfecte locatie.",
        specializations: ["Restaurants", "Cafés", "Hotels"],
        languages: ["Nederlands", "Engels", "Duits"],
        yearsExperience: 10,
        linkedIn: "https://linkedin.com/in/jandevries",
        twitter: null,
        verified: true,
        isActive: true,
        dealsCompleted: 89,
        rating: 4.8,
        reviewCount: 47,
        createdAt: new Date("2020-03-15"),
      },
      {
        id: "agent-2",
        userId: "user-2",
        agencyId: "agency-1",
        firstName: "Maria",
        lastName: "Jansen",
        email: "maria@horecagrond-makelaars.nl",
        phone: "+31 6 9876 5432",
        avatar: "/images/agents/maria-jansen.jpg",
        bio: "Expert in dark kitchens en fast food concepten. Ik help startende ondernemers bij het vinden van betaalbare locaties.",
        specializations: ["Dark Kitchens", "Fast Food", "Bakkerijen"],
        languages: ["Nederlands", "Engels", "Spaans"],
        yearsExperience: 6,
        linkedIn: "https://linkedin.com/in/mariajansen",
        twitter: "https://twitter.com/mariajansen",
        verified: true,
        isActive: true,
        dealsCompleted: 67,
        rating: 4.9,
        reviewCount: 34,
        createdAt: new Date("2021-06-01"),
      },
    ],
  },
];

const mockProperties: Property[] = [
  {
    id: "prop-1",
    title: "Karakteristiek Restaurant in de Jordaan",
    slug: "karakteristiek-restaurant-jordaan",
    shortDescription:
      "Prachtig hoekpand met authentieke details en terras aan de gracht.",
    description:
      "Dit karakteristieke restaurantpand bevindt zich op een toplocatie in de gezellige Jordaan. Met originele glas-in-loodramen, hoge plafonds en een ruim terras aan de gracht biedt dit pand de perfecte setting voor een sfeervolle horecaonderneming.",
    propertyType: "RESTAURANT",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 8500,
    salePrice: null,
    servicesCosts: 850,
    address: "Elandsgracht 45",
    city: "Amsterdam",
    postalCode: "1016 TR",
    province: "Noord-Holland",
    country: "Nederland",
    latitude: 52.3702,
    longitude: 4.8815,
    surfaceTotal: 180,
    surfaceCommercial: 120,
    seatingCapacity: 65,
    hasKitchen: true,
    hasTerrace: true,
    hasParking: false,
    hasBasement: true,
    images: [
      {
        id: "img-1",
        url: "/images/properties/jordaan-restaurant-1.jpg",
        alt: "Restaurant interieur met originele details",
        order: 0,
      },
      {
        id: "img-2",
        url: "/images/properties/jordaan-restaurant-2.jpg",
        alt: "Terras aan de gracht",
        order: 1,
      },
    ],
    agencyId: "agency-1",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
    publishedAt: new Date("2024-01-12"),
  },
  {
    id: "prop-2",
    title: "Modern Café op Bruisende Locatie",
    slug: "modern-cafe-bruisende-locatie",
    shortDescription: "Turn-key café met volledig ingerichte keuken.",
    description:
      "Dit moderne café is gelegen op een van de drukste winkelstraten van Rotterdam. Het pand is volledig ingericht en kan direct worden overgenomen. Ideaal voor een ondernemer die snel wil starten.",
    propertyType: "CAFE",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 5200,
    salePrice: null,
    servicesCosts: 520,
    address: "Lijnbaan 82",
    city: "Rotterdam",
    postalCode: "3012 EK",
    province: "Zuid-Holland",
    country: "Nederland",
    latitude: 51.9225,
    longitude: 4.4792,
    surfaceTotal: 95,
    surfaceCommercial: 75,
    seatingCapacity: 40,
    hasKitchen: true,
    hasTerrace: false,
    hasParking: true,
    hasBasement: false,
    images: [
      {
        id: "img-3",
        url: "/images/properties/rotterdam-cafe-1.jpg",
        alt: "Modern café interieur",
        order: 0,
      },
    ],
    agencyId: "agency-1",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-14"),
    publishedAt: new Date("2024-01-10"),
  },
  {
    id: "prop-3",
    title: "Dark Kitchen in Logistiek Gebied",
    slug: "dark-kitchen-logistiek-gebied",
    shortDescription:
      "Efficiënte dark kitchen met uitstekende bereikbaarheid.",
    description:
      "Strategisch gelegen dark kitchen met directe toegang tot de snelweg. Perfect voor bezorgconcepten met een groot bereik. De ruimte is volledig uitgerust met professionele keukenapparatuur.",
    propertyType: "DARK_KITCHEN",
    status: "ACTIVE",
    priceType: "RENT",
    rentPrice: 3200,
    salePrice: null,
    servicesCosts: 400,
    address: "Industrieweg 15",
    city: "Utrecht",
    postalCode: "3542 AD",
    province: "Utrecht",
    country: "Nederland",
    latitude: 52.0907,
    longitude: 5.1214,
    surfaceTotal: 120,
    surfaceCommercial: 100,
    seatingCapacity: 0,
    hasKitchen: true,
    hasTerrace: false,
    hasParking: true,
    hasBasement: false,
    images: [
      {
        id: "img-4",
        url: "/images/properties/utrecht-dark-kitchen-1.jpg",
        alt: "Professionele keuken setup",
        order: 0,
      },
    ],
    agencyId: "agency-1",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
    publishedAt: new Date("2024-01-06"),
  },
  {
    id: "prop-4",
    title: "Sfeervolle Bar in Hartje Centrum",
    slug: "sfeervolle-bar-hartje-centrum",
    shortDescription: "Gezellige bar met authentieke uitstraling.",
    description:
      "Deze karakteristieke bar in het centrum van Den Haag heeft een trouwe klantenkring en staat bekend om zijn gezellige sfeer. Inclusief complete inventaris en vergunningen.",
    propertyType: "BAR",
    status: "ACTIVE",
    priceType: "SALE",
    rentPrice: null,
    salePrice: 185000,
    servicesCosts: null,
    address: "Denneweg 88",
    city: "Den Haag",
    postalCode: "2514 CL",
    province: "Zuid-Holland",
    country: "Nederland",
    latitude: 52.0799,
    longitude: 4.3113,
    surfaceTotal: 85,
    surfaceCommercial: 70,
    seatingCapacity: 35,
    hasKitchen: false,
    hasTerrace: true,
    hasParking: false,
    hasBasement: true,
    images: [
      {
        id: "img-5",
        url: "/images/properties/denhaag-bar-1.jpg",
        alt: "Bar interieur",
        order: 0,
      },
    ],
    agencyId: "agency-1",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-11"),
    publishedAt: new Date("2024-01-04"),
  },
];

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Get agency by slug
 */
export async function getAgency(
  slug: string
): Promise<ActionResult<AgencyWithDetails>> {
  try {
    // TODO: Replace with Prisma query
    // const agency = await prisma.agency.findUnique({
    //   where: { slug },
    //   include: {
    //     agents: {
    //       where: { isActive: true },
    //       orderBy: { createdAt: 'asc' }
    //     }
    //   }
    // });

    const agency = mockAgencies.find((a) => a.slug === slug);

    if (!agency) {
      return {
        success: false,
        error: "Agency not found",
      };
    }

    return {
      success: true,
      data: agency,
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
    // TODO: Replace with Prisma query
    // const properties = await prisma.property.findMany({
    //   where: {
    //     agencyId,
    //     ...(options?.status === 'ACTIVE' ? { status: 'ACTIVE' } : {})
    //   },
    //   include: { images: { orderBy: { order: 'asc' } } },
    //   orderBy: { publishedAt: 'desc' },
    //   take: options?.limit
    // });

    let properties = mockProperties.filter((p) => p.agencyId === agencyId);

    if (options?.status === "ACTIVE") {
      properties = properties.filter((p) => p.status === "ACTIVE");
    }

    if (options?.limit) {
      properties = properties.slice(0, options.limit);
    }

    return {
      success: true,
      data: properties,
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
 * Get all agency slugs for static generation
 */
export async function getAllAgencySlugs(): Promise<string[]> {
  // TODO: Replace with Prisma query
  // const agencies = await prisma.agency.findMany({
  //   where: { verified: true },
  //   select: { slug: true }
  // });
  // return agencies.map(a => a.slug);

  return mockAgencies.filter((a) => a.verified).map((a) => a.slug);
}

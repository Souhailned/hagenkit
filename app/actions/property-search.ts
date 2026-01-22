"use server";

import {
  type PropertyFilter,
  type PropertyType,
  type PriceType,
  type SortBy,
  type SortOrder,
  listPropertiesSchema,
} from "@/lib/validations/property";

// ActionResult type for consistent returns
type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Property type for search results (matches future Prisma model)
export interface PropertySearchResult {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  propertyType: PropertyType;
  priceType: PriceType;
  rentPrice: number | null;
  salePrice: number | null;
  city: string;
  province: string | null;
  address: string;
  surfaceTotal: number;
  hasTerrace: boolean;
  hasKitchen: boolean;
  hasParking: boolean;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  publishedAt: Date | null;
  viewCount: number;
  savedCount: number;
  primaryImage: {
    thumbnailUrl: string;
    altText: string | null;
  } | null;
  agency: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface SearchPropertiesResult {
  items: PropertySearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Input type for search
export interface SearchPropertiesInput {
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  filters?: PropertyFilter;
  search?: string;
}

// Mock data for development (will be replaced with real Prisma queries)
const MOCK_PROPERTIES: PropertySearchResult[] = [
  {
    id: "prop_1",
    slug: "restaurant-centrum-amsterdam",
    title: "Karakteristiek Restaurant in Hartje Amsterdam",
    shortDescription: "Prachtig restaurant op A-locatie in de Jordaan. Volledig ingericht met professionele keuken en terrasvergunning.",
    propertyType: "RESTAURANT",
    priceType: "RENT",
    rentPrice: 650000, // in cents
    salePrice: null,
    city: "Amsterdam",
    province: "Noord-Holland",
    address: "Prinsengracht 123",
    surfaceTotal: 180,
    hasTerrace: true,
    hasKitchen: true,
    hasParking: false,
    seatingCapacityInside: 65,
    seatingCapacityOutside: 30,
    publishedAt: new Date("2024-01-15"),
    viewCount: 342,
    savedCount: 28,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      altText: "Restaurant interieur Amsterdam",
    },
    agency: {
      id: "agency_1",
      name: "Horeca Makelaars Amsterdam",
      slug: "horeca-makelaars-amsterdam",
    },
  },
  {
    id: "prop_2",
    slug: "cafe-rotterdam-centrum",
    title: "Sfeervolle Café-Bar met Woning",
    shortDescription: "Unieke kans! Draaiend café met bovenwoning op toplocatie in Rotterdam. Volledige inventaris en trouwe klantenkring.",
    propertyType: "BAR",
    priceType: "SALE",
    rentPrice: null,
    salePrice: 42500000, // in cents (€425.000)
    city: "Rotterdam",
    province: "Zuid-Holland",
    address: "Witte de Withstraat 45",
    surfaceTotal: 145,
    hasTerrace: true,
    hasKitchen: true,
    hasParking: false,
    seatingCapacityInside: 50,
    seatingCapacityOutside: 20,
    publishedAt: new Date("2024-01-18"),
    viewCount: 156,
    savedCount: 12,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=400&h=300&fit=crop",
      altText: "Café bar Rotterdam",
    },
    agency: {
      id: "agency_2",
      name: "Zuid-Holland Horeca",
      slug: "zuid-holland-horeca",
    },
  },
  {
    id: "prop_3",
    slug: "dark-kitchen-utrecht",
    title: "Moderne Dark Kitchen met Bezorgdepot",
    shortDescription: "Volledig uitgeruste dark kitchen op industrieterrein. Ideaal voor meerdere delivery-concepten met laadperron.",
    propertyType: "DARK_KITCHEN",
    priceType: "RENT",
    rentPrice: 350000,
    salePrice: null,
    city: "Utrecht",
    province: "Utrecht",
    address: "Lage Weide 78",
    surfaceTotal: 320,
    hasTerrace: false,
    hasKitchen: true,
    hasParking: true,
    seatingCapacityInside: null,
    seatingCapacityOutside: null,
    publishedAt: new Date("2024-01-20"),
    viewCount: 89,
    savedCount: 7,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop",
      altText: "Dark kitchen Utrecht",
    },
    agency: {
      id: "agency_3",
      name: "Utrecht Bedrijfsruimte",
      slug: "utrecht-bedrijfsruimte",
    },
  },
  {
    id: "prop_4",
    slug: "hotel-boutique-den-haag",
    title: "Boutique Hotel 3-Sterren met Restaurant",
    shortDescription: "Charmant boutique hotel in monumentaal pand. 22 kamers, ontbijtzaal en eigen restaurant op straathoek.",
    propertyType: "HOTEL",
    priceType: "RENT_OR_SALE",
    rentPrice: 1250000,
    salePrice: 185000000,
    city: "Den Haag",
    province: "Zuid-Holland",
    address: "Lange Voorhout 12",
    surfaceTotal: 850,
    hasTerrace: true,
    hasKitchen: true,
    hasParking: false,
    seatingCapacityInside: 45,
    seatingCapacityOutside: 15,
    publishedAt: new Date("2024-01-10"),
    viewCount: 421,
    savedCount: 35,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      altText: "Boutique hotel Den Haag",
    },
    agency: {
      id: "agency_1",
      name: "Horeca Makelaars Amsterdam",
      slug: "horeca-makelaars-amsterdam",
    },
  },
  {
    id: "prop_5",
    slug: "cafe-eindhoven-strijp",
    title: "Trendy Café op Strijp-S",
    shortDescription: "Hip café in creatieve wijk Strijp-S. Industrieel karakter met hoge plafonds en groot terras.",
    propertyType: "CAFE",
    priceType: "RENT",
    rentPrice: 425000,
    salePrice: null,
    city: "Eindhoven",
    province: "Noord-Brabant",
    address: "Torenallee 22",
    surfaceTotal: 200,
    hasTerrace: true,
    hasKitchen: true,
    hasParking: true,
    seatingCapacityInside: 80,
    seatingCapacityOutside: 60,
    publishedAt: new Date("2024-01-22"),
    viewCount: 67,
    savedCount: 5,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      altText: "Café Strijp-S Eindhoven",
    },
    agency: {
      id: "agency_4",
      name: "Brabant Horeca Makelaars",
      slug: "brabant-horeca-makelaars",
    },
  },
  {
    id: "prop_6",
    slug: "bakkerij-groningen-centrum",
    title: "Ambachtelijke Bakkerij met Lunchroom",
    shortDescription: "Gevestigde bakkerij met trouwe klantenkring. Volledige bakkerijinrichting en gezellige lunchruimte.",
    propertyType: "BAKERY",
    priceType: "SALE",
    rentPrice: null,
    salePrice: 28500000,
    city: "Groningen",
    province: "Groningen",
    address: "Zwanestraat 8",
    surfaceTotal: 140,
    hasTerrace: false,
    hasKitchen: true,
    hasParking: false,
    seatingCapacityInside: 25,
    seatingCapacityOutside: null,
    publishedAt: new Date("2024-01-12"),
    viewCount: 134,
    savedCount: 11,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
      altText: "Bakkerij Groningen",
    },
    agency: {
      id: "agency_5",
      name: "Noord Makelaardij",
      slug: "noord-makelaardij",
    },
  },
  {
    id: "prop_7",
    slug: "nachtclub-amsterdam-rembrandtplein",
    title: "Exclusieve Nachtclub op Rembrandtplein",
    shortDescription: "Bekende nachtclub op iconische locatie. Twee verdiepingen, professioneel geluidssysteem en alle vergunningen.",
    propertyType: "NIGHTCLUB",
    priceType: "RENT",
    rentPrice: 1500000,
    salePrice: null,
    city: "Amsterdam",
    province: "Noord-Holland",
    address: "Rembrandtplein 28",
    surfaceTotal: 450,
    hasTerrace: false,
    hasKitchen: true,
    hasParking: false,
    seatingCapacityInside: null,
    seatingCapacityOutside: null,
    publishedAt: new Date("2024-01-08"),
    viewCount: 567,
    savedCount: 42,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&h=300&fit=crop",
      altText: "Nachtclub Amsterdam",
    },
    agency: {
      id: "agency_1",
      name: "Horeca Makelaars Amsterdam",
      slug: "horeca-makelaars-amsterdam",
    },
  },
  {
    id: "prop_8",
    slug: "food-court-rotterdam-markthal",
    title: "Food Court Unit in de Markthal",
    shortDescription: "Unieke kans in Rotterdam's Markthal. Kant-en-klare unit met veel passanten.",
    propertyType: "FOOD_COURT",
    priceType: "RENT",
    rentPrice: 550000,
    salePrice: null,
    city: "Rotterdam",
    province: "Zuid-Holland",
    address: "Markthal 45",
    surfaceTotal: 45,
    hasTerrace: false,
    hasKitchen: true,
    hasParking: false,
    seatingCapacityInside: 12,
    seatingCapacityOutside: null,
    publishedAt: new Date("2024-01-19"),
    viewCount: 234,
    savedCount: 19,
    primaryImage: {
      thumbnailUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop",
      altText: "Food court Rotterdam",
    },
    agency: {
      id: "agency_2",
      name: "Zuid-Holland Horeca",
      slug: "zuid-holland-horeca",
    },
  },
];

/**
 * Search properties with filters, pagination, and sorting
 * This action is used on the public listings page with SSR
 */
export async function searchProperties(
  input: SearchPropertiesInput
): Promise<ActionResult<SearchPropertiesResult>> {
  try {
    // Validate input
    const validated = listPropertiesSchema.parse({
      page: input.page ?? 1,
      limit: input.limit ?? 20,
      sortBy: input.sortBy ?? "publishedAt",
      sortOrder: input.sortOrder ?? "desc",
      filters: input.filters,
      search: input.search,
    });

    // Apply filters to mock data
    let filteredProperties = [...MOCK_PROPERTIES];

    // Search filter
    if (validated.search) {
      const searchLower = validated.search.toLowerCase();
      filteredProperties = filteredProperties.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.shortDescription?.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply property filters
    if (validated.filters) {
      const { filters } = validated;

      // City filter
      if (filters.cities && filters.cities.length > 0) {
        filteredProperties = filteredProperties.filter((p) =>
          filters.cities!.some(
            (city) => p.city.toLowerCase() === city.toLowerCase()
          )
        );
      }

      // Province filter
      if (filters.provinces && filters.provinces.length > 0) {
        filteredProperties = filteredProperties.filter(
          (p) =>
            p.province &&
            filters.provinces!.some(
              (prov) => p.province!.toLowerCase() === prov.toLowerCase()
            )
        );
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        filteredProperties = filteredProperties.filter((p) =>
          filters.propertyTypes!.includes(p.propertyType)
        );
      }

      // Price type filter
      if (filters.priceType) {
        filteredProperties = filteredProperties.filter(
          (p) =>
            p.priceType === filters.priceType ||
            p.priceType === "RENT_OR_SALE"
        );
      }

      // Price range filter (using rent or sale price based on priceType)
      if (filters.priceMin !== undefined) {
        filteredProperties = filteredProperties.filter((p) => {
          const price = p.rentPrice ?? p.salePrice ?? 0;
          return price >= filters.priceMin!;
        });
      }
      if (filters.priceMax !== undefined) {
        filteredProperties = filteredProperties.filter((p) => {
          const price = p.rentPrice ?? p.salePrice ?? Infinity;
          return price <= filters.priceMax!;
        });
      }

      // Surface filter
      if (filters.surfaceMin !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.surfaceTotal >= filters.surfaceMin!
        );
      }
      if (filters.surfaceMax !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.surfaceTotal <= filters.surfaceMax!
        );
      }

      // Feature filters
      if (filters.hasTerrace !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.hasTerrace === filters.hasTerrace
        );
      }
      if (filters.hasKitchen !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.hasKitchen === filters.hasKitchen
        );
      }
      if (filters.hasParking !== undefined) {
        filteredProperties = filteredProperties.filter(
          (p) => p.hasParking === filters.hasParking
        );
      }
    }

    // Sort
    filteredProperties.sort((a, b) => {
      let comparison = 0;
      switch (validated.sortBy) {
        case "publishedAt":
          comparison =
            (a.publishedAt?.getTime() ?? 0) - (b.publishedAt?.getTime() ?? 0);
          break;
        case "rentPrice":
          comparison = (a.rentPrice ?? 0) - (b.rentPrice ?? 0);
          break;
        case "salePrice":
          comparison = (a.salePrice ?? 0) - (b.salePrice ?? 0);
          break;
        case "surfaceTotal":
          comparison = a.surfaceTotal - b.surfaceTotal;
          break;
        case "viewCount":
          comparison = a.viewCount - b.viewCount;
          break;
      }
      return validated.sortOrder === "desc" ? -comparison : comparison;
    });

    // Pagination
    const total = filteredProperties.length;
    const totalPages = Math.ceil(total / validated.limit);
    const start = (validated.page - 1) * validated.limit;
    const items = filteredProperties.slice(start, start + validated.limit);

    return {
      success: true,
      data: {
        items,
        total,
        page: validated.page,
        limit: validated.limit,
        totalPages,
        hasMore: validated.page < totalPages,
      },
    };
  } catch (error) {
    console.error("Error searching properties:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Er ging iets mis bij het zoeken",
    };
  }
}

/**
 * Get featured properties for homepage
 */
export async function getFeaturedProperties(
  limit: number = 4
): Promise<ActionResult<PropertySearchResult[]>> {
  try {
    // In real implementation, filter by featured=true and featuredUntil > now
    const featured = MOCK_PROPERTIES.slice(0, limit);
    return { success: true, data: featured };
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return {
      success: false,
      error: "Kon uitgelichte panden niet laden",
    };
  }
}

/**
 * Get recent properties
 */
export async function getRecentProperties(
  limit: number = 6
): Promise<ActionResult<PropertySearchResult[]>> {
  try {
    const recent = [...MOCK_PROPERTIES]
      .sort(
        (a, b) =>
          (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
      )
      .slice(0, limit);
    return { success: true, data: recent };
  } catch (error) {
    console.error("Error fetching recent properties:", error);
    return {
      success: false,
      error: "Kon recente panden niet laden",
    };
  }
}

/**
 * Get unique cities from properties for filter options
 */
export async function getPropertyCities(): Promise<ActionResult<string[]>> {
  try {
    const cities = [...new Set(MOCK_PROPERTIES.map((p) => p.city))].sort();
    return { success: true, data: cities };
  } catch {
    return { success: false, error: "Kon steden niet laden" };
  }
}

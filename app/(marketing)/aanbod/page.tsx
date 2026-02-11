import type { Metadata } from "next";
import {
  PropertyType,
  PropertyFeature,
  PropertyTypeLabels,
  SortOption,
} from "@/types/property";
import { searchProperties } from "@/app/actions/properties";
import { AanbodClient } from "@/components/aanbod/aanbod-client";
import { RecentViews } from "@/components/property/recent-views";

export const metadata: Metadata = {
  title: "Horecapanden | Vind jouw perfecte horecalocatie",
  description:
    "Zoek en vind horecapanden in heel Nederland. Restaurants, cafés, bars, hotels en meer. Filter op locatie, type, prijs en oppervlakte.",
  openGraph: {
    title: "Horecapanden | Vind jouw perfecte horecalocatie",
    description:
      "Zoek en vind horecapanden in heel Nederland. Restaurants, cafés, bars, hotels en meer.",
    type: "website",
  },
};

// Force dynamic rendering for this page since it uses search params
export const dynamic = "force-dynamic";

interface AanbodPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Parse URL search params into filter values
function parseSearchParams(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const getString = (key: string): string | undefined => {
    const value = searchParams[key];
    return typeof value === "string" ? value : undefined;
  };

  const getNumber = (key: string): number | undefined => {
    const value = getString(key);
    if (!value) return undefined;
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  };

  const getArray = (key: string): string[] => {
    const value = getString(key);
    return value ? value.split(",").filter(Boolean) : [];
  };

  return {
    cities: getArray("cities"),
    types: getArray("types") as PropertyType[],
    priceMin: getNumber("priceMin"),
    priceMax: getNumber("priceMax"),
    areaMin: getNumber("areaMin"),
    areaMax: getNumber("areaMax"),
    features: getArray("features") as PropertyFeature[],
    sortBy: (getString("sortBy") || "newest") as SortOption,
    page: getNumber("page") || 1,
    view: (getString("view") || "list") as "list" | "map",
  };
}

export default async function AanbodPage({ searchParams }: AanbodPageProps) {
  const resolvedParams = await searchParams;
  const filters = parseSearchParams(resolvedParams);

  // Fetch initial data server-side
  const result = await searchProperties({
    cities: filters.cities.length > 0 ? filters.cities : undefined,
    types: filters.types.length > 0 ? filters.types : undefined,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    areaMin: filters.areaMin,
    areaMax: filters.areaMax,
    features: filters.features.length > 0 ? filters.features : undefined,
    sortBy: filters.sortBy,
    page: filters.page,
    pageSize: 12,
  });

  if (!result.success || !result.data) {
    throw new Error("Failed to load properties");
  }

  // Get all unique cities from the database for filter options
  // TODO: Move this to a dedicated server action
  const allCities = [
    "Amsterdam",
    "Rotterdam",
    "Utrecht",
    "Den Haag",
    "Eindhoven",
    "Tilburg",
    "Groningen",
    "Almere",
    "Breda",
    "Nijmegen",
  ];

  // Property types with labels
  const types = Object.entries(PropertyTypeLabels).map(([value, label]) => ({
    value: value as PropertyType,
    label,
  }));

  // Property features
  const features: { value: PropertyFeature; label: string }[] = [
    { value: "TERRACE", label: "Terras" },
    { value: "PARKING", label: "Parkeren" },
    { value: "KITCHEN", label: "Professionele keuken" },
    { value: "LIVING_QUARTERS", label: "Woonruimte" },
    { value: "ALCOHOL_LICENSE", label: "Drank- & Horecavergunning" },
    { value: "VENTILATION", label: "Ventilatie" },
    { value: "CELLAR", label: "Kelder" },
    { value: "DELIVERY_OPTION", label: "Bezorgmogelijkheid" },
    { value: "OUTDOOR_SEATING", label: "Buitenzitplaatsen" },
    { value: "WHEELCHAIR_ACCESSIBLE", label: "Rolstoeltoegankelijk" },
  ];

  // Price and area ranges (based on typical Dutch horeca properties)
  const filterOptions = {
    cities: allCities,
    types,
    features,
    priceRange: { min: 0, max: 50000 },
    areaRange: { min: 0, max: 1000 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Ontdek uw</span>
              <span className="mt-1 block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                ideale horecapand
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Van sfeervolle restaurants tot bruisende cafés. Vind het perfecte
              pand voor uw horecadroom in heel Nederland.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Recent views */}
      <RecentViews />

      {/* Main content */}
      <section className="container mx-auto px-4 py-10 lg:py-12">
        <AanbodClient
          filterOptions={filterOptions}
          initialResults={result.data}
          initialFilters={filters}
        />
      </section>
    </div>
  );
}

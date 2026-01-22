import { Suspense } from "react";
import type { Metadata } from "next";
import { searchProperties, getPropertyCities } from "@/app/actions/property-search";
import { PropertyListingsClient } from "@/components/property/property-listings-client";
import { PropertyListingsSkeleton } from "@/components/property/property-skeleton";
import type { PropertyFilter, PropertyType, SortBy, SortOrder } from "@/lib/validations/property";

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

// Parse URL search params into filter object
function parseSearchParams(params: { [key: string]: string | string[] | undefined }): {
  filters: PropertyFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number;
} {
  const filters: PropertyFilter = {};

  // Cities
  const cities = params.cities;
  if (typeof cities === "string" && cities) {
    filters.cities = cities.split(",").filter(Boolean);
  }

  // Property types
  const types = params.types;
  if (typeof types === "string" && types) {
    filters.propertyTypes = types.split(",").filter(Boolean) as PropertyType[];
  }

  // Price range
  const priceMin = params.priceMin;
  const priceMax = params.priceMax;
  if (typeof priceMin === "string" && priceMin) {
    filters.priceMin = parseInt(priceMin, 10);
  }
  if (typeof priceMax === "string" && priceMax) {
    filters.priceMax = parseInt(priceMax, 10);
  }

  // Surface range
  const surfaceMin = params.surfaceMin;
  const surfaceMax = params.surfaceMax;
  if (typeof surfaceMin === "string" && surfaceMin) {
    filters.surfaceMin = parseInt(surfaceMin, 10);
  }
  if (typeof surfaceMax === "string" && surfaceMax) {
    filters.surfaceMax = parseInt(surfaceMax, 10);
  }

  // Boolean features
  if (params.terrace === "1") filters.hasTerrace = true;
  if (params.kitchen === "1") filters.hasKitchen = true;
  if (params.parking === "1") filters.hasParking = true;
  if (params.storage === "1") filters.hasStorage = true;
  if (params.basement === "1") filters.hasBasement = true;

  // Features
  const features = params.features;
  if (typeof features === "string" && features) {
    filters.features = features.split(",").filter(Boolean);
  }

  // Sorting
  const sortBy = (params.sortBy as SortBy) || "publishedAt";
  const sortOrder = (params.sortOrder as SortOrder) || "desc";

  // Page
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  return { filters, sortBy, sortOrder, page };
}

async function AanbodContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { filters, sortBy, sortOrder, page } = parseSearchParams(searchParams);

  // Fetch initial data with SSR
  const [propertiesResult, citiesResult] = await Promise.all([
    searchProperties({
      filters,
      sortBy,
      sortOrder,
      page,
      limit: 12,
    }),
    getPropertyCities(),
  ]);

  if (!propertiesResult.success || !propertiesResult.data) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Er ging iets mis bij het laden van de panden. Probeer het later opnieuw.
        </p>
      </div>
    );
  }

  return (
    <PropertyListingsClient
      initialData={propertiesResult.data}
      availableCities={citiesResult.data ?? undefined}
    />
  );
}

export default async function AanbodPage({ searchParams }: AanbodPageProps) {
  const params = await searchParams;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Horecapanden
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Vind de perfecte horecalocatie voor jouw concept. Van restaurant tot café, van hotel
              tot dark kitchen &mdash; ontdek het complete aanbod in heel Nederland.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<PropertyListingsSkeleton />}>
            <AanbodContent searchParams={params} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

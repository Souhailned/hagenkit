import { Suspense } from "react";
import { Metadata } from "next";
import { searchProperties, getFilterOptions } from "@/app/actions/properties";
import { PropertyType, PropertyFeature, SortOption } from "@/types/property";
import { AanbodClient } from "@/components/aanbod/aanbod-client";
import { PropertyGridSkeleton } from "@/components/aanbod";

export const metadata: Metadata = {
  title: "Aanbod | Horecapanden",
  description:
    "Bekijk ons uitgebreide aanbod aan horecapanden. Van restaurants en cafés tot hotels en snackbars. Vind uw ideale horecapand.",
  openGraph: {
    title: "Aanbod | Horecapanden",
    description:
      "Bekijk ons uitgebreide aanbod aan horecapanden. Van restaurants en cafés tot hotels en snackbars.",
    type: "website",
  },
};

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
    sortBy: (getString("sortBy") as SortOption) || "newest",
    page: getNumber("page") || 1,
  };
}

async function AanbodContent({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filters = parseSearchParams(searchParams);

  // Fetch filter options and initial results in parallel
  const [filterOptionsResult, searchResult] = await Promise.all([
    getFilterOptions(),
    searchProperties({
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
    }),
  ]);

  if (!filterOptionsResult.success || !filterOptionsResult.data) {
    throw new Error("Failed to load filter options");
  }

  if (!searchResult.success || !searchResult.data) {
    throw new Error("Failed to load properties");
  }

  return (
    <AanbodClient
      filterOptions={filterOptionsResult.data}
      initialResults={searchResult.data}
      initialFilters={filters}
    />
  );
}

export default async function AanbodPage({ searchParams }: AanbodPageProps) {
  const resolvedParams = await searchParams;

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

      {/* Main content */}
      <section className="container mx-auto px-4 py-10 lg:py-12">
        <Suspense
          fallback={
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar skeleton */}
              <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-24 rounded-xl border border-border/60 bg-card p-4">
                  <div className="h-8 w-24 animate-pulse rounded bg-muted mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded bg-muted"
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Results skeleton */}
              <div className="flex-1">
                <div className="mb-6 flex justify-between">
                  <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-10 w-44 animate-pulse rounded bg-muted" />
                </div>
                <PropertyGridSkeleton count={6} />
              </div>
            </div>
          }
        >
          <AanbodContent searchParams={resolvedParams} />
        </Suspense>
      </section>
    </div>
  );
}

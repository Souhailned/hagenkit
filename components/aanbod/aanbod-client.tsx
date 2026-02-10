"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  PropertyType,
  PropertyFeature,
  SortOption,
  SearchPropertiesResult,
} from "@/types/property";
import { FilterSidebar } from "./filter-sidebar";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import { ActiveFilters } from "./active-filters";
import { SortDropdown } from "./sort-dropdown";
import { PropertyGrid, PropertyGridSkeleton } from "./property-grid";
import { EmptyState } from "./empty-state";
import { ResultsPagination } from "./results-pagination";
import { ViewToggle } from "./view-toggle";
import { searchProperties } from "@/app/actions/properties";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/search/search-bar";

const PropertyMap = dynamic(
  () => import("./property-map").then((mod) => mod.PropertyMap),
  {
    loading: () => (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-border/60 bg-muted/50">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Kaart laden...</span>
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface AanbodClientProps {
  filterOptions: {
    cities: string[];
    types: { value: PropertyType; label: string }[];
    features: { value: PropertyFeature; label: string }[];
    priceRange: { min: number; max: number };
    areaRange: { min: number; max: number };
  };
  initialResults: SearchPropertiesResult;
  initialFilters: {
    cities: string[];
    types: PropertyType[];
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    features: PropertyFeature[];
    sortBy: SortOption;
    page: number;
    view: "list" | "map";
  };
}

export function AanbodClient({
  filterOptions,
  initialResults,
  initialFilters,
}: AanbodClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter state
  const [selectedCities, setSelectedCities] = React.useState<string[]>(
    initialFilters.cities
  );
  const [selectedTypes, setSelectedTypes] = React.useState<PropertyType[]>(
    initialFilters.types
  );
  const [priceMin, setPriceMin] = React.useState<number | undefined>(
    initialFilters.priceMin
  );
  const [priceMax, setPriceMax] = React.useState<number | undefined>(
    initialFilters.priceMax
  );
  const [areaMin, setAreaMin] = React.useState<number | undefined>(
    initialFilters.areaMin
  );
  const [areaMax, setAreaMax] = React.useState<number | undefined>(
    initialFilters.areaMax
  );
  const [selectedFeatures, setSelectedFeatures] = React.useState<
    PropertyFeature[]
  >(initialFilters.features);
  const [sortBy, setSortBy] = React.useState<SortOption>(initialFilters.sortBy);
  const [page, setPage] = React.useState(initialFilters.page);
  const [view, setView] = React.useState<"list" | "map">(initialFilters.view);

  // Trigger map resize when switching to map view
  React.useEffect(() => {
    if (view === "map") {
      // MapLibre needs a resize trigger when container becomes visible
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, [view]);

  // Results state
  const [results, setResults] =
    React.useState<SearchPropertiesResult>(initialResults);
  const [isLoading, setIsLoading] = React.useState(false);

  // Count active filters
  const activeFilterCount =
    selectedCities.length +
    selectedTypes.length +
    (priceMin !== undefined ? 1 : 0) +
    (priceMax !== undefined ? 1 : 0) +
    (areaMin !== undefined ? 1 : 0) +
    (areaMax !== undefined ? 1 : 0) +
    selectedFeatures.length;

  // Build URL params from current filters
  const buildUrlParams = React.useCallback(() => {
    const params = new URLSearchParams();

    if (selectedCities.length > 0) {
      params.set("cities", selectedCities.join(","));
    }
    if (selectedTypes.length > 0) {
      params.set("types", selectedTypes.join(","));
    }
    if (priceMin !== undefined) {
      params.set("priceMin", priceMin.toString());
    }
    if (priceMax !== undefined) {
      params.set("priceMax", priceMax.toString());
    }
    if (areaMin !== undefined) {
      params.set("areaMin", areaMin.toString());
    }
    if (areaMax !== undefined) {
      params.set("areaMax", areaMax.toString());
    }
    if (selectedFeatures.length > 0) {
      params.set("features", selectedFeatures.join(","));
    }
    if (sortBy !== "newest") {
      params.set("sortBy", sortBy);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    if (view === "map") {
      params.set("view", "map");
    }

    return params;
  }, [
    selectedCities,
    selectedTypes,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    selectedFeatures,
    sortBy,
    page,
    view,
  ]);

  // Fetch results when filters change
  const fetchResults = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await searchProperties({
        cities: selectedCities.length > 0 ? selectedCities : undefined,
        types:
          selectedTypes.length > 0 ? (selectedTypes as PropertyType[]) : undefined,
        priceMin,
        priceMax,
        areaMin,
        areaMax,
        features:
          selectedFeatures.length > 0
            ? (selectedFeatures as PropertyFeature[])
            : undefined,
        sortBy: sortBy as SortOption,
        page,
        pageSize: 12,
      });

      if (result.success && result.data) {
        setResults(result.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedCities,
    selectedTypes,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    selectedFeatures,
    sortBy,
    page,
  ]);

  // Update URL when filters change (debounced)
  React.useEffect(() => {
    const params = buildUrlParams();
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    // Use replace to avoid polluting browser history
    router.replace(newUrl, { scroll: false });
  }, [buildUrlParams, pathname, router]);

  // Fetch results when filters change
  React.useEffect(() => {
    // Skip initial fetch since we have SSR data
    const currentParams = buildUrlParams().toString();
    const initialParams = new URLSearchParams(searchParams.toString()).toString();

    if (currentParams !== initialParams) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCities,
    selectedTypes,
    priceMin,
    priceMax,
    areaMin,
    areaMax,
    selectedFeatures,
    sortBy,
    page,
  ]);

  // Reset page when filters change (except page itself)
  const resetPage = () => {
    if (page !== 1) {
      setPage(1);
    }
  };

  // Filter change handlers
  const handleCitiesChange = (cities: string[]) => {
    setSelectedCities(cities);
    resetPage();
  };

  const handleTypesChange = (types: PropertyType[]) => {
    setSelectedTypes(types);
    resetPage();
  };

  const handlePriceMinChange = (value: number | undefined) => {
    setPriceMin(value);
    resetPage();
  };

  const handlePriceMaxChange = (value: number | undefined) => {
    setPriceMax(value);
    resetPage();
  };

  const handleAreaMinChange = (value: number | undefined) => {
    setAreaMin(value);
    resetPage();
  };

  const handleAreaMaxChange = (value: number | undefined) => {
    setAreaMax(value);
    resetPage();
  };

  const handleFeaturesChange = (features: PropertyFeature[]) => {
    setSelectedFeatures(features);
    resetPage();
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    resetPage();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset all filters
  const handleReset = () => {
    setSelectedCities([]);
    setSelectedTypes([]);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setAreaMin(undefined);
    setAreaMax(undefined);
    setSelectedFeatures([]);
    setSortBy("newest");
    setPage(1);
  };

  // Remove individual filter handlers
  const handleRemoveCity = (city: string) => {
    setSelectedCities(selectedCities.filter((c) => c !== city));
    resetPage();
  };

  const handleRemoveType = (type: PropertyType) => {
    setSelectedTypes(selectedTypes.filter((t) => t !== type));
    resetPage();
  };

  const handleRemoveFeature = (feature: PropertyFeature) => {
    setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    resetPage();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <SearchBar size="lg" className="max-w-2xl" />

      <div className="flex flex-col lg:flex-row gap-8">
      {/* Desktop sidebar */}
      <FilterSidebar
        className="hidden lg:block w-72 shrink-0"
        filterOptions={filterOptions}
        selectedCities={selectedCities}
        selectedTypes={selectedTypes}
        priceMin={priceMin}
        priceMax={priceMax}
        areaMin={areaMin}
        areaMax={areaMax}
        selectedFeatures={selectedFeatures}
        onCitiesChange={handleCitiesChange}
        onTypesChange={handleTypesChange}
        onPriceMinChange={handlePriceMinChange}
        onPriceMaxChange={handlePriceMaxChange}
        onAreaMinChange={handleAreaMinChange}
        onAreaMaxChange={handleAreaMaxChange}
        onFeaturesChange={handleFeaturesChange}
        onReset={handleReset}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Results header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile filter button */}
            <div className="lg:hidden">
              <MobileFilterSheet
                filterOptions={filterOptions}
                selectedCities={selectedCities}
                selectedTypes={selectedTypes}
                priceMin={priceMin}
                priceMax={priceMax}
                areaMin={areaMin}
                areaMax={areaMax}
                selectedFeatures={selectedFeatures}
                onCitiesChange={handleCitiesChange}
                onTypesChange={handleTypesChange}
                onPriceMinChange={handlePriceMinChange}
                onPriceMaxChange={handlePriceMaxChange}
                onAreaMinChange={handleAreaMinChange}
                onAreaMaxChange={handleAreaMaxChange}
                onFeaturesChange={handleFeaturesChange}
                onReset={handleReset}
                activeFilterCount={activeFilterCount}
              />
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {results.total}
              </span>{" "}
              {results.total === 1 ? "pand" : "panden"} gevonden
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <ViewToggle view={view} onViewChange={setView} />

            {/* Sort dropdown */}
            <SortDropdown value={sortBy} onChange={handleSortChange} />
          </div>
        </div>

        {/* Active filters chips */}
        <div className="mb-6">
          <ActiveFilters
            cities={selectedCities}
            types={selectedTypes}
            priceMin={priceMin}
            priceMax={priceMax}
            areaMin={areaMin}
            areaMax={areaMax}
            features={selectedFeatures}
            onRemoveCity={handleRemoveCity}
            onRemoveType={handleRemoveType}
            onRemovePriceMin={() => {
              setPriceMin(undefined);
              resetPage();
            }}
            onRemovePriceMax={() => {
              setPriceMax(undefined);
              resetPage();
            }}
            onRemoveAreaMin={() => {
              setAreaMin(undefined);
              resetPage();
            }}
            onRemoveAreaMax={() => {
              setAreaMax(undefined);
              resetPage();
            }}
            onRemoveFeature={handleRemoveFeature}
            onClearAll={handleReset}
          />
        </div>

        {/* Results */}
        <div
          className={cn(
            "w-full transition-opacity duration-200",
            view === "map" ? "block" : "hidden"
          )}
        >
          <PropertyMap
            properties={results.properties}
            className="h-[calc(100vh-280px)] min-h-[500px] w-full"
          />
        </div>
        <div
          className={cn(
            "transition-opacity duration-200",
            view === "list" ? "block" : "hidden"
          )}
        >
          {isLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : results.properties.length > 0 ? (
            <>
              <PropertyGrid properties={results.properties} />
              <ResultsPagination
                currentPage={results.page}
                pageCount={results.pageCount}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyState
              hasFilters={activeFilterCount > 0}
              onClearFilters={handleReset}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

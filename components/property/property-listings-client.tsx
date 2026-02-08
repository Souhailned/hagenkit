"use client";

import { useCallback, useMemo, useTransition, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Property } from "@/types/agency";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PropertyCard } from "./property-card";
import { PropertyFilters } from "./property-filters";
import { ActiveFilters } from "./active-filters";
import { MobileFiltersSheet } from "./mobile-filters-sheet";
import { PropertyGridSkeleton } from "./property-skeleton";
import { PropertyEmptyState } from "./property-empty-state";
import {
  searchProperties,
  type SearchPropertiesResult,
} from "@/app/actions/property-search";
import {
  type PropertyFilter,
  type PropertyType,
  type SortBy,
  type SortOrder,
} from "@/lib/validations/property";

interface PropertyListingsClientProps {
  initialData: SearchPropertiesResult;
  availableCities?: string[];
}

const SORT_OPTIONS: Array<{ label: string; sortBy: SortBy; sortOrder: SortOrder }> = [
  { label: "Nieuwste", sortBy: "publishedAt", sortOrder: "desc" },
  { label: "Oudste", sortBy: "publishedAt", sortOrder: "asc" },
  { label: "Prijs laag-hoog", sortBy: "rentPrice", sortOrder: "asc" },
  { label: "Prijs hoog-laag", sortBy: "rentPrice", sortOrder: "desc" },
  { label: "Oppervlakte klein-groot", sortBy: "surfaceTotal", sortOrder: "asc" },
  { label: "Oppervlakte groot-klein", sortBy: "surfaceTotal", sortOrder: "desc" },
  { label: "Meest bekeken", sortBy: "viewCount", sortOrder: "desc" },
];

// Helper to parse filters from URL search params
function parseFiltersFromParams(params: URLSearchParams): PropertyFilter {
  const filters: PropertyFilter = {};

  // Cities
  const cities = params.get("cities");
  if (cities) {
    filters.cities = cities.split(",").filter(Boolean);
  }

  // Property types
  const types = params.get("types");
  if (types) {
    filters.propertyTypes = types.split(",").filter(Boolean) as PropertyType[];
  }

  // Price range
  const priceMin = params.get("priceMin");
  const priceMax = params.get("priceMax");
  if (priceMin) filters.priceMin = parseInt(priceMin, 10);
  if (priceMax) filters.priceMax = parseInt(priceMax, 10);

  // Surface range
  const surfaceMin = params.get("surfaceMin");
  const surfaceMax = params.get("surfaceMax");
  if (surfaceMin) filters.surfaceMin = parseInt(surfaceMin, 10);
  if (surfaceMax) filters.surfaceMax = parseInt(surfaceMax, 10);

  // Boolean features
  if (params.get("terrace") === "1") filters.hasTerrace = true;
  if (params.get("kitchen") === "1") filters.hasKitchen = true;
  if (params.get("parking") === "1") filters.hasParking = true;
  if (params.get("storage") === "1") filters.hasStorage = true;
  if (params.get("basement") === "1") filters.hasBasement = true;

  // Features
  const features = params.get("features");
  if (features) {
    filters.features = features.split(",").filter(Boolean);
  }

  return filters;
}

// Helper to serialize filters to URL search params
function serializeFiltersToParams(
  filters: PropertyFilter,
  sortBy: SortBy,
  sortOrder: SortOrder,
  page: number
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.cities?.length) {
    params.set("cities", filters.cities.join(","));
  }
  if (filters.propertyTypes?.length) {
    params.set("types", filters.propertyTypes.join(","));
  }
  if (filters.priceMin !== undefined) {
    params.set("priceMin", filters.priceMin.toString());
  }
  if (filters.priceMax !== undefined) {
    params.set("priceMax", filters.priceMax.toString());
  }
  if (filters.surfaceMin !== undefined) {
    params.set("surfaceMin", filters.surfaceMin.toString());
  }
  if (filters.surfaceMax !== undefined) {
    params.set("surfaceMax", filters.surfaceMax.toString());
  }
  if (filters.hasTerrace) params.set("terrace", "1");
  if (filters.hasKitchen) params.set("kitchen", "1");
  if (filters.hasParking) params.set("parking", "1");
  if (filters.hasStorage) params.set("storage", "1");
  if (filters.hasBasement) params.set("basement", "1");
  if (filters.features?.length) {
    params.set("features", filters.features.join(","));
  }

  // Sorting (only if not default)
  if (sortBy !== "publishedAt" || sortOrder !== "desc") {
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
  }

  // Page (only if not first page)
  if (page > 1) {
    params.set("page", page.toString());
  }

  return params;
}

// Count active filters
function countActiveFilters(filters: PropertyFilter): number {
  let count = 0;
  if (filters.cities?.length) count += filters.cities.length;
  if (filters.propertyTypes?.length) count += filters.propertyTypes.length;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) count += 1;
  if (filters.surfaceMin !== undefined || filters.surfaceMax !== undefined) count += 1;
  if (filters.hasTerrace) count += 1;
  if (filters.hasKitchen) count += 1;
  if (filters.hasParking) count += 1;
  if (filters.hasStorage) count += 1;
  if (filters.hasBasement) count += 1;
  if (filters.features?.length) count += filters.features.length;
  return count;
}

export function PropertyListingsClient({
  initialData,
  availableCities,
}: PropertyListingsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse initial state from URL
  const initialFilters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams]
  );
  const initialSortBy = (searchParams.get("sortBy") as SortBy) || "publishedAt";
  const initialSortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [filters, setFilters] = useState<PropertyFilter>(initialFilters);
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<SearchPropertiesResult>(initialData);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const currentSortLabel = useMemo(() => {
    const option = SORT_OPTIONS.find(
      (o) => o.sortBy === sortBy && o.sortOrder === sortOrder
    );
    return option?.label || "Nieuwste";
  }, [sortBy, sortOrder]);

  // Update URL and fetch data
  const updateSearch = useCallback(
    (
      newFilters: PropertyFilter,
      newSortBy: SortBy,
      newSortOrder: SortOrder,
      newPage: number
    ) => {
      const params = serializeFiltersToParams(newFilters, newSortBy, newSortOrder, newPage);
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Update URL without scroll
      router.push(newUrl, { scroll: false });

      // Fetch new data
      startTransition(async () => {
        const result = await searchProperties({
          page: newPage,
          sortBy: newSortBy,
          sortOrder: newSortOrder,
          filters: newFilters,
        });
        if (result.success && result.data) {
          setData(result.data);
        }
      });
    },
    [pathname, router]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: PropertyFilter) => {
      setFilters(newFilters);
      setPage(1); // Reset to first page on filter change
      updateSearch(newFilters, sortBy, sortOrder, 1);
    },
    [sortBy, sortOrder, updateSearch]
  );

  // Handle sort changes
  const handleSortChange = useCallback(
    (newSortBy: SortBy, newSortOrder: SortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
      setPage(1);
      updateSearch(filters, newSortBy, newSortOrder, 1);
    },
    [filters, updateSearch]
  );

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateSearch(filters, sortBy, sortOrder, newPage);
      // Scroll to top of results
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, sortBy, sortOrder, updateSearch]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    handleFilterChange({});
  }, [handleFilterChange]);

  // Generate pagination items
  const paginationItems = useMemo(() => {
    const { totalPages } = data;
    const items: Array<"prev" | "next" | "ellipsis" | number> = [];

    if (totalPages <= 7) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Show first, last, current and neighbors with ellipsis
      items.push(1);

      if (page > 3) {
        items.push("ellipsis");
      }

      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        items.push(i);
      }

      if (page < totalPages - 2) {
        items.push("ellipsis");
      }

      items.push(totalPages);
    }

    return items;
  }, [data, page]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Desktop Filters Sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24">
          <PropertyFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            availableCities={availableCities}
            className="max-h-[calc(100vh-8rem)] overflow-y-auto pb-8"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        {/* Results Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile filters button */}
            <MobileFiltersSheet
              filters={filters}
              onFilterChange={handleFilterChange}
              activeFilterCount={activeFilterCount}
              availableCities={availableCities}
            />

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data.total}</span>{" "}
              {data.total === 1 ? "pand" : "panden"} gevonden
            </p>
          </div>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="size-4" />
                {currentSortLabel}
                <ChevronDown className="ml-1 size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={`${option.sortBy}-${option.sortOrder}`}
                  onClick={() => handleSortChange(option.sortBy, option.sortOrder)}
                  className={
                    sortBy === option.sortBy && sortOrder === option.sortOrder
                      ? "bg-muted"
                      : ""
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          className="mb-6"
        />

        {/* Loading State */}
        {isPending && <PropertyGridSkeleton count={6} />}

        {/* Results Grid */}
        {!isPending && data.items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.items.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property as unknown as Property}
                priority={index < 3}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isPending && data.items.length === 0 && (
          <PropertyEmptyState
            hasFilters={activeFilterCount > 0}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Pagination */}
        {!isPending && data.totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(item as number);
                      }}
                      isActive={page === item}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < data.totalPages) handlePageChange(page + 1);
                  }}
                  className={
                    page >= data.totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

export default PropertyListingsClient;

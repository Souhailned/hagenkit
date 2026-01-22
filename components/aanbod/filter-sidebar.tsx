"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import { PropertyType, PropertyFeature } from "@/types/property";
import {
  LocationFilter,
  TypeFilter,
  PriceFilter,
  AreaFilter,
  FeaturesFilter,
} from "./filters";

interface FilterSidebarProps {
  filterOptions: {
    cities: string[];
    types: { value: PropertyType; label: string }[];
    features: { value: PropertyFeature; label: string }[];
    priceRange: { min: number; max: number };
    areaRange: { min: number; max: number };
  };
  // Current filter values
  selectedCities: string[];
  selectedTypes: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  selectedFeatures: PropertyFeature[];
  // Change handlers
  onCitiesChange: (cities: string[]) => void;
  onTypesChange: (types: PropertyType[]) => void;
  onPriceMinChange: (value: number | undefined) => void;
  onPriceMaxChange: (value: number | undefined) => void;
  onAreaMinChange: (value: number | undefined) => void;
  onAreaMaxChange: (value: number | undefined) => void;
  onFeaturesChange: (features: PropertyFeature[]) => void;
  onReset: () => void;
  className?: string;
}

export function FilterSidebar({
  filterOptions,
  selectedCities,
  selectedTypes,
  priceMin,
  priceMax,
  areaMin,
  areaMax,
  selectedFeatures,
  onCitiesChange,
  onTypesChange,
  onPriceMinChange,
  onPriceMaxChange,
  onAreaMinChange,
  onAreaMaxChange,
  onFeaturesChange,
  onReset,
  className,
}: FilterSidebarProps) {
  const hasFilters =
    selectedCities.length > 0 ||
    selectedTypes.length > 0 ||
    priceMin !== undefined ||
    priceMax !== undefined ||
    areaMin !== undefined ||
    areaMax !== undefined ||
    selectedFeatures.length > 0;

  return (
    <aside className={className}>
      <div className="sticky top-24">
        <div className="rounded-xl border border-border/60 bg-card">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <h2 className="font-semibold tracking-tight">Filters</h2>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>

          {/* Filter sections */}
          <ScrollArea className="h-[calc(100vh-16rem)] max-h-[600px]">
            <div className="space-y-6 p-4">
              {/* Location filter */}
              <LocationFilter
                cities={filterOptions.cities}
                selectedCities={selectedCities}
                onChange={onCitiesChange}
              />

              <Separator />

              {/* Type filter */}
              <TypeFilter
                types={filterOptions.types}
                selectedTypes={selectedTypes}
                onChange={onTypesChange}
              />

              <Separator />

              {/* Price filter */}
              <PriceFilter
                priceRange={filterOptions.priceRange}
                minPrice={priceMin}
                maxPrice={priceMax}
                onMinChange={onPriceMinChange}
                onMaxChange={onPriceMaxChange}
              />

              <Separator />

              {/* Area filter */}
              <AreaFilter
                areaRange={filterOptions.areaRange}
                minArea={areaMin}
                maxArea={areaMax}
                onMinChange={onAreaMinChange}
                onMaxChange={onAreaMaxChange}
              />

              <Separator />

              {/* Features filter */}
              <FeaturesFilter
                features={filterOptions.features}
                selectedFeatures={selectedFeatures}
                onChange={onFeaturesChange}
              />
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
}

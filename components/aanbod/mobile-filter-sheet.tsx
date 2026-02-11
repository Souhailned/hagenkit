"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { PropertyType, PropertyFeature } from "@/types/property";
import {
  LocationFilter,
  TypeFilter,
  StatusFilter,
  PublishedFilter,
  PriceFilter,
  AreaFilter,
  FeaturesFilter,
} from "./filters";

interface MobileFilterSheetProps {
  filterOptions: {
    cities: string[];
    types: { value: PropertyType; label: string }[];
    features: { value: PropertyFeature; label: string }[];
    priceRange: { min: number; max: number };
    areaRange: { min: number; max: number };
  };
  selectedCities: string[];
  selectedTypes: PropertyType[];
  selectedStatuses: string[];
  publishedWithinDays?: number;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  selectedFeatures: PropertyFeature[];
  onCitiesChange: (cities: string[]) => void;
  onTypesChange: (types: PropertyType[]) => void;
  onStatusesChange: (statuses: string[]) => void;
  onPublishedChange: (days: number | undefined) => void;
  onPriceMinChange: (value: number | undefined) => void;
  onPriceMaxChange: (value: number | undefined) => void;
  onAreaMinChange: (value: number | undefined) => void;
  onAreaMaxChange: (value: number | undefined) => void;
  onFeaturesChange: (features: PropertyFeature[]) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export function MobileFilterSheet({
  filterOptions,
  selectedCities,
  selectedTypes,
  selectedStatuses,
  publishedWithinDays,
  priceMin,
  priceMax,
  areaMin,
  areaMax,
  selectedFeatures,
  onCitiesChange,
  onTypesChange,
  onStatusesChange,
  onPublishedChange,
  onPriceMinChange,
  onPriceMaxChange,
  onAreaMinChange,
  onAreaMaxChange,
  onFeaturesChange,
  onReset,
  activeFilterCount,
}: MobileFilterSheetProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b border-border/60 p-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset alles
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="space-y-6 p-4">
            <LocationFilter
              cities={filterOptions.cities}
              selectedCities={selectedCities}
              onChange={onCitiesChange}
            />
            <Separator />
            <TypeFilter
              types={filterOptions.types}
              selectedTypes={selectedTypes}
              onChange={onTypesChange}
            />
            <Separator />
            <StatusFilter
              selectedStatuses={selectedStatuses}
              onChange={onStatusesChange}
            />
            <Separator />
            <PublishedFilter
              publishedWithinDays={publishedWithinDays}
              onChange={onPublishedChange}
            />
            <Separator />
            <PriceFilter
              priceRange={filterOptions.priceRange}
              minPrice={priceMin}
              maxPrice={priceMax}
              onMinChange={onPriceMinChange}
              onMaxChange={onPriceMaxChange}
            />
            <Separator />
            <AreaFilter
              areaRange={filterOptions.areaRange}
              minArea={areaMin}
              maxArea={areaMax}
              onMinChange={onAreaMinChange}
              onMaxChange={onAreaMaxChange}
            />
            <Separator />
            <FeaturesFilter
              features={filterOptions.features}
              selectedFeatures={selectedFeatures}
              onChange={onFeaturesChange}
            />
          </div>
        </ScrollArea>

        <SheetFooter className="border-t border-border/60 p-4">
          <Button onClick={() => setOpen(false)} className="w-full gap-2">
            <Check className="h-4 w-4" />
            Bekijk resultaten
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

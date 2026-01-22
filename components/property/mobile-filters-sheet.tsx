"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { PropertyFilters } from "./property-filters";
import type { PropertyFilter } from "@/lib/validations/property";

interface MobileFiltersSheetProps {
  filters: PropertyFilter;
  onFilterChange: (filters: PropertyFilter) => void;
  activeFilterCount: number;
  availableCities?: string[];
}

export function MobileFiltersSheet({
  filters,
  onFilterChange,
  activeFilterCount,
  availableCities,
}: MobileFiltersSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<PropertyFilter>(filters);

  // Reset temp filters when sheet opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setTempFilters(filters);
      }
      setIsOpen(open);
    },
    [filters]
  );

  // Apply filters and close sheet
  const handleApply = useCallback(() => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  }, [tempFilters, onFilterChange]);

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setTempFilters({});
  }, []);

  // Count active temp filters
  const getTempFilterCount = (f: PropertyFilter): number => {
    let count = 0;
    if (f.cities?.length) count += f.cities.length;
    if (f.propertyTypes?.length) count += f.propertyTypes.length;
    if (f.priceMin !== undefined || f.priceMax !== undefined) count += 1;
    if (f.surfaceMin !== undefined || f.surfaceMax !== undefined) count += 1;
    if (f.hasTerrace) count += 1;
    if (f.hasKitchen) count += 1;
    if (f.hasParking) count += 1;
    if (f.hasStorage) count += 1;
    if (f.hasBasement) count += 1;
    if (f.features?.length) count += f.features.length;
    return count;
  };

  const tempFilterCount = getTempFilterCount(tempFilters);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 size-5 rounded-full p-0 text-[10px] font-semibold"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {tempFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs text-muted-foreground"
              >
                Alles wissen
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <PropertyFilters
            filters={tempFilters}
            onFilterChange={setTempFilters}
            availableCities={availableCities}
          />
        </div>

        <SheetFooter className="border-t px-4 py-4">
          <div className="flex w-full gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Annuleren
              </Button>
            </SheetClose>
            <Button onClick={handleApply} className="flex-1">
              Toon resultaten
              {tempFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-primary-foreground/20 text-primary-foreground"
                >
                  {tempFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default MobileFiltersSheet;

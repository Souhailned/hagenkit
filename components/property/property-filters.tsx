"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, RotateCcw } from "lucide-react";
import {
  type PropertyType,
  type PropertyFilter,
  PROPERTY_TYPE_LABELS,
  DUTCH_CITIES,
  POPULAR_FEATURES,
} from "@/lib/validations/property";
import { cn } from "@/lib/utils";

interface PropertyFiltersProps {
  filters: PropertyFilter;
  onFilterChange: (filters: PropertyFilter) => void;
  availableCities?: string[];
  className?: string;
}

const PROPERTY_TYPES = Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][];

export function PropertyFilters({
  filters,
  onFilterChange,
  availableCities = [...DUTCH_CITIES],
  className,
}: PropertyFiltersProps) {
  const updateFilters = useCallback(
    (updates: Partial<PropertyFilter>) => {
      onFilterChange({ ...filters, ...updates });
    },
    [filters, onFilterChange]
  );

  const toggleCity = useCallback(
    (city: string) => {
      const currentCities = filters.cities ?? [];
      const newCities = currentCities.includes(city)
        ? currentCities.filter((c) => c !== city)
        : [...currentCities, city];
      updateFilters({ cities: newCities.length > 0 ? newCities : undefined });
    },
    [filters.cities, updateFilters]
  );

  const togglePropertyType = useCallback(
    (type: PropertyType) => {
      const currentTypes = filters.propertyTypes ?? [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      updateFilters({ propertyTypes: newTypes.length > 0 ? newTypes : undefined });
    },
    [filters.propertyTypes, updateFilters]
  );

  const toggleFeature = useCallback(
    (feature: string) => {
      const currentFeatures = filters.features ?? [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter((f) => f !== feature)
        : [...currentFeatures, feature];
      updateFilters({ features: newFeatures.length > 0 ? newFeatures : undefined });
    },
    [filters.features, updateFilters]
  );

  const handlePriceChange = useCallback(
    (type: "min" | "max", value: string) => {
      const numValue = value ? parseInt(value, 10) * 100 : undefined; // Convert to cents
      updateFilters({
        [type === "min" ? "priceMin" : "priceMax"]: numValue,
      });
    },
    [updateFilters]
  );

  const handleSurfaceChange = useCallback(
    (type: "min" | "max", value: string) => {
      const numValue = value ? parseInt(value, 10) : undefined;
      updateFilters({
        [type === "min" ? "surfaceMin" : "surfaceMax"]: numValue,
      });
    },
    [updateFilters]
  );

  const clearAllFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const hasFilters =
    (filters.cities && filters.cities.length > 0) ||
    (filters.propertyTypes && filters.propertyTypes.length > 0) ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.surfaceMin !== undefined ||
    filters.surfaceMax !== undefined ||
    filters.hasTerrace !== undefined ||
    filters.hasKitchen !== undefined ||
    filters.hasParking !== undefined ||
    (filters.features && filters.features.length > 0);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header with clear button */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 size-3" />
            Wis alles
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-6">
          {/* Location / Cities */}
          <FilterSection title="Locatie">
            <div className="flex flex-wrap gap-2">
              {availableCities.slice(0, 12).map((city) => {
                const isSelected = filters.cities?.includes(city);
                return (
                  <Badge
                    key={city}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => toggleCity(city)}
                  >
                    {city}
                    {isSelected && <X className="ml-1 size-3" />}
                  </Badge>
                );
              })}
            </div>
          </FilterSection>

          <Separator />

          {/* Property Type */}
          <FilterSection title="Type">
            <div className="grid gap-2">
              {PROPERTY_TYPES.map(([type, label]) => {
                const isChecked = filters.propertyTypes?.includes(type) ?? false;
                return (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => togglePropertyType(type)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          <Separator />

          {/* Price Range */}
          <FilterSection title="Prijs">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="priceMin" className="text-xs text-muted-foreground">
                    Minimum
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      &euro;
                    </span>
                    <Input
                      id="priceMin"
                      type="number"
                      placeholder="0"
                      className="pl-7"
                      value={filters.priceMin ? filters.priceMin / 100 : ""}
                      onChange={(e) => handlePriceChange("min", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priceMax" className="text-xs text-muted-foreground">
                    Maximum
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      &euro;
                    </span>
                    <Input
                      id="priceMax"
                      type="number"
                      placeholder="Onbeperkt"
                      className="pl-7"
                      value={filters.priceMax ? filters.priceMax / 100 : ""}
                      onChange={(e) => handlePriceChange("max", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Huurprijzen zijn per maand excl. BTW
              </p>
            </div>
          </FilterSection>

          <Separator />

          {/* Surface Range */}
          <FilterSection title="Oppervlakte">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="surfaceMin" className="text-xs text-muted-foreground">
                    Minimum
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="surfaceMin"
                      type="number"
                      placeholder="0"
                      value={filters.surfaceMin ?? ""}
                      onChange={(e) => handleSurfaceChange("min", e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      m&sup2;
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="surfaceMax" className="text-xs text-muted-foreground">
                    Maximum
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="surfaceMax"
                      type="number"
                      placeholder="Onbeperkt"
                      value={filters.surfaceMax ?? ""}
                      onChange={(e) => handleSurfaceChange("max", e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      m&sup2;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Features */}
          <FilterSection title="Kenmerken">
            <div className="space-y-3">
              {/* Quick toggles */}
              <div className="grid gap-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50">
                  <Checkbox
                    checked={filters.hasTerrace ?? false}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasTerrace: checked === true ? true : undefined })
                    }
                  />
                  <span className="text-sm">Terras</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50">
                  <Checkbox
                    checked={filters.hasKitchen ?? false}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasKitchen: checked === true ? true : undefined })
                    }
                  />
                  <span className="text-sm">Keuken</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50">
                  <Checkbox
                    checked={filters.hasParking ?? false}
                    onCheckedChange={(checked) =>
                      updateFilters({ hasParking: checked === true ? true : undefined })
                    }
                  />
                  <span className="text-sm">Parkeren</span>
                </label>
              </div>

              {/* Popular features */}
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Populaire voorzieningen
                </p>
                <div className="grid gap-2">
                  {POPULAR_FEATURES.map((feature) => {
                    const isChecked = filters.features?.includes(feature.key) ?? false;
                    return (
                      <label
                        key={feature.key}
                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleFeature(feature.key)}
                        />
                        <span className="text-sm">{feature.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </FilterSection>
        </div>
      </ScrollArea>
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </div>
  );
}

export default PropertyFilters;

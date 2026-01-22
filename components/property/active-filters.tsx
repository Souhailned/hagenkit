"use client";

import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type PropertyFilter,
  PROPERTY_TYPE_LABELS,
  POPULAR_FEATURES,
} from "@/lib/validations/property";
import { cn } from "@/lib/utils";

interface ActiveFiltersProps {
  filters: PropertyFilter;
  onFilterChange: (filters: PropertyFilter) => void;
  className?: string;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ActiveFilters({ filters, onFilterChange, className }: ActiveFiltersProps) {
  const chips: Array<{ label: string; onRemove: () => void }> = [];

  // City chips
  if (filters.cities && filters.cities.length > 0) {
    filters.cities.forEach((city) => {
      chips.push({
        label: city,
        onRemove: () => {
          const newCities = filters.cities!.filter((c) => c !== city);
          onFilterChange({
            ...filters,
            cities: newCities.length > 0 ? newCities : undefined,
          });
        },
      });
    });
  }

  // Property type chips
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    filters.propertyTypes.forEach((type) => {
      chips.push({
        label: PROPERTY_TYPE_LABELS[type],
        onRemove: () => {
          const newTypes = filters.propertyTypes!.filter((t) => t !== type);
          onFilterChange({
            ...filters,
            propertyTypes: newTypes.length > 0 ? newTypes : undefined,
          });
        },
      });
    });
  }

  // Price range chips
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    let priceLabel = "";
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      priceLabel = `${formatPrice(filters.priceMin)} - ${formatPrice(filters.priceMax)}`;
    } else if (filters.priceMin !== undefined) {
      priceLabel = `Vanaf ${formatPrice(filters.priceMin)}`;
    } else if (filters.priceMax !== undefined) {
      priceLabel = `Tot ${formatPrice(filters.priceMax)}`;
    }
    chips.push({
      label: priceLabel,
      onRemove: () => {
        onFilterChange({
          ...filters,
          priceMin: undefined,
          priceMax: undefined,
        });
      },
    });
  }

  // Surface range chips
  if (filters.surfaceMin !== undefined || filters.surfaceMax !== undefined) {
    let surfaceLabel = "";
    if (filters.surfaceMin !== undefined && filters.surfaceMax !== undefined) {
      surfaceLabel = `${filters.surfaceMin} - ${filters.surfaceMax} m\u00B2`;
    } else if (filters.surfaceMin !== undefined) {
      surfaceLabel = `Vanaf ${filters.surfaceMin} m\u00B2`;
    } else if (filters.surfaceMax !== undefined) {
      surfaceLabel = `Tot ${filters.surfaceMax} m\u00B2`;
    }
    chips.push({
      label: surfaceLabel,
      onRemove: () => {
        onFilterChange({
          ...filters,
          surfaceMin: undefined,
          surfaceMax: undefined,
        });
      },
    });
  }

  // Feature chips
  if (filters.hasTerrace) {
    chips.push({
      label: "Terras",
      onRemove: () => onFilterChange({ ...filters, hasTerrace: undefined }),
    });
  }
  if (filters.hasKitchen) {
    chips.push({
      label: "Keuken",
      onRemove: () => onFilterChange({ ...filters, hasKitchen: undefined }),
    });
  }
  if (filters.hasParking) {
    chips.push({
      label: "Parkeren",
      onRemove: () => onFilterChange({ ...filters, hasParking: undefined }),
    });
  }
  if (filters.hasStorage) {
    chips.push({
      label: "Opslag",
      onRemove: () => onFilterChange({ ...filters, hasStorage: undefined }),
    });
  }
  if (filters.hasBasement) {
    chips.push({
      label: "Kelder",
      onRemove: () => onFilterChange({ ...filters, hasBasement: undefined }),
    });
  }

  // Custom feature chips
  if (filters.features && filters.features.length > 0) {
    filters.features.forEach((featureKey) => {
      const feature = POPULAR_FEATURES.find((f) => f.key === featureKey);
      chips.push({
        label: feature?.label ?? featureKey,
        onRemove: () => {
          const newFeatures = filters.features!.filter((f) => f !== featureKey);
          onFilterChange({
            ...filters,
            features: newFeatures.length > 0 ? newFeatures : undefined,
          });
        },
      });
    });
  }

  if (chips.length === 0) {
    return null;
  }

  const clearAll = () => {
    onFilterChange({});
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground">Actieve filters:</span>

      {chips.map((chip, index) => (
        <Badge
          key={`${chip.label}-${index}`}
          variant="secondary"
          className="group cursor-pointer gap-1 pr-1 transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={chip.onRemove}
        >
          {chip.label}
          <span className="ml-0.5 flex size-4 items-center justify-center rounded-full transition-colors group-hover:bg-destructive/20">
            <X className="size-3" />
          </span>
        </Badge>
      ))}

      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-1 size-3" />
          Wis alles
        </Button>
      )}
    </div>
  );
}

export default ActiveFilters;

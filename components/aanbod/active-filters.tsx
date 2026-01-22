"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PropertyType,
  PropertyTypeLabels,
  PropertyFeature,
  PropertyFeatureLabels,
} from "@/types/property";

interface ActiveFiltersProps {
  cities: string[];
  types: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  features: PropertyFeature[];
  onRemoveCity: (city: string) => void;
  onRemoveType: (type: PropertyType) => void;
  onRemovePriceMin: () => void;
  onRemovePriceMax: () => void;
  onRemoveAreaMin: () => void;
  onRemoveAreaMax: () => void;
  onRemoveFeature: (feature: PropertyFeature) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  cities,
  types,
  priceMin,
  priceMax,
  areaMin,
  areaMax,
  features,
  onRemoveCity,
  onRemoveType,
  onRemovePriceMin,
  onRemovePriceMax,
  onRemoveAreaMin,
  onRemoveAreaMax,
  onRemoveFeature,
  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters =
    cities.length > 0 ||
    types.length > 0 ||
    priceMin !== undefined ||
    priceMax !== undefined ||
    areaMin !== undefined ||
    areaMax !== undefined ||
    features.length > 0;

  if (!hasFilters) return null;

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${Math.round(value / 1000)}K`;
    }
    return `€${value}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Actieve filters:</span>

      {/* City filters */}
      {cities.map((city) => (
        <FilterChip key={`city-${city}`} onRemove={() => onRemoveCity(city)}>
          {city}
        </FilterChip>
      ))}

      {/* Type filters */}
      {types.map((type) => (
        <FilterChip key={`type-${type}`} onRemove={() => onRemoveType(type)}>
          {PropertyTypeLabels[type]}
        </FilterChip>
      ))}

      {/* Price filters */}
      {priceMin !== undefined && (
        <FilterChip onRemove={onRemovePriceMin}>
          Min. {formatPrice(priceMin)}
        </FilterChip>
      )}
      {priceMax !== undefined && (
        <FilterChip onRemove={onRemovePriceMax}>
          Max. {formatPrice(priceMax)}
        </FilterChip>
      )}

      {/* Area filters */}
      {areaMin !== undefined && (
        <FilterChip onRemove={onRemoveAreaMin}>Min. {areaMin} m²</FilterChip>
      )}
      {areaMax !== undefined && (
        <FilterChip onRemove={onRemoveAreaMax}>Max. {areaMax} m²</FilterChip>
      )}

      {/* Feature filters */}
      {features.map((feature) => (
        <FilterChip
          key={`feature-${feature}`}
          onRemove={() => onRemoveFeature(feature)}
        >
          {PropertyFeatureLabels[feature]}
        </FilterChip>
      ))}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Wis alles
      </Button>
    </div>
  );
}

interface FilterChipProps {
  children: React.ReactNode;
  onRemove: () => void;
}

function FilterChip({ children, onRemove }: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 pr-1 font-normal transition-colors hover:bg-secondary/80"
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
        aria-label={`Verwijder filter ${children}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

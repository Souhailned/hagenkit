"use client";

import { Property } from "@/types/property";
import { PropertyCard, PropertyCardSkeleton } from "./property-card";

interface PropertyGridProps {
  properties: Property[];
}

export function PropertyGrid({ properties }: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          priority={index < 6}
        />
      ))}
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Property, PropertyTypeLabels, PropertyFeatureLabels, PriceType } from "@/types/property";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Maximize2,
  Tag,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";

/**
 * Helper to get effective price based on priceType
 */
function getEffectivePrice(property: Property): number {
  switch (property.priceType) {
    case "RENT":
      return property.rentPrice || 0;
    case "SALE":
      return property.salePrice || 0;
    case "RENT_OR_SALE":
      return property.rentPrice || property.salePrice || 0;
    default:
      return 0;
  }
}

interface PropertyCardProps {
  property: Property;
  className?: string;
  priority?: boolean;
  isFavorited?: boolean;
}

export function PropertyCard({ property, className, priority = false, isFavorited = false }: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(getEffectivePrice(property) / 100); // Convert cents to euros

  const priceLabel = property.priceType === "RENT" || property.priceType === "RENT_OR_SALE" ? "/maand" : "";

  return (
    <Link
      href={`/aanbod/${property.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-xl bg-card",
        "border border-border/60 transition-all duration-500 ease-out",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-1",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.images[0] ? (
          <Image
            src={property.images[0].thumbnailUrl || property.images[0].originalUrl}
            alt={property.images[0].altText || property.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">Geen afbeelding</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {property.isNew && (
            <Badge
              className="bg-primary text-primary-foreground border-0 shadow-lg backdrop-blur-sm"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Nieuw
            </Badge>
          )}
          {property.isFeatured && (
            <Badge
              variant="secondary"
              className="border-0 bg-white/90 text-foreground shadow-lg backdrop-blur-sm"
            >
              Uitgelicht
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            propertyId={property.id}
            initialFavorited={isFavorited}
            size="sm"
          />
        </div>

        {/* Property type badge */}
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="outline"
            className="border-white/30 bg-black/40 text-white backdrop-blur-sm"
          >
            {PropertyTypeLabels[property.propertyType]}
          </Badge>
        </div>

        {/* Hover arrow */}
        <div
          className={cn(
            "absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center",
            "rounded-full bg-white shadow-lg",
            "translate-y-4 opacity-0 transition-all duration-300",
            "group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <ArrowUpRight className="h-5 w-5 text-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground leading-tight tracking-tight line-clamp-2 min-h-[2.5rem]">
          {property.title}
        </h3>

        {/* Location */}
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {property.address}, {property.city}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Maximize2 className="h-4 w-4" />
            <span>{property.surfaceTotal} m²</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="capitalize">{property.priceType}</span>
          </div>
        </div>

        {/* Features preview */}
        {property.features && property.features.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {property.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {PropertyFeatureLabels[feature]}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price + Agency */}
        <div className="mt-4 border-t border-border/50 pt-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {formattedPrice}
              </span>
              <span className="text-sm text-muted-foreground">{priceLabel}</span>
            </div>
            <span
              className={cn(
                "text-sm font-medium text-primary transition-colors",
                "group-hover:underline"
              )}
            >
              Bekijk details
            </span>
          </div>
          {property.agency && (
            <p className="mt-1.5 text-xs text-muted-foreground truncate">
              via {property.agency.name}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Loading skeleton for property cards
 */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] animate-pulse bg-muted" />

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-5 w-1/2 animate-pulse rounded bg-muted" />

        {/* Location */}
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />

        {/* Stats */}
        <div className="mt-4 flex gap-4">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>

        {/* Features */}
        <div className="mt-3 flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline justify-between border-t border-border/50 pt-4">
          <div className="h-7 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Maximize2, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PropertyCard as PropertyCardType } from "@/types/property";
import {
  formatPrice,
  formatSurface,
  getPropertyTypeLabel,
  getPriceTypeLabel,
} from "@/types/property";

interface PropertyCardProps {
  property: PropertyCardType;
  onSave?: (propertyId: string) => void;
  className?: string;
  priority?: boolean;
}

/**
 * PropertyCard - A visually distinctive card for displaying property listings
 *
 * Design: Editorial real estate aesthetic with warm tones, generous spacing,
 * and premium hover states. Cards feel like they belong in a high-end property magazine.
 */
export function PropertyCard({
  property,
  onSave,
  className,
  priority = false,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(property.isSaved ?? false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(property.id);
  };

  // Determine the display price
  const displayPrice =
    property.priceType === "SALE"
      ? property.salePrice
        ? formatPrice(property.salePrice)
        : "Prijs op aanvraag"
      : property.rentPrice
        ? `${formatPrice(property.rentPrice)}/mnd`
        : "Prijs op aanvraag";

  // Get score badge color
  const getScoreColor = (score?: string) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score.startsWith("A")) return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    if (score === "B") return "bg-blue-500/10 text-blue-600 border-blue-200";
    if (score === "C") return "bg-amber-500/10 text-amber-600 border-amber-200";
    return "bg-red-500/10 text-red-600 border-red-200";
  };

  return (
    <Link
      href={`/aanbod/${property.slug}`}
      className={cn("group block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <article className="relative overflow-hidden rounded-xl bg-card ring-1 ring-border/50 transition-all duration-300 hover:ring-border hover:shadow-lg hover:shadow-primary/5">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.primaryImage ? (
            <Image
              src={property.primaryImage.originalUrl}
              alt={property.primaryImage.altText || property.title}
              fill
              priority={priority}
              className={cn(
                "object-cover transition-transform duration-500",
                isHovered && "scale-105"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="size-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Top badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge
              variant="secondary"
              className="bg-background/95 backdrop-blur-sm text-foreground shadow-sm"
            >
              {getPriceTypeLabel(property.priceType)}
            </Badge>
            {property.horecaScore && (
              <Badge
                variant="outline"
                className={cn(
                  "backdrop-blur-sm shadow-sm",
                  getScoreColor(property.horecaScore)
                )}
              >
                <Sparkles className="size-3" />
                {property.horecaScore}
              </Badge>
            )}
          </div>

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute right-3 top-3 bg-background/80 backdrop-blur-sm shadow-sm transition-all",
              "hover:bg-background hover:scale-110",
              isSaved && "text-red-500 hover:text-red-600"
            )}
            onClick={handleSave}
            aria-label={isSaved ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
          >
            <Heart
              className={cn(
                "size-4 transition-all",
                isSaved && "fill-current"
              )}
            />
          </Button>

          {/* Price overlay on hover */}
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 transition-all duration-300",
              isHovered && "translate-y-0 opacity-100"
            )}
          >
            <span className="text-lg font-semibold text-white drop-shadow-md">
              {displayPrice}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Property type */}
          <div className="mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {getPropertyTypeLabel(property.propertyType)}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-1 text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {property.title}
          </h3>

          {/* Location */}
          <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">
              {property.city}
              {property.province && `, ${property.province}`}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            {/* Surface */}
            <div className="flex items-center gap-1.5 text-sm">
              <Maximize2 className="size-3.5 text-muted-foreground" />
              <span className="font-medium">{formatSurface(property.surfaceTotal)}</span>
            </div>

            {/* Price (visible when not hovered) */}
            <div
              className={cn(
                "text-right transition-opacity duration-200",
                isHovered && "opacity-0"
              )}
            >
              <span className="text-sm font-semibold text-foreground">
                {displayPrice}
              </span>
            </div>
          </div>

          {/* Feature badges */}
          {(property.hasTerrace || property.hasParking) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {property.hasTerrace && (
                <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  Terras
                </span>
              )}
              {property.hasParking && (
                <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                  Parkeren
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

/**
 * PropertyCardSkeleton - Loading state for property cards
 */
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-card ring-1 ring-border/50",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="aspect-[4/3] animate-pulse bg-muted" />

      {/* Content skeleton */}
      <div className="p-4">
        <div className="mb-1.5 h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/**
 * PropertyCardGrid - Responsive grid for property cards
 */
export function PropertyCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 md:gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

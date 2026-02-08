import Link from "next/link";
import {
  MapPinIcon,
  RulerIcon,
  UsersIcon,
  HeartIcon,
  EyeIcon,
  SparklesIcon,
  TreeDeciduousIcon,
  UtensilsIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { PropertyListItem, PropertyType, PriceType } from "@/types/property";

/**
 * Format price from cents to readable string
 */
function formatPrice(cents: number, priceType: PriceType): string {
  const euros = cents / 100;
  const formatted = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(euros);

  if (priceType === "RENT") {
    return `${formatted}/mnd`;
  }
  return formatted;
}

/**
 * Get property type label
 */
function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    RESTAURANT: "Restaurant",
    CAFE: "Café",
    BAR: "Bar",
    HOTEL: "Hotel",
    DARK_KITCHEN: "Dark Kitchen",
    NIGHTCLUB: "Nachtclub",
    FOOD_COURT: "Food Court",
    CATERING: "Catering",
    BAKERY: "Bakkerij",
    SNACKBAR: "Snackbar",
    PARTYCENTRUM: "Partycentrum",
    GRANDCAFE: "Grand Café",
    LUNCHROOM: "Lunchroom",
    PIZZERIA: "Pizzeria",
    BRASSERIE: "Brasserie",
    OTHER: "Overig",
  };
  return labels[type] || type;
}

/**
 * Get score color based on horeca score
 */
function getScoreColor(score: string | null): string {
  if (!score) return "bg-muted text-muted-foreground";

  const colors: Record<string, string> = {
    "A+": "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    "A": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "B+": "bg-sky-500/10 text-sky-600 border-sky-500/20",
    "B": "bg-sky-500/10 text-sky-600 border-sky-500/20",
    "C": "bg-amber-500/10 text-amber-600 border-amber-500/20",
    "D": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    "F": "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return colors[score] || "bg-muted text-muted-foreground";
}

interface PropertyCardProps {
  property: PropertyListItem;
  variant?: "default" | "compact";
  showAgency?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  variant = "default",
  showAgency = true,
  className,
}: PropertyCardProps) {
  const price = property.rentPrice ?? property.salePrice;
  const priceDisplay = price ? formatPrice(price, property.priceType) : "Prijs op aanvraag";
  const totalSeating =
    (property.seatingCapacityInside ?? 0) + (property.seatingCapacityOutside ?? 0);

  return (
    <Link href={`/aanbod/${property.slug}`} className="group block">
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5",
          "hover:border-primary/20",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          className
        )}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {property.primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.primaryImage.thumbnailUrl}
              alt={property.primaryImage.altText ?? property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-muted-foreground/40">
                <SparklesIcon className="h-12 w-12" />
              </div>
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            {/* Property type badge */}
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm shadow-sm"
            >
              {getPropertyTypeLabel(property.propertyType)}
            </Badge>

            {/* Featured badge */}
            {property.featured && (
              <Badge className="bg-primary/90 backdrop-blur-sm">
                <SparklesIcon className="mr-1 h-3 w-3" />
                Uitgelicht
              </Badge>
            )}
          </div>

          {/* Score badge */}
          {property.horecaScore && (
            <div className="absolute bottom-3 right-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  "border-2 font-bold text-sm shadow-lg backdrop-blur-sm",
                  getScoreColor(property.horecaScore)
                )}
              >
                {property.horecaScore}
              </div>
            </div>
          )}

          {/* Price type indicator */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="outline"
              className="bg-background/90 backdrop-blur-sm text-xs"
            >
              {property.priceType === "RENT" ? "Te huur" : property.priceType === "SALE" ? "Te koop" : "Huur/Koop"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title & Location */}
          <div className="mb-3">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">
                {property.neighborhood
                  ? `${property.neighborhood}, ${property.city}`
                  : property.city}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-3">
            <p className="text-lg font-bold text-foreground">{priceDisplay}</p>
          </div>

          {/* Key stats */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <RulerIcon className="h-3.5 w-3.5" />
              <span>{property.surfaceTotal} m²</span>
            </div>
            {totalSeating > 0 && (
              <div className="flex items-center gap-1.5">
                <UsersIcon className="h-3.5 w-3.5" />
                <span>{totalSeating} zitpl.</span>
              </div>
            )}
            {property.hasTerrace && (
              <div className="flex items-center gap-1.5 text-emerald-600">
                <TreeDeciduousIcon className="h-3.5 w-3.5" />
                <span>Terras</span>
              </div>
            )}
            {property.hasKitchen && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <UtensilsIcon className="h-3.5 w-3.5" />
                <span>Keuken</span>
              </div>
            )}
          </div>

          {/* Description preview (only in default variant) */}
          {variant === "default" && property.shortDescription && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {property.shortDescription}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-4 py-3 bg-muted/30">
          {/* Agency info */}
          {showAgency && property.agency ? (
            <span className="text-xs text-muted-foreground truncate max-w-[60%]">
              {property.agency.name}
            </span>
          ) : (
            <span />
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              <span>{property.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon className="h-3.5 w-3.5" />
              <span>{property.savedCount}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

/**
 * Loading skeleton for PropertyCard
 */
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-4 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
            <div className="h-3 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

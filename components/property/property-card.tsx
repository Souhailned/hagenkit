import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Ruler,
  Users,
  UtensilsCrossed,
  Sun,
  Car,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/types/agency";

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
  className?: string;
}

const propertyTypeLabels: Partial<Record<Property["propertyType"], string>> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
  NIGHTCLUB: "Nachtclub",
  BAKERY: "Bakkerij",
  CATERING: "Catering",
  EETCAFE: "Eetcafé",
  GRAND_CAFE: "Grand Café",
  COCKTAILBAR: "Cocktailbar",
  HOTEL_RESTAURANT: "Hotel-Restaurant",
  BED_AND_BREAKFAST: "B&B",
  LUNCHROOM: "Lunchroom",
  KOFFIEBAR: "Koffiebar",
  BRASSERIE: "Brasserie",
  PIZZERIA: "Pizzeria",
  SNACKBAR: "Snackbar",
  IJSSALON: "IJssalon",
  PARTYCENTRUM: "Partycentrum",
  OTHER: "Overig",
};

export function PropertyCard({
  property,
  priority = false,
  className,
}: PropertyCardProps) {
  const coverImage = property.images[0];
  const priceLabel =
    property.priceType === "SALE"
      ? `${formatCurrency(property.salePrice ?? 0)} k.k.`
      : `${formatCurrency(property.rentPrice ?? 0)} /mnd`;

  return (
    <Link
      href={`/panden/${property.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {coverImage ? (
          <Image
            src={coverImage.url}
            alt={coverImage.alt || property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Property Type Badge */}
        <div className="absolute left-3 top-3">
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm"
          >
            {propertyTypeLabels[property.propertyType]}
          </Badge>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-3 right-3">
          <div className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-md">
            {priceLabel}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {property.title}
        </h3>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {property.city}, {property.province}
          </span>
        </div>

        {/* Short Description */}
        {property.shortDescription && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {property.shortDescription}
          </p>
        )}

        {/* Features Grid */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border/50 pt-3">
          {property.surfaceTotal && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              <span>{property.surfaceTotal} m²</span>
            </div>
          )}
          {property.seatingCapacity && property.seatingCapacity > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{property.seatingCapacity} zitplaatsen</span>
            </div>
          )}
          {property.hasTerrace && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sun className="h-3.5 w-3.5" />
              <span>Terras</span>
            </div>
          )}
          {property.hasParking && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Car className="h-3.5 w-3.5" />
              <span>Parking</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mb-4 h-10 w-full animate-pulse rounded bg-muted" />
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border/50 pt-3">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

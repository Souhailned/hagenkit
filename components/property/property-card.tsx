import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2, Users, Heart, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PROPERTY_TYPE_LABELS, PRICE_TYPE_LABELS } from "@/lib/validations/property";
import type { PropertySearchResult } from "@/app/actions/property-search";

interface PropertyCardProps {
  property: PropertySearchResult;
  priority?: boolean;
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

export function PropertyCard({ property, priority = false, className }: PropertyCardProps) {
  const {
    slug,
    title,
    shortDescription,
    propertyType,
    priceType,
    rentPrice,
    salePrice,
    city,
    address,
    surfaceTotal,
    hasTerrace,
    seatingCapacityInside,
    seatingCapacityOutside,
    primaryImage,
    viewCount,
    savedCount,
  } = property;

  const displayPrice = priceType === "SALE" ? salePrice : rentPrice;
  const priceLabel = priceType === "SALE" ? "" : "/mnd";
  const totalSeating = (seatingCapacityInside ?? 0) + (seatingCapacityOutside ?? 0);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20",
        className
      )}
    >
      {/* Image Container */}
      <Link href={`/aanbod/${slug}`} className="relative aspect-[4/3] overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.thumbnailUrl}
            alt={primaryImage.altText ?? title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Building2 className="size-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-medium">
            {PROPERTY_TYPE_LABELS[propertyType]}
          </Badge>
          {priceType === "RENT_OR_SALE" && (
            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-xs">
              {PRICE_TYPE_LABELS[priceType]}
            </Badge>
          )}
        </div>

        {/* Save button */}
        <button
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
          aria-label="Bewaar dit pand"
        >
          <Heart className="size-4 text-muted-foreground" />
        </button>

        {/* Stats overlay on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-xs text-white/90">{viewCount} weergaven</span>
          <span className="text-xs text-white/90">{savedCount} keer bewaard</span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            {displayPrice ? formatPrice(displayPrice) : "Prijs op aanvraag"}
          </span>
          {displayPrice && priceLabel && (
            <span className="text-sm text-muted-foreground">{priceLabel}</span>
          )}
        </div>

        {/* Title */}
        <Link href={`/aanbod/${slug}`} className="group/title">
          <h3 className="mb-1 line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary">
            {title}
          </h3>
        </Link>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{address}, {city}</span>
        </div>

        {/* Description */}
        {shortDescription && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {shortDescription}
          </p>
        )}

        {/* Features */}
        <div className="mt-auto flex flex-wrap items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Maximize2 className="size-3.5" />
            <span>{surfaceTotal} m&sup2;</span>
          </div>

          {totalSeating > 0 && (
            <div className="flex items-center gap-1">
              <Users className="size-3.5" />
              <span>{totalSeating} zitplaatsen</span>
            </div>
          )}

          {hasTerrace && (
            <Badge variant="secondary" className="text-xs px-2 py-0">
              Terras
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;

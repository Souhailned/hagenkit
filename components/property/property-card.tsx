import Image from "next/image";
import Link from "next/link";
import { MapPin, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    city: string;
    priceType: string;
    rentPrice: number | null;
    salePrice: number | null;
    surfaceTotal: number;
    propertyType: string;
    images: Array<{
      id: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
      isPrimary: boolean;
    }>;
  };
  className?: string;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
  NIGHTCLUB: "Nachtclub",
  CATERING: "Catering",
  FOOD_RETAIL: "Food Retail",
  MIXED_USE: "Gemengd",
  OTHER: "Overig",
};

/**
 * Format price in euros (input is in cents)
 */
function formatPrice(priceInCents: number | null): string {
  if (!priceInCents) return "Op aanvraag";
  const euros = priceInCents / 100;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(euros);
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const imageUrl = primaryImage?.mediumUrl || primaryImage?.thumbnailUrl || "/placeholder-property.jpg";

  const price = property.priceType === "SALE" ? property.salePrice : property.rentPrice;
  const priceLabel = property.priceType === "RENT" ? "/maand" : "";
  const typeLabel = PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType;

  return (
    <Link
      href={`/aanbod/${property.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:border-primary/20",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-foreground">
            {typeLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.city}</span>
        </div>

        {property.shortDescription && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {property.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t">
          <div>
            <span className="text-lg font-semibold text-foreground">
              {formatPrice(price)}
            </span>
            {priceLabel && (
              <span className="text-sm text-muted-foreground">{priceLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Maximize2 className="size-3.5" />
            <span>{property.surfaceTotal} m²</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

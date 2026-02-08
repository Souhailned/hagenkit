import Image from "next/image";
import Link from "next/link";
import { MapPin, Ruler, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";
import {
  formatPrice,
  formatSurface,
  PropertyTypeLabels,
  PriceTypeLabels,
} from "@/types/property";

interface SimilarPropertiesProps {
  properties: Property[];
  className?: string;
}

export function SimilarProperties({ properties, className }: SimilarPropertiesProps) {
  if (!properties || properties.length === 0) {
    return null;
  }

  return (
    <section className={cn("", className)}>
      <h2 className="mb-6 text-2xl font-bold">Vergelijkbare panden</h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const primaryImage =
            property.images?.find((img) => img.isPrimary) ||
            property.images?.[0];

          const price =
            property.priceType === "SALE"
              ? property.salePrice
              : property.rentPrice;

          return (
            <Link
              key={property.id}
              href={`/aanbod/${property.slug}`}
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.mediumUrl || primaryImage.originalUrl}
                      alt={primaryImage.altText || property.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <span className="text-muted-foreground">Geen afbeelding</span>
                    </div>
                  )}

                  {/* Price badge overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <Badge className="bg-black/80 text-white hover:bg-black/90">
                      {formatPrice(price)}
                      {property.priceType !== "SALE" && (
                        <span className="text-white/70">/mnd</span>
                      )}
                    </Badge>

                    {property.featured && (
                      <Badge variant="secondary" className="bg-white/90">
                        Uitgelicht
                      </Badge>
                    )}
                  </div>

                  {/* Type badge */}
                  <Badge
                    variant="secondary"
                    className="absolute top-3 left-3 bg-white/90"
                  >
                    {PropertyTypeLabels[property.propertyType]}
                  </Badge>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {property.neighborhood
                      ? `${property.neighborhood}, ${property.city}`
                      : property.city}
                  </p>

                  {property.shortDescription && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {property.shortDescription}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3.5 w-3.5" />
                      {formatSurface(property.surfaceTotal)}
                    </span>
                    {property.viewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {property.viewCount.toLocaleString("nl-NL")}
                      </span>
                    )}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {PriceTypeLabels[property.priceType]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

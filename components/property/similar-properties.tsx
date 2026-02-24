import Link from "next/link";
import Image from "next/image";
import { MapPin, Maximize2, ArrowUpRight, Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SimilarProperty {
  id: string;
  title: string;
  slug: string;
  city: string;
  propertyType: string;
  rentPrice: number | null;
  surfaceTotal: number | null;
  images: string[];
  matchReason: string;
}

interface SimilarPropertiesProps {
  properties: SimilarProperty[];
}

export function SimilarProperties({ properties }: SimilarPropertiesProps) {
  if (properties.length === 0) return null;

  return (
    <section>
      <Separator className="mb-8" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">
            Vergelijkbare panden
          </h2>
        </div>
        <Link
          href="/aanbod"
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Alle panden
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div
        className={cn(
          "grid gap-4",
          properties.length === 1 && "max-w-sm grid-cols-1",
          properties.length === 2 && "grid-cols-1 sm:grid-cols-2",
          properties.length === 3 &&
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          properties.length >= 4 &&
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/aanbod/${property.slug}`}
            className={cn(
              "group relative block overflow-hidden rounded-xl bg-card",
              "border border-border/60 transition-all duration-500 ease-out",
              "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
              "hover:-translate-y-0.5"
            )}
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {property.images[0] ? (
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    Geen afbeelding
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

              {/* Match reason badge */}
              <Badge
                variant="secondary"
                className="absolute left-2.5 top-2.5 border-0 bg-background/90 text-[11px] font-medium shadow-sm backdrop-blur-sm"
              >
                {property.matchReason}
              </Badge>

              {/* Hover arrow */}
              <div
                className={cn(
                  "absolute bottom-2.5 right-2.5 flex size-8 items-center justify-center",
                  "rounded-full bg-background shadow-md",
                  "translate-y-3 opacity-0 transition-all duration-300",
                  "group-hover:translate-y-0 group-hover:opacity-100"
                )}
              >
                <ArrowUpRight className="size-4 text-foreground" />
              </div>
            </div>

            {/* Content */}
            <div className="p-3.5">
              <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {property.title}
              </h3>

              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{property.city}</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-sm font-bold tracking-tight text-foreground">
                  {property.rentPrice
                    ? `${formatPrice(property.rentPrice)}/mnd`
                    : "Op aanvraag"}
                </span>
                {property.surfaceTotal && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Maximize2 className="size-3" />
                    {property.surfaceTotal} m²
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

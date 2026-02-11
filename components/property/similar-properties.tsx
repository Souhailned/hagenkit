"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkle, MapPin, Ruler, ArrowRight } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSimilarProperties } from "@/app/actions/recommendations";
import { formatPrice } from "@/lib/format";

interface SimilarPropertiesProps {
  propertyId: string;
}

export function SimilarProperties({ propertyId }: SimilarPropertiesProps) {
  const [properties, setProperties] = React.useState<Awaited<ReturnType<typeof getSimilarProperties>>["properties"]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    getSimilarProperties(propertyId, 4).then((result) => {
      if (result.success) setProperties(result.properties);
      setLoaded(true);
    });
  }, [propertyId]);

  if (loaded && properties.length === 0) return null;
  if (!loaded) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkle className="h-5 w-5 text-primary" weight="duotone" />
        <h2 className="text-xl font-semibold">Vergelijkbare panden</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {properties.map((property) => (
          <Link key={property.id} href={`/aanbod/${property.slug}`}>
            <Card className="group overflow-hidden hover:shadow-md transition-shadow h-full">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={property.images[0] || "/placeholder.jpg"}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <Badge variant="secondary" className="absolute top-2 left-2 text-[10px]">
                  {property.matchReason}
                </Badge>
              </div>
              <CardContent className="p-3 space-y-1.5">
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" weight="fill" />
                  {property.city}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">
                    {property.rentPrice ? `${formatPrice(property.rentPrice)}/mnd` : "Op aanvraag"}
                  </span>
                  {property.surfaceTotal && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Ruler className="h-3 w-3" />
                      {property.surfaceTotal} m²
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Link
          href="/aanbod"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Bekijk alle panden
          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Link>
      </div>
    </section>
  );
}

import {
  MapPin,
  Navigation,
  Train,
  Car,
  Footprints,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types/property";

interface PropertyLocationProps {
  property: Property;
  className?: string;
}

export function PropertyLocation({ property, className }: PropertyLocationProps) {
  const fullAddress = [
    property.address,
    property.addressLine2,
    `${property.postalCode} ${property.city}`,
    property.province,
  ]
    .filter(Boolean)
    .join(", ");

  // Generate Google Maps URLs
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress
  )}`;

  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    fullAddress
  )}`;

  // OpenStreetMap embed URL (free alternative)
  const osmEmbedUrl = property.latitude && property.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.01},${property.latitude - 0.01},${property.longitude + 0.01},${property.latitude + 0.01}&layer=mapnik&marker=${property.latitude},${property.longitude}`
    : null;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">Locatie</h3>

      {/* Address display */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{property.address}</p>
          {property.addressLine2 && (
            <p className="text-sm text-muted-foreground">{property.addressLine2}</p>
          )}
          <p className="text-sm text-muted-foreground">
            {property.postalCode} {property.city}
          </p>
          {property.neighborhood && (
            <Badge variant="secondary" className="mt-1.5">
              <Building2 className="mr-1 h-3 w-3" />
              {property.neighborhood}
            </Badge>
          )}
        </div>
      </div>

      {/* Map placeholder/embed */}
      <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border bg-muted">
        {osmEmbedUrl ? (
          <iframe
            src={osmEmbedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Kaart van ${property.address}`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <MapPin className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {fullAddress}
            </p>
            <Button
              variant="link"
              size="sm"
              asChild
              className="mt-2"
            >
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bekijk op Google Maps
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Map action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Bekijk op kaart
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation className="mr-2 h-4 w-4" />
            Route plannen
          </a>
        </Button>
      </div>

      {/* Location highlights */}
      {(property.locationScore || property.footfallEstimate) && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-card p-4">
          {property.locationScore && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Locatiescore
              </p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {property.locationScore}
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              </p>
            </div>
          )}
          {property.footfallEstimate && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Dagelijkse passanten
              </p>
              <p className="mt-1 text-2xl font-bold">
                {property.footfallEstimate.toLocaleString("nl-NL")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transport info (from features) */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Train className="h-4 w-4" />
          <span>OV goed bereikbaar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Car className="h-4 w-4" />
          <span>Parkeren in de buurt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Footprints className="h-4 w-4" />
          <span>Loopgebied</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MapControls,
} from "@/components/ui/map";
import { Badge } from "@/components/ui/badge";
import { Property, PropertyTypeLabels, formatPrice } from "@/types/property";
import { cn } from "@/lib/utils";
import { MapPin, Maximize2, ArrowUpRight } from "lucide-react";

// Netherlands center
const NL_CENTER: [number, number] = [5.2913, 52.1326];
const NL_ZOOM = 7;

interface PropertyMapProps {
  properties: Property[];
  className?: string;
}

export function PropertyMap({ properties, className }: PropertyMapProps) {
  const mappableProperties = useMemo(
    () => properties.filter((p) => p.latitude != null && p.longitude != null),
    [properties]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Map
        center={NL_CENTER}
        zoom={NL_ZOOM}
        styles={{
          light: "https://tiles.openfreemap.org/styles/liberty",
          dark: "https://tiles.openfreemap.org/styles/dark",
        }}
        className="h-full w-full rounded-xl"
      >
        <MapControls showZoom showLocate position="bottom-right" />

        {mappableProperties.map((property) => (
          <PropertyMapMarker key={property.id} property={property} />
        ))}
      </Map>

      {mappableProperties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted/80">
          <p className="text-muted-foreground">
            Geen panden met locatiegegevens gevonden
          </p>
        </div>
      )}
    </div>
  );
}

function PropertyMapMarker({ property }: { property: Property }) {
  const price = getDisplayPrice(property);

  return (
    <MapMarker
      longitude={property.longitude!}
      latitude={property.latitude!}
    >
      <MarkerContent>
        <div
          className={cn(
            "rounded-full border border-primary/20 bg-primary px-2.5 py-1",
            "text-xs font-semibold text-primary-foreground shadow-lg",
            "cursor-pointer transition-transform hover:scale-110"
          )}
        >
          {price}
        </div>
      </MarkerContent>

      <MarkerTooltip>{property.title}</MarkerTooltip>

      <MarkerPopup closeButton>
        <PropertyPopupCard property={property} />
      </MarkerPopup>
    </MapMarker>
  );
}

function PropertyPopupCard({ property }: { property: Property }) {
  const price = getDisplayPrice(property);
  const priceLabel =
    property.priceType === "RENT" || property.priceType === "RENT_OR_SALE"
      ? "/mnd"
      : "";

  return (
    <Link
      href={`/aanbod/${property.slug}`}
      className="group block w-64 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {property.images[0] ? (
          <Image
            src={
              property.images[0].thumbnailUrl ||
              property.images[0].originalUrl
            }
            alt={property.images[0].altText || property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="256px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-muted-foreground">
              Geen afbeelding
            </span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge
            variant="outline"
            className="border-white/30 bg-black/50 text-xs text-white backdrop-blur-sm"
          >
            {PropertyTypeLabels[property.propertyType]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
          {property.title}
        </h4>

        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {property.city}
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            {property.surfaceTotal} m²
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
          <span className="text-sm font-bold text-foreground">
            {price}
            <span className="text-xs font-normal text-muted-foreground">
              {priceLabel}
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

function getDisplayPrice(property: Property): string {
  const cents =
    property.priceType === "SALE"
      ? property.salePrice
      : property.rentPrice || property.salePrice;
  return formatPrice(cents || 0);
}

/**
 * Small inline map for property detail pages
 */
interface PropertyDetailMapProps {
  latitude: number;
  longitude: number;
  title: string;
  className?: string;
}

export function PropertyDetailMap({
  latitude,
  longitude,
  title,
  className,
}: PropertyDetailMapProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl", className)}>
      <Map
        center={[longitude, latitude]}
        zoom={14}
        styles={{
          light: "https://tiles.openfreemap.org/styles/liberty",
          dark: "https://tiles.openfreemap.org/styles/dark",
        }}
        className="h-full w-full"
      >
        <MapControls showZoom position="bottom-right" />
        <MapMarker longitude={longitude} latitude={latitude}>
          <MarkerContent>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                "border-2 border-white bg-primary shadow-lg"
              )}
            >
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
          </MarkerContent>
          <MarkerTooltip>{title}</MarkerTooltip>
        </MapMarker>
      </Map>
    </div>
  );
}

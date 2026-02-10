"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Map,
  MapClusterLayer,
  MapPopup,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Filter properties met locatiegegevens
  const mappableProperties = useMemo(
    () => properties.filter((p) => p.latitude != null && p.longitude != null),
    [properties]
  );

  // Converteer properties naar GeoJSON FeatureCollection voor clustering
  const geoJsonData = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point, { property: Property }>>(
    () => ({
      type: "FeatureCollection",
      features: mappableProperties.map((property) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [property.longitude!, property.latitude!],
        },
        properties: {
          property,
        },
      })),
    }),
    [mappableProperties]
  );

  return (
    <div
      className={cn("relative w-full", className)}
      role="region"
      aria-label={`Kaart met ${mappableProperties.length} horecapanden`}
    >
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

        {/* Cluster layer voor property markers */}
        <MapClusterLayer
          data={geoJsonData}
          clusterMaxZoom={14}
          clusterRadius={50}
          clusterColors={["#3b82f6", "#f97316", "#ef4444"]} // Blauw → Oranje → Rood
          clusterThresholds={[10, 50]} // Klein < 10, Medium < 50, Groot >= 50
          pointColor="#2563eb" // Primary blue (hex for MapLibre compatibility)
          onPointClick={(feature) => {
            setSelectedProperty(feature.properties.property);
          }}
        />

        {/* Property popup bij klik op individuele marker */}
        {selectedProperty && (
          <MapPopup
            longitude={selectedProperty.longitude!}
            latitude={selectedProperty.latitude!}
            closeButton
            onClose={() => setSelectedProperty(null)}
          >
            <PropertyPopupCard property={selectedProperty} />
          </MapPopup>
        )}
      </Map>

      {/* Results count overlay */}
      {mappableProperties.length > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-lg border border-border/50 bg-background/90 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
          {mappableProperties.length} {mappableProperties.length === 1 ? "pand" : "panden"}
        </div>
      )}

      {mappableProperties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-muted/80">
          <div className="text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Geen panden met locatiegegevens gevonden
            </p>
          </div>
        </div>
      )}
    </div>
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
        {property.images?.[0] ? (
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

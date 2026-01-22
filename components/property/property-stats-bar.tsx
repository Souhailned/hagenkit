import {
  Euro,
  Ruler,
  Building2,
  CheckCircle2,
  Users,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types/property";
import {
  formatPrice,
  formatSurface,
  PropertyTypeLabels,
  PriceTypeLabels,
  PropertyStatusLabels,
} from "@/lib/types/property";

interface PropertyStatsBarProps {
  property: Property;
  className?: string;
}

export function PropertyStatsBar({ property, className }: PropertyStatsBarProps) {
  const price =
    property.priceType === "SALE"
      ? property.salePrice
      : property.rentPrice;

  const priceLabel = property.priceType === "SALE" ? "" : "/maand";

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    UNDER_OFFER: "bg-amber-500/10 text-amber-700 border-amber-200",
    RENTED: "bg-blue-500/10 text-blue-700 border-blue-200",
    SOLD: "bg-purple-500/10 text-purple-700 border-purple-200",
  };

  const stats = [
    {
      icon: Euro,
      label: "Prijs",
      value: formatPrice(price),
      suffix: priceLabel,
      highlight: true,
    },
    {
      icon: Ruler,
      label: "Oppervlakte",
      value: formatSurface(property.surfaceTotal),
      suffix: "",
    },
    {
      icon: Building2,
      label: "Type",
      value: PropertyTypeLabels[property.propertyType] || property.propertyType,
      suffix: "",
    },
    ...(property.seatingCapacityInside
      ? [
          {
            icon: Users,
            label: "Capaciteit",
            value: `${property.seatingCapacityInside}${
              property.seatingCapacityOutside
                ? ` + ${property.seatingCapacityOutside}`
                : ""
            }`,
            suffix: " zitplaatsen",
          },
        ]
      : []),
    ...(property.availableFrom
      ? [
          {
            icon: CalendarDays,
            label: "Beschikbaar",
            value: new Date(property.availableFrom).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            suffix: "",
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        className
      )}
    >
      {/* Price type and status badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-medium">
          {PriceTypeLabels[property.priceType]}
        </Badge>
        <Badge
          variant="outline"
          className={cn("font-medium", statusColors[property.status])}
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          {PropertyStatusLabels[property.status]}
        </Badge>
        {property.featured && (
          <Badge className="bg-primary/90 font-medium">
            Uitgelicht
          </Badge>
        )}
        {property.horecaScore && (
          <Badge
            variant="outline"
            className="border-amber-300 bg-amber-50 font-semibold text-amber-700"
          >
            Score: {property.horecaScore}
          </Badge>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col",
              stat.highlight && "sm:col-span-1"
            )}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <stat.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <div className="mt-1">
              <span
                className={cn(
                  "text-lg font-semibold tracking-tight",
                  stat.highlight && "text-xl text-primary"
                )}
              >
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-sm text-muted-foreground">
                  {stat.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional pricing info */}
      {(property.servicesCosts || property.depositMonths) && (
        <div className="mt-4 flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground">
          {property.servicesCosts && (
            <span>
              Servicekosten:{" "}
              <span className="font-medium text-foreground">
                {formatPrice(property.servicesCosts)}/maand
              </span>
            </span>
          )}
          {property.depositMonths && (
            <span>
              Borg:{" "}
              <span className="font-medium text-foreground">
                {property.depositMonths} maanden
              </span>
            </span>
          )}
          {property.priceNegotiable && (
            <span className="text-emerald-600">
              Prijs onderhandelbaar
            </span>
          )}
        </div>
      )}
    </div>
  );
}

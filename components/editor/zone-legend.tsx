"use client";

import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSceneMeasurements } from "@/lib/editor/systems";
import { ZONE_COLORS, ZONE_LABELS } from "@/lib/editor/schema";
import { cn } from "@/lib/utils";

function StatItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ZoneLegend() {
  const { zones, totalArea, totalCapacity, wallCount, itemCount } =
    useSceneMeasurements();

  if (zones.length === 0 && wallCount === 0 && itemCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-background/95 p-3 shadow-sm backdrop-blur-sm">
      {/* Zone list */}
      {zones.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Zones
          </span>
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center gap-2 text-xs"
            >
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: ZONE_COLORS[zone.zoneType] ?? "#999" }}
              />
              <span className="flex-1 truncate text-foreground">
                {ZONE_LABELS[zone.zoneType]}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {zone.area.toFixed(1)} m&sup2;
              </span>
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[10px] leading-none"
              >
                {zone.capacity}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {zones.length > 0 && <Separator />}

      {/* Totals */}
      <div className="flex flex-col gap-1">
        {zones.length > 0 && (
          <>
            <StatItem
              label="Totale oppervlakte"
              value={`${totalArea.toFixed(1)} m\u00B2`}
            />
            <StatItem
              label="Totale capaciteit"
              value={`${totalCapacity} stoelen`}
            />
          </>
        )}
        <StatItem label="Muren" value={wallCount} />
        <StatItem label="Inventaris" value={itemCount} />
      </div>
    </div>
  );
}

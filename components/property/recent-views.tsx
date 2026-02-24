"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ClockCounterClockwise, MapPin } from "@phosphor-icons/react";
import {
  getRecentViews,
  clearRecentViews,
  type RecentView,
} from "@/lib/recent-views";
import { formatPrice } from "@/lib/format";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function RecentViews() {
  const [views, setViews] = React.useState<RecentView[]>([]);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    setViews(getRecentViews());
  }, []);

  if (views.length === 0 || dismissed) return null;

  const formatRecentPrice = (view: RecentView) => {
    if (view.price == null) return "Op aanvraag";
    if (view.priceType === "RENT") return `${formatPrice(view.price)}/mnd`;
    return formatPrice(view.price);
  };

  const handleClear = () => {
    clearRecentViews();
    setDismissed(true);
  };

  return (
    <div className="mt-4 border-t border-border/40 pt-4">
      {/* Header row */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ClockCounterClockwise className="h-3.5 w-3.5" weight="bold" />
          <span className="text-xs font-medium">Recent bekeken</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Wissen
        </Button>
      </div>

      {/* Compact card strip */}
      <ScrollArea className="w-full">
        <div className="flex gap-2.5 pb-1">
          {views.map((view) => (
            <Link
              key={view.id}
              href={`/aanbod/${view.slug}`}
              className="group flex min-w-[240px] max-w-[300px] shrink-0 items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={view.image || "/placeholder.jpg"}
                  alt={view.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                  {view.title}
                </h3>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" weight="fill" />
                  <span className="truncate">{view.city}</span>
                </div>
                <p className="mt-0.5 text-xs font-semibold text-primary">
                  {formatRecentPrice(view)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

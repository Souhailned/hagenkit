"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ClockCounterClockwise, MapPin } from "@phosphor-icons/react";
import { getRecentViews, type RecentView } from "@/lib/recent-views";
import { formatPrice } from "@/lib/format";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function RecentViews() {
  const [views, setViews] = React.useState<RecentView[]>([]);

  React.useEffect(() => {
    setViews(getRecentViews());
  }, []);

  if (views.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center gap-2 mb-4">
          <ClockCounterClockwise className="h-5 w-5 text-muted-foreground" weight="duotone" />
          <h2 className="text-lg font-semibold">Recent bekeken</h2>
        </div>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {views.map((view) => (
              <Link
                key={view.id}
                href={`/aanbod/${view.slug}`}
                className="group flex-shrink-0 w-[200px]"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                  <Image
                    src={view.image || "/placeholder.jpg"}
                    alt={view.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="200px"
                  />
                </div>
                <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {view.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" weight="fill" />
                  {view.city}
                </div>
                <p className="text-sm font-semibold text-primary mt-0.5">
                  {view.price ? `${formatPrice(view.price)}/mnd` : "Op aanvraag"}
                </p>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}

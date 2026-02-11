"use client";

import * as React from "react";
import { Heart } from "@phosphor-icons/react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { cn } from "@/lib/utils";

interface SaveReminderBarProps {
  propertyId: string;
  className?: string;
}

export function SaveReminderBar({ propertyId, className }: SaveReminderBarProps) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 60% of the page
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.6);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm",
        "animate-in slide-in-from-bottom duration-300",
        "lg:hidden", // Only on mobile — desktop has sticky sidebar
        className
      )}
    >
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4 text-muted-foreground" weight="duotone" />
          <span className="text-muted-foreground">Wil je dit pand niet vergeten?</span>
        </div>
        <FavoriteButton propertyId={propertyId} size="sm" />
      </div>
    </div>
  );
}

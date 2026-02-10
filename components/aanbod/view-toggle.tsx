"use client";

import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5"
      role="radiogroup"
      aria-label="Weergave wisselen"
    >
      <button
        type="button"
        role="radio"
        aria-checked={view === "list"}
        aria-label="Lijstweergave"
        onClick={() => onViewChange("list")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Lijst</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === "map"}
        aria-label="Kaartweergave"
        onClick={() => onViewChange("map")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "map"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <MapIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Kaart</span>
      </button>
    </div>
  );
}

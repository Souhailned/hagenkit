"use client";

import { Building2, Search, MapPin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        {hasFilters && (
          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Search className="h-4 w-4" />
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold tracking-tight">
        {hasFilters
          ? "Geen panden gevonden"
          : "Begin met zoeken"}
      </h3>

      <p className="mt-2 max-w-sm text-muted-foreground">
        {hasFilters
          ? "Er zijn geen panden die aan uw zoekcriteria voldoen. Probeer uw filters aan te passen."
          : "Gebruik de filters om het perfecte horecapand te vinden."}
      </p>

      {hasFilters && (
        <Button onClick={onClearFilters} variant="outline" className="mt-6 gap-2">
          <RotateCcw className="h-4 w-4" />
          Filters wissen
        </Button>
      )}

      {/* Suggestions */}
      {hasFilters && (
        <div className="mt-8 w-full max-w-md">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Suggesties:
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Probeer een andere locatie</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>Selecteer minder specifieke types</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 shrink-0" />
              <span>Verruim uw prijsbereik</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Building2, Search, Bell, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PropertyEmptyStateProps {
  hasFilters?: boolean;
  searchQuery?: string;
  onClearFilters?: () => void;
  onCreateAlert?: () => void;
  className?: string;
}

export function PropertyEmptyState({
  hasFilters = false,
  searchQuery,
  onClearFilters,
  onCreateAlert,
  className,
}: PropertyEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-muted">
        {hasFilters || searchQuery ? (
          <Search className="size-8 text-muted-foreground" />
        ) : (
          <Building2 className="size-8 text-muted-foreground" />
        )}
      </div>

      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {hasFilters || searchQuery
          ? "Geen panden gevonden"
          : "Nog geen panden beschikbaar"}
      </h3>

      <p className="mb-6 max-w-md text-muted-foreground">
        {hasFilters || searchQuery ? (
          <>
            We hebben geen horecapanden gevonden die voldoen aan je zoekcriteria.
            Probeer je filters aan te passen of maak een zoek-alert aan om op de hoogte te blijven.
          </>
        ) : (
          <>
            Er zijn momenteel geen horecapanden beschikbaar. Kijk later nog eens terug of maak
            een zoek-alert aan om als eerste te horen wanneer er nieuwe panden beschikbaar komen.
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <RotateCcw className="mr-2 size-4" />
            Filters wissen
          </Button>
        )}

        {onCreateAlert && (
          <Button variant={hasFilters ? "default" : "outline"} onClick={onCreateAlert}>
            <Bell className="mr-2 size-4" />
            Zoek-alert aanmaken
          </Button>
        )}
      </div>

      {/* Suggestions */}
      <div className="mt-10 w-full max-w-lg">
        <h4 className="mb-4 text-sm font-medium text-muted-foreground">
          Suggesties
        </h4>
        <ul className="grid gap-2 text-left text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>Verbreed je zoekgebied door meer steden toe te voegen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>Verhoog je maximale prijsrange</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>Overweeg andere type horecalocaties</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>Maak een alert aan om nieuwe panden direct te ontvangen</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PropertyEmptyState;

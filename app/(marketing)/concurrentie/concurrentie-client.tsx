"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBuurtAnalysis } from "@/app/actions/buurt-analysis";
import type { BuurtAnalysis, NearbyPlace } from "@/lib/buurt-intelligence";
import { Search, MapPin, UtensilsCrossed, Store, Train, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Geocode via Nominatim (free, no API key)
async function geocode(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=nl&limit=1`,
      { headers: { "User-Agent": "Horecagrond/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
    }
    return null;
  } catch {
    return null;
  }
}

const categoryIcons: Record<string, React.ReactNode> = {
  horeca_concurrent: <UtensilsCrossed className="h-3.5 w-3.5 text-red-500" />,
  horeca_complementair: <UtensilsCrossed className="h-3.5 w-3.5 text-amber-500" />,
  supermarkt: <Store className="h-3.5 w-3.5 text-green-500" />,
  winkel: <Store className="h-3.5 w-3.5 text-blue-500" />,
  transport: <Train className="h-3.5 w-3.5 text-purple-500" />,
  kantoor: <Building2 className="h-3.5 w-3.5 text-slate-500" />,
  onderwijs: <Building2 className="h-3.5 w-3.5 text-blue-500" />,
  cultuur: <Building2 className="h-3.5 w-3.5 text-pink-500" />,
};

const categoryLabels: Record<string, string> = {
  horeca_concurrent: "Concurrent",
  horeca_complementair: "Complementair",
  supermarkt: "Supermarkt",
  winkel: "Winkel",
  transport: "OV/Parkeren",
  kantoor: "Kantoor",
  onderwijs: "Onderwijs",
  cultuur: "Cultuur",
};

export function ConcurrentieClient() {
  const [query, setQuery] = useState("");
  const [analysis, setAnalysis] = useState<BuurtAnalysis | null>(null);
  const [location, setLocation] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    setError("");
    setAnalysis(null);

    startTransition(async () => {
      const geo = await geocode(query);
      if (!geo) {
        setError("Locatie niet gevonden. Probeer een ander adres of stadsnaam.");
        return;
      }

      setLocation(geo.display.split(",").slice(0, 3).join(","));
      const result = await getBuurtAnalysis(geo.lat, geo.lng, 500);
      if (!result) {
        setError("Kon geen data ophalen voor deze locatie.");
        return;
      }
      setAnalysis(result);
    });
  };

  // Group places by category
  const groupedPlaces = analysis
    ? Object.entries(
        analysis.concurrenten
          .concat(analysis.complementair, analysis.transport, analysis.voorzieningen)
          .reduce((acc, place) => {
            const key = place.category;
            if (!acc[key]) acc[key] = [];
            acc[key].push(place);
            return acc;
          }, {} as Record<string, NearbyPlace[]>)
      ).sort(([, a], [, b]) => b.length - a.length)
    : [];

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex gap-2 max-w-xl mx-auto">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op adres, stad of postcode..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isPending || !query.trim()} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Zoek
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {analysis && (
        <>
          {/* Location + Bruisindex */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{location}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm font-medium">Bruisindex:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn("h-3 w-3 rounded-sm", {
                      "bg-green-500": i < analysis.bruisIndex && analysis.bruisIndex >= 7,
                      "bg-amber-500": i < analysis.bruisIndex && analysis.bruisIndex >= 4 && analysis.bruisIndex < 7,
                      "bg-blue-400": i < analysis.bruisIndex && analysis.bruisIndex < 4,
                      "bg-muted": i >= analysis.bruisIndex,
                    })}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{analysis.bruisIndex}/10</span>
            </div>
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Horeca" value={analysis.stats.horecaCount} sublabel={analysis.stats.horecaDensity} color="text-red-500" />
            <StatCard label="OV Score" value={`${analysis.stats.transportScore}/10`} sublabel={`${analysis.transport.length} punten`} color="text-purple-500" />
            <StatCard label="Kantoren" value={analysis.stats.kantorenNabij} sublabel={analysis.stats.kantorenNabij > 3 ? "Veel" : "Beperkt"} color="text-blue-500" />
            <StatCard label="Voorzieningen" value={`${analysis.stats.voorzieningenScore}/10`} sublabel={`${analysis.voorzieningen.length} punten`} color="text-green-500" />
          </div>

          {/* Grouped places */}
          {groupedPlaces.map(([category, places]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {categoryIcons[category]}
                  {categoryLabels[category] || category} ({places.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {places
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 10)
                    .map((place, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate">{place.name}</span>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {place.distance}m
                        </Badge>
                      </div>
                    ))}
                  {places.length > 10 && (
                    <p className="text-xs text-muted-foreground">+{places.length - 10} meer</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sublabel, color }: { label: string; value: string | number; sublabel: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className={cn("text-xl font-bold", color)}>{value}</p>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

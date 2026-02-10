"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBuurtAnalysis } from "@/app/actions/buurt-analysis";
import type { BuurtAnalysis } from "@/lib/buurt-intelligence";
import {
  MapPin,
  UtensilsCrossed,
  Train,
  Building2,
  Store,
  Star,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface BuurtIntelligenceProps {
  lat: number;
  lng: number;
  radius?: number;
}

export function BuurtIntelligence({ lat, lng, radius = 500 }: BuurtIntelligenceProps) {
  const [analysis, setAnalysis] = useState<BuurtAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getBuurtAnalysis(lat, lng, radius).then((result) => {
      if (cancelled) return;
      if (result) {
        setAnalysis(result);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [lat, lng, radius]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Buurtanalyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return null; // Silently hide if no data available
  }

  const { stats, bruisIndex, summary, concurrenten, transport, voorzieningen } = analysis;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Buurtanalyse
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Radius {radius}m
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Bruisindex */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-2 rounded-sm ${
                  i < bruisIndex
                    ? bruisIndex >= 7 ? "bg-green-500" : bruisIndex >= 4 ? "bg-amber-500" : "bg-blue-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            Bruisindex: {bruisIndex}/10
          </span>
          <span className="text-xs text-muted-foreground">
            {bruisIndex >= 7 ? "Zeer levendig" : bruisIndex >= 4 ? "Gemiddeld" : "Rustig"}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<UtensilsCrossed className="h-4 w-4" />}
            label="Horeca nabij"
            value={stats.horecaCount}
            sublabel={`Dichtheid: ${stats.horecaDensity}`}
            color={stats.horecaCount > 10 ? "text-amber-500" : "text-green-500"}
          />
          <StatCard
            icon={<Train className="h-4 w-4" />}
            label="Bereikbaarheid"
            value={`${stats.transportScore}/10`}
            sublabel={`${transport.length} OV-punten`}
            color={stats.transportScore >= 6 ? "text-green-500" : "text-muted-foreground"}
          />
          <StatCard
            icon={<Building2 className="h-4 w-4" />}
            label="Kantoren"
            value={stats.kantorenNabij}
            sublabel={stats.kantorenNabij > 3 ? "Veel lunchverkeer" : "Beperkt"}
            color="text-blue-500"
          />
          <StatCard
            icon={<Store className="h-4 w-4" />}
            label="Voorzieningen"
            value={`${stats.voorzieningenScore}/10`}
            sublabel={`${voorzieningen.length} punten`}
            color={stats.voorzieningenScore >= 5 ? "text-green-500" : "text-muted-foreground"}
          />
        </div>

        {/* Top concurrenten */}
        {concurrenten.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Concurrenten ({concurrenten.length})
            </h4>
            <div className="space-y-1.5">
              {concurrenten
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 5)
                .map((place, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">
                      {place.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {place.distance}m
                    </span>
                  </div>
                ))}
              {concurrenten.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{concurrenten.length - 5} meer
                </p>
              )}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="rounded-lg bg-muted/50 p-3">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Inzichten
          </h4>
          <ul className="space-y-1 text-sm">
            {stats.horecaCount > 15 && (
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                Hoge horeca-dichtheid — onderscheidend concept noodzakelijk
              </li>
            )}
            {stats.horecaCount < 3 && (
              <li className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">•</span>
                Weinig concurrentie — kans voor pioniers
              </li>
            )}
            {stats.kantorenNabij > 5 && (
              <li className="flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5">•</span>
                Veel kantoren — potentieel voor lunch/koffie concept
              </li>
            )}
            {stats.transportScore >= 7 && (
              <li className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">•</span>
                Uitstekende OV-bereikbaarheid — goed voor passanten
              </li>
            )}
            {stats.transportScore < 3 && (
              <li className="flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">•</span>
                Beperkt OV — bestemmingshoreca met eigen publiek
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{sublabel}</p>
    </div>
  );
}

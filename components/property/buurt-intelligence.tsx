"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBuurtAnalysis } from "@/app/actions/buurt-analysis";
import type { EnhancedBuurtAnalysis } from "@/lib/buurt/types";
import {
  MapPin,
  UtensilsCrossed,
  Train,
  Building2,
  Store,
  AlertTriangle,
  TrendingUp,
  Users,
  Banknote,
  Bus,
  Star,
  Info,
  Footprints,
  Clock,
  ChevronDown,
} from "lucide-react";

interface BuurtIntelligenceProps {
  lat: number;
  lng: number;
  radius?: number;
  onAnalysisLoaded?: (analysis: EnhancedBuurtAnalysis) => void;
}

export function BuurtIntelligence({
  lat,
  lng,
  radius = 500,
  onAnalysisLoaded,
}: BuurtIntelligenceProps) {
  const [analysis, setAnalysis] = useState<EnhancedBuurtAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    getBuurtAnalysis(lat, lng, radius).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setAnalysis(result.data);
        onAnalysisLoaded?.(result.data);
      } else {
        setError(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, radius, onAnalysisLoaded]);

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
    return null;
  }

  const { stats, bruisIndex, summary } = analysis;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Buurtanalyse
          </CardTitle>
          <div className="flex items-center gap-2">
            <DataQualityBadge quality={analysis.dataQuality} />
            <Badge variant="outline" className="text-xs">
              Radius {radius}m
            </Badge>
          </div>
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
                    ? bruisIndex >= 7
                      ? "bg-green-500"
                      : bruisIndex >= 4
                        ? "bg-amber-500"
                        : "bg-blue-400"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            Bruisindex: {bruisIndex}/10
          </span>
          <span className="text-xs text-muted-foreground">
            {bruisIndex >= 7
              ? "Zeer levendig"
              : bruisIndex >= 4
                ? "Gemiddeld"
                : "Rustig"}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>

        {/* Tabs */}
        <Tabs defaultValue="overzicht" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="overzicht" className="text-xs">
              Overzicht
            </TabsTrigger>
            <TabsTrigger value="demografie" className="text-xs">
              Demografie
            </TabsTrigger>
            <TabsTrigger value="bereikbaarheid" className="text-xs">
              Bereikbaarheid
            </TabsTrigger>
            <TabsTrigger value="concurrentie" className="text-xs">
              Concurrentie
            </TabsTrigger>
          </TabsList>

          {/* Overzicht Tab */}
          <TabsContent value="overzicht" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<UtensilsCrossed className="h-4 w-4" />}
                label="Horeca nabij"
                value={stats.horecaCount}
                sublabel={`Dichtheid: ${stats.horecaDensity}`}
                color={
                  stats.horecaCount > 10
                    ? "text-amber-500"
                    : "text-green-500"
                }
              />
              <StatCard
                icon={<Train className="h-4 w-4" />}
                label="Bereikbaarheid"
                value={`${analysis.transportAnalysis?.score ?? stats.transportScore}/10`}
                sublabel={
                  analysis.transportAnalysis?.bereikbaarheidOV ||
                  `${analysis.transport.length} OV-punten`
                }
                color={
                  (analysis.transportAnalysis?.score ?? stats.transportScore) >=
                  6
                    ? "text-green-500"
                    : "text-muted-foreground"
                }
              />
              <StatCard
                icon={<Footprints className="h-4 w-4" />}
                label="Passanten"
                value={
                  analysis.passanten
                    ? `~${analysis.passanten.dagschatting.toLocaleString("nl-NL")}`
                    : "—"
                }
                sublabel={
                  analysis.passanten
                    ? `Confidence: ${analysis.passanten.confidence}`
                    : "Geen data"
                }
                color="text-primary"
              />
              <StatCard
                icon={<Building2 className="h-4 w-4" />}
                label="Kantoren"
                value={stats.kantorenNabij}
                sublabel={
                  stats.kantorenNabij > 3 ? "Veel lunchverkeer" : "Beperkt"
                }
                color="text-blue-500"
              />
            </div>

            {/* BAG geschiktheid */}
            {analysis.building && (
              <div className="rounded-lg border p-3 flex items-center gap-3">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">Pandgeschiktheid: </span>
                  <span className="text-muted-foreground">
                    {analysis.building.isHorecaGeschikt
                      ? "Horeca-geschikt (bestemming)"
                      : "Geen horeca-bestemming"}
                    {analysis.building.bouwjaar
                      ? ` — Bouwjaar ${analysis.building.bouwjaar}`
                      : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Insights */}
            <InsightsPanel stats={stats} analysis={analysis} />
          </TabsContent>

          {/* Demografie Tab */}
          <TabsContent value="demografie" className="space-y-4 mt-4">
            {analysis.demographics ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<Users className="h-4 w-4" />}
                    label="Inwoners"
                    value={analysis.demographics.inwoners.toLocaleString(
                      "nl-NL",
                    )}
                    sublabel={analysis.demographics.buurtNaam}
                    color="text-primary"
                  />
                  <StatCard
                    icon={<Banknote className="h-4 w-4" />}
                    label="Gem. inkomen"
                    value={
                      analysis.demographics.gemiddeldInkomen
                        ? `€${analysis.demographics.gemiddeldInkomen}k`
                        : "—"
                    }
                    sublabel={
                      analysis.demographics.gemiddeldInkomen
                        ? analysis.demographics.gemiddeldInkomen > 33
                          ? "Boven landelijk gem."
                          : analysis.demographics.gemiddeldInkomen > 25
                            ? "Rond landelijk gem."
                            : "Onder landelijk gem."
                        : "Geen data"
                    }
                    color={
                      analysis.demographics.gemiddeldInkomen &&
                      analysis.demographics.gemiddeldInkomen > 33
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }
                  />
                </div>

                {/* Age distribution */}
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-3">
                    Leeftijdsverdeling
                  </h4>
                  <div className="space-y-2">
                    <AgeBar
                      label="Jong (0-24)"
                      percentage={
                        analysis.demographics.leeftijdsverdeling.jong
                      }
                      color="bg-blue-400"
                    />
                    <AgeBar
                      label="Werkleeftijd (25-64)"
                      percentage={
                        analysis.demographics.leeftijdsverdeling.werkleeftijd
                      }
                      color="bg-primary"
                    />
                    <AgeBar
                      label="65+"
                      percentage={
                        analysis.demographics.leeftijdsverdeling.ouder
                      }
                      color="bg-amber-400"
                    />
                  </div>
                </div>

                {/* Extra demographics */}
                {(analysis.demographics.huishoudens ||
                  analysis.demographics.dichtheid) && (
                  <div className="grid grid-cols-2 gap-3">
                    {analysis.demographics.huishoudens && (
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-lg font-semibold">
                          {analysis.demographics.huishoudens.toLocaleString(
                            "nl-NL",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Huishoudens
                        </p>
                      </div>
                    )}
                    {analysis.demographics.dichtheid && (
                      <div className="rounded-lg border p-3 text-center">
                        <p className="text-lg font-semibold">
                          {analysis.demographics.dichtheid.toLocaleString(
                            "nl-NL",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Inw./km²
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <NoDataMessage message="Demografische data niet beschikbaar voor deze locatie." />
            )}
          </TabsContent>

          {/* Bereikbaarheid Tab */}
          <TabsContent value="bereikbaarheid" className="space-y-4 mt-4">
            {analysis.transportAnalysis ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" />
                    <span className="font-medium">OV-score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {analysis.transportAnalysis.score}
                    </span>
                    <span className="text-muted-foreground">/10</span>
                    <Badge
                      variant={
                        analysis.transportAnalysis.bereikbaarheidOV ===
                          "uitstekend" ||
                        analysis.transportAnalysis.bereikbaarheidOV === "goed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {analysis.transportAnalysis.bereikbaarheidOV}
                    </Badge>
                  </div>
                </div>

                {/* Stop list */}
                {analysis.transportAnalysis.stops.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.transportAnalysis.stops.slice(0, 10).map((stop, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <TransportIcon type={stop.type} />
                          <div>
                            <p className="text-sm font-medium">{stop.naam}</p>
                            {stop.lijnen && stop.lijnen.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Lijnen: {stop.lijnen.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {stop.afstand}m
                        </span>
                      </div>
                    ))}
                    {analysis.transportAnalysis.stops.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        +{analysis.transportAnalysis.stops.length - 10} meer
                      </p>
                    )}
                  </div>
                ) : (
                  <NoDataMessage message="Geen OV-haltes gevonden binnen de radius." />
                )}
              </>
            ) : (
              <NoDataMessage message="Bereikbaarheidsdata niet beschikbaar." />
            )}
          </TabsContent>

          {/* Concurrentie Tab */}
          <TabsContent value="concurrentie" className="space-y-4 mt-4">
            {analysis.competitors.length > 0 ? (
              <>
                {/* Price summary */}
                <CompetitorSummary competitors={analysis.competitors} />

                {/* Market insights */}
                <MarktAnalyseCard competitors={analysis.competitors} />

                {/* Opening hours gap detection */}
                <OpeningHoursInsights competitors={analysis.competitors} />

                {/* Competitor list */}
                <div className="space-y-2">
                  {analysis.competitors.slice(0, 15).map((comp, i) => (
                    <CompetitorRow key={i} competitor={comp} />
                  ))}
                  {analysis.competitors.length > 15 && (
                    <p className="text-xs text-muted-foreground">
                      +{analysis.competitors.length - 15} meer
                    </p>
                  )}
                </div>
              </>
            ) : (
              <NoDataMessage message="Geen concurrenten gevonden binnen de radius." />
            )}
          </TabsContent>
        </Tabs>

        {/* Sources footer */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Bronnen: {analysis.dataSources.join(", ")}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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

function DataQualityBadge({
  quality,
}: {
  quality: EnhancedBuurtAnalysis["dataQuality"];
}) {
  const colors = {
    volledig: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
    gedeeltelijk: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    basis: "bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={`text-[10px] ${colors[quality]}`}>
      {quality.charAt(0).toUpperCase() + quality.slice(1)}
    </Badge>
  );
}

function AgeBar({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{percentage}%</span>
    </div>
  );
}

function TransportIcon({ type }: { type: string }) {
  switch (type) {
    case "trein":
      return <Train className="h-4 w-4 text-primary" />;
    case "metro":
      return <Train className="h-4 w-4 text-red-500" />;
    case "tram":
      return <Bus className="h-4 w-4 text-blue-500" />;
    default:
      return <Bus className="h-4 w-4 text-muted-foreground" />;
  }
}

function NoDataMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4 text-center">
      <Info className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Concurrentie sub-components
// ---------------------------------------------------------------------------

const PRICE_LABELS = ["Gratis", "€", "€€", "€€€", "€€€€"];

function PriceLevelIndicator({ level }: { level: number }) {
  return (
    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
      {PRICE_LABELS[level] ?? `€×${level}`}
    </span>
  );
}

function CompetitorSummary({
  competitors,
}: {
  competitors: EnhancedBuurtAnalysis["competitors"];
}) {
  const withPrice = competitors.filter((c) => c.priceLevel != null);
  const avgPrice =
    withPrice.length > 0
      ? withPrice.reduce((sum, c) => sum + (c.priceLevel ?? 0), 0) /
        withPrice.length
      : null;

  const googleCount = competitors.filter((c) => c.bron === "google").length;
  const osmCount = competitors.filter((c) => c.bron === "osm").length;
  const closedTemp = competitors.filter(
    (c) => c.businessStatus === "CLOSED_TEMPORARILY",
  ).length;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-lg border p-2.5 text-center">
        <p className="text-lg font-semibold">{competitors.length}</p>
        <p className="text-[10px] text-muted-foreground">Totaal</p>
      </div>
      <div className="rounded-lg border p-2.5 text-center">
        <p className="text-lg font-semibold">
          {avgPrice != null ? PRICE_LABELS[Math.round(avgPrice)] ?? "—" : "—"}
        </p>
        <p className="text-[10px] text-muted-foreground">Gem. prijs</p>
      </div>
      <div className="rounded-lg border p-2.5 text-center">
        <p className="text-lg font-semibold">
          {googleCount}/{osmCount}
        </p>
        <p className="text-[10px] text-muted-foreground">Google/OSM</p>
      </div>
      {closedTemp > 0 && (
        <div className="col-span-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-2 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300">
            {closedTemp} tijdelijk gesloten
          </span>
        </div>
      )}
    </div>
  );
}

function CompetitorRow({
  competitor: comp,
}: {
  competitor: EnhancedBuurtAnalysis["competitors"][number];
}) {
  const [showHours, setShowHours] = useState(false);
  const isClosed = comp.businessStatus === "CLOSED_TEMPORARILY";

  return (
    <div
      className={`rounded-lg border px-3 py-2 ${isClosed ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <UtensilsCrossed className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">{comp.naam}</p>
              {isClosed && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 border-amber-300 text-amber-600 dark:text-amber-400"
                >
                  Gesloten
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{comp.type}</span>
              {comp.priceLevel != null && (
                <>
                  <span>·</span>
                  <PriceLevelIndicator level={comp.priceLevel} />
                </>
              )}
              {comp.reviewCount ? (
                <>
                  <span>·</span>
                  <span>{comp.reviewCount} reviews</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {comp.rating && (
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs">{comp.rating}</span>
            </div>
          )}
          <span className="text-xs text-muted-foreground">{comp.afstand}m</span>
          <Badge variant="outline" className="text-[10px] px-1">
            {comp.bron.toUpperCase()}
          </Badge>
          {comp.openingHours && (
            <button
              onClick={() => setShowHours(!showHours)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Openingstijden"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showHours ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Expandable opening hours */}
      {showHours && comp.openingHours && (
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-start gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-[11px] text-muted-foreground space-y-0.5">
              {comp.openingHours.weekdayDescriptions.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task #18: Marktanalyse summary card
// ---------------------------------------------------------------------------

function MarktAnalyseCard({
  competitors,
}: {
  competitors: EnhancedBuurtAnalysis["competitors"];
}) {
  const googleComps = competitors.filter((c) => c.bron === "google");
  if (googleComps.length < 2) return null;

  const withRating = googleComps.filter((c) => c.rating);
  const avgRating =
    withRating.length > 0
      ? withRating.reduce((sum, c) => sum + (c.rating ?? 0), 0) /
        withRating.length
      : null;

  const topRated = withRating
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 3);

  const withPrice = googleComps.filter((c) => c.priceLevel != null);
  const priceDistrib = [0, 0, 0, 0, 0]; // counts per level
  withPrice.forEach((c) => {
    if (c.priceLevel != null) priceDistrib[c.priceLevel]++;
  });

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3" />
        Marktanalyse
      </h4>

      {/* Rating overview */}
      {avgRating && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Gem. beoordeling
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-sm font-medium">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({withRating.length} zaken)
            </span>
          </div>
        </div>
      )}

      {/* Price distribution */}
      {withPrice.length >= 3 && (
        <div>
          <span className="text-xs text-muted-foreground">
            Prijsverdeling
          </span>
          <div className="flex items-end gap-1 mt-1 h-8">
            {PRICE_LABELS.slice(1).map((label, i) => {
              const count = priceDistrib[i + 1];
              const maxCount = Math.max(...priceDistrib.slice(1), 1);
              const height = count > 0 ? Math.max((count / maxCount) * 100, 15) : 0;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  {count > 0 && (
                    <span className="text-[9px] text-muted-foreground">
                      {count}
                    </span>
                  )}
                  <div
                    className="w-full rounded-sm bg-primary/20"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top rated */}
      {topRated.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Best beoordeeld</span>
          <div className="mt-1 space-y-1">
            {topRated.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="truncate">{c.naam}</span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                  <span>{c.rating}</span>
                  {c.reviewCount && (
                    <span className="text-muted-foreground">
                      ({c.reviewCount})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task #16: Opening hours gap detection
// ---------------------------------------------------------------------------

const DUTCH_DAYS = [
  "maandag",
  "dinsdag",
  "woensdag",
  "donderdag",
  "vrijdag",
  "zaterdag",
  "zondag",
];

function OpeningHoursInsights({
  competitors,
}: {
  competitors: EnhancedBuurtAnalysis["competitors"];
}) {
  const withHours = competitors.filter((c) => c.openingHours?.weekdayDescriptions?.length);
  if (withHours.length < 2) return null;

  // Parse opening hours to find gaps
  const dayPatterns: Record<string, { open: number; total: number }> = {};
  DUTCH_DAYS.forEach((day) => {
    dayPatterns[day] = { open: 0, total: withHours.length };
  });

  for (const comp of withHours) {
    for (const line of comp.openingHours!.weekdayDescriptions) {
      const lower = line.toLowerCase();
      for (const day of DUTCH_DAYS) {
        if (lower.includes(day)) {
          // Check if it contains "gesloten" / "closed"
          if (!lower.includes("gesloten") && !lower.includes("closed")) {
            dayPatterns[day].open++;
          }
        }
      }
    }
  }

  // Find days with low availability
  const insights: string[] = [];

  // Weekend gaps
  const zatOpen = dayPatterns["zaterdag"].open;
  const zonOpen = dayPatterns["zondag"].open;
  const total = withHours.length;

  if (zonOpen < total * 0.3 && total >= 3) {
    insights.push(`Slechts ${zonOpen}/${total} concurrenten open op zondag — kans voor zondagshoreca`);
  }
  if (zatOpen < total * 0.4 && total >= 3) {
    insights.push(`Slechts ${zatOpen}/${total} open op zaterdag — weekend niche`);
  }

  // Weekday gaps
  const weekdayOpens = DUTCH_DAYS.slice(0, 5).map((d) => dayPatterns[d].open);
  const minWeekday = Math.min(...weekdayOpens);
  if (minWeekday < total * 0.5 && total >= 3) {
    const gapDay = DUTCH_DAYS[weekdayOpens.indexOf(minWeekday)];
    insights.push(
      `${gapDay.charAt(0).toUpperCase() + gapDay.slice(1)}: slechts ${minWeekday}/${total} open — mogelijke doordeweekse niche`,
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-3">
      <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        Openingstijden-analyse
      </h4>
      <ul className="space-y-1">
        {insights.map((insight, i) => (
          <li
            key={i}
            className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-1.5"
          >
            <span className="mt-0.5">&#x2022;</span>
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InsightsPanel({
  stats,
  analysis,
}: {
  stats: EnhancedBuurtAnalysis["stats"];
  analysis: EnhancedBuurtAnalysis;
}) {
  const insights: { color: string; text: string }[] = [];

  if (stats.horecaCount > 15) {
    insights.push({
      color: "text-amber-500",
      text: "Hoge horeca-dichtheid — onderscheidend concept noodzakelijk",
    });
  }
  if (stats.horecaCount < 3) {
    insights.push({
      color: "text-green-500",
      text: "Weinig concurrentie — kans voor pioniers",
    });
  }
  if (stats.kantorenNabij > 5) {
    insights.push({
      color: "text-blue-500",
      text: "Veel kantoren — potentieel voor lunch/koffie concept",
    });
  }
  if (
    (analysis.transportAnalysis?.score ?? stats.transportScore) >= 7
  ) {
    insights.push({
      color: "text-green-500",
      text: "Uitstekende OV-bereikbaarheid — goed voor passanten",
    });
  }
  if (
    (analysis.transportAnalysis?.score ?? stats.transportScore) < 3
  ) {
    insights.push({
      color: "text-amber-500",
      text: "Beperkt OV — bestemmingshoreca met eigen publiek",
    });
  }
  if (analysis.demographics?.leeftijdsverdeling.jong ?? 0 > 35) {
    insights.push({
      color: "text-blue-500",
      text: "Jonge buurt — potentieel voor trendy concepten",
    });
  }

  if (insights.length === 0) return null;

  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Inzichten
      </h4>
      <ul className="space-y-1 text-sm">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className={`${insight.color} mt-0.5`}>&#x2022;</span>
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

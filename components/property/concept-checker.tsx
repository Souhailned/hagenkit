"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { checkConceptForLocation } from "@/app/actions/buurt-analysis";
import type { ConceptCheckResult } from "@/lib/buurt/types";
import {
  Sparkles,
  Check,
  AlertTriangle,
  Target,
  Users,
  MessageSquareText,
  RotateCcw,
  Search,
  Star,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Filter,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRICE_LEVEL_LABELS = ["Gratis", "\u20AC", "\u20AC\u20AC", "\u20AC\u20AC\u20AC", "\u20AC\u20AC\u20AC\u20AC"] as const;

interface ConceptCheckerProps {
  lat: number;
  lng: number;
  radius?: number;
}

const PRESET_CONCEPTS = [
  { label: "Smoothiebar", emoji: "\uD83E\uDD64" },
  { label: "Espressobar", emoji: "\u2615" },
  { label: "Wijnbar", emoji: "\uD83C\uDF77" },
  { label: "Pokebowl", emoji: "\uD83E\uDD57" },
  { label: "Bakkerij", emoji: "\uD83E\uDD50" },
  { label: "Sushi", emoji: "\uD83C\uDF63" },
  { label: "Pizzeria", emoji: "\uD83C\uDF55" },
  { label: "Broodjeszaak", emoji: "\uD83E\uDD6A" },
  { label: "IJssalon", emoji: "\uD83C\uDF66" },
  { label: "Cocktailbar", emoji: "\uD83C\uDF78" },
];

export function ConceptChecker({ lat, lng, radius = 500 }: ConceptCheckerProps) {
  const [result, setResult] = useState<ConceptCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customConcept, setCustomConcept] = useState("");
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [qualityExpanded, setQualityExpanded] = useState(false);

  async function checkConcept(concept: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedConcept(concept);
    setQualityExpanded(false);

    try {
      const response = await checkConceptForLocation(concept, lat, lng, radius);

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error ?? "Onbekende fout opgetreden.");
      }
    } catch {
      setError("Verbindingsfout. Controleer je internet en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setSelectedConcept(null);
    setCustomConcept("");
    setQualityExpanded(false);
  }

  const totalScanned =
    result
      ? result.competitionScan.directeCount +
        result.competitionScan.indirecteCount +
        (result.competitionScan.irrelevantFiltered ?? 0)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Concept Checker
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Past een specifiek horecaconcept op deze locatie? Selecteer of typ een
          concept.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Concept selection */}
        {!result && !loading && (
          <>
            <div className="flex flex-wrap gap-2">
              {PRESET_CONCEPTS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => checkConcept(preset.label)}
                >
                  <span>{preset.emoji}</span>
                  {preset.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Of typ je eigen concept..."
                value={customConcept}
                onChange={(e) => setCustomConcept(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customConcept.trim()) {
                    checkConcept(customConcept.trim());
                  }
                }}
              />
              <Button
                size="sm"
                disabled={!customConcept.trim()}
                onClick={() => checkConcept(customConcept.trim())}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Analyseren van &ldquo;{selectedConcept}&rdquo;...
            </div>
            <Skeleton className="h-20" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={reset}
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Probeer opnieuw
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Header with score + badges */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{result.concept}</h3>
                  <ClassificationBadge
                    aiClassified={result.competitionScan.aiClassified}
                    investigatedCompetitors={
                      result.competitionScan.investigatedCompetitors
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Viability analyse
                  </p>
                  {result.qualityScore != null && (
                    <QualityBadge score={result.qualityScore} />
                  )}
                </div>
              </div>
              <ViabilityGauge score={result.viabilityScore} />
            </div>

            {/* Irrelevant filtered notice */}
            {(result.competitionScan.irrelevantFiltered ?? 0) > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                <Filter className="h-3 w-3 shrink-0" />
                {result.competitionScan.irrelevantFiltered} irrelevante
                resultaten gefilterd
              </div>
            )}

            {/* Competition + Pricing */}
            <div className="rounded-lg border p-3 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                Concurrentie &amp; Markt
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-lg font-semibold">
                    {result.competitionScan.directeCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Direct</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-lg font-semibold">
                    {result.competitionScan.indirecteCount}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Indirect</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-lg font-semibold">
                    {result.pricePositioning.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Marktprijs
                  </p>
                </div>
              </div>

              {/* Price match indicator */}
              {result.pricePositioning.gemiddeld != null && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs",
                    result.pricePositioning.match
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
                  )}
                >
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  {result.pricePositioning.match
                    ? `Jouw concept (${PRICE_LEVEL_LABELS[result.pricePositioning.conceptLevel]}) past bij het marktgemiddelde (${result.pricePositioning.label})`
                    : `Let op: jouw concept (${PRICE_LEVEL_LABELS[result.pricePositioning.conceptLevel]}) wijkt af van het marktgemiddelde (${result.pricePositioning.label})`}
                </div>
              )}

              {/* Top competitors */}
              {result.topConcurrenten.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground font-medium">
                    Directe concurrenten:
                  </p>
                  {result.topConcurrenten.map((c, i) => (
                    <div
                      key={`${c.naam}-${c.afstand}-${i}`}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        {c.naam}
                        {result.competitionScan.investigatedCompetitors?.includes(c.naam) && (
                          <span className="bg-accent/10 text-accent-foreground text-[10px] px-1.5 py-0.5 rounded shrink-0">
                            Onderzocht
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {c.rating && (
                          <span className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            {c.rating}
                          </span>
                        )}
                        {c.priceLevel != null && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {PRICE_LEVEL_LABELS[c.priceLevel]}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {c.afstand}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Investigation stats — use total scanned as denominator */}
              {(result.competitionScan.investigatedCompetitors?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Search className="h-3 w-3 shrink-0" />
                  {result.competitionScan.investigatedCompetitors!.length} van{" "}
                  {totalScanned} concurrenten onderzocht via reviews
                </div>
              )}
            </div>

            {/* Gap analyse */}
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm">{result.gapAnalyse}</p>
            </div>

            {/* Doelgroep match */}
            <div className="rounded-lg border p-3">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                Doelgroep match
              </h4>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      result.doelgroepMatch.score >= 70
                        ? "bg-green-500 dark:bg-green-600"
                        : result.doelgroepMatch.score >= 40
                          ? "bg-amber-500 dark:bg-amber-600"
                          : "bg-red-400 dark:bg-red-500",
                    )}
                    style={{ width: `${result.doelgroepMatch.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8">
                  {result.doelgroepMatch.score}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.doelgroepMatch.uitleg}
              </p>
            </div>

            {/* Kansen & Risico's */}
            {(result.kansen.length > 0 || result.risicos.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.kansen.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-green-600 dark:text-green-400 mb-1.5 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Kansen
                    </h4>
                    <ul className="space-y-1">
                      {result.kansen.map((k, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-1.5"
                        >
                          <span className="text-green-500 dark:text-green-400 mt-0.5">
                            &#x2022;
                          </span>
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.risicos.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Risico&apos;s
                    </h4>
                    <ul className="space-y-1">
                      {result.risicos.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-1.5"
                        >
                          <span className="text-amber-500 dark:text-amber-400 mt-0.5">
                            &#x2022;
                          </span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* AI insight */}
            {result.aiInsight && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                  AI Advies
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.aiInsight}
                </p>
              </div>
            )}

            {/* Quality notes (expandable) */}
            {result.qualityNotes && result.qualityNotes.length > 0 && (
              <div className="rounded-lg border border-muted p-3">
                <button
                  type="button"
                  aria-expanded={qualityExpanded}
                  aria-controls="quality-notes-list"
                  className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setQualityExpanded(!qualityExpanded)}
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="h-3 w-3" />
                    Datakwaliteit ({result.qualityNotes.length} aandachtspunt
                    {result.qualityNotes.length !== 1 ? "en" : ""})
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      qualityExpanded && "rotate-180",
                    )}
                  />
                </button>
                {qualityExpanded && (
                  <ul id="quality-notes-list" className="mt-2 space-y-1">
                    {result.qualityNotes.map((note, i) => (
                      <li
                        key={note}
                        className="text-xs text-muted-foreground flex items-start gap-1.5"
                      >
                        <span className="text-muted-foreground/60 mt-0.5">
                          &#x2022;
                        </span>
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Reset button */}
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Probeer ander concept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Classification Badge
// ---------------------------------------------------------------------------

function ClassificationBadge({
  aiClassified,
  investigatedCompetitors,
}: {
  aiClassified?: boolean;
  investigatedCompetitors?: string[];
}) {
  if (aiClassified && (investigatedCompetitors?.length ?? 0) > 0) {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-[10px] px-1.5 py-0 h-5 border-primary/30 text-primary bg-primary/10"
      >
        <Search className="h-2.5 w-2.5" />
        AI-onderzocht
      </Badge>
    );
  }

  if (aiClassified) {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-[10px] px-1.5 py-0 h-5 border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950/30"
      >
        <ShieldCheck className="h-2.5 w-2.5" />
        AI-geverifieerd
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 text-[10px] px-1.5 py-0 h-5 text-muted-foreground"
    >
      Basis classificatie
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Quality Badge
// ---------------------------------------------------------------------------

function QualityBadge({ score }: { score: number }) {
  const label = score >= 70 ? "goed" : score >= 40 ? "redelijk" : "beperkt";
  const color =
    score >= 70
      ? "text-green-600 dark:text-green-400"
      : score >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

  return (
    <span
      className={cn("text-[10px] font-medium", color)}
      title={`Datakwaliteit: ${score}/100 (${label})`}
    >
      Kwaliteit: {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Viability Gauge
// ---------------------------------------------------------------------------

function ViabilityGauge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "text-green-500 dark:text-green-400"
      : score >= 40
        ? "text-amber-500 dark:text-amber-400"
        : "text-red-400 dark:text-red-500";

  const bgColor =
    score >= 70
      ? "stroke-green-500 dark:stroke-green-400"
      : score >= 40
        ? "stroke-amber-500 dark:stroke-amber-400"
        : "stroke-red-400 dark:stroke-red-500";

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90" aria-hidden="true">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="4"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          className={bgColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className={cn("absolute text-sm font-bold", color)} aria-label={`Viability score: ${score} van 100`}>
        {score}
      </span>
    </div>
  );
}

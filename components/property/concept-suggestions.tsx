"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBuurtAnalysis } from "@/app/actions/buurt-analysis";
import { generateConceptSuggestions, type ConceptAnalysis } from "@/lib/concept-suggestion";
import { Lightbulb, Check, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConceptSuggestionsProps {
  lat: number;
  lng: number;
  surface: number;
  hasKitchen?: boolean;
  hasTerrace?: boolean;
  seatingCapacity?: number;
}

export function ConceptSuggestions({
  lat, lng, surface, hasKitchen, hasTerrace, seatingCapacity,
}: ConceptSuggestionsProps) {
  const [analysis, setAnalysis] = useState<ConceptAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getBuurtAnalysis(lat, lng, 500).then((buurt) => {
      if (cancelled || !buurt) {
        setLoading(false);
        return;
      }
      const result = generateConceptSuggestions({
        surface,
        buurtAnalysis: buurt,
        hasKitchen,
        hasTerrace,
        seatingCapacity,
      });
      setAnalysis(result);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [lat, lng, surface, hasKitchen, hasTerrace, seatingCapacity]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Wat past hier?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!analysis || analysis.suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Wat past hier?
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {analysis.locationProfile}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {analysis.suggestions.map((s, i) => {
          const isExpanded = expandedIdx === i;
          const scoreColor = s.score >= 70 ? "text-green-600" : s.score >= 50 ? "text-amber-600" : "text-muted-foreground";
          const scoreBg = s.score >= 70 ? "bg-green-500" : s.score >= 50 ? "bg-amber-500" : "bg-muted-foreground";

          return (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                i === 0 && "border-green-500/30 bg-green-500/5",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="font-medium">
                      {i === 0 && <Badge variant="outline" className="mr-2 text-xs text-green-600 border-green-500/30">Top match</Badge>}
                      {s.concept}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.reasoning}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Score bar */}
                  <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", scoreBg)} style={{ width: `${s.score}%` }} />
                  </div>
                  <span className={cn("text-sm font-semibold w-8", scoreColor)}>{s.score}</span>
                </div>
              </div>

              {/* Expand button */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs text-muted-foreground"
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
              >
                {isExpanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {isExpanded ? "Minder" : "Details"}
              </Button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  {s.opportunities.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1.5 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Kansen
                      </p>
                      <ul className="space-y-1">
                        {s.opportunities.map((o, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">•</span> {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.risks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Aandachtspunten
                      </p>
                      <ul className="space-y-1">
                        {s.risks.map((r, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-start gap-1.5">
                            <span className="text-amber-500 mt-0.5">•</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

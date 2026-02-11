"use client";

import * as React from "react";
import { ChartBar, Star, Warning, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ListingOptimizerProps {
  property: {
    title: string;
    description: string | null;
    images: string[];
    city: string;
    address: string;
    rentPrice: number | null;
    surfaceTotal: number | null;
    buildYear: number | null;
    seatingCapacityInside: number | null;
    seatingCapacityOutside: number | null;
  };
}

interface ScoreItem {
  label: string;
  score: number;
  maxScore: number;
  tip?: string;
  status: "good" | "warn" | "bad";
}

function calculateScore(property: ListingOptimizerProps["property"]): {
  total: number;
  max: number;
  items: ScoreItem[];
} {
  const items: ScoreItem[] = [];

  // Title quality (max 15)
  const titleLen = property.title?.length ?? 0;
  const titleScore = titleLen > 40 ? 15 : titleLen > 20 ? 10 : titleLen > 0 ? 5 : 0;
  items.push({
    label: "Titel",
    score: titleScore,
    maxScore: 15,
    tip: titleScore < 15 ? "Gebruik een beschrijvende titel van 40+ tekens met type en locatie" : undefined,
    status: titleScore >= 15 ? "good" : titleScore >= 10 ? "warn" : "bad",
  });

  // Description quality (max 25)
  const descLen = property.description?.length ?? 0;
  const descScore = descLen > 300 ? 25 : descLen > 150 ? 15 : descLen > 50 ? 8 : 0;
  items.push({
    label: "Beschrijving",
    score: descScore,
    maxScore: 25,
    tip: descScore < 25 ? "Schrijf een gedetailleerde beschrijving van 300+ tekens met USPs" : undefined,
    status: descScore >= 25 ? "good" : descScore >= 15 ? "warn" : "bad",
  });

  // Photos (max 20)
  const photoCount = property.images?.length ?? 0;
  const photoScore = photoCount >= 10 ? 20 : photoCount >= 5 ? 15 : photoCount >= 1 ? 8 : 0;
  items.push({
    label: "Foto's",
    score: photoScore,
    maxScore: 20,
    tip: photoScore < 20 ? `Voeg meer foto's toe (nu ${photoCount}, ideaal 10+)` : undefined,
    status: photoScore >= 20 ? "good" : photoScore >= 15 ? "warn" : "bad",
  });

  // Price (max 10)
  const priceScore = property.rentPrice ? 10 : 0;
  items.push({
    label: "Prijs",
    score: priceScore,
    maxScore: 10,
    tip: priceScore < 10 ? "Voeg een huurprijs toe — listings met prijs krijgen 3x meer reacties" : undefined,
    status: priceScore >= 10 ? "good" : "bad",
  });

  // Details completeness (max 15)
  let detailScore = 0;
  if (property.surfaceTotal) detailScore += 5;
  if (property.buildYear) detailScore += 5;
  if (property.seatingCapacityInside || property.seatingCapacityOutside) detailScore += 5;
  items.push({
    label: "Kenmerken",
    score: detailScore,
    maxScore: 15,
    tip: detailScore < 15 ? "Vul oppervlakte, bouwjaar en capaciteit in voor betere vindbaarheid" : undefined,
    status: detailScore >= 15 ? "good" : detailScore >= 10 ? "warn" : "bad",
  });

  // Location (max 15)
  const locationScore = property.city && property.address ? 15 : property.city ? 8 : 0;
  items.push({
    label: "Locatie",
    score: locationScore,
    maxScore: 15,
    tip: locationScore < 15 ? "Voeg een volledig adres toe voor de kaartweergave" : undefined,
    status: locationScore >= 15 ? "good" : locationScore >= 8 ? "warn" : "bad",
  });

  const total = items.reduce((sum, item) => sum + item.score, 0);
  const max = items.reduce((sum, item) => sum + item.maxScore, 0);

  return { total, max, items };
}

export function ListingOptimizer({ property }: ListingOptimizerProps) {
  const { total, max, items } = calculateScore(property);
  const percentage = Math.round((total / max) * 100);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "[&>div]:bg-green-500";
    if (pct >= 50) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  const tips = items.filter((i) => i.tip);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBar className="h-5 w-5 text-primary" weight="duotone" />
          Listing Score
        </CardTitle>
        <CardDescription>
          Optimaliseer je listing voor meer bereik en reacties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall score */}
        <div className="flex items-center gap-4">
          <div className={cn("text-3xl font-bold", getScoreColor(percentage))}>
            {percentage}%
          </div>
          <div className="flex-1">
            <Progress value={percentage} className={cn("h-3", getProgressColor(percentage))} />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.status === "good" && (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" weight="fill" />
              )}
              {item.status === "warn" && (
                <Warning className="h-4 w-4 text-yellow-500 shrink-0" weight="fill" />
              )}
              {item.status === "bad" && (
                <Warning className="h-4 w-4 text-red-500 shrink-0" weight="fill" />
              )}
              <span className="flex-1">{item.label}</span>
              <span className="text-muted-foreground">
                {item.score}/{item.maxScore}
              </span>
            </div>
          ))}
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Verbeterpunten
            </p>
            {tips.slice(0, 3).map((tip) => (
              <div key={tip.label} className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" weight="bold" />
                <span>{tip.tip}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

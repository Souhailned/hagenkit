"use client";

import { cn } from "@/lib/utils";
import { getTemperatureColor, getTemperatureBg, type LeadScore } from "@/lib/lead-scoring";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeadThermometerProps {
  score: LeadScore;
  compact?: boolean;
}

export function LeadThermometer({ score, compact = false }: LeadThermometerProps) {
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              getTemperatureBg(score.temperature),
              getTemperatureColor(score.temperature),
            )}>
              <span>{score.emoji}</span>
              <span>{score.score}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">{score.emoji} {score.label} lead — {score.score}/100</p>
            <p className="text-xs text-muted-foreground mt-1">{score.suggestedAction}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      {/* Score header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{score.emoji}</span>
          <div>
            <p className={cn("font-semibold", getTemperatureColor(score.temperature))}>
              {score.label} lead
            </p>
            <p className="text-xs text-muted-foreground">Score: {score.score}/100</p>
          </div>
        </div>
        {/* Visual thermometer bar */}
        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", {
              "bg-red-500": score.temperature === "hot",
              "bg-amber-500": score.temperature === "warm",
              "bg-blue-400": score.temperature === "cold",
            })}
            style={{ width: `${score.score}%` }}
          />
        </div>
      </div>

      {/* Factors breakdown */}
      <div className="space-y-1.5">
        {score.factors.map((factor) => (
          <div key={factor.name} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{factor.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${(factor.points / factor.maxPoints) * 100}%` }}
                />
              </div>
              <span className="text-muted-foreground w-8 text-right">
                {factor.points}/{factor.maxPoints}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested action */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
          💡 Aanbevolen actie
        </p>
        <p className="text-sm">{score.suggestedAction}</p>
      </div>
    </div>
  );
}

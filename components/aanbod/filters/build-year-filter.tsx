"use client";

import * as React from "react";
import { Buildings } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const BUILD_PERIODS = [
  { value: "pre-1920", label: "Voor 1920", min: 0, max: 1919 },
  { value: "1920-1945", label: "1920 - 1945", min: 1920, max: 1945 },
  { value: "1946-1970", label: "1946 - 1970", min: 1946, max: 1970 },
  { value: "1971-1990", label: "1971 - 1990", min: 1971, max: 1990 },
  { value: "1991-2010", label: "1991 - 2010", min: 1991, max: 2010 },
  { value: "2011-now", label: "2011 of nieuwer", min: 2011, max: 9999 },
] as const;

export type BuildPeriod = (typeof BUILD_PERIODS)[number]["value"];

interface BuildYearFilterProps {
  selectedPeriods: string[];
  onChange: (periods: string[]) => void;
}

export function BuildYearFilter({ selectedPeriods, onChange }: BuildYearFilterProps) {
  const togglePeriod = (period: string) => {
    if (selectedPeriods.includes(period)) {
      onChange(selectedPeriods.filter((p) => p !== period));
    } else {
      onChange([...selectedPeriods, period]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Buildings className="h-4 w-4 text-muted-foreground" weight="duotone" />
        <span className="text-sm font-medium">Bouwperiode</span>
      </div>

      <div className="space-y-2">
        {BUILD_PERIODS.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={`build-${value}`}
              checked={selectedPeriods.includes(value)}
              onCheckedChange={() => togglePeriod(value)}
            />
            <Label
              htmlFor={`build-${value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Convert selected build periods to min/max year ranges for query */
export function buildPeriodsToYearRanges(periods: string[]): { min: number; max: number }[] {
  return periods
    .map((p) => BUILD_PERIODS.find((bp) => bp.value === p))
    .filter(Boolean)
    .map((bp) => ({ min: bp!.min, max: bp!.max }));
}

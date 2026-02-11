"use client";

import * as React from "react";
import { Clock } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PERIOD_OPTIONS = [
  { value: "0", label: "Alle" },
  { value: "1", label: "Vandaag" },
  { value: "3", label: "3 dagen" },
  { value: "7", label: "7 dagen" },
  { value: "14", label: "14 dagen" },
  { value: "30", label: "30 dagen" },
] as const;

interface PublishedFilterProps {
  publishedWithinDays?: number;
  onChange: (days: number | undefined) => void;
}

export function PublishedFilter({
  publishedWithinDays,
  onChange,
}: PublishedFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" weight="duotone" />
        <span className="text-sm font-medium">Aangeboden sinds</span>
      </div>

      <RadioGroup
        value={publishedWithinDays?.toString() ?? "0"}
        onValueChange={(val) => {
          const num = parseInt(val, 10);
          onChange(num === 0 ? undefined : num);
        }}
        className="space-y-2"
      >
        {PERIOD_OPTIONS.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <RadioGroupItem value={value} id={`published-${value}`} />
            <Label
              htmlFor={`published-${value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

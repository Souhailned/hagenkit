"use client";

import * as React from "react";
import { Eye } from "@phosphor-icons/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Beschikbaar" },
  { value: "UNDER_OFFER", label: "In onderhandeling" },
  { value: "RENTED", label: "Verhuurd" },
  { value: "SOLD", label: "Verkocht" },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

interface StatusFilterProps {
  selectedStatuses: string[];
  onChange: (statuses: string[]) => void;
}

export function StatusFilter({
  selectedStatuses,
  onChange,
}: StatusFilterProps) {
  const toggleStatus = (status: StatusValue) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-muted-foreground" weight="duotone" />
        <span className="text-sm font-medium">Beschikbaarheid</span>
      </div>

      <div className="space-y-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={`status-${value}`}
              checked={selectedStatuses.includes(value)}
              onCheckedChange={() => toggleStatus(value)}
            />
            <Label
              htmlFor={`status-${value}`}
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

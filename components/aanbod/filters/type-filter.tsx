"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { PropertyType } from "@/types/property";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TypeFilterProps {
  types: { value: PropertyType; label: string }[];
  selectedTypes: PropertyType[];
  onChange: (types: PropertyType[]) => void;
}

export function TypeFilter({
  types,
  selectedTypes,
  onChange,
}: TypeFilterProps) {
  const toggleType = (type: PropertyType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Type</span>
      </div>

      <div className="space-y-2">
        {types.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={`type-${value}`}
              checked={selectedTypes.includes(value)}
              onCheckedChange={() => toggleType(value)}
            />
            <Label
              htmlFor={`type-${value}`}
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

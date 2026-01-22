"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { PropertyFeature } from "@/types/property";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FeaturesFilterProps {
  features: { value: PropertyFeature; label: string }[];
  selectedFeatures: PropertyFeature[];
  onChange: (features: PropertyFeature[]) => void;
}

export function FeaturesFilter({
  features,
  selectedFeatures,
  onChange,
}: FeaturesFilterProps) {
  const toggleFeature = (feature: PropertyFeature) => {
    if (selectedFeatures.includes(feature)) {
      onChange(selectedFeatures.filter((f) => f !== feature));
    } else {
      onChange([...selectedFeatures, feature]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Kenmerken</span>
      </div>

      <div className="space-y-2">
        {features.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={`feature-${value}`}
              checked={selectedFeatures.includes(value)}
              onCheckedChange={() => toggleFeature(value)}
            />
            <Label
              htmlFor={`feature-${value}`}
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

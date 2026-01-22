"use client";

import * as React from "react";
import { Maximize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AreaFilterProps {
  areaRange: { min: number; max: number };
  minArea?: number;
  maxArea?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

export function AreaFilter({
  minArea,
  maxArea,
  onMinChange,
  onMaxChange,
}: AreaFilterProps) {
  const [localMin, setLocalMin] = React.useState<string>(
    minArea?.toString() || ""
  );
  const [localMax, setLocalMax] = React.useState<string>(
    maxArea?.toString() || ""
  );

  // Sync local state with props
  React.useEffect(() => {
    setLocalMin(minArea?.toString() || "");
  }, [minArea]);

  React.useEffect(() => {
    setLocalMax(maxArea?.toString() || "");
  }, [maxArea]);

  const handleMinBlur = () => {
    const value = localMin ? parseInt(localMin, 10) : undefined;
    onMinChange(value && !isNaN(value) ? value : undefined);
  };

  const handleMaxBlur = () => {
    const value = localMax ? parseInt(localMax, 10) : undefined;
    onMaxChange(value && !isNaN(value) ? value : undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Maximize2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Oppervlakte</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="area-min" className="text-xs text-muted-foreground">
            Minimum
          </Label>
          <div className="relative">
            <Input
              id="area-min"
              type="number"
              placeholder="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={handleMinBlur}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              m²
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="area-max" className="text-xs text-muted-foreground">
            Maximum
          </Label>
          <div className="relative">
            <Input
              id="area-max"
              type="number"
              placeholder="Geen max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={handleMaxBlur}
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              m²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

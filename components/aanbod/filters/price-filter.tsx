"use client";

import * as React from "react";
import { Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PriceFilterProps {
  priceRange: { min: number; max: number };
  minPrice?: number;
  maxPrice?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
}

export function PriceFilter({
  priceRange,
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}: PriceFilterProps) {
  const [localMin, setLocalMin] = React.useState<string>(
    minPrice?.toString() || ""
  );
  const [localMax, setLocalMax] = React.useState<string>(
    maxPrice?.toString() || ""
  );

  // Sync local state with props
  React.useEffect(() => {
    setLocalMin(minPrice?.toString() || "");
  }, [minPrice]);

  React.useEffect(() => {
    setLocalMax(maxPrice?.toString() || "");
  }, [maxPrice]);

  const handleMinBlur = () => {
    const value = localMin ? parseInt(localMin, 10) : undefined;
    onMinChange(value && !isNaN(value) ? value : undefined);
  };

  const handleMaxBlur = () => {
    const value = localMax ? parseInt(localMax, 10) : undefined;
    onMaxChange(value && !isNaN(value) ? value : undefined);
  };

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values;
    setLocalMin(min.toString());
    setLocalMax(max.toString());
    onMinChange(min === priceRange.min ? undefined : min);
    onMaxChange(max === priceRange.max ? undefined : max);
  };

  const currentMin = minPrice ?? priceRange.min;
  const currentMax = maxPrice ?? priceRange.max;

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${Math.round(value / 1000)}K`;
    }
    return `€${value}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Euro className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Prijs</span>
      </div>

      {/* Slider */}
      <div className="px-1">
        <Slider
          min={priceRange.min}
          max={priceRange.max}
          step={1000}
          value={[currentMin, currentMax]}
          onValueChange={handleSliderChange}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(currentMin)}</span>
          <span>{formatPrice(currentMax)}</span>
        </div>
      </div>

      {/* Input fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="price-min" className="text-xs text-muted-foreground">
            Minimum
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
            <Input
              id="price-min"
              type="number"
              placeholder="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={handleMinBlur}
              className="pl-7"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price-max" className="text-xs text-muted-foreground">
            Maximum
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
            <Input
              id="price-max"
              type="number"
              placeholder="Geen max"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={handleMaxBlur}
              className="pl-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useId, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  BUDGET_CONFIG,
  formatEuro,
  parseEuro,
  type BudgetData,
  type StepProps,
} from "./types";

/**
 * StepBudget Component
 *
 * Two number inputs for min/max budget with euro formatting and
 * an optional dual-thumb slider for visual budget range selection.
 *
 * @example
 * ```tsx
 * <StepBudget
 *   data={{ minBudget: 50000, maxBudget: 150000 }}
 *   onUpdate={(data) => setBudgetData(data)}
 * />
 * ```
 */
export function StepBudget({ data, onUpdate }: StepProps<BudgetData>) {
  const minInputId = useId();
  const maxInputId = useId();
  const sliderId = useId();

  // Local state for formatted input display
  const [minInputValue, setMinInputValue] = useState(
    data.minBudget !== null ? formatEuro(data.minBudget) : ""
  );
  const [maxInputValue, setMaxInputValue] = useState(
    data.maxBudget !== null ? formatEuro(data.maxBudget) : ""
  );

  // Sync local state when data changes externally
  useEffect(() => {
    setMinInputValue(data.minBudget !== null ? formatEuro(data.minBudget) : "");
    setMaxInputValue(data.maxBudget !== null ? formatEuro(data.maxBudget) : "");
  }, [data.minBudget, data.maxBudget]);

  const handleMinInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setMinInputValue(rawValue);
    },
    []
  );

  const handleMaxInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setMaxInputValue(rawValue);
    },
    []
  );

  const handleMinInputBlur = useCallback(() => {
    const parsed = parseEuro(minInputValue);
    if (parsed !== null) {
      // Clamp to valid range
      const clamped = Math.max(
        BUDGET_CONFIG.MIN,
        Math.min(parsed, data.maxBudget ?? BUDGET_CONFIG.MAX)
      );
      onUpdate({ ...data, minBudget: clamped });
      setMinInputValue(formatEuro(clamped));
    } else if (minInputValue === "") {
      onUpdate({ ...data, minBudget: null });
    }
  }, [minInputValue, data, onUpdate]);

  const handleMaxInputBlur = useCallback(() => {
    const parsed = parseEuro(maxInputValue);
    if (parsed !== null) {
      // Clamp to valid range
      const clamped = Math.max(
        data.minBudget ?? BUDGET_CONFIG.MIN,
        Math.min(parsed, BUDGET_CONFIG.MAX)
      );
      onUpdate({ ...data, maxBudget: clamped });
      setMaxInputValue(formatEuro(clamped));
    } else if (maxInputValue === "") {
      onUpdate({ ...data, maxBudget: null });
    }
  }, [maxInputValue, data, onUpdate]);

  const handleSliderChange = useCallback(
    (values: number[]) => {
      onUpdate({
        minBudget: values[0],
        maxBudget: values[1],
      });
    },
    [onUpdate]
  );

  // Calculate slider values, using defaults if null
  const sliderValues = [
    data.minBudget ?? BUDGET_CONFIG.DEFAULT_MIN,
    data.maxBudget ?? BUDGET_CONFIG.DEFAULT_MAX,
  ];

  // Calculate visual indicators for budget range
  const rangeText =
    data.minBudget !== null && data.maxBudget !== null
      ? `${formatEuro(data.minBudget)} - ${formatEuro(data.maxBudget)}`
      : "Selecteer je budgetrange";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Wat is je budget?
        </h2>
        <p className="text-sm text-muted-foreground">
          Geef je minimale en maximale investering aan voor de overname
        </p>
      </div>

      {/* Budget Range Visual Display */}
      <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Jouw budgetrange
        </p>
        <p
          className={cn(
            "mt-2 text-2xl font-bold tracking-tight transition-colors",
            data.minBudget !== null && data.maxBudget !== null
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {rangeText}
        </p>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        {/* Min Budget Input */}
        <div className="space-y-2">
          <Label htmlFor={minInputId} className="text-sm font-medium">
            Minimum budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
            <Input
              id={minInputId}
              type="text"
              inputMode="numeric"
              value={minInputValue.replace(/^€\s*/, "")}
              onChange={handleMinInputChange}
              onBlur={handleMinInputBlur}
              placeholder="50.000"
              className="pl-7"
              aria-describedby={`${minInputId}-hint`}
            />
          </div>
          <p id={`${minInputId}-hint`} className="text-xs text-muted-foreground">
            Vanaf {formatEuro(BUDGET_CONFIG.MIN)}
          </p>
        </div>

        {/* Max Budget Input */}
        <div className="space-y-2">
          <Label htmlFor={maxInputId} className="text-sm font-medium">
            Maximum budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
            <Input
              id={maxInputId}
              type="text"
              inputMode="numeric"
              value={maxInputValue.replace(/^€\s*/, "")}
              onChange={handleMaxInputChange}
              onBlur={handleMaxInputBlur}
              placeholder="150.000"
              className="pl-7"
              aria-describedby={`${maxInputId}-hint`}
            />
          </div>
          <p id={`${maxInputId}-hint`} className="text-xs text-muted-foreground">
            Tot {formatEuro(BUDGET_CONFIG.MAX)}
          </p>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-4">
        <Label htmlFor={sliderId} className="text-sm font-medium">
          Of gebruik de slider
        </Label>
        <div className="px-2">
          <Slider
            id={sliderId}
            value={sliderValues}
            min={BUDGET_CONFIG.MIN}
            max={BUDGET_CONFIG.MAX}
            step={BUDGET_CONFIG.STEP}
            onValueChange={handleSliderChange}
            className="w-full"
            aria-label="Budget range slider"
          />
        </div>
        {/* Slider Labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatEuro(BUDGET_CONFIG.MIN)}</span>
          <span>{formatEuro(BUDGET_CONFIG.MAX / 2)}</span>
          <span>{formatEuro(BUDGET_CONFIG.MAX)}</span>
        </div>
      </div>

      {/* Budget Tips */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h3 className="text-sm font-medium text-foreground">
          💡 Budgetadvies
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Klein café: €25.000 - €75.000</li>
          <li>• Middelgroot restaurant: €75.000 - €200.000</li>
          <li>• Grote horecazaak: €200.000+</li>
        </ul>
      </div>
    </div>
  );
}

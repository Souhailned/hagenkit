"use client";

import { useCallback, useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  BUSINESS_TYPES,
  type BusinessTypeData,
  type BusinessType,
  type StepProps,
} from "./types";

/**
 * StepBusinessType Component
 *
 * Radio group for selecting horeca business type with optional
 * concept description field. Follows controlled component pattern.
 *
 * @example
 * ```tsx
 * <StepBusinessType
 *   data={{ businessType: null, conceptDescription: "" }}
 *   onUpdate={(data) => setBusinessData(data)}
 * />
 * ```
 */
export function StepBusinessType({
  data,
  onUpdate,
}: StepProps<BusinessTypeData>) {
  const radioGroupId = useId();
  const textareaId = useId();

  const handleBusinessTypeChange = useCallback(
    (value: string) => {
      onUpdate({
        ...data,
        businessType: value as BusinessType,
      });
    },
    [data, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({
        ...data,
        conceptDescription: e.target.value,
      });
    },
    [data, onUpdate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Wat voor horecazaak zoek je?
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecteer het type bedrijf dat het beste bij jouw plannen past
        </p>
      </div>

      {/* Business Type Selection */}
      <RadioGroup
        id={radioGroupId}
        value={data.businessType ?? undefined}
        onValueChange={handleBusinessTypeChange}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {BUSINESS_TYPES.map((type) => (
          <Label
            key={type.value}
            htmlFor={`${radioGroupId}-${type.value}`}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 bg-card p-4 text-center shadow-sm transition-all duration-200",
              "hover:border-primary/50 hover:bg-accent/50 hover:shadow-md",
              "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:shadow-md",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            )}
          >
            <RadioGroupItem
              id={`${radioGroupId}-${type.value}`}
              value={type.value}
              className="sr-only"
            />
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl transition-transform duration-200",
                "group-hover:scale-110",
                "group-has-[[data-state=checked]]:bg-primary/10 group-has-[[data-state=checked]]:scale-110"
              )}
              aria-hidden="true"
            >
              {type.icon}
            </span>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                "group-has-[[data-state=checked]]:text-primary"
              )}
            >
              {type.label}
            </span>

            {/* Selection indicator */}
            <div
              className={cn(
                "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity",
                "group-has-[[data-state=checked]]:opacity-100"
              )}
              aria-hidden="true"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </Label>
        ))}
      </RadioGroup>

      {/* Concept Description - Always visible but highlighted when "other" is selected */}
      <div
        className={cn(
          "space-y-2 transition-all duration-300",
          data.businessType === "other"
            ? "opacity-100"
            : "opacity-70 hover:opacity-100"
        )}
      >
        <Label
          htmlFor={textareaId}
          className="text-sm font-medium text-foreground"
        >
          Beschrijf je concept
          {data.businessType === "other" ? (
            <span className="ml-1 text-destructive">*</span>
          ) : (
            <span className="ml-1 text-muted-foreground">(optioneel)</span>
          )}
        </Label>
        <Textarea
          id={textareaId}
          value={data.conceptDescription}
          onChange={handleDescriptionChange}
          placeholder={
            data.businessType === "other"
              ? "Vertel ons meer over het type zaak dat je zoekt..."
              : "Heb je specifieke ideeën of wensen voor je concept? Deel ze hier..."
          }
          className={cn(
            "min-h-[100px] resize-none transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20",
            data.businessType === "other" && "ring-2 ring-primary/30"
          )}
          aria-describedby={`${textareaId}-hint`}
        />
        <p
          id={`${textareaId}-hint`}
          className="text-xs text-muted-foreground"
        >
          {data.businessType === "other"
            ? "Geef een beschrijving zodat we beter kunnen begrijpen wat je zoekt"
            : "Optioneel: meer details helpen ons betere matches te vinden"}
        </p>
      </div>
    </div>
  );
}

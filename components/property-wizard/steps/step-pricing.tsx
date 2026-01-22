"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  PriceType,
  PRICE_TYPES,
  PRICE_TYPE_LABELS,
  PropertyWizardData,
} from "../types";
import { IconHome, IconKey, IconExchange } from "@tabler/icons-react";

interface StepPricingProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
}

const PRICE_TYPE_ICONS: Record<PriceType, React.ComponentType<{ className?: string }>> = {
  RENT: IconKey,
  SALE: IconHome,
  RENT_OR_SALE: IconExchange,
};

const PRICE_TYPE_DESCRIPTIONS: Record<PriceType, string> = {
  RENT: "Maandelijkse huurprijs",
  SALE: "Eenmalige koopsom",
  RENT_OR_SALE: "Beide opties beschikbaar",
};

// Format number with thousands separator
const formatPrice = (value: number | undefined): string => {
  if (value === undefined || isNaN(value)) return "";
  return value.toLocaleString("nl-NL");
};

// Parse price from formatted string to cents
const parsePrice = (value: string): number | undefined => {
  const cleaned = value.replace(/[^\d]/g, "");
  if (!cleaned) return undefined;
  return parseInt(cleaned, 10);
};

export function StepPricing({ data, onUpdate }: StepPricingProps) {
  const showRentFields = data.priceType === "RENT" || data.priceType === "RENT_OR_SALE";
  const showSaleFields = data.priceType === "SALE" || data.priceType === "RENT_OR_SALE";

  return (
    <div className="space-y-6">
      {/* Price Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Aanbiedingstype <span className="text-destructive">*</span>
        </Label>

        <RadioGroup
          value={data.priceType ?? ""}
          onValueChange={(value) => onUpdate({ priceType: value as PriceType })}
          className="grid gap-3 sm:grid-cols-3"
        >
          {PRICE_TYPES.map((type) => {
            const Icon = PRICE_TYPE_ICONS[type];
            const isSelected = data.priceType === type;

            return (
              <Label
                key={type}
                htmlFor={`price-type-${type}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <RadioGroupItem value={type} id={`price-type-${type}`} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "size-4",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-medium">{PRICE_TYPE_LABELS[type]}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {PRICE_TYPE_DESCRIPTIONS[type]}
                  </p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Conditional price fields based on type */}
      {data.priceType && (
        <div className="space-y-6 rounded-lg border bg-card p-4">
          {/* Rent Price */}
          {showRentFields && (
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <IconKey className="size-4 text-primary" />
                Huurprijs
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rentPrice" className="text-sm">
                    Huurprijs per maand <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
                    </span>
                    <Input
                      id="rentPrice"
                      placeholder="2.500"
                      value={formatPrice(data.rentPrice)}
                      onChange={(e) => onUpdate({ rentPrice: parsePrice(e.target.value) })}
                      className="h-11 pl-8 pr-16"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      /maand
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicesCosts" className="text-sm">
                    Servicekosten (optioneel)
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
                    </span>
                    <Input
                      id="servicesCosts"
                      placeholder="250"
                      value={formatPrice(data.servicesCosts)}
                      onChange={(e) => onUpdate({ servicesCosts: parsePrice(e.target.value) })}
                      className="h-11 pl-8 pr-16"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      /maand
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositMonths" className="text-sm">
                  Borg (in maanden huur)
                </Label>
                <Input
                  id="depositMonths"
                  type="number"
                  min={0}
                  max={12}
                  placeholder="3"
                  value={data.depositMonths ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      depositMonths: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="h-11 w-full sm:w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Standaard is 2-3 maanden borg gebruikelijk
                </p>
              </div>
            </div>
          )}

          {/* Divider when both */}
          {showRentFields && showSaleFields && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">of</span>
              </div>
            </div>
          )}

          {/* Sale Price */}
          {showSaleFields && (
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <IconHome className="size-4 text-primary" />
                Koopprijs
              </h4>
              <div className="space-y-2">
                <Label htmlFor="salePrice" className="text-sm">
                  Vraagprijs <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <Input
                    id="salePrice"
                    placeholder="450.000"
                    value={formatPrice(data.salePrice)}
                    onChange={(e) => onUpdate({ salePrice: parsePrice(e.target.value) })}
                    className="h-11 pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Vermeld de vraagprijs exclusief BTW en overdrachtskosten
                </p>
              </div>
            </div>
          )}

          {/* Price summary */}
          {(data.rentPrice || data.salePrice) && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Samenvatting</p>
              <div className="mt-2 space-y-1">
                {data.rentPrice && (
                  <p className="text-sm">
                    Huur: <span className="font-medium">€{formatPrice(data.rentPrice)}/maand</span>
                    {data.servicesCosts && (
                      <span className="text-muted-foreground">
                        {" "}+ €{formatPrice(data.servicesCosts)} servicekosten
                      </span>
                    )}
                  </p>
                )}
                {data.salePrice && (
                  <p className="text-sm">
                    Koop: <span className="font-medium">€{formatPrice(data.salePrice)}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

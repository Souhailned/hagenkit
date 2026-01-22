"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropertyWizardData } from "../types";
import {
  IconRuler2,
  IconBuildingFactory2,
  IconToolsKitchen2,
  IconBox,
  IconSunHigh,
  IconStairs,
  IconArrowsVertical,
} from "@tabler/icons-react";

interface StepDimensionsProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
}

interface DimensionFieldProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number | undefined | null;
  onChange: (value: number | undefined) => void;
  unit: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
}

function DimensionField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  unit,
  required = false,
  placeholder = "0",
  description,
}: DimensionFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={0}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) =>
            onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
          }
          className="h-11 pr-14"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function StepDimensions({ data, onUpdate }: StepDimensionsProps) {
  return (
    <div className="space-y-6">
      {/* Primary - Total surface */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <DimensionField
          id="surfaceTotal"
          label="Totale oppervlakte"
          icon={IconRuler2}
          value={data.surfaceTotal}
          onChange={(value) => onUpdate({ surfaceTotal: value ?? null })}
          unit="m²"
          required
          placeholder="150"
          description="Het totale vloeroppervlak van het pand"
        />
      </div>

      {/* Secondary surfaces */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Ruimteverdeling (optioneel)
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <DimensionField
            id="surfaceCommercial"
            label="Commerciële ruimte"
            icon={IconBuildingFactory2}
            value={data.surfaceCommercial}
            onChange={(value) => onUpdate({ surfaceCommercial: value })}
            unit="m²"
            placeholder="100"
            description="Gastengedeelte / zaaloppervlakte"
          />
          <DimensionField
            id="surfaceKitchen"
            label="Keuken"
            icon={IconToolsKitchen2}
            value={data.surfaceKitchen}
            onChange={(value) => onUpdate({ surfaceKitchen: value })}
            unit="m²"
            placeholder="30"
          />
          <DimensionField
            id="surfaceStorage"
            label="Opslag"
            icon={IconBox}
            value={data.surfaceStorage}
            onChange={(value) => onUpdate({ surfaceStorage: value })}
            unit="m²"
            placeholder="15"
          />
          <DimensionField
            id="surfaceTerrace"
            label="Terras"
            icon={IconSunHigh}
            value={data.surfaceTerrace}
            onChange={(value) => onUpdate({ surfaceTerrace: value })}
            unit="m²"
            placeholder="25"
          />
        </div>
      </div>

      {/* Building characteristics */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Gebouwkenmerken
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Floors */}
          <div className="space-y-2">
            <Label htmlFor="floors" className="flex items-center gap-2 text-sm font-medium">
              <IconStairs className="size-4 text-muted-foreground" />
              Aantal verdiepingen
            </Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ floors: Math.max(1, data.floors - 1) })}
                className="flex size-11 items-center justify-center rounded-md border bg-background text-lg hover:bg-accent"
                disabled={data.floors <= 1}
              >
                −
              </button>
              <Input
                id="floors"
                type="number"
                min={1}
                max={10}
                value={data.floors}
                onChange={(e) =>
                  onUpdate({ floors: Math.max(1, parseInt(e.target.value, 10) || 1) })
                }
                className="h-11 w-20 text-center"
              />
              <button
                type="button"
                onClick={() => onUpdate({ floors: Math.min(10, data.floors + 1) })}
                className="flex size-11 items-center justify-center rounded-md border bg-background text-lg hover:bg-accent"
                disabled={data.floors >= 10}
              >
                +
              </button>
            </div>
          </div>

          {/* Ceiling height */}
          <div className="space-y-2">
            <Label htmlFor="ceilingHeight" className="flex items-center gap-2 text-sm font-medium">
              <IconArrowsVertical className="size-4 text-muted-foreground" />
              Plafondhoogte
            </Label>
            <div className="relative">
              <Input
                id="ceilingHeight"
                type="number"
                step={0.1}
                min={0}
                placeholder="3.2"
                value={data.ceilingHeight ?? ""}
                onChange={(e) =>
                  onUpdate({
                    ceilingHeight: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                className="h-11 pr-10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                m
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Gemiddelde hoogte van het plafond
            </p>
          </div>
        </div>
      </div>

      {/* Surface summary */}
      {data.surfaceTotal && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-xs font-medium text-muted-foreground">Samenvatting afmetingen</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary" />
              <span className="text-sm">
                Totaal: <strong>{data.surfaceTotal} m²</strong>
              </span>
            </div>
            {data.surfaceCommercial && (
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-blue-500" />
                <span className="text-sm">Zaal: {data.surfaceCommercial} m²</span>
              </div>
            )}
            {data.surfaceKitchen && (
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-orange-500" />
                <span className="text-sm">Keuken: {data.surfaceKitchen} m²</span>
              </div>
            )}
            {data.surfaceStorage && (
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-gray-500" />
                <span className="text-sm">Opslag: {data.surfaceStorage} m²</span>
              </div>
            )}
            {data.surfaceTerrace && (
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-green-500" />
                <span className="text-sm">Terras: {data.surfaceTerrace} m²</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

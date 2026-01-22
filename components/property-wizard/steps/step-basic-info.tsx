"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PropertyType,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  PropertyWizardData,
} from "../types";
import {
  IconBuildingStore,
  IconCoffee,
  IconGlass,
  IconBuilding,
  IconChefHat,
  IconMoon,
  IconToolsKitchen2,
  IconTruck,
  IconBread,
  IconDots,
} from "@tabler/icons-react";

interface StepBasicInfoProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
}

const TYPE_ICONS: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  RESTAURANT: IconBuildingStore,
  CAFE: IconCoffee,
  BAR: IconGlass,
  HOTEL: IconBuilding,
  DARK_KITCHEN: IconChefHat,
  NIGHTCLUB: IconMoon,
  FOOD_COURT: IconToolsKitchen2,
  CATERING: IconTruck,
  BAKERY: IconBread,
  OTHER: IconDots,
};

export function StepBasicInfo({ data, onUpdate }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Titel van het pand <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Bijv. Karakteristiek café in hartje Amsterdam"
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Kies een aantrekkelijke titel die het pand goed beschrijft
        </p>
      </div>

      {/* Property Type Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Type pand <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {PROPERTY_TYPES.map((type) => {
            const Icon = TYPE_ICONS[type];
            const isSelected = data.propertyType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => onUpdate({ propertyType: type })}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium leading-tight",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {PROPERTY_TYPE_LABELS[type]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Beschrijving
        </Label>
        <Textarea
          id="description"
          placeholder="Geef een uitgebreide beschrijving van het pand, de sfeer, mogelijkheden en bijzonderheden..."
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="min-h-32 resize-none"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Een goede beschrijving vergroot de kans op leads</span>
          <span>{data.description.length} / 2000</span>
        </div>
      </div>
    </div>
  );
}

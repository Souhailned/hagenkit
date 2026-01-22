"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  FEATURES_BY_CATEGORY,
  CATEGORY_LABELS,
  FeatureCategory,
  PropertyWizardData,
} from "../types";
import {
  IconLicense,
  IconBuildingFactory2,
  IconPlugConnected,
} from "@tabler/icons-react";

interface StepFeaturesProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
}

const CATEGORY_ICONS: Record<FeatureCategory, React.ComponentType<{ className?: string }>> = {
  LICENSE: IconLicense,
  FACILITY: IconBuildingFactory2,
  UTILITY: IconPlugConnected,
};

const CATEGORY_DESCRIPTIONS: Record<FeatureCategory, string> = {
  LICENSE: "Bestaande vergunningen en licenties",
  FACILITY: "Beschikbare faciliteiten en ruimtes",
  UTILITY: "Technische voorzieningen en aansluitingen",
};

export function StepFeatures({ data, onUpdate }: StepFeaturesProps) {
  const handleFeatureToggle = (key: string, checked: boolean) => {
    onUpdate({
      features: {
        ...data.features,
        [key]: checked,
      },
    });
  };

  const selectedCount = Object.values(data.features).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecteer de kenmerken die van toepassing zijn op dit pand
        </p>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {selectedCount} geselecteerd
        </span>
      </div>

      {/* Feature categories */}
      <div className="space-y-6">
        {(Object.keys(FEATURES_BY_CATEGORY) as FeatureCategory[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const features = FEATURES_BY_CATEGORY[category];
          const categorySelectedCount = features.filter(
            (f) => data.features[f.key]
          ).length;

          return (
            <div key={category} className="space-y-3">
              {/* Category header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{CATEGORY_LABELS[category]}</h4>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_DESCRIPTIONS[category]}
                    </p>
                  </div>
                </div>
                {categorySelectedCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {categorySelectedCount} / {features.length}
                  </span>
                )}
              </div>

              {/* Feature checkboxes */}
              <div className="grid gap-2 sm:grid-cols-2">
                {features.map((feature) => {
                  const isChecked = data.features[feature.key] || false;

                  return (
                    <label
                      key={feature.key}
                      htmlFor={feature.key}
                      className={cn(
                        "group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all",
                        isChecked
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-accent/30"
                      )}
                    >
                      <Checkbox
                        id={feature.key}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleFeatureToggle(feature.key, checked === true)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 space-y-0.5">
                        <span
                          className={cn(
                            "text-sm font-medium leading-tight",
                            isChecked ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {feature.label}
                        </span>
                        {feature.description && (
                          <p className="text-xs text-muted-foreground/70">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-dashed bg-muted/30 p-4">
        <h5 className="text-sm font-medium">Tips</h5>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          <li>• Vergunningen zijn belangrijk voor zoekers die snel willen starten</li>
          <li>• Een professionele keuken en afzuiginstallatie zijn USP&apos;s voor restaurants</li>
          <li>• Vermeld alleen kenmerken die daadwerkelijk aanwezig en operationeel zijn</li>
        </ul>
      </div>
    </div>
  );
}

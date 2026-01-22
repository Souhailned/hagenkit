"use client";

import { useCallback, useId, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DUTCH_CITIES,
  MUST_HAVE_FEATURES,
  type PreferencesData,
  type City,
  type Feature,
  type StepProps,
} from "./types";

/**
 * StepPreferences Component
 *
 * Multi-select for Dutch cities (popular cities highlighted) and
 * checkboxes for must-have features like terras, keuken, alcohol vergunning.
 *
 * @example
 * ```tsx
 * <StepPreferences
 *   data={{ cities: ["amsterdam", "rotterdam"], features: ["terras"] }}
 *   onUpdate={(data) => setPreferencesData(data)}
 * />
 * ```
 */
export function StepPreferences({ data, onUpdate }: StepProps<PreferencesData>) {
  const citiesGroupId = useId();
  const featuresGroupId = useId();

  // Split cities into popular and other
  const { popularCities, otherCities } = useMemo(() => {
    const popular = DUTCH_CITIES.filter((c) => c.popular);
    const other = DUTCH_CITIES.filter((c) => !c.popular);
    return { popularCities: popular, otherCities: other };
  }, []);

  const handleCityToggle = useCallback(
    (cityValue: City, checked: boolean) => {
      const newCities = checked
        ? [...data.cities, cityValue]
        : data.cities.filter((c) => c !== cityValue);
      onUpdate({ ...data, cities: newCities });
    },
    [data, onUpdate]
  );

  const handleFeatureToggle = useCallback(
    (featureValue: Feature, checked: boolean) => {
      const newFeatures = checked
        ? [...data.features, featureValue]
        : data.features.filter((f) => f !== featureValue);
      onUpdate({ ...data, features: newFeatures });
    },
    [data, onUpdate]
  );

  const handleSelectAllPopular = useCallback(() => {
    const allPopular = popularCities.map((c) => c.value);
    const hasAllPopular = allPopular.every((c) => data.cities.includes(c));

    if (hasAllPopular) {
      // Deselect all popular
      onUpdate({
        ...data,
        cities: data.cities.filter((c) => !allPopular.includes(c)),
      });
    } else {
      // Select all popular
      const merged = [...new Set([...data.cities, ...allPopular])];
      onUpdate({ ...data, cities: merged });
    }
  }, [data, onUpdate, popularCities]);

  const allPopularSelected = popularCities.every((c) =>
    data.cities.includes(c.value)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Waar en wat zoek je?
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecteer je voorkeurslocaties en de must-have kenmerken
        </p>
      </div>

      {/* Cities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Locaties</Label>
          <button
            type="button"
            onClick={handleSelectAllPopular}
            className="text-xs font-medium text-primary hover:underline"
          >
            {allPopularSelected
              ? "Deselecteer populaire steden"
              : "Selecteer populaire steden"}
          </button>
        </div>

        {/* Popular Cities */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Populaire steden
          </p>
          <div
            id={citiesGroupId}
            role="group"
            aria-label="Populaire steden selectie"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {popularCities.map((city) => {
              const isSelected = data.cities.includes(city.value);
              return (
                <Label
                  key={city.value}
                  htmlFor={`${citiesGroupId}-${city.value}`}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-all duration-200",
                    "hover:border-primary/50 hover:bg-accent/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <Checkbox
                    id={`${citiesGroupId}-${city.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleCityToggle(city.value, checked === true)
                    }
                  />
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {city.label}
                  </span>
                  {/* Popular badge */}
                  <span className="ml-auto text-xs text-amber-600">⭐</span>
                </Label>
              );
            })}
          </div>
        </div>

        {/* Other Cities */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Overige steden
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {otherCities.map((city) => {
              const isSelected = data.cities.includes(city.value);
              return (
                <Label
                  key={city.value}
                  htmlFor={`${citiesGroupId}-other-${city.value}`}
                  className={cn(
                    "group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-200",
                    "hover:border-primary/50 hover:bg-accent/50",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <Checkbox
                    id={`${citiesGroupId}-other-${city.value}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleCityToggle(city.value, checked === true)
                    }
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {city.label}
                  </span>
                </Label>
              );
            })}
          </div>
        </div>

        {/* Selected count */}
        <p className="text-xs text-muted-foreground">
          {data.cities.length === 0
            ? "Geen locaties geselecteerd"
            : `${data.cities.length} ${data.cities.length === 1 ? "locatie" : "locaties"} geselecteerd`}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Features Section */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Must-have kenmerken</Label>
        <p className="text-xs text-muted-foreground">
          Selecteer de faciliteiten die essentieel zijn voor jouw zaak
        </p>

        <div
          id={featuresGroupId}
          role="group"
          aria-label="Must-have kenmerken selectie"
          className="grid gap-3 sm:grid-cols-2"
        >
          {MUST_HAVE_FEATURES.map((feature) => {
            const isSelected = data.features.includes(feature.value);
            return (
              <Label
                key={feature.value}
                htmlFor={`${featuresGroupId}-${feature.value}`}
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all duration-200",
                  "hover:border-primary/50 hover:bg-accent/30",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card"
                )}
              >
                <Checkbox
                  id={`${featuresGroupId}-${feature.value}`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleFeatureToggle(feature.value, checked === true)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{feature.icon}</span>
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {feature.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Label>
            );
          })}
        </div>

        {/* Selected features count */}
        <p className="text-xs text-muted-foreground">
          {data.features.length === 0
            ? "Geen must-haves geselecteerd"
            : `${data.features.length} ${data.features.length === 1 ? "kenmerk" : "kenmerken"} geselecteerd`}
        </p>
      </div>
    </div>
  );
}

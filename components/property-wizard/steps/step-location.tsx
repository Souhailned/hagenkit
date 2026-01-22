"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PropertyWizardData } from "../types";
import { IconMapPin, IconCurrentLocation, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState, useCallback, useRef, useEffect } from "react";

interface StepLocationProps {
  data: PropertyWizardData;
  onUpdate: (data: Partial<PropertyWizardData>) => void;
}

// Popular Dutch cities for horeca
const POPULAR_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Maastricht",
  "Haarlem",
  "Arnhem",
  "Leiden",
  "Tilburg",
  "Breda",
];

export function StepLocation({ data, onUpdate }: StepLocationProps) {
  const [showCoordinates, setShowCoordinates] = useState(
    Boolean(data.latitude || data.longitude)
  );
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Filter city suggestions based on input
  const handleCityChange = useCallback((value: string) => {
    onUpdate({ city: value });

    if (value.length > 0) {
      const filtered = POPULAR_CITIES.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  }, [onUpdate]);

  const selectCity = useCallback((city: string) => {
    onUpdate({ city });
    setShowSuggestions(false);
    setCitySuggestions([]);
  }, [onUpdate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format postal code (Dutch format: 1234 AB)
  const handlePostalCodeChange = (value: string) => {
    // Remove spaces and convert to uppercase
    const cleaned = value.replace(/\s/g, "").toUpperCase();

    // Format as "1234 AB"
    if (cleaned.length <= 4) {
      onUpdate({ postalCode: cleaned });
    } else {
      const formatted = cleaned.slice(0, 4) + " " + cleaned.slice(4, 6);
      onUpdate({ postalCode: formatted });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-4">
        <IconMapPin className="mt-0.5 size-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Locatie bepaalt zichtbaarheid
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Een correct adres zorgt ervoor dat zoekers het pand op de kaart kunnen vinden
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Straatnaam en huisnummer <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          placeholder="Bijv. Prinsengracht 123"
          value={data.address}
          onChange={(e) => onUpdate({ address: e.target.value })}
          className="h-11"
        />
      </div>

      {/* City and Postal Code grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* City with autocomplete */}
        <div className="relative space-y-2" ref={cityInputRef}>
          <Label htmlFor="city" className="text-sm font-medium">
            Stad <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            placeholder="Bijv. Amsterdam"
            value={data.city}
            onChange={(e) => handleCityChange(e.target.value)}
            onFocus={() => {
              if (citySuggestions.length > 0) setShowSuggestions(true);
            }}
            className="h-11"
            autoComplete="off"
          />

          {/* City suggestions dropdown */}
          {showSuggestions && citySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border bg-popover shadow-md">
              {citySuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => selectCity(city)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-sm font-medium">
            Postcode <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postalCode"
            placeholder="1234 AB"
            value={data.postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            maxLength={7}
            className="h-11"
          />
        </div>
      </div>

      {/* Quick city selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Populaire steden</Label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CITIES.slice(0, 8).map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onUpdate({ city })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                data.city === city
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Optional coordinates */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowCoordinates(!showCoordinates)}
          className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <IconCurrentLocation className="size-4" />
            Geavanceerd: GPS-coördinaten (optioneel)
          </span>
          {showCoordinates ? (
            <IconChevronUp className="size-4" />
          ) : (
            <IconChevronDown className="size-4" />
          )}
        </button>

        {showCoordinates && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="52.3676"
                value={data.latitude ?? ""}
                onChange={(e) =>
                  onUpdate({
                    latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="4.9041"
                value={data.longitude ?? ""}
                onChange={(e) =>
                  onUpdate({
                    longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <p className="col-span-full text-xs text-muted-foreground">
              Coördinaten worden automatisch berekend op basis van het adres indien niet opgegeven
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

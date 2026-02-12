// @ts-nocheck
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { type PropertyWizardData } from "../types";
import { MapPin, ChevronDown, Navigation, Loader2 } from "lucide-react";

// Dutch provinces for selection
const provinces = [
  "Noord-Holland",
  "Zuid-Holland",
  "Utrecht",
  "Noord-Brabant",
  "Gelderland",
  "Overijssel",
  "Limburg",
  "Flevoland",
  "Groningen",
  "Friesland",
  "Drenthe",
  "Zeeland",
] as const;

// Simple address suggestions (simulated - in production would use API)
const citySuggestions = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Tilburg",
  "Groningen",
  "Almere",
  "Breda",
  "Nijmegen",
  "Apeldoorn",
  "Haarlem",
  "Arnhem",
  "Enschede",
  "Amersfoort",
  "Zaanstad",
  "Den Bosch",
  "Haarlemmermeer",
  "Zwolle",
  "Maastricht",
];

interface StepLocationProps {
  data: PropertyWizardData;
  onUpdate: (updates: Partial<PropertyWizardData>) => void;
  errors?: Record<string, string>;
}

export function StepLocation({ data, onUpdate, errors }: StepLocationProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [citySuggestionsList, setCitySuggestionsList] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Filter city suggestions based on input
  const handleCityChange = useCallback((value: string) => {
    onUpdate({ city: value });
    if (value.length >= 2) {
      const filtered = citySuggestions.filter((city) =>
        city.toLowerCase().startsWith(value.toLowerCase())
      );
      setCitySuggestionsList(filtered.slice(0, 5));
      setShowCitySuggestions(filtered.length > 0);
    } else {
      setShowCitySuggestions(false);
    }
  }, [onUpdate]);

  const selectCity = useCallback((city: string) => {
    onUpdate({ city });
    setShowCitySuggestions(false);
    setCitySuggestionsList([]);
  }, [onUpdate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Attempt to get current location
  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGeolocating(false);
        setShowAdvanced(true);
      },
      () => {
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onUpdate]);

  return (
    <div className="space-y-6">
      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Adres <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="address"
            value={data.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder="Straatnaam en huisnummer"
            className={cn("pl-10", errors?.address && "border-destructive")}
          />
        </div>
        {errors?.address && (
          <p className="text-sm text-destructive">{errors.address}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-2">
        <Label htmlFor="addressLine2" className="text-sm font-medium">
          Adresregel 2 <span className="text-muted-foreground text-xs">(optioneel)</span>
        </Label>
        <Input
          id="addressLine2"
          value={data.addressLine2}
          onChange={(e) => onUpdate({ addressLine2: e.target.value })}
          placeholder="Appartementnummer, verdieping, etc."
        />
      </div>

      {/* City & Postal Code Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* City with suggestions */}
        <div className="space-y-2" ref={cityInputRef}>
          <Label htmlFor="city" className="text-sm font-medium">
            Stad <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="city"
              value={data.city}
              onChange={(e) => handleCityChange(e.target.value)}
              onFocus={() => data.city.length >= 2 && citySuggestionsList.length > 0 && setShowCitySuggestions(true)}
              placeholder="Plaats"
              className={cn(errors?.city && "border-destructive")}
              autoComplete="off"
            />
            {showCitySuggestions && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover p-1 shadow-lg">
                {citySuggestionsList.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors?.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>

        {/* Postal Code */}
        <div className="space-y-2">
          <Label htmlFor="postalCode" className="text-sm font-medium">
            Postcode <span className="text-destructive">*</span>
          </Label>
          <Input
            id="postalCode"
            value={data.postalCode}
            onChange={(e) => {
              // Format Dutch postal code (1234 AB)
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, "");
              onUpdate({ postalCode: value });
            }}
            placeholder="1234 AB"
            maxLength={7}
            className={cn(errors?.postalCode && "border-destructive")}
          />
          {errors?.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Province */}
      <div className="space-y-2">
        <Label htmlFor="province" className="text-sm font-medium">
          Provincie
        </Label>
        <Select
          value={data.province}
          onValueChange={(value) => onUpdate({ province: value })}
        >
          <SelectTrigger id="province">
            <SelectValue placeholder="Selecteer provincie" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced: Manual Coordinates */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="flex w-full items-center justify-between px-0 hover:bg-transparent"
          >
            <span className="text-sm text-muted-foreground">
              Geavanceerd: Handmatige coördinaten
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showAdvanced && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          {/* Get Current Location Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            disabled={isGeolocating}
            className="w-full"
          >
            {isGeolocating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="mr-2 h-4 w-4" />
            )}
            {isGeolocating ? "Locatie ophalen..." : "Gebruik huidige locatie"}
          </Button>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Latitude */}
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                Breedtegraad (Latitude)
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={data.latitude ?? ""}
                onChange={(e) =>
                  onUpdate({
                    latitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="52.3676"
              />
            </div>

            {/* Longitude */}
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                Lengtegraad (Longitude)
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={data.longitude ?? ""}
                onChange={(e) =>
                  onUpdate({
                    longitude: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="4.9041"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Coördinaten worden automatisch bepaald bij publicatie. Handmatige invoer
            is alleen nodig voor nauwkeurige positionering.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

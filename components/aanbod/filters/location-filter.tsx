"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface LocationFilterProps {
  cities: string[];
  selectedCities: string[];
  onChange: (cities: string[]) => void;
}

export function LocationFilter({
  cities,
  selectedCities,
  onChange,
}: LocationFilterProps) {
  const [open, setOpen] = React.useState(false);

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      onChange(selectedCities.filter((c) => c !== city));
    } else {
      onChange([...selectedCities, city]);
    }
  };

  const removeCity = (city: string) => {
    onChange(selectedCities.filter((c) => c !== city));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Locatie</span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            {selectedCities.length === 0
              ? "Selecteer steden..."
              : `${selectedCities.length} geselecteerd`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Zoek stad..." className="h-9" />
            <CommandList>
              <CommandEmpty>Geen steden gevonden.</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city}
                    value={city}
                    onSelect={() => toggleCity(city)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCities.includes(city)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {city}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected cities badges */}
      {selectedCities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCities.map((city) => (
            <Badge
              key={city}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {city}
              <button
                type="button"
                onClick={() => removeCity(city)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Verwijder {city}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

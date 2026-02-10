"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PropertyType, PropertyTypeLabels, PROPERTY_TYPES } from "@/types/property";
import { Check, X, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PropertyFiltersProps {
  availableCities: string[];
}

export function PropertyFilters({ availableCities }: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current filters from URL
  const getArray = useCallback((key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const getNumber = useCallback((key: string): string => {
    return searchParams.get(key) || "";
  }, [searchParams]);

  // Filter states
  const [minPrice, setMinPrice] = useState(getNumber("minPrice"));
  const [maxPrice, setMaxPrice] = useState(getNumber("maxPrice"));
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(getArray("types") as PropertyType[]);
  const [city, setCity] = useState(getNumber("city"));
  const [minArea, setMinArea] = useState(getNumber("minArea"));
  const [maxArea, setMaxArea] = useState(getNumber("maxArea"));
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);

  // Build URL params
  const buildUrlParams = useCallback((newParams: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(","));
        }
      } else if (value) {
        params.set(key, value);
      }
    });

    return params.toString();
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = buildUrlParams({
      minPrice,
      maxPrice,
      types: selectedTypes,
      city,
      minArea,
      maxArea,
    });

    startTransition(() => {
      router.push(`/aanbod${params ? `?${params}` : ""}`);
    });
  }, [minPrice, maxPrice, selectedTypes, city, minArea, maxArea, buildUrlParams, router]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedTypes([]);
    setCity("");
    setMinArea("");
    setMaxArea("");

    startTransition(() => {
      router.push("/aanbod");
    });
  }, [router]);

  // Toggle property type
  const toggleType = useCallback((type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  // Remove single type
  const removeType = useCallback((type: PropertyType) => {
    setSelectedTypes((prev) => prev.filter((t) => t !== type));
  }, []);

  // Active filter count
  const activeFilterCount = [
    minPrice,
    maxPrice,
    selectedTypes.length > 0,
    city,
    minArea,
    maxArea,
  ].filter(Boolean).length;

  // Filter content component (reusable for both desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Prijs (per maand)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="flex-1"
          />
          <span className="flex items-center text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Type pand</Label>
        <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
            >
              {selectedTypes.length > 0
                ? `${selectedTypes.length} geselecteerd`
                : "Selecteer types"}
              <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Zoek type..." />
              <CommandList>
                <CommandEmpty>Geen resultaten gevonden.</CommandEmpty>
                <CommandGroup>
                  {PROPERTY_TYPES.map((type) => (
                    <CommandItem
                      key={type}
                      value={type}
                      onSelect={() => toggleType(type)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedTypes.includes(type)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{PropertyTypeLabels[type]}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected types badges */}
        {selectedTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {PropertyTypeLabels[type]}
                <button
                  onClick={() => removeType(type)}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* City */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Stad</Label>
        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
            >
              {city || "Selecteer stad"}
              <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Zoek stad..." />
              <CommandList>
                <CommandEmpty>Geen resultaten gevonden.</CommandEmpty>
                <CommandGroup>
                  {availableCities.map((cityName) => (
                    <CommandItem
                      key={cityName}
                      value={cityName}
                      onSelect={(value) => {
                        setCity(city === value ? "" : value);
                        setCityPopoverOpen(false);
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          city === cityName
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{cityName}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Surface Area */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Oppervlakte (m²)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            className="flex-1"
          />
          <span className="flex items-center text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={applyFilters}
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? "Laden..." : "Toepassen"}
        </Button>
        {activeFilterCount > 0 && (
          <Button
            onClick={clearFilters}
            variant="outline"
            disabled={isPending}
          >
            Wissen
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop filters - horizontal bar */}
      <div className="hidden lg:flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        {/* Price */}
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">Prijs:</Label>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24"
          />
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Type */}
        <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between font-normal min-w-[160px]"
            >
              {selectedTypes.length > 0
                ? `${selectedTypes.length} types`
                : "Type pand"}
              <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Zoek type..." />
              <CommandList>
                <CommandEmpty>Geen resultaten gevonden.</CommandEmpty>
                <CommandGroup>
                  {PROPERTY_TYPES.map((type) => (
                    <CommandItem
                      key={type}
                      value={type}
                      onSelect={() => toggleType(type)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedTypes.includes(type)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{PropertyTypeLabels[type]}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border" />

        {/* City */}
        <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between font-normal min-w-[160px]"
            >
              {city || "Stad"}
              <SlidersHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Zoek stad..." />
              <CommandList>
                <CommandEmpty>Geen resultaten gevonden.</CommandEmpty>
                <CommandGroup>
                  {availableCities.map((cityName) => (
                    <CommandItem
                      key={cityName}
                      value={cityName}
                      onSelect={(value) => {
                        setCity(city === value ? "" : value);
                        setCityPopoverOpen(false);
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          city === cityName
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{cityName}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="h-8 w-px bg-border" />

        {/* Area */}
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">m²:</Label>
          <Input
            type="number"
            placeholder="Min"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            className="w-20"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            className="w-20"
          />
        </div>

        <div className="ml-auto flex gap-2">
          <Button onClick={applyFilters} disabled={isPending}>
            {isPending ? "Laden..." : "Toepassen"}
          </Button>
          {activeFilterCount > 0 && (
            <Button onClick={clearFilters} variant="outline" disabled={isPending}>
              Wis filters
            </Button>
          )}
        </div>

        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeFilterCount}
          </Badge>
        )}
      </div>

      {/* Mobile filters - Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

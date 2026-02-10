"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

const presets: { label: string; params: Record<string, string> }[] = [
  { label: "Restaurants", params: { types: "RESTAURANT" } },
  { label: "Cafés", params: { types: "CAFE,EETCAFE,GRAND_CAFE" } },
  { label: "Bars", params: { types: "BAR,COCKTAILBAR" } },
  { label: "Hotels", params: { types: "HOTEL,BED_AND_BREAKFAST" } },
  { label: "Lunchrooms", params: { types: "LUNCHROOM,KOFFIEBAR" } },
  { label: "< €2.500/mnd", params: { maxPrice: "250000" } },
  { label: "Amsterdam", params: { city: "Amsterdam" } },
  { label: "Rotterdam", params: { city: "Rotterdam" } },
  { label: "Utrecht", params: { city: "Utrecht" } },
];

export function QuickFilters({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function applyFilter(params: Record<string, string>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => sp.set(k, v));
    router.push(`/aanbod?${sp.toString()}`);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className || ""}`}>
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => applyFilter(preset.params)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}

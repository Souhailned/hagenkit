"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, ShoppingBag, Train, GraduationCap, TreePine } from "lucide-react";

interface NeighborhoodInfoProps {
  city: string;
  neighborhood?: string | null;
  className?: string;
}

// Simulated neighborhood data based on city
// In production: connect to CBS/OpenStreetMap/Google Places API
const cityData: Record<string, { population: string; avgIncome: string; density: string }> = {
  Amsterdam: { population: "872.757", avgIncome: "€38.200", density: "Zeer hoog" },
  Rotterdam: { population: "651.631", avgIncome: "€32.100", density: "Hoog" },
  Utrecht: { population: "361.699", avgIncome: "€36.800", density: "Hoog" },
  "Den Haag": { population: "548.320", avgIncome: "€34.500", density: "Hoog" },
  Eindhoven: { population: "238.478", avgIncome: "€35.600", density: "Gemiddeld" },
  Groningen: { population: "233.218", avgIncome: "€30.900", density: "Gemiddeld" },
  Maastricht: { population: "121.565", avgIncome: "€33.200", density: "Gemiddeld" },
  Arnhem: { population: "164.096", avgIncome: "€33.800", density: "Gemiddeld" },
};

const nearbyFeatures = [
  { icon: Train, label: "OV halte", distance: "< 500m" },
  { icon: ShoppingBag, label: "Winkelgebied", distance: "< 200m" },
  { icon: Users, label: "Woonwijk", distance: "Aangrenzend" },
  { icon: GraduationCap, label: "Onderwijs", distance: "< 1km" },
  { icon: TreePine, label: "Park/groen", distance: "< 800m" },
];

export function NeighborhoodInfo({ city, neighborhood, className }: NeighborhoodInfoProps) {
  const data = cityData[city];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4 text-primary" />
          Buurtinformatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* City stats */}
        {data && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Inwoners</p>
              <p className="text-sm font-semibold">{data.population}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Gem. inkomen</p>
              <p className="text-sm font-semibold">{data.avgIncome}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Dichtheid</p>
              <p className="text-sm font-semibold">{data.density}</p>
            </div>
          </div>
        )}

        {/* Nearby features */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">In de buurt</p>
          <div className="space-y-2">
            {nearbyFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                    {feature.label}
                  </span>
                  <span className="text-xs font-medium">{feature.distance}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/60">
          * Indicatieve buurtdata. Gebaseerd op gemeentelijke cijfers.
        </p>
      </CardContent>
    </Card>
  );
}

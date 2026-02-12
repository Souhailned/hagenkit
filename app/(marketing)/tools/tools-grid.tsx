"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendUp, Sparkle, ClipboardText, Presentation, MapPin, X } from "@phosphor-icons/react";
import { RevenuePredictor } from "@/components/ai/revenue-predictor";
import { NameGenerator } from "@/components/ai/name-generator";
import { StartupChecklist } from "@/components/ai/startup-checklist";
import { PitchGenerator } from "@/components/ai/pitch-generator";
import { LocationScoreTool } from "@/components/ai/location-score";

const tools = [
  {
    id: "revenue",
    icon: TrendUp,
    title: "Omzet Voorspeller",
    description: "Schat de maandelijkse omzet voor jouw horecaconcept op basis van locatie, type en grootte.",
    color: "text-blue-600 bg-blue-100",
    component: RevenuePredictor,
  },
  {
    id: "name",
    icon: Sparkle,
    title: "Naam Generator",
    description: "Vind de perfecte naam voor je horecazaak — van klassiek tot modern.",
    color: "text-purple-600 bg-purple-100",
    component: NameGenerator,
  },
  {
    id: "checklist",
    icon: ClipboardText,
    title: "Startup Checklist",
    description: "Persoonlijk stappenplan met alles wat je moet regelen om een horecazaak te openen.",
    color: "text-green-600 bg-green-100",
    component: StartupChecklist,
  },
  {
    id: "pitch",
    icon: Presentation,
    title: "Pitch Generator",
    description: "Genereer een professionele investeerderspitch voor je horecaconcept.",
    color: "text-amber-600 bg-amber-100",
    component: PitchGenerator,
  },
  {
    id: "location",
    icon: MapPin,
    title: "Locatie Score",
    description: "Beoordeel hoe geschikt een locatie is voor jouw horecaconcept — van voetverkeer tot concurrentie.",
    color: "text-red-600 bg-red-100",
    component: LocationScoreTool,
  },
];

export function ToolsGrid() {
  const [activeTool, setActiveTool] = React.useState<string | null>(null);

  const active = tools.find((t) => t.id === activeTool);

  if (active) {
    const Component = active.component;
    return (
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => setActiveTool(null)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Terug naar tools
        </button>
        <Card>
          <CardContent className="p-6">
            <Component />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="text-left"
          >
            <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full">
              <CardContent className="p-6">
                <div className={`inline-flex rounded-xl p-3 ${tool.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="font-semibold text-lg">{tool.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import * as React from "react";
import { TrendUp, Sparkle, ClipboardText, Presentation, MapPin, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { RevenuePredictor } from "@/components/ai/revenue-predictor";
import { NameGenerator } from "@/components/ai/name-generator";
import { StartupChecklist } from "@/components/ai/startup-checklist";
import { PitchGenerator } from "@/components/ai/pitch-generator";
import { LocationScoreTool } from "@/components/ai/location-score";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: "revenue",
    icon: TrendUp,
    title: "Omzet Voorspeller",
    description: "Schat de maandelijkse omzet voor jouw horecaconcept op basis van locatie, type en grootte.",
    component: RevenuePredictor,
    featured: true,
  },
  {
    id: "name",
    icon: Sparkle,
    title: "Naam Generator",
    description: "Vind de perfecte naam voor je horecazaak — van klassiek tot modern.",
    component: NameGenerator,
  },
  {
    id: "checklist",
    icon: ClipboardText,
    title: "Startup Checklist",
    description: "Persoonlijk stappenplan met alles wat je moet regelen om een horecazaak te openen.",
    component: StartupChecklist,
  },
  {
    id: "pitch",
    icon: Presentation,
    title: "Pitch Generator",
    description: "Genereer een professionele investeerderspitch voor je horecaconcept.",
    component: PitchGenerator,
  },
  {
    id: "location",
    icon: MapPin,
    title: "Locatie Score",
    description: "Beoordeel hoe geschikt een locatie is voor jouw horecaconcept — van voetverkeer tot concurrentie.",
    component: LocationScoreTool,
  },
];

export function ToolsGrid() {
  const [activeTool, setActiveTool] = React.useState<string | null>(null);

  const active = tools.find((t) => t.id === activeTool);

  if (active) {
    const Component = active.component;
    const Icon = active.icon;
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => setActiveTool(null)}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" weight="bold" />
          Alle tools
        </button>
        <div className="rounded-2xl border border-border bg-background">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="inline-flex rounded-lg bg-muted p-2">
              <Icon className="h-4 w-4 text-foreground" weight="regular" />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">{active.title}</h2>
          </div>
          <div className="p-6">
            <Component />
          </div>
        </div>
      </div>
    );
  }

  const featured = tools.find((t) => t.featured);
  const rest = tools.filter((t) => !t.featured);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
      {/* Featured tool — spans 2 cols and 2 rows */}
      {featured && (
        <button
          onClick={() => setActiveTool(featured.id)}
          className="col-span-2 row-span-2 text-left group"
        >
          <div className="relative rounded-2xl border border-border bg-background p-6 h-full flex flex-col justify-between hover:border-border/80 hover:shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer">
            <div>
              <div className="inline-flex rounded-lg border border-border bg-muted p-2.5 mb-5">
                <featured.icon className="h-5 w-5 text-foreground" weight="regular" />
              </div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">{featured.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
                {featured.description}
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-foreground">
              <span>Probeer</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" weight="bold" />
            </div>
          </div>
        </button>
      )}

      {/* Rest — 2 cols each, stacking on the right + bottom */}
      {rest.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="col-span-2 sm:col-span-1 lg:col-span-2 text-left group"
          >
            <div className="rounded-2xl border border-border bg-background p-5 h-full hover:border-border/80 hover:shadow-[0_2px_12px_-3px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer">
              <div className="inline-flex rounded-lg border border-border bg-muted p-2 mb-3">
                <Icon className="h-4 w-4 text-foreground" weight="regular" />
              </div>
              <h2 className="text-[15px] font-semibold text-foreground tracking-tight">{tool.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  IconBuildingStore,
  IconArrowRight,
  IconClock,
  IconSparkles,
  IconChartBar,
  IconUsers,
} from "@tabler/icons-react";

interface StepFirstPropertyProps {
  onAddProperty: () => void;
  onSkip: () => void;
}

export function StepFirstProperty({
  onAddProperty,
  onSkip,
}: StepFirstPropertyProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <IconBuildingStore className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">
          Voeg je eerste pand toe
        </h2>
        <p className="text-sm text-muted-foreground">
          Begin direct met het plaatsen van horecavastgoed
        </p>
      </div>

      {/* Benefits showcase */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <IconSparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">AI-gestuurde foto verbetering</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Maak je foto&apos;s professioneler met onze AI-tools
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <IconChartBar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Inzicht in je prestaties</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bekijk views, leads en conversies per pand
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <IconUsers className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium">Bereik serieuze zoekers</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Horecaondernemers vinden jouw aanbod direct
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full h-12 text-base group"
          onClick={onAddProperty}
        >
          <IconBuildingStore className="w-5 h-5 mr-2" />
          Voeg nu je eerste pand toe
          <IconArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <IconClock className="w-4 h-4" />
          Ik doe dit later
        </button>
      </div>

      {/* Reassurance */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Je kunt altijd later panden toevoegen vanuit je dashboard.
          <br />
          Het toevoegen duurt ongeveer 5 minuten per pand.
        </p>
      </div>
    </div>
  );
}

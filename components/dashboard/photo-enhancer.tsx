"use client";

import * as React from "react";
import { MagicWand, Image as ImageIcon, SpinnerGap, Check, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PhotoEnhancerProps {
  propertyId: string;
  images: string[];
  onEnhanced?: (enhancedUrls: string[]) => void;
}

type EnhanceStatus = "idle" | "processing" | "done" | "error";

interface EnhanceState {
  status: EnhanceStatus;
  original: string;
  enhanced?: string;
}

export function PhotoEnhancer({ propertyId, images, onEnhanced }: PhotoEnhancerProps) {
  const [states, setStates] = React.useState<EnhanceState[]>(
    images.map((img) => ({ status: "idle", original: img }))
  );
  const [isEnhancingAll, setIsEnhancingAll] = React.useState(false);

  const enhancePhoto = async (index: number) => {
    setStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: "processing" as const } : s))
    );

    try {
      // TODO: Connect to Fal.ai when API key is available
      // For now, simulate enhancement with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStates((prev) =>
        prev.map((s, i) =>
          i === index
            ? { ...s, status: "done" as const, enhanced: s.original }
            : s
        )
      );
    } catch {
      setStates((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status: "error" as const } : s))
      );
    }
  };

  const enhanceAll = async () => {
    setIsEnhancingAll(true);
    for (let i = 0; i < states.length; i++) {
      if (states[i].status !== "done") {
        await enhancePhoto(i);
      }
    }
    setIsEnhancingAll(false);

    const enhanced = states
      .filter((s) => s.enhanced)
      .map((s) => s.enhanced!);
    onEnhanced?.(enhanced);
  };

  const doneCount = states.filter((s) => s.status === "done").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MagicWand className="h-5 w-5 text-primary" weight="duotone" />
              Foto Verbetering
            </CardTitle>
            <CardDescription>
              Verbeter je foto&apos;s automatisch — betere belichting, kleuren en scherpte
            </CardDescription>
          </div>
          <Button
            onClick={enhanceAll}
            disabled={isEnhancingAll || doneCount === images.length}
            size="sm"
            className="gap-1.5"
          >
            <MagicWand className="h-4 w-4" weight="bold" />
            {doneCount === images.length
              ? "Alles verbeterd"
              : isEnhancingAll
                ? "Bezig..."
                : `Verbeter alle (${images.length})`}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {states.map((state, index) => (
            <div
              key={index}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border",
                state.status === "done" && "ring-2 ring-green-500",
                state.status === "error" && "ring-2 ring-destructive"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.enhanced || state.original}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {state.status === "idle" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    onClick={() => enhancePhoto(index)}
                  >
                    <MagicWand className="h-3.5 w-3.5" weight="bold" />
                    Verbeter
                  </Button>
                )}
              </div>

              {/* Status badge */}
              <div className="absolute top-2 right-2">
                {state.status === "processing" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <SpinnerGap className="h-4 w-4 animate-spin" weight="bold" />
                  </div>
                )}
                {state.status === "done" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <Check className="h-4 w-4" weight="bold" />
                  </div>
                )}
                {state.status === "error" && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                    <Warning className="h-4 w-4" weight="bold" />
                  </div>
                )}
              </div>

              {/* Number */}
              <div className="absolute bottom-2 left-2 flex h-5 w-5 items-center justify-center rounded bg-black/60 text-[10px] text-white font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {doneCount > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            {doneCount} van {images.length} foto&apos;s verbeterd
          </p>
        )}
      </CardContent>
    </Card>
  );
}

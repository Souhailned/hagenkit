"use client";

import { useState } from "react";
import { useSceneStore } from "@/lib/editor/stores";
import { Layout, Sparkles, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorEmptyStateProps {
  onOpenTemplate: () => void;
  onOpenAiGenerate: () => void;
  onStartDrawing: () => void;
}

export function EditorEmptyState({
  onOpenTemplate,
  onOpenAiGenerate,
  onStartDrawing,
}: EditorEmptyStateProps) {
  const nodeCount = useSceneStore((s) => Object.keys(s.nodes).length);
  const [dismissed, setDismissed] = useState(false);

  // Hide when nodes exist or user dismissed
  if (nodeCount > 0 || dismissed) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Maak uw plattegrond
          </h3>
          <p className="text-sm text-muted-foreground">
            Begin met een template, laat AI een plattegrond genereren, of teken
            zelf.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" className="gap-2" onClick={onOpenTemplate}>
            <Layout className="size-4" />
            Template kiezen
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={onOpenAiGenerate}
          >
            <Sparkles className="size-4" />
            AI genereren
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setDismissed(true);
              onStartDrawing();
            }}
          >
            <PenTool className="size-4" />
            Zelf tekenen
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: De meeste makelaars beginnen met een template en passen deze aan.
        </p>
      </div>
    </div>
  );
}

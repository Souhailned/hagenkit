"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { SceneData } from "@/lib/editor/schema";
import { useEditorStore } from "@/lib/editor/stores";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layers, Box, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PropertyEditor = dynamic(
  () =>
    import("@/components/editor/property-editor").then((mod) => ({
      default: mod.PropertyEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px] bg-muted/30 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-pulse rounded-lg bg-muted" />
          <span className="text-muted-foreground text-sm">
            Plattegrond laden...
          </span>
        </div>
      </div>
    ),
  }
);

interface FloorPlanData {
  id: string;
  name: string;
  floor: number;
  sceneData: unknown;
  totalArea: number | null;
}

interface FloorPlanViewerProps {
  propertyId: string;
  floorPlans: FloorPlanData[];
}

function getFloorLabel(floor: number): string {
  if (floor === -1) return "Kelder";
  if (floor === 0) return "Begane grond";
  if (floor === 1) return "1e verdieping";
  if (floor === 2) return "2e verdieping";
  if (floor === 3) return "3e verdieping";
  return `${floor}e verdieping`;
}

export function FloorPlanViewer({
  propertyId,
  floorPlans,
}: FloorPlanViewerProps) {
  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    floorPlans[0]?.id ?? ""
  );
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const viewMode = useEditorStore((s) => s.viewMode);

  // Sort floors ascending
  const sortedFloors = [...floorPlans].sort((a, b) => a.floor - b.floor);

  const selectedFloor = sortedFloors.find((fp) => fp.id === selectedFloorId);

  // Reset view mode to 3d when component mounts
  useEffect(() => {
    setViewMode("3d");
  }, [setViewMode]);

  // Reset view mode when switching floors
  useEffect(() => {
    setViewMode("3d");
  }, [selectedFloorId, setViewMode]);

  if (floorPlans.length === 0) {
    return null;
  }

  const sceneData = selectedFloor?.sceneData as SceneData | undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Maximize2 className="size-5 text-muted-foreground" />
          <CardTitle className="text-lg">Plattegrond</CardTitle>
        </div>

        <div className="flex items-center gap-2">
          {/* 2D/3D Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 px-2.5 text-xs font-medium",
                viewMode === "2d" &&
                  "bg-background text-foreground shadow-sm"
              )}
              onClick={() => setViewMode("2d")}
            >
              <Layers className="size-3.5" />
              2D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 px-2.5 text-xs font-medium",
                viewMode === "3d" &&
                  "bg-background text-foreground shadow-sm"
              )}
              onClick={() => setViewMode("3d")}
            >
              <Box className="size-3.5" />
              3D
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Floor selector tabs */}
      {sortedFloors.length > 1 && (
        <div className="flex items-center gap-1.5 px-6 pb-3">
          {sortedFloors.map((fp) => (
            <Button
              key={fp.id}
              variant={fp.id === selectedFloorId ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs",
                fp.id === selectedFloorId && "pointer-events-none"
              )}
              onClick={() => setSelectedFloorId(fp.id)}
            >
              {getFloorLabel(fp.floor)}
              {fp.totalArea != null && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1 h-4 px-1 text-[10px] leading-none",
                    fp.id === selectedFloorId &&
                      "bg-primary-foreground/20 text-primary-foreground"
                  )}
                >
                  {fp.totalArea} m&sup2;
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      <Separator />

      <CardContent className="p-0">
        <div className="relative min-h-[400px] max-h-[600px] h-[50vh]">
          {sceneData ? (
            <PropertyEditor
              propertyId={propertyId}
              floorPlanId={selectedFloor?.id}
              initialScene={sceneData}
              readOnly
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Geen plattegronddata beschikbaar voor deze verdieping.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

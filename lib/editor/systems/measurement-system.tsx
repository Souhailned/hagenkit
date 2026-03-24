"use client";

import { useMemo } from "react";
import { useSceneStore } from "../stores";
import { polygonArea } from "../utils";
import type { ZoneNode, ItemNode, HorecaZoneType } from "../schema";

export interface ZoneSummary {
  id: string;
  name: string;
  zoneType: HorecaZoneType;
  area: number;
  capacity: number;
  itemCount: number;
}

export interface SceneMeasurements {
  totalArea: number;
  totalCapacity: number;
  wallCount: number;
  itemCount: number;
  zones: ZoneSummary[];
}

/**
 * Hook to compute scene measurements from the current node state.
 * Does not render anything — just provides derived data.
 */
export function useSceneMeasurements(): SceneMeasurements {
  const nodes = useSceneStore((s) => s.nodes);

  return useMemo(() => {
    const nodeValues = Object.values(nodes);
    const zones: ZoneSummary[] = [];
    let totalArea = 0;
    let totalCapacity = 0;
    let wallCount = 0;
    let itemCount = 0;

    const items = nodeValues.filter((n) => n.type === "item") as ItemNode[];

    for (const node of nodeValues) {
      switch (node.type) {
        case "wall":
          wallCount++;
          break;
        case "zone": {
          const zone = node as ZoneNode;
          const area = zone.area || polygonArea(zone.polygon);
          const capacity = zone.capacity ?? 0;
          const zoneItems = items.filter((i) => i.parentId === zone.id).length;

          totalArea += area;
          totalCapacity += capacity;

          zones.push({
            id: zone.id,
            name: zone.zoneType,
            zoneType: zone.zoneType,
            area,
            capacity,
            itemCount: zoneItems,
          });
          break;
        }
        case "item":
          itemCount++;
          break;
      }
    }

    return { totalArea, totalCapacity, wallCount, itemCount, zones };
  }, [nodes]);
}

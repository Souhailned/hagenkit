"use client";

import { useEffect } from "react";
import { useSceneStore } from "../stores";
import { polygonArea, estimateCapacity } from "../utils";
import type { ZoneNode } from "../schema";

/**
 * useZoneSystem — recalculates zone areas and capacities when zone polygons change.
 * Call this hook in a component that has access to the store.
 */
export function useZoneSystem(): void {
  const nodes = useSceneStore((s) => s.nodes);
  const dirtyNodes = useSceneStore((s) => s.dirtyNodes);
  const updateNode = useSceneStore((s) => s.updateNode);

  useEffect(() => {
    if (dirtyNodes.size === 0) return;

    const dirtyIds = Array.from(dirtyNodes);
    for (const id of dirtyIds) {
      const node = nodes[id];
      if (!node || node.type !== "zone") continue;

      const zoneNode = node as ZoneNode;
      const area = polygonArea(zoneNode.polygon);
      const capacity = estimateCapacity(area);

      if (
        Math.abs((zoneNode.area ?? 0) - area) > 0.01 ||
        zoneNode.capacity !== capacity
      ) {
        updateNode(id, { area, capacity } as Partial<ZoneNode>);
      }
    }
  }, [nodes, dirtyNodes, updateNode]);
}

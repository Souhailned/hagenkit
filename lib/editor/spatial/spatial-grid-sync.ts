"use client";

// lib/editor/spatial/spatial-grid-sync.ts
// React hook that synchronizes the SpatialGridManager with the scene store.
// Subscribes to scene store changes and rebuilds the spatial grid when
// nodes change. Returns the manager instance for use by other hooks.

import { useEffect, useRef, useMemo } from "react";
import { SpatialGridManager } from "./spatial-grid-manager";
import { useSceneStore } from "../stores/scene-store";
import type { AnyNode, WallNode } from "../schema/nodes";

/**
 * Syncs the SpatialGridManager with the Zustand scene store.
 *
 * - On mount, performs a full rebuild from current scene state.
 * - Subscribes to store changes and incrementally updates the grid
 *   when nodes change (using dirty tracking).
 * - Returns the manager instance, stable across renders.
 *
 * Usage:
 * ```tsx
 * function EditorCanvas() {
 *   const manager = useSpatialGridSync();
 *   // Pass manager to child components or use via useSpatialQuery()
 * }
 * ```
 */
export function useSpatialGridSync(): SpatialGridManager {
  const manager = useMemo(() => new SpatialGridManager(), []);
  const prevNodesRef = useRef<Record<string, AnyNode> | null>(null);

  useEffect(() => {
    // Initial full rebuild
    const initialNodes = useSceneStore.getState().nodes;
    manager.rebuild(initialNodes);
    prevNodesRef.current = initialNodes;

    // Subscribe to store changes
    const unsub = useSceneStore.subscribe((state, prevState) => {
      const currentNodes = state.nodes;
      const prevNodes = prevState.nodes;

      // Same reference = no change
      if (currentNodes === prevNodes) return;

      // If the node dictionary was entirely replaced (loadScene, clear, etc.),
      // do a full rebuild. Otherwise, do an incremental update.
      const currentKeys = Object.keys(currentNodes);
      const prevKeys = prevNodes ? Object.keys(prevNodes) : [];

      // Heuristic: if more than 50% of nodes changed, full rebuild is faster
      const changedCount = countChanges(currentNodes, prevNodes);
      const totalCount = Math.max(currentKeys.length, prevKeys.length, 1);

      if (changedCount / totalCount > 0.5) {
        manager.rebuild(currentNodes);
      } else {
        // Incremental: find changed/added/removed nodes
        incrementalUpdate(manager, currentNodes, prevNodes);
      }

      prevNodesRef.current = currentNodes;
    });

    return () => {
      unsub();
      manager.clear();
    };
  }, [manager]);

  return manager;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countChanges(
  current: Record<string, AnyNode>,
  prev: Record<string, AnyNode>,
): number {
  let count = 0;

  // Added or changed
  for (const [id, node] of Object.entries(current)) {
    if (prev[id] !== node) count++;
  }

  // Removed
  for (const id of Object.keys(prev)) {
    if (!(id in current)) count++;
  }

  return count;
}

function incrementalUpdate(
  manager: SpatialGridManager,
  current: Record<string, AnyNode>,
  prev: Record<string, AnyNode>,
): void {
  // Collect walls for wall-item lookups
  const walls = new Map<string, WallNode>();
  for (const node of Object.values(current)) {
    if (node.type === "wall") {
      walls.set(node.id, node);
    }
  }

  // Handle removed nodes
  for (const id of Object.keys(prev)) {
    if (!(id in current)) {
      manager.removeNode(id);
    }
  }

  // Handle added/changed nodes
  for (const [id, node] of Object.entries(current)) {
    if (prev[id] !== node) {
      manager.updateNode(node, walls);
    }
  }
}

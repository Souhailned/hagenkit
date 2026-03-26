"use client";

// lib/editor/spatial/use-spatial-query.ts
// React hook that provides spatial query functions for editor components.
// Wraps the SpatialGridManager with a convenient API for collision detection
// and overlap checking during item placement and movement.

import { useCallback, useMemo } from "react";
import { useSpatialGridSync } from "./spatial-grid-sync";
import { aabbFromCenter, type AABB } from "./spatial-grid";

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface SpatialQueryAPI {
  /**
   * Check if placing a floor item with the given bounds would collide
   * with any existing item.
   *
   * @param bounds    - AABB of the proposed placement
   * @param excludeId - Item to exclude (e.g., the item being moved)
   * @returns Set of colliding item IDs (empty if no collision)
   */
  checkFloorCollision: (bounds: AABB, excludeId?: string) => Set<string>;

  /**
   * Convenience: check collision for a centered rectangular item.
   *
   * @param cx        - Center X in world coords
   * @param cz        - Center Z in world coords
   * @param width     - Item width in meters
   * @param depth     - Item depth in meters
   * @param excludeId - Item to exclude
   * @returns Set of colliding item IDs
   */
  checkItemCollision: (
    cx: number,
    cz: number,
    width: number,
    depth: number,
    excludeId?: string,
  ) => Set<string>;

  /**
   * Check if placing a door/window at a position on a wall would overlap
   * with any existing wall-attached items.
   *
   * @param wallId     - The wall ID
   * @param position   - Center position (0-1 ratio along wall)
   * @param width      - Width of the item in meters
   * @param wallLength - Length of the wall in meters
   * @param excludeId  - Item to exclude (for move operations)
   * @returns true if there is an overlap
   */
  checkWallOverlap: (
    wallId: string,
    position: number,
    width: number,
    wallLength: number,
    excludeId?: string,
  ) => boolean;

  /**
   * Get all floor-placed items in a rectangular area.
   *
   * @param bounds    - AABB of the query area
   * @param excludeId - Item to exclude
   * @returns Set of item IDs in the area
   */
  getItemsInArea: (bounds: AABB, excludeId?: string) => Set<string>;

  /**
   * The underlying SpatialGridManager, for advanced use cases.
   */
  manager: ReturnType<typeof useSpatialGridSync>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides spatial query functions for editor components.
 *
 * This hook:
 * 1. Synchronizes a SpatialGridManager with the scene store (via useSpatialGridSync)
 * 2. Returns memoized query functions for collision detection
 *
 * Usage:
 * ```tsx
 * function ItemPlacementTool() {
 *   const { checkFloorCollision, checkWallOverlap } = useSpatialQuery();
 *
 *   const handlePlace = (x: number, z: number) => {
 *     const collisions = checkFloorCollision(
 *       { minX: x - 0.5, minZ: z - 0.5, maxX: x + 0.5, maxZ: z + 0.5 }
 *     );
 *     if (collisions.size > 0) {
 *       console.warn("Collision detected with:", collisions);
 *     }
 *   };
 * }
 * ```
 */
export function useSpatialQuery(): SpatialQueryAPI {
  const manager = useSpatialGridSync();

  const checkFloorCollision = useCallback(
    (bounds: AABB, excludeId?: string) => {
      return manager.checkFloorCollision(bounds, excludeId);
    },
    [manager],
  );

  const checkItemCollision = useCallback(
    (
      cx: number,
      cz: number,
      width: number,
      depth: number,
      excludeId?: string,
    ) => {
      const bounds = aabbFromCenter(cx, cz, width, depth);
      return manager.checkFloorCollision(bounds, excludeId);
    },
    [manager],
  );

  const checkWallOverlap = useCallback(
    (
      wallId: string,
      position: number,
      width: number,
      wallLength: number,
      excludeId?: string,
    ) => {
      return manager.checkWallOverlap(
        wallId,
        position,
        width,
        wallLength,
        excludeId,
      );
    },
    [manager],
  );

  const getItemsInArea = useCallback(
    (bounds: AABB, excludeId?: string) => {
      return manager.getItemsInArea(bounds, excludeId);
    },
    [manager],
  );

  return useMemo(
    () => ({
      checkFloorCollision,
      checkItemCollision,
      checkWallOverlap,
      getItemsInArea,
      manager,
    }),
    [
      checkFloorCollision,
      checkItemCollision,
      checkWallOverlap,
      getItemsInArea,
      manager,
    ],
  );
}

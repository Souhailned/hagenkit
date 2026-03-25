'use client';

// lib/editor/systems/wall-system.tsx
// R3F system component that recalculates wall geometry when walls change.
// Runs in the useFrame loop at priority 4 (before render).
// When dirty walls are detected, it recalculates ALL junctions and miter
// points (since moving one wall can affect adjacent walls' corners), then
// updates the THREE.js geometry on each affected mesh via the scene registry.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores';
import { sceneRegistry } from '../registry';
import type { WallNode } from '../schema';
import { findJunctions, calculateMiterPoints, getWallFootprint } from './wall-mitering';
import { generateWallGeometry, footprintsEqual } from './wall-geometry';
import { getWallOpenings, subtractOpenings } from './wall-csg';
import type { WallFootprint } from './wall-mitering';

/**
 * WallSystem — invisible R3F component that manages wall geometry mitering.
 *
 * On each frame, checks for dirty wall nodes. If any are found:
 * 1. Collects ALL walls (mitering is a global operation)
 * 2. Finds junctions (where wall endpoints cluster)
 * 3. Calculates miter points at each junction
 * 4. Regenerates geometry for dirty walls AND their junction neighbors
 * 5. Replaces the geometry on the corresponding THREE.Mesh via the registry
 *
 * This component renders nothing — it only performs side effects.
 */
export function WallSystem() {
  // Cache the last computed footprint per wall to skip unnecessary geometry rebuilds
  const footprintCache = useRef<Map<string, WallFootprint>>(new Map());

  useFrame(() => {
    const { nodes, dirtyNodes, markClean } = useSceneStore.getState();

    // Find dirty walls, and walls whose doors/windows changed
    const dirtyWallIds: string[] = [];
    for (const id of dirtyNodes) {
      const node = nodes[id];
      if (node?.type === 'wall') {
        dirtyWallIds.push(id);
      } else if ((node?.type === 'door' || node?.type === 'window') && node.wallId) {
        // A door/window changed — mark its parent wall as needing update
        if (!dirtyWallIds.includes(node.wallId)) {
          dirtyWallIds.push(node.wallId);
        }
        markClean(id);
      }
    }

    // Also check for deleted door/window nodes — their wallId may still be in the scene
    // (handled by the wallsToUpdate set below)

    if (dirtyWallIds.length === 0) return;

    // Get ALL walls — mitering is a level-wide calculation
    const walls: WallNode[] = [];
    for (const node of Object.values(nodes)) {
      if (node.type === 'wall') {
        walls.push(node);
      }
    }

    if (walls.length === 0) {
      // All walls deleted — clean up cache
      footprintCache.current.clear();
      for (const id of dirtyWallIds) {
        markClean(id);
      }
      return;
    }

    // Calculate junctions and miter data
    const junctions = findJunctions(walls);
    const miterData = calculateMiterPoints(walls, junctions);

    // Determine which walls need geometry updates:
    // - All dirty walls
    // - Adjacent walls that share a junction with any dirty wall
    const wallsToUpdate = new Set(dirtyWallIds);

    for (const wallId of dirtyWallIds) {
      for (const [, junction] of junctions) {
        if (junction.wallIds.includes(wallId)) {
          for (const adjId of junction.wallIds) {
            wallsToUpdate.add(adjId);
          }
        }
      }
    }

    // Generate and apply geometry for each wall that needs updating
    for (const wallId of wallsToUpdate) {
      const wall = nodes[wallId];
      if (!wall || wall.type !== 'wall') continue;

      const wallNode = wall as WallNode;
      const miter = miterData.get(wallId);

      // Check if footprint actually changed (skip needless geometry rebuild)
      const newFootprint = getWallFootprint(wallNode, miter);
      const cached = footprintCache.current.get(wallId);
      if (cached && footprintsEqual(cached, newFootprint)) {
        // Footprint unchanged — just mark clean
        if (dirtyWallIds.includes(wallId)) {
          markClean(wallId);
        }
        continue;
      }

      // Get the mesh from the registry
      const obj = sceneRegistry.get(wallId);
      if (!obj || !(obj instanceof THREE.Mesh)) {
        // Mesh not yet registered (renderer hasn't mounted yet).
        // Don't mark clean — let it retry next frame.
        continue;
      }

      let newGeo = generateWallGeometry(wallNode, miter);
      if (newGeo) {
        // Apply CSG subtraction for doors/windows on this wall
        const openings = getWallOpenings(wallId, nodes);
        if (openings.length > 0) {
          const csgGeo = subtractOpenings(newGeo, wallNode, openings);
          if (csgGeo !== newGeo) {
            newGeo.dispose();
            newGeo = csgGeo;
          }
        }

        // Dispose old geometry to prevent memory leaks
        obj.geometry.dispose();
        obj.geometry = newGeo;

        // Reset position and rotation — the mitered geometry is in world space
        obj.position.set(0, 0, 0);
        obj.rotation.set(0, 0, 0);

        // Update the footprint cache
        footprintCache.current.set(wallId, newFootprint);
      }

      // Mark dirty wall as clean
      if (dirtyWallIds.includes(wallId)) {
        markClean(wallId);
      }
    }

    // Clean up cache for deleted walls
    for (const cachedId of footprintCache.current.keys()) {
      if (!nodes[cachedId]) {
        footprintCache.current.delete(cachedId);
      }
    }
  }, 4); // priority 4: run before default render priority (0)

  return null;
}

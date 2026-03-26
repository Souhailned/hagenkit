'use client';

// lib/editor/systems/item-system.tsx
// R3F system component that handles item positioning rules.
// Ported from Pascal Editor's item-system.tsx.
//
// Positioning rules based on attachTo:
//   - floor:   Place at Y=0 (or slab elevation if on a slab)
//   - wall:    Offset from wall center by wall thickness/2
//   - ceiling: Position at ceiling height, inverted
//   - none:    Free-floating, no adjustment
//
// Runs in useFrame at priority 2 (before door/window systems at 3).

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores';
import { sceneRegistry } from '../registry';
import type { ItemNode, WallNode, SlabNode, CeilingNode } from '../schema';

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Find the slab elevation for an item, if it is a child of a slab node
 * or positioned above a slab polygon.
 */
function findSlabElevation(
  item: ItemNode,
  nodes: Record<string, import('../schema').AnyNode>,
): number {
  // Check parent chain for slab
  if (item.parentId) {
    const parent = nodes[item.parentId];
    if (parent?.type === 'slab') {
      const slab = parent as SlabNode;
      return slab.elevation ?? 0;
    }
  }
  return 0;
}

/**
 * Find the ceiling height for ceiling-attached items.
 */
function findCeilingHeight(
  item: ItemNode,
  nodes: Record<string, import('../schema').AnyNode>,
): number {
  if (item.parentId) {
    const parent = nodes[item.parentId];
    if (parent?.type === 'ceiling') {
      return (parent as CeilingNode).height;
    }
    // Check for level node (ceiling at level height)
    if (parent?.type === 'level') {
      return (parent as import('../schema').LevelNode).height;
    }
  }
  // Default ceiling height
  return 3.0;
}

/**
 * Compute wall-mounted item offset: perpendicular to the wall,
 * pushed out by half the wall thickness.
 */
function computeWallItemTransform(
  item: ItemNode,
  wall: WallNode,
): { px: number; py: number; pz: number; rotY: number } {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const wallAngle = Math.atan2(dz, dx);
  const wallLength = Math.hypot(dx, dz);

  // Position along wall (wallT is 0-1 ratio)
  const t = item.wallT ?? 0.5;
  const cx = wall.start[0] + dx * t;
  const cz = wall.start[1] + dz * t;

  // Perpendicular offset (push outward from wall center)
  const perpX = -Math.sin(wallAngle);
  const perpZ = Math.cos(wallAngle);
  const offset = wall.thickness / 2 + item.depth / 2;

  return {
    px: cx + perpX * offset,
    py: item.height / 2,
    pz: cz + perpZ * offset,
    rotY: -wallAngle,
  };
}

// ── System component ─────────────────────────────────────────────────

/**
 * ItemSystem — invisible R3F component that applies item positioning rules.
 *
 * On each frame, checks for dirty item nodes and adjusts their position
 * based on their attachTo property:
 *   - floor items sit at Y=0 (or slab elevation)
 *   - wall items offset perpendicular to their parent wall
 *   - ceiling items hang from ceiling height
 *   - none/free items use their stored position as-is
 */
export function ItemSystem() {
  useFrame(() => {
    const { nodes, dirtyNodes, markClean } = useSceneStore.getState();

    const dirtyItemIds: string[] = [];
    for (const id of dirtyNodes) {
      const node = nodes[id];
      if (node?.type === 'item') {
        dirtyItemIds.push(id);
      }
    }

    if (dirtyItemIds.length === 0) return;

    for (const itemId of dirtyItemIds) {
      const node = nodes[itemId];
      if (!node || node.type !== 'item') {
        markClean(itemId);
        continue;
      }

      const item = node as ItemNode;
      const obj = sceneRegistry.get(itemId);
      if (!obj) {
        // Not yet mounted — retry next frame
        continue;
      }

      const attachTo = item.attachTo ?? 'floor';

      switch (attachTo) {
        case 'floor': {
          const slabY = findSlabElevation(item, nodes);
          obj.position.set(
            item.position[0],
            slabY + item.height / 2,
            item.position[2],
          );
          obj.rotation.set(
            item.rotation[0],
            item.rotation[1],
            item.rotation[2],
          );
          break;
        }

        case 'wall': {
          if (item.wallId) {
            const wallNode = nodes[item.wallId];
            if (wallNode?.type === 'wall') {
              const { px, py, pz, rotY } = computeWallItemTransform(
                item,
                wallNode as WallNode,
              );
              obj.position.set(px, py, pz);
              obj.rotation.set(0, rotY, 0);
            }
          } else {
            // No wall reference — treat as floor item
            obj.position.set(
              item.position[0],
              item.height / 2,
              item.position[2],
            );
          }
          break;
        }

        case 'ceiling': {
          const ceilingH = findCeilingHeight(item, nodes);
          obj.position.set(
            item.position[0],
            ceilingH - item.height / 2,
            item.position[2],
          );
          // Invert for ceiling-mounted items (upside down)
          obj.rotation.set(
            Math.PI,
            item.rotation[1],
            item.rotation[2],
          );
          break;
        }

        case 'none':
        default: {
          // Free-floating: use stored position directly
          obj.position.set(
            item.position[0],
            item.position[1] + item.height / 2,
            item.position[2],
          );
          obj.rotation.set(
            item.rotation[0],
            item.rotation[1],
            item.rotation[2],
          );
          break;
        }
      }

      // Apply scale if specified
      if (item.scale) {
        obj.scale.set(item.scale[0], item.scale[1], item.scale[2]);
      }

      markClean(itemId);
    }
  }, 2); // priority 2: before door/window (3) and wall (4) systems

  return null;
}

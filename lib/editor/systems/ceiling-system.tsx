'use client';

// lib/editor/systems/ceiling-system.tsx
// R3F system component that generates ceiling geometry from polygon data.
// Ported from Pascal Editor's ceiling-system.tsx.
//
// Like slab but positioned at ceiling height:
//   1. Creates flat ShapeGeometry from polygon (thin extrusion)
//   2. Adds hole cutouts
//   3. Positions at ceiling height
//
// Runs in useFrame at priority 1 (same pass as slab).

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores';
import { sceneRegistry } from '../registry';
import type { CeilingNode, Vec2 } from '../schema';

// Thin ceiling slab thickness (visual only)
const CEILING_THICKNESS = 0.02;

// ── Geometry cache key ───────────────────────────────────────────────

interface CeilingGeometryKey {
  polygon: string;
  holes: string;
  height: number;
}

function ceilingKeyEqual(a: CeilingGeometryKey, b: CeilingGeometryKey): boolean {
  return (
    a.polygon === b.polygon &&
    a.holes === b.holes &&
    a.height === b.height
  );
}

// ── Geometry generation ──────────────────────────────────────────────

/**
 * Create a THREE.Shape from 2D polygon points.
 */
function polygonToShape(polygon: Vec2[]): THREE.Shape {
  const shape = new THREE.Shape();
  if (polygon.length < 3) return shape;

  shape.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i++) {
    shape.lineTo(polygon[i][0], polygon[i][1]);
  }
  shape.closePath();
  return shape;
}

/**
 * Create a THREE.Path (hole) from 2D polygon points.
 */
function polygonToPath(polygon: Vec2[]): THREE.Path {
  const path = new THREE.Path();
  if (polygon.length < 3) return path;

  path.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i++) {
    path.lineTo(polygon[i][0], polygon[i][1]);
  }
  path.closePath();
  return path;
}

/**
 * Generate ceiling geometry from polygon + holes.
 * Uses a thin extrusion for visual representation.
 */
function generateCeilingGeometry(ceiling: CeilingNode): THREE.BufferGeometry | null {
  if (ceiling.polygon.length < 3) return null;

  const shape = polygonToShape(ceiling.polygon);

  // Add holes (e.g., for light fixtures, vents, skylights)
  if (ceiling.holes) {
    for (const holePolygon of ceiling.holes) {
      if (holePolygon.length >= 3) {
        shape.holes.push(polygonToPath(holePolygon));
      }
    }
  }

  // Thin extrusion for visual ceiling plane
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CEILING_THICKNESS,
    bevelEnabled: false,
    steps: 1,
  });

  // Rotate so extrusion goes along Y axis
  // Shape XY -> World XZ, Extrude local Z -> World Y
  geometry.rotateX(-Math.PI / 2);

  geometry.computeVertexNormals();

  return geometry;
}

// ── System component ─────────────────────────────────────────────────

/**
 * CeilingSystem — invisible R3F component that manages ceiling geometry.
 *
 * On each frame, checks for dirty ceiling nodes. For each dirty ceiling:
 * 1. Generates flat geometry from polygon + holes
 * 2. Replaces the geometry on the ceiling's registered Mesh
 * 3. Positions at the ceiling height
 * 4. Marks the ceiling clean
 */
export function CeilingSystem() {
  const geometryCache = useRef<Map<string, CeilingGeometryKey>>(new Map());

  useFrame(() => {
    const { nodes, dirtyNodes, markClean } = useSceneStore.getState();

    const dirtyCeilingIds: string[] = [];
    for (const id of dirtyNodes) {
      const node = nodes[id];
      if (node?.type === 'ceiling') {
        dirtyCeilingIds.push(id);
      }
    }

    if (dirtyCeilingIds.length === 0) return;

    for (const ceilingId of dirtyCeilingIds) {
      const node = nodes[ceilingId];
      if (!node || node.type !== 'ceiling') {
        markClean(ceilingId);
        continue;
      }

      const ceiling = node as CeilingNode;

      // Check if geometry actually changed
      const newKey: CeilingGeometryKey = {
        polygon: JSON.stringify(ceiling.polygon),
        holes: JSON.stringify(ceiling.holes ?? []),
        height: ceiling.height,
      };

      const cached = geometryCache.current.get(ceilingId);
      if (cached && ceilingKeyEqual(cached, newKey)) {
        markClean(ceilingId);
        continue;
      }

      const obj = sceneRegistry.get(ceilingId);
      if (!obj || !(obj instanceof THREE.Mesh)) {
        // Not yet mounted — retry next frame
        continue;
      }

      const newGeo = generateCeilingGeometry(ceiling);
      if (newGeo) {
        // Dispose old geometry
        obj.geometry.dispose();
        obj.geometry = newGeo;

        // Position ceiling at its height
        obj.position.set(0, ceiling.height, 0);
        obj.rotation.set(0, 0, 0);

        geometryCache.current.set(ceilingId, newKey);
      }

      markClean(ceilingId);
    }

    // Clean up cache for deleted ceilings
    for (const cachedId of geometryCache.current.keys()) {
      if (!nodes[cachedId]) {
        geometryCache.current.delete(cachedId);
      }
    }
  }, 1); // priority 1: same pass as slab

  return null;
}

'use client';

// lib/editor/systems/slab-system.tsx
// R3F system component that generates slab (floor) geometry from polygon data.
// Ported from Pascal Editor's slab-system.tsx.
//
// For each dirty slab node:
//   1. Creates THREE.Shape from polygon
//   2. Creates THREE.Path for each hole and adds to shape.holes
//   3. Extrudes by thickness
//   4. Positions at elevation
//
// Runs in useFrame at priority 1.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores';
import { sceneRegistry } from '../registry';
import type { SlabNode, Vec2 } from '../schema';

// ── Geometry cache key ───────────────────────────────────────────────

interface SlabGeometryKey {
  polygon: string;    // JSON-serialized for comparison
  holes: string;      // JSON-serialized
  thickness: number;
  elevation: number;
}

function slabKeyEqual(a: SlabGeometryKey, b: SlabGeometryKey): boolean {
  return (
    a.polygon === b.polygon &&
    a.holes === b.holes &&
    a.thickness === b.thickness &&
    a.elevation === b.elevation
  );
}

// ── Geometry generation ──────────────────────────────────────────────

/**
 * Create a THREE.Shape from 2D polygon points.
 * Maps Vec2 [x, z] -> Shape [x, y] (THREE.Shape is 2D).
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
 * Generate an extruded slab geometry from polygon + holes.
 */
function generateSlabGeometry(slab: SlabNode): THREE.BufferGeometry | null {
  if (slab.polygon.length < 3) return null;

  const shape = polygonToShape(slab.polygon);

  // Add holes
  if (slab.holes) {
    for (const holePolygon of slab.holes) {
      if (holePolygon.length >= 3) {
        shape.holes.push(polygonToPath(holePolygon));
      }
    }
  }

  // Extrude downward by thickness
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: slab.thickness,
    bevelEnabled: false,
    steps: 1,
  });

  // Rotate so extrusion goes along Y axis (down from the slab surface)
  // Shape is in XZ (mapped to XY for THREE.Shape), extrude along local Z.
  // We want: Shape X -> World X, Shape Y -> World Z, Extrude -> World Y (downward)
  geometry.rotateX(-Math.PI / 2);

  geometry.computeVertexNormals();

  return geometry;
}

// ── System component ─────────────────────────────────────────────────

/**
 * SlabSystem — invisible R3F component that manages slab geometry.
 *
 * On each frame, checks for dirty slab nodes. For each dirty slab:
 * 1. Generates extruded geometry from polygon + holes
 * 2. Replaces the geometry on the slab's registered Mesh
 * 3. Positions at the slab's elevation
 * 4. Marks the slab clean
 */
export function SlabSystem() {
  const geometryCache = useRef<Map<string, SlabGeometryKey>>(new Map());

  useFrame(() => {
    const { nodes, dirtyNodes, markClean } = useSceneStore.getState();

    const dirtySlabIds: string[] = [];
    for (const id of dirtyNodes) {
      const node = nodes[id];
      if (node?.type === 'slab') {
        dirtySlabIds.push(id);
      }
    }

    if (dirtySlabIds.length === 0) return;

    for (const slabId of dirtySlabIds) {
      const node = nodes[slabId];
      if (!node || node.type !== 'slab') {
        markClean(slabId);
        continue;
      }

      const slab = node as SlabNode;
      const elevation = slab.elevation ?? 0;

      // Check if geometry actually changed
      const newKey: SlabGeometryKey = {
        polygon: JSON.stringify(slab.polygon),
        holes: JSON.stringify(slab.holes ?? []),
        thickness: slab.thickness,
        elevation,
      };

      const cached = geometryCache.current.get(slabId);
      if (cached && slabKeyEqual(cached, newKey)) {
        markClean(slabId);
        continue;
      }

      const obj = sceneRegistry.get(slabId);
      if (!obj || !(obj instanceof THREE.Mesh)) {
        // Not yet mounted — retry next frame
        continue;
      }

      const newGeo = generateSlabGeometry(slab);
      if (newGeo) {
        // Dispose old geometry
        obj.geometry.dispose();
        obj.geometry = newGeo;

        // Position: the slab surface sits at the given elevation
        // The extruded geometry goes downward from Y=0 in local space
        obj.position.set(0, elevation, 0);
        obj.rotation.set(0, 0, 0);

        geometryCache.current.set(slabId, newKey);
      }

      markClean(slabId);
    }

    // Clean up cache for deleted slabs
    for (const cachedId of geometryCache.current.keys()) {
      if (!nodes[cachedId]) {
        geometryCache.current.delete(cachedId);
      }
    }
  }, 1); // priority 1: early pass

  return null;
}

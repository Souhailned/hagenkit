// lib/editor/systems/wall-geometry.ts
// Converts a 2D wall footprint polygon into an extruded THREE.js geometry.
// Used by the WallSystem to replace placeholder box geometries with
// properly mitered wall shapes.

import * as THREE from 'three';
import type { WallNode } from '../schema';
import type { WallMiterData, WallFootprint } from './wall-mitering';
import { getWallFootprint } from './wall-mitering';

/**
 * Generate an extruded THREE.js geometry from a wall's footprint polygon.
 *
 * The footprint is a 2D polygon in the XZ plane. We create a THREE.Shape
 * from these points (mapping footprint x->shape x, footprint y->shape y),
 * then extrude upward (along the local Z axis of the extrusion).
 *
 * The resulting geometry is positioned in world space — the mesh using it
 * should be at position [0, 0, 0] with no rotation.
 *
 * @param wall - The wall node
 * @param miter - Miter data for this wall (from calculateMiterPoints)
 * @returns A THREE.BufferGeometry for the wall, or null if degenerate
 */
export function generateWallGeometry(
  wall: WallNode,
  miter: WallMiterData | undefined,
): THREE.BufferGeometry | null {
  const footprint = getWallFootprint(wall, miter);

  if (footprint.length < 3) return null;

  // Create a 2D shape from the footprint in the XZ plane.
  // THREE.Shape works in 2D (x, y). We map:
  //   footprint.x -> shape.x (world X)
  //   footprint.y -> shape.y (world Z)
  // Then we extrude along shape's Z axis, which becomes world Y.
  const shape = new THREE.Shape();
  shape.moveTo(footprint[0].x, footprint[0].y);
  for (let i = 1; i < footprint.length; i++) {
    shape.lineTo(footprint[i].x, footprint[i].y);
  }
  shape.closePath();

  // Extrude upward by the wall height
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: wall.height,
    bevelEnabled: false,
    steps: 1,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // The extrude goes along local Z. We need to rotate so it goes along Y (up).
  // Rotate -90 degrees around X axis to convert local Z -> world Y.
  geometry.rotateX(-Math.PI / 2);

  // After the rotation, the base of the wall is at Y=0 and extends upward to Y=height.
  // The footprint coordinates are already in world XZ space.
  // No additional translation needed because the shape coordinates are absolute.

  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Check whether two footprints are effectively the same (no geometry update needed).
 * Compares point-by-point with a small epsilon.
 */
export function footprintsEqual(a: WallFootprint, b: WallFootprint): boolean {
  if (a.length !== b.length) return false;
  const eps = 1e-6;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i].x - b[i].x) > eps || Math.abs(a[i].y - b[i].y) > eps) {
      return false;
    }
  }
  return true;
}

/**
 * Geometry utilities for the floor plan editor.
 */
import type { AnyNode } from "../schema/nodes";

/** Calculate the area of a polygon using the Shoelace formula */
export function polygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  return Math.abs(area) / 2;
}

/** Calculate the centroid of a polygon */
export function polygonCentroid(points: [number, number][]): [number, number] {
  if (points.length === 0) return [0, 0];
  let cx = 0;
  let cy = 0;
  for (const [x, y] of points) {
    cx += x;
    cy += y;
  }
  return [cx / points.length, cy / points.length];
}

/** Distance between two 2D points */
export function distance2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Snap a value to the nearest grid increment */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Snap a 2D point to the grid */
export function snapPointToGrid(
  point: [number, number],
  gridSize: number,
): [number, number] {
  return [snapToGrid(point[0], gridSize), snapToGrid(point[1], gridSize)];
}

/** Calculate the angle between two 2D points in radians */
export function angleBetween(a: [number, number], b: [number, number]): number {
  return Math.atan2(b[1] - a[1], b[0] - a[0]);
}

/** Midpoint of two 2D points */
export function midpoint2D(
  a: [number, number],
  b: [number, number],
): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/** Estimate seating capacity from area (roughly 1 seat per 1.5 m²) */
export function estimateCapacity(areaM2: number): number {
  return Math.floor(areaM2 / 1.5);
}

/** Bounding box in 2D */
export interface Bounds2D {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  width: number;
  depth: number;
}

/** Compute 2D bounding box (X/Z plane) from a flat node dictionary.
 *  Inspects wall start/end, zone polygons, and item positions. */
export function computeSceneBounds(
  nodes: Record<string, AnyNode>,
): Bounds2D | null {
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;
  let hasPoints = false;

  const expand = (x: number, z: number) => {
    hasPoints = true;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  };

  for (const node of Object.values(nodes)) {
    switch (node.type) {
      case "wall":
        expand(node.start[0], node.start[1]);
        expand(node.end[0], node.end[1]);
        break;
      case "zone":
      case "slab":
      case "ceiling":
        for (const pt of node.polygon) {
          expand(pt[0], pt[1]);
        }
        break;
      case "item":
      case "door":
      case "window":
      case "scan":
      case "guide":
      case "roof-segment":
        expand(node.position[0], node.position[2]);
        break;
      case "site":
        // Site polygon defines the property boundary
        if (node.polygon) {
          for (const pt of node.polygon) {
            expand(pt[0], pt[1]);
          }
        }
        break;
      // building, level, roof — container nodes, no own geometry
      default:
        break;
    }
  }

  if (!hasPoints) return null;

  const width = maxX - minX;
  const depth = maxZ - minZ;
  return {
    minX,
    minZ,
    maxX,
    maxZ,
    centerX: minX + width / 2,
    centerZ: minZ + depth / 2,
    width,
    depth,
  };
}

/** Generate a unique ID */
export function generateId(): string {
  return crypto.randomUUID();
}

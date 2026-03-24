/**
 * Geometry utilities for the floor plan editor.
 */

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

/** Generate a unique ID */
export function generateId(): string {
  return crypto.randomUUID();
}

// lib/editor/systems/wall-mitering.ts
// Wall mitering algorithm ported from the Pascal Editor.
//
// Creates proper corner joints where walls meet instead of overlapping boxes.
// The algorithm:
// 1. findJunctions() — group wall endpoints that are within EPSILON of each other
// 2. calculateMiterPoints() — at each junction, sort walls by outgoing angle
//    and compute where adjacent wall edge lines intersect
// 3. getWallFootprint() — build 2D polygon for each wall, using miter points
//    at junctions and default rectangular offsets elsewhere

import type { WallNode } from '../schema';

// ============================================================================
// TYPES
// ============================================================================

/** 2D point used for footprint calculations */
export interface Point2D {
  x: number;
  y: number;
}

/** A junction is a point where 2+ wall endpoints meet */
export interface Junction {
  /** Center position of the junction (average of clustered endpoints) */
  position: Point2D;
  /** IDs of walls that meet at this junction */
  wallIds: string[];
  /** Which end of each wall connects: 'start' | 'end' */
  wallEnds: Array<'start' | 'end'>;
}

/** Miter data for one end of a wall */
export interface WallEndMiter {
  /** The mitered corner points (left and right of wall edge) */
  left: Point2D;
  right: Point2D;
}

/** Full miter data for a wall — one entry per end */
export interface WallMiterData {
  start: WallEndMiter | null;
  end: WallEndMiter | null;
}

/** The 2D polygon footprint of a wall (in XZ plane) */
export type WallFootprint = Point2D[];

// ============================================================================
// CONSTANTS
// ============================================================================

/** Distance threshold (meters) for two endpoints to be considered the same junction */
const JUNCTION_EPSILON = 0.01;

/** Maximum miter extension factor to avoid extreme spikes at acute angles */
const MAX_MITER_FACTOR = 3.0;

// ============================================================================
// UTILITY HELPERS
// ============================================================================

/** Create a string key from a 2D point for Map lookups */
export function pointToKey(p: Point2D): string {
  // Round to 3 decimal places to cluster nearby points
  return `${Math.round(p.x * 1000)},${Math.round(p.y * 1000)}`;
}

/** Get the endpoint position of a wall as a Point2D */
function wallEndpoint(wall: WallNode, end: 'start' | 'end'): Point2D {
  const pt = end === 'start' ? wall.start : wall.end;
  return { x: pt[0], y: pt[1] };
}

/** Get the "other" end of a wall */
function otherEnd(end: 'start' | 'end'): 'start' | 'end' {
  return end === 'start' ? 'end' : 'start';
}

/** Euclidean distance between two Point2D */
function dist(a: Point2D, b: Point2D): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Compute the outgoing angle of a wall from a junction point.
 *  The angle points AWAY from the junction, toward the other end of the wall. */
function outgoingAngle(wall: WallNode, connectedEnd: 'start' | 'end'): number {
  const from = wallEndpoint(wall, connectedEnd);
  const to = wallEndpoint(wall, otherEnd(connectedEnd));
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/** Compute perpendicular unit normal (left side) for a given direction angle */
function leftNormal(angle: number): Point2D {
  return { x: -Math.sin(angle), y: Math.cos(angle) };
}

/** Compute perpendicular unit normal (right side) for a given direction angle */
function rightNormal(angle: number): Point2D {
  return { x: Math.sin(angle), y: -Math.cos(angle) };
}

/** Offset a point by a direction and distance */
function offsetPoint(p: Point2D, normal: Point2D, distance: number): Point2D {
  return {
    x: p.x + normal.x * distance,
    y: p.y + normal.y * distance,
  };
}

/**
 * Intersect two 2D lines, each defined by a point and direction vector.
 * Returns the intersection point, or null if lines are parallel.
 *
 * Line 1: p1 + t * d1
 * Line 2: p2 + s * d2
 */
function lineLineIntersection(
  p1: Point2D,
  d1: Point2D,
  p2: Point2D,
  d2: Point2D,
): Point2D | null {
  const cross = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(cross) < 1e-10) return null; // parallel

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const t = (dx * d2.y - dy * d2.x) / cross;

  return {
    x: p1.x + t * d1.x,
    y: p1.y + t * d1.y,
  };
}

// ============================================================================
// JUNCTION DETECTION
// ============================================================================

/**
 * Find all junctions in the scene — points where 2+ wall endpoints cluster.
 * Returns a Map keyed by a rounded position key.
 */
export function findJunctions(
  walls: WallNode[],
): Map<string, Junction> {
  const junctions = new Map<string, Junction>();

  // Collect all endpoints
  interface Endpoint {
    wallId: string;
    end: 'start' | 'end';
    position: Point2D;
  }
  const endpoints: Endpoint[] = [];

  for (const wall of walls) {
    endpoints.push({
      wallId: wall.id,
      end: 'start',
      position: wallEndpoint(wall, 'start'),
    });
    endpoints.push({
      wallId: wall.id,
      end: 'end',
      position: wallEndpoint(wall, 'end'),
    });
  }

  // Greedy clustering: group endpoints within EPSILON of each other
  const used = new Set<number>();

  for (let i = 0; i < endpoints.length; i++) {
    if (used.has(i)) continue;

    const cluster: Endpoint[] = [endpoints[i]];
    used.add(i);

    for (let j = i + 1; j < endpoints.length; j++) {
      if (used.has(j)) continue;
      if (dist(endpoints[i].position, endpoints[j].position) < JUNCTION_EPSILON) {
        cluster.push(endpoints[j]);
        used.add(j);
      }
    }

    // Only create a junction if 2+ endpoints meet
    if (cluster.length < 2) continue;

    // Average position of the cluster
    let cx = 0;
    let cy = 0;
    for (const ep of cluster) {
      cx += ep.position.x;
      cy += ep.position.y;
    }
    const avgPos: Point2D = { x: cx / cluster.length, y: cy / cluster.length };

    const key = pointToKey(avgPos);
    junctions.set(key, {
      position: avgPos,
      wallIds: cluster.map((ep) => ep.wallId),
      wallEnds: cluster.map((ep) => ep.end),
    });
  }

  return junctions;
}

// ============================================================================
// MITER POINT CALCULATION
// ============================================================================

/** Entry describing a wall at a junction, used for sorting */
interface JunctionWallEntry {
  wallId: string;
  end: 'start' | 'end';
  angle: number; // outgoing angle from junction
  thickness: number;
}

/**
 * Calculate miter points for all walls at all junctions.
 * Returns a Map from wallId to WallMiterData.
 */
export function calculateMiterPoints(
  walls: WallNode[],
  junctions: Map<string, Junction>,
): Map<string, WallMiterData> {
  const wallMap = new Map<string, WallNode>();
  for (const w of walls) wallMap.set(w.id, w);

  // Initialize miter data for each wall
  const miterData = new Map<string, WallMiterData>();
  for (const w of walls) {
    miterData.set(w.id, { start: null, end: null });
  }

  for (const [, junction] of junctions) {
    // Build sorted list of walls at this junction by outgoing angle
    const entries: JunctionWallEntry[] = [];
    for (let i = 0; i < junction.wallIds.length; i++) {
      const wallId = junction.wallIds[i];
      const wallEnd = junction.wallEnds[i];
      const wall = wallMap.get(wallId);
      if (!wall) continue;

      entries.push({
        wallId,
        end: wallEnd,
        angle: outgoingAngle(wall, wallEnd),
        thickness: wall.thickness,
      });
    }

    // Sort by outgoing angle (counter-clockwise)
    entries.sort((a, b) => a.angle - b.angle);

    if (entries.length < 2) continue;

    // For each pair of adjacent walls (in angular order), compute the miter
    for (let i = 0; i < entries.length; i++) {
      const curr = entries[i];
      const next = entries[(i + 1) % entries.length];

      const currWall = wallMap.get(curr.wallId);
      const nextWall = wallMap.get(next.wallId);
      if (!currWall || !nextWall) continue;

      // The "right" edge of curr wall and "left" edge of next wall
      // should meet at the miter point

      // Direction of each wall (outgoing from junction)
      const currDir: Point2D = {
        x: Math.cos(curr.angle),
        y: Math.sin(curr.angle),
      };
      const nextDir: Point2D = {
        x: Math.cos(next.angle),
        y: Math.sin(next.angle),
      };

      // Right edge of curr: junction + right offset, along curr direction
      const currRightNorm = rightNormal(curr.angle);
      const currRightPt = offsetPoint(junction.position, currRightNorm, curr.thickness / 2);

      // Left edge of next: junction + left offset, along next direction
      const nextLeftNorm = leftNormal(next.angle);
      const nextLeftPt = offsetPoint(junction.position, nextLeftNorm, next.thickness / 2);

      // Intersect the two edge lines
      let miterPt = lineLineIntersection(currRightPt, currDir, nextLeftPt, nextDir);

      // Clamp miter to avoid extreme spikes
      if (miterPt) {
        const miterDist = dist(miterPt, junction.position);
        const maxAllowed = Math.max(curr.thickness, next.thickness) * MAX_MITER_FACTOR;
        if (miterDist > maxAllowed) {
          // Fallback: just use the offset point (no miter)
          miterPt = null;
        }
      }

      // Apply miter to curr wall's right side at this end
      if (miterPt) {
        const currMiter = miterData.get(curr.wallId)!;
        const endData = curr.end === 'start' ? 'start' : 'end';
        if (!currMiter[endData]) {
          currMiter[endData] = {
            left: offsetPoint(junction.position, leftNormal(curr.angle), curr.thickness / 2),
            right: miterPt,
          };
        } else {
          currMiter[endData]!.right = miterPt;
        }
      }

      // Apply miter to next wall's left side at this end
      if (miterPt) {
        const nextMiter = miterData.get(next.wallId)!;
        const endData = next.end === 'start' ? 'start' : 'end';
        if (!nextMiter[endData]) {
          nextMiter[endData] = {
            left: miterPt,
            right: offsetPoint(junction.position, rightNormal(next.angle), next.thickness / 2),
          };
        } else {
          nextMiter[endData]!.left = miterPt;
        }
      }
    }
  }

  return miterData;
}

// ============================================================================
// WALL FOOTPRINT
// ============================================================================

/**
 * Build the 2D polygon footprint of a wall.
 * Uses miter points at junctions and rectangular offsets at free ends.
 *
 * The polygon is in the XZ plane (x = wall.start/end[0], y = wall.start/end[1]).
 * Returns points wound counter-clockwise when viewed from above.
 *
 * Footprint order:
 *   startLeft -> endLeft -> endRight -> startRight
 */
export function getWallFootprint(
  wall: WallNode,
  miter: WallMiterData | undefined,
): WallFootprint {
  const start: Point2D = { x: wall.start[0], y: wall.start[1] };
  const end: Point2D = { x: wall.end[0], y: wall.end[1] };

  const wallLen = dist(start, end);
  if (wallLen < 1e-6) {
    // Degenerate wall — return a tiny square
    const half = wall.thickness / 2;
    return [
      { x: start.x - half, y: start.y - half },
      { x: start.x + half, y: start.y - half },
      { x: start.x + half, y: start.y + half },
      { x: start.x - half, y: start.y + half },
    ];
  }

  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const halfT = wall.thickness / 2;

  const lNorm = leftNormal(angle);
  const rNorm = rightNormal(angle);

  // Default rectangular corners (no miter)
  let startLeft: Point2D;
  let startRight: Point2D;
  let endLeft: Point2D;
  let endRight: Point2D;

  if (miter?.start) {
    startLeft = miter.start.left;
    startRight = miter.start.right;
  } else {
    startLeft = offsetPoint(start, lNorm, halfT);
    startRight = offsetPoint(start, rNorm, halfT);
  }

  if (miter?.end) {
    endLeft = miter.end.left;
    endRight = miter.end.right;
  } else {
    endLeft = offsetPoint(end, lNorm, halfT);
    endRight = offsetPoint(end, rNorm, halfT);
  }

  // Return polygon: startLeft -> endLeft -> endRight -> startRight
  return [startLeft, endLeft, endRight, startRight];
}

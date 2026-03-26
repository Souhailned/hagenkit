// lib/editor/spatial/space-detection.ts
// Flood-fill algorithm for interior/exterior space detection.
//
// Given a set of wall nodes, this module:
// 1. Rasterizes wall segments onto a 2D grid
// 2. Flood-fills from the grid boundary (exterior)
// 3. Identifies remaining unfilled cells as interior
// 4. For each wall, determines which side faces interior (frontSide)
//    and which faces exterior (backSide)
//
// This is the same approach used by Pascal Editor for automatic
// wall-side classification, ported to work with Horecagrond's
// flat node dictionary.

import type { WallNode, WallSide } from "../schema/nodes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of space detection for a single wall. */
export interface WallSideClassification {
  /** Which side of the wall faces interior space */
  frontSide: WallSide;
  /** Which side of the wall faces exterior space */
  backSide: WallSide;
}

/** A 2D grid cell state during flood fill. */
const enum CellState {
  /** Empty / unvisited */
  Empty = 0,
  /** Occupied by a wall segment */
  Wall = 1,
  /** Filled by flood-fill (exterior) */
  Exterior = 2,
  /** Interior (not reached by exterior flood-fill) */
  Interior = 3,
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Resolution of the rasterization grid in meters.
 * Smaller = more precise but slower. 0.1m (10cm) is a good balance
 * for floor plans where walls are typically 0.15-0.3m thick.
 */
const GRID_RESOLUTION = 0.1;

/**
 * Padding cells added around the scene bounds to ensure the exterior
 * flood-fill can wrap around all walls.
 */
const GRID_PADDING = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Rasterize a line segment (wall) onto the grid, marking cells as Wall.
 * Uses a conservative rasterization approach (Bresenham-like with thickness).
 */
function rasterizeWall(
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
  originX: number,
  originZ: number,
  start: [number, number],
  end: [number, number],
  thickness: number,
  resolution: number,
): void {
  // Convert wall endpoints to grid coordinates
  const sx = (start[0] - originX) / resolution;
  const sz = (start[1] - originZ) / resolution;
  const ex = (end[0] - originX) / resolution;
  const ez = (end[1] - originZ) / resolution;

  // Wall direction and perpendicular
  const dx = ex - sx;
  const dz = ez - sz;
  const len = Math.hypot(dx, dz);
  if (len < 0.001) return;

  // Perpendicular offset for wall thickness
  const halfThickCells = (thickness / 2) / resolution;
  const nx = -dz / len; // perpendicular X
  const nz = dx / len; // perpendicular Z

  // Sample along the wall at sub-cell intervals
  const steps = Math.ceil(len * 2);
  const thickSteps = Math.max(1, Math.ceil(halfThickCells * 2));

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = sx + dx * t;
    const cz = sz + dz * t;

    // Fill across the wall thickness
    for (let j = -thickSteps; j <= thickSteps; j++) {
      const offset = (j / thickSteps) * halfThickCells;
      const gx = Math.round(cx + nx * offset);
      const gz = Math.round(cz + nz * offset);

      if (gx >= 0 && gx < gridWidth && gz >= 0 && gz < gridHeight) {
        grid[gz * gridWidth + gx] = CellState.Wall;
      }
    }
  }
}

/**
 * Flood-fill from a seed point, marking all reachable Empty cells as Exterior.
 * Uses an iterative stack-based approach (avoids stack overflow on large grids).
 */
function floodFillExterior(
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
): void {
  // Seed from all border cells
  const stack: number[] = [];

  // Top and bottom rows
  for (let x = 0; x < gridWidth; x++) {
    if (grid[x] === CellState.Empty) {
      grid[x] = CellState.Exterior;
      stack.push(x);
    }
    const bottomIdx = (gridHeight - 1) * gridWidth + x;
    if (grid[bottomIdx] === CellState.Empty) {
      grid[bottomIdx] = CellState.Exterior;
      stack.push(bottomIdx);
    }
  }

  // Left and right columns
  for (let z = 0; z < gridHeight; z++) {
    const leftIdx = z * gridWidth;
    if (grid[leftIdx] === CellState.Empty) {
      grid[leftIdx] = CellState.Exterior;
      stack.push(leftIdx);
    }
    const rightIdx = z * gridWidth + (gridWidth - 1);
    if (grid[rightIdx] === CellState.Empty) {
      grid[rightIdx] = CellState.Exterior;
      stack.push(rightIdx);
    }
  }

  // BFS-style flood fill using the stack
  // 4-connected neighbors
  const offsets = [-gridWidth, gridWidth, -1, 1];

  while (stack.length > 0) {
    const idx = stack.pop()!;
    const x = idx % gridWidth;
    const z = Math.floor(idx / gridWidth);

    for (const offset of offsets) {
      const nIdx = idx + offset;

      // Bounds check
      if (offset === -1 && x === 0) continue;
      if (offset === 1 && x === gridWidth - 1) continue;
      if (nIdx < 0 || nIdx >= gridWidth * gridHeight) continue;

      if (grid[nIdx] === CellState.Empty) {
        grid[nIdx] = CellState.Exterior;
        stack.push(nIdx);
      }
    }
  }

  // Mark remaining empty cells as interior
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === CellState.Empty) {
      grid[i] = CellState.Interior;
    }
  }
}

/**
 * Determine the wall side classification by sampling points on each side
 * of the wall's midpoint and checking if they are interior or exterior.
 */
function classifyWallSide(
  grid: Uint8Array,
  gridWidth: number,
  gridHeight: number,
  originX: number,
  originZ: number,
  wall: WallNode,
  resolution: number,
): WallSideClassification {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const len = Math.hypot(dx, dz);

  if (len < 0.001) {
    return { frontSide: "unknown", backSide: "unknown" };
  }

  // Perpendicular unit vector (the "normal" of the wall)
  const nx = -dz / len;
  const nz = dx / len;

  // Sample offset: slightly beyond wall thickness
  const sampleOffset = wall.thickness / 2 + resolution * 2;

  // Midpoint of wall in world space
  const midX = (wall.start[0] + wall.end[0]) / 2;
  const midZ = (wall.start[1] + wall.end[1]) / 2;

  // Sample points on front and back side
  const frontX = midX + nx * sampleOffset;
  const frontZ = midZ + nz * sampleOffset;
  const backX = midX - nx * sampleOffset;
  const backZ = midZ - nz * sampleOffset;

  // Convert to grid coordinates
  const fgx = Math.round((frontX - originX) / resolution);
  const fgz = Math.round((frontZ - originZ) / resolution);
  const bgx = Math.round((backX - originX) / resolution);
  const bgz = Math.round((backZ - originZ) / resolution);

  // Sample grid state
  const frontState = sampleGridState(grid, gridWidth, gridHeight, fgx, fgz);
  const backState = sampleGridState(grid, gridWidth, gridHeight, bgx, bgz);

  return {
    frontSide: cellStateToWallSide(frontState),
    backSide: cellStateToWallSide(backState),
  };
}

function sampleGridState(
  grid: Uint8Array,
  width: number,
  height: number,
  x: number,
  z: number,
): CellState {
  if (x < 0 || x >= width || z < 0 || z >= height) {
    return CellState.Exterior; // Out of bounds = exterior
  }
  return grid[z * width + x] as CellState;
}

function cellStateToWallSide(state: CellState): WallSide {
  switch (state) {
    case CellState.Interior:
      return "interior";
    case CellState.Exterior:
      return "exterior";
    default:
      return "unknown";
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect interior/exterior spaces from wall segments and classify each
 * wall's front and back sides.
 *
 * Algorithm:
 * 1. Compute bounding box of all walls
 * 2. Create a 2D grid at GRID_RESOLUTION covering the bounds + padding
 * 3. Rasterize all wall segments onto the grid
 * 4. Flood-fill from the boundary edges (exterior detection)
 * 5. Remaining unfilled cells are interior
 * 6. For each wall, sample points on each side to classify front/back
 *
 * @param walls - Array of wall nodes
 * @returns Map from wall ID to its side classification
 */
export function detectSpaces(
  walls: WallNode[],
): Map<string, WallSideClassification> {
  const result = new Map<string, WallSideClassification>();

  if (walls.length === 0) return result;

  // ── Step 1: Compute world bounds ────────────────────────────────────

  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;

  for (const wall of walls) {
    for (const pt of [wall.start, wall.end]) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minZ) minZ = pt[1];
      if (pt[1] > maxZ) maxZ = pt[1];
    }
  }

  // Add padding
  const padding = GRID_PADDING * GRID_RESOLUTION;
  const originX = minX - padding;
  const originZ = minZ - padding;
  const extentX = maxX + padding;
  const extentZ = maxZ + padding;

  // ── Step 2: Create grid ─────────────────────────────────────────────

  const gridWidth = Math.ceil((extentX - originX) / GRID_RESOLUTION) + 1;
  const gridHeight = Math.ceil((extentZ - originZ) / GRID_RESOLUTION) + 1;

  // Sanity check: prevent absurdly large grids (> 10 million cells)
  if (gridWidth * gridHeight > 10_000_000) {
    // Scene is too large for space detection at this resolution.
    // Return all walls as "unknown".
    for (const wall of walls) {
      result.set(wall.id, { frontSide: "unknown", backSide: "unknown" });
    }
    return result;
  }

  const grid = new Uint8Array(gridWidth * gridHeight);

  // ── Step 3: Rasterize walls ─────────────────────────────────────────

  for (const wall of walls) {
    rasterizeWall(
      grid,
      gridWidth,
      gridHeight,
      originX,
      originZ,
      wall.start,
      wall.end,
      wall.thickness,
      GRID_RESOLUTION,
    );
  }

  // ── Step 4: Flood-fill exterior ─────────────────────────────────────

  floodFillExterior(grid, gridWidth, gridHeight);

  // ── Step 5 & 6: Classify each wall ──────────────────────────────────

  for (const wall of walls) {
    const classification = classifyWallSide(
      grid,
      gridWidth,
      gridHeight,
      originX,
      originZ,
      wall,
      GRID_RESOLUTION,
    );
    result.set(wall.id, classification);
  }

  return result;
}

/**
 * Check if a 2D point is inside the interior space defined by walls.
 * Useful for validating item placements.
 *
 * This is a convenience function that runs space detection and point-tests.
 * For repeated queries, prefer calling detectSpaces() once and caching.
 *
 * @param point - [x, z] coordinates in world space
 * @param walls - Array of wall nodes
 * @returns true if the point is inside the interior
 */
export function isPointInterior(
  point: [number, number],
  walls: WallNode[],
): boolean {
  if (walls.length === 0) return false;

  // Compute bounds
  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;

  for (const wall of walls) {
    for (const pt of [wall.start, wall.end]) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minZ) minZ = pt[1];
      if (pt[1] > maxZ) maxZ = pt[1];
    }
  }

  const padding = GRID_PADDING * GRID_RESOLUTION;
  const originX = minX - padding;
  const originZ = minZ - padding;
  const extentX = maxX + padding;
  const extentZ = maxZ + padding;

  const gridWidth = Math.ceil((extentX - originX) / GRID_RESOLUTION) + 1;
  const gridHeight = Math.ceil((extentZ - originZ) / GRID_RESOLUTION) + 1;

  if (gridWidth * gridHeight > 10_000_000) return false;

  const grid = new Uint8Array(gridWidth * gridHeight);

  for (const wall of walls) {
    rasterizeWall(
      grid,
      gridWidth,
      gridHeight,
      originX,
      originZ,
      wall.start,
      wall.end,
      wall.thickness,
      GRID_RESOLUTION,
    );
  }

  floodFillExterior(grid, gridWidth, gridHeight);

  // Check the point
  const gx = Math.round((point[0] - originX) / GRID_RESOLUTION);
  const gz = Math.round((point[1] - originZ) / GRID_RESOLUTION);

  if (gx < 0 || gx >= gridWidth || gz < 0 || gz >= gridHeight) return false;

  return grid[gz * gridWidth + gx] === CellState.Interior;
}

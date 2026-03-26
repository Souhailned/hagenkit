// lib/editor/spatial/spatial-grid.ts
// 2D grid-based spatial index for floor-placed items (items, zones, furniture).
// Divides world space into uniform cells and tracks which item IDs occupy each
// cell. Enables fast AABB-based collision queries in O(k) where k is the
// number of occupied cells in the query region, rather than O(n) over all items.
//
// Ported from Pascal Editor's spatial-grid concept with adaptations for
// Horecagrond's flat node dictionary (Record<string, AnyNode>).

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Axis-aligned bounding box in the XZ plane (2D floor coordinates). */
export interface AABB {
  /** Minimum X coordinate (left edge) */
  minX: number;
  /** Minimum Z coordinate (top edge in plan view) */
  minZ: number;
  /** Maximum X coordinate (right edge) */
  maxX: number;
  /** Maximum Z coordinate (bottom edge in plan view) */
  maxZ: number;
}

/** A single cell key is an encoded `col,row` string for Map lookup. */
type CellKey = string;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cellKey(col: number, row: number): CellKey {
  return `${col},${row}`;
}

// ---------------------------------------------------------------------------
// SpatialGrid class
// ---------------------------------------------------------------------------

/**
 * 2D uniform-grid spatial index.
 *
 * The world is divided into square cells of `cellSize` meters.
 * Each cell stores a Set of item IDs whose AABB overlaps that cell.
 *
 * Usage:
 * ```ts
 * const grid = new SpatialGrid(1.0); // 1m cells
 * grid.insert("item_1", { minX: 0, minZ: 0, maxX: 2, maxZ: 1 });
 * const hits = grid.query({ minX: 0.5, minZ: 0, maxX: 1.5, maxZ: 0.5 });
 * // hits === Set(["item_1"])
 * ```
 */
export class SpatialGrid {
  /** Cell size in meters */
  readonly cellSize: number;

  /** Grid cells: cell key -> set of item IDs */
  private cells: Map<CellKey, Set<string>>;

  /** Reverse index: item ID -> set of cell keys it occupies.
   *  Needed for efficient removal without re-scanning the grid. */
  private itemCells: Map<string, Set<CellKey>>;

  /** Cached bounds per item, used for partial rebuild. */
  private itemBounds: Map<string, AABB>;

  constructor(cellSize: number = 1.0) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.itemCells = new Map();
    this.itemBounds = new Map();
  }

  // ── Core API ─────────────────────────────────────────────────────────

  /**
   * Insert an item into the grid by its axis-aligned bounding box.
   * If the item was already inserted, it is removed first (move semantics).
   */
  insert(id: string, bounds: AABB): void {
    // Remove stale entry if present (supports move/resize)
    if (this.itemCells.has(id)) {
      this.remove(id);
    }

    const minCol = Math.floor(bounds.minX / this.cellSize);
    const maxCol = Math.floor(bounds.maxX / this.cellSize);
    const minRow = Math.floor(bounds.minZ / this.cellSize);
    const maxRow = Math.floor(bounds.maxZ / this.cellSize);

    const occupiedCells = new Set<CellKey>();

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const key = cellKey(col, row);
        let cell = this.cells.get(key);
        if (!cell) {
          cell = new Set();
          this.cells.set(key, cell);
        }
        cell.add(id);
        occupiedCells.add(key);
      }
    }

    this.itemCells.set(id, occupiedCells);
    this.itemBounds.set(id, { ...bounds });
  }

  /**
   * Remove an item from the grid.
   * Returns true if the item was found and removed.
   */
  remove(id: string): boolean {
    const occupied = this.itemCells.get(id);
    if (!occupied) return false;

    for (const key of occupied) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.delete(id);
        if (cell.size === 0) {
          this.cells.delete(key);
        }
      }
    }

    this.itemCells.delete(id);
    this.itemBounds.delete(id);
    return true;
  }

  /**
   * Query the grid for all item IDs whose bounding box overlaps the
   * given region. Returns a Set of item IDs.
   *
   * Optionally pass `excludeId` to ignore a specific item (e.g. the item
   * being moved, to avoid self-collision).
   */
  query(bounds: AABB, excludeId?: string): Set<string> {
    const result = new Set<string>();

    const minCol = Math.floor(bounds.minX / this.cellSize);
    const maxCol = Math.floor(bounds.maxX / this.cellSize);
    const minRow = Math.floor(bounds.minZ / this.cellSize);
    const maxRow = Math.floor(bounds.maxZ / this.cellSize);

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cell = this.cells.get(cellKey(col, row));
        if (cell) {
          for (const id of cell) {
            if (id !== excludeId) {
              result.add(id);
            }
          }
        }
      }
    }

    // Narrow-phase: confirm actual AABB overlap (grid cells are conservative)
    const confirmed = new Set<string>();
    for (const id of result) {
      const stored = this.itemBounds.get(id);
      if (stored && aabbOverlap(bounds, stored)) {
        confirmed.add(id);
      }
    }

    return confirmed;
  }

  /**
   * Check whether placing an item with the given bounds would collide
   * with any existing item. Returns the Set of colliding item IDs.
   *
   * @param bounds - Proposed bounding box
   * @param excludeId - Item to exclude (e.g. the item being moved)
   */
  checkCollision(bounds: AABB, excludeId?: string): Set<string> {
    return this.query(bounds, excludeId);
  }

  /**
   * Get the stored AABB for an item, or undefined if not tracked.
   */
  getBounds(id: string): AABB | undefined {
    return this.itemBounds.get(id);
  }

  /**
   * Check if an item is currently in the grid.
   */
  has(id: string): boolean {
    return this.itemCells.has(id);
  }

  /**
   * Clear the entire grid.
   */
  clear(): void {
    this.cells.clear();
    this.itemCells.clear();
    this.itemBounds.clear();
  }

  /**
   * Number of tracked items.
   */
  get size(): number {
    return this.itemCells.size;
  }
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/**
 * Test whether two AABBs overlap (inclusive of touching edges).
 */
export function aabbOverlap(a: AABB, b: AABB): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minZ <= b.maxZ && a.maxZ >= b.minZ;
}

/**
 * Compute an AABB from a center point and half-extents (width/depth).
 * Items in the editor store position as [x, y, z] where x/z are the
 * floor-plane coordinates. Width maps to X, depth maps to Z.
 */
export function aabbFromCenter(
  cx: number,
  cz: number,
  width: number,
  depth: number,
): AABB {
  const hw = width / 2;
  const hd = depth / 2;
  return {
    minX: cx - hw,
    minZ: cz - hd,
    maxX: cx + hw,
    maxZ: cz + hd,
  };
}

/**
 * Compute an AABB from a wall node's start/end points and thickness.
 * The wall's thickness expands perpendicular to its direction.
 */
export function aabbFromWall(
  start: [number, number],
  end: [number, number],
  thickness: number,
): AABB {
  const halfT = thickness / 2;
  return {
    minX: Math.min(start[0], end[0]) - halfT,
    minZ: Math.min(start[1], end[1]) - halfT,
    maxX: Math.max(start[0], end[0]) + halfT,
    maxZ: Math.max(start[1], end[1]) + halfT,
  };
}

/**
 * Compute an AABB from a polygon (zone, slab, etc.).
 */
export function aabbFromPolygon(points: [number, number][]): AABB {
  if (points.length === 0) {
    return { minX: 0, minZ: 0, maxX: 0, maxZ: 0 };
  }

  let minX = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxZ = -Infinity;

  for (const [x, z] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  return { minX, minZ, maxX, maxZ };
}

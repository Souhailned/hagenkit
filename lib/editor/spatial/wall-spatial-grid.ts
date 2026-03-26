// lib/editor/spatial/wall-spatial-grid.ts
// 1D spatial index for wall-attached items (doors, windows).
//
// Each wall has a linear parameter space from 0 to 1 (ratio along the wall).
// Wall-attached items occupy a range [start, end] on this line.
// This grid enables fast overlap checks when placing a new door or window.
//
// Ported from Pascal Editor's wall-spatial-grid concept.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A 1D interval on a wall, expressed as ratios (0-1) along the wall length. */
export interface WallInterval {
  /** The item ID occupying this interval */
  itemId: string;
  /** Start position along the wall (0-1 ratio) */
  start: number;
  /** End position along the wall (0-1 ratio) */
  end: number;
}

// ---------------------------------------------------------------------------
// WallSpatialGrid class
// ---------------------------------------------------------------------------

/**
 * 1D spatial index for wall-attached items.
 *
 * Manages intervals per wall. Each wall is identified by its node ID.
 * Items on a wall occupy a range [start, end] expressed as 0-1 ratios
 * along the wall's length.
 *
 * Usage:
 * ```ts
 * const wsg = new WallSpatialGrid();
 * wsg.insert("wall_1", "door_1", 0.2, 0.4);
 * wsg.hasOverlap("wall_1", 0.3, 0.5); // true
 * wsg.hasOverlap("wall_1", 0.5, 0.7); // false
 * ```
 */
export class WallSpatialGrid {
  /** Per-wall interval lists: wall ID -> sorted intervals */
  private walls: Map<string, WallInterval[]>;

  constructor() {
    this.walls = new Map();
  }

  // ── Core API ─────────────────────────────────────────────────────────

  /**
   * Insert an item interval on a wall.
   * If the item already exists on this wall, it is removed first.
   *
   * @param wallId - ID of the wall node
   * @param itemId - ID of the door/window node
   * @param start  - Start ratio (0-1) along the wall
   * @param end    - End ratio (0-1) along the wall
   */
  insert(wallId: string, itemId: string, start: number, end: number): void {
    // Ensure start <= end
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);

    // Remove existing entry for this item on this wall
    this.remove(wallId, itemId);

    let intervals = this.walls.get(wallId);
    if (!intervals) {
      intervals = [];
      this.walls.set(wallId, intervals);
    }

    intervals.push({ itemId, start: lo, end: hi });

    // Keep sorted by start position for efficient queries
    intervals.sort((a, b) => a.start - b.start);
  }

  /**
   * Remove an item from a wall.
   * Returns true if the item was found and removed.
   */
  remove(wallId: string, itemId: string): boolean {
    const intervals = this.walls.get(wallId);
    if (!intervals) return false;

    const idx = intervals.findIndex((iv) => iv.itemId === itemId);
    if (idx === -1) return false;

    intervals.splice(idx, 1);

    // Clean up empty walls
    if (intervals.length === 0) {
      this.walls.delete(wallId);
    }

    return true;
  }

  /**
   * Remove an item from ALL walls (when you don't know which wall it's on).
   * Returns true if the item was found on any wall.
   */
  removeItem(itemId: string): boolean {
    let found = false;
    for (const [wallId, intervals] of this.walls) {
      const idx = intervals.findIndex((iv) => iv.itemId === itemId);
      if (idx !== -1) {
        intervals.splice(idx, 1);
        found = true;
        if (intervals.length === 0) {
          this.walls.delete(wallId);
        }
      }
    }
    return found;
  }

  /**
   * Remove an entire wall and all its intervals (when a wall is deleted).
   */
  removeWall(wallId: string): void {
    this.walls.delete(wallId);
  }

  /**
   * Query all items that overlap the given interval on a wall.
   * Returns the set of overlapping item IDs.
   *
   * @param wallId    - ID of the wall
   * @param start     - Query start ratio (0-1)
   * @param end       - Query end ratio (0-1)
   * @param excludeId - Optional item ID to exclude (for move operations)
   */
  query(
    wallId: string,
    start: number,
    end: number,
    excludeId?: string,
  ): Set<string> {
    const result = new Set<string>();
    const intervals = this.walls.get(wallId);
    if (!intervals) return result;

    const lo = Math.min(start, end);
    const hi = Math.max(start, end);

    for (const iv of intervals) {
      if (iv.itemId === excludeId) continue;
      // Two intervals overlap iff neither is entirely to the left/right
      if (iv.start < hi && iv.end > lo) {
        result.add(iv.itemId);
      }
    }

    return result;
  }

  /**
   * Check whether placing an item at [start, end] on a wall would overlap
   * with any existing items. Convenience wrapper around `query()`.
   *
   * @param wallId    - ID of the wall
   * @param start     - Start ratio (0-1)
   * @param end       - End ratio (0-1)
   * @param excludeId - Item to exclude from the check
   */
  hasOverlap(
    wallId: string,
    start: number,
    end: number,
    excludeId?: string,
  ): boolean {
    return this.query(wallId, start, end, excludeId).size > 0;
  }

  /**
   * Check whether placing an item at a center position with a given width
   * would overlap. The position and width are in wall-ratio space.
   *
   * @param wallId     - ID of the wall
   * @param position   - Center position as a 0-1 ratio
   * @param widthRatio - Width as a ratio of the wall length
   * @param excludeId  - Item to exclude from the check
   */
  hasOverlapAtPosition(
    wallId: string,
    position: number,
    widthRatio: number,
    excludeId?: string,
  ): boolean {
    const halfWidth = widthRatio / 2;
    return this.hasOverlap(
      wallId,
      position - halfWidth,
      position + halfWidth,
      excludeId,
    );
  }

  /**
   * Get all intervals for a wall.
   */
  getIntervals(wallId: string): ReadonlyArray<WallInterval> {
    return this.walls.get(wallId) ?? [];
  }

  /**
   * Get all tracked wall IDs.
   */
  getWallIds(): string[] {
    return Array.from(this.walls.keys());
  }

  /**
   * Clear the entire wall spatial grid.
   */
  clear(): void {
    this.walls.clear();
  }

  /**
   * Total number of tracked items across all walls.
   */
  get size(): number {
    let count = 0;
    for (const intervals of this.walls.values()) {
      count += intervals.length;
    }
    return count;
  }
}

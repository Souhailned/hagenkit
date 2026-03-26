// lib/editor/spatial/spatial-grid-manager.ts
// Coordinates both the floor SpatialGrid and the WallSpatialGrid.
// Provides a unified API for collision detection and overlap checking.
//
// This manager maintains:
// 1. A SpatialGrid for floor-placed items (furniture, zones, walls)
// 2. A WallSpatialGrid for wall-attached items (doors, windows)
//
// It rebuilds from the scene's flat node dictionary and provides
// query methods used by the editor tools.

import {
  SpatialGrid,
  aabbFromCenter,
  aabbFromWall,
  type AABB,
} from "./spatial-grid";
import { WallSpatialGrid } from "./wall-spatial-grid";
import type {
  AnyNode,
  WallNode,
  ItemNode,
  DoorNode,
  WindowNode,
} from "../schema/nodes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default cell size for the floor spatial grid (1 meter). */
const DEFAULT_CELL_SIZE = 1.0;

// ---------------------------------------------------------------------------
// SpatialGridManager
// ---------------------------------------------------------------------------

/**
 * Coordinates the floor spatial grid (2D AABB index) and the wall spatial
 * grid (1D interval index) to provide unified collision/overlap queries.
 *
 * Usage:
 * ```ts
 * const manager = new SpatialGridManager();
 * manager.rebuild(sceneNodes);
 *
 * // Check floor collision
 * const collisions = manager.checkFloorCollision(bounds, "item_being_moved");
 *
 * // Check wall overlap
 * const overlaps = manager.checkWallOverlap("wall_1", 0.5, 0.1);
 * ```
 */
export class SpatialGridManager {
  /** Floor-placed items spatial grid */
  readonly floorGrid: SpatialGrid;

  /** Wall-attached items spatial grid */
  readonly wallGrid: WallSpatialGrid;

  /** Tracks which node IDs are in the floor grid for incremental updates */
  private trackedFloorIds: Set<string>;

  /** Tracks which node IDs are in the wall grid for incremental updates */
  private trackedWallItemIds: Set<string>;

  constructor(cellSize: number = DEFAULT_CELL_SIZE) {
    this.floorGrid = new SpatialGrid(cellSize);
    this.wallGrid = new WallSpatialGrid();
    this.trackedFloorIds = new Set();
    this.trackedWallItemIds = new Set();
  }

  // ── Full rebuild ─────────────────────────────────────────────────────

  /**
   * Rebuild both grids from the full node dictionary.
   * This is called when the scene is first loaded or after major changes.
   */
  rebuild(nodes: Record<string, AnyNode>): void {
    this.floorGrid.clear();
    this.wallGrid.clear();
    this.trackedFloorIds.clear();
    this.trackedWallItemIds.clear();

    // Pre-collect walls for length lookups when processing doors/windows
    const wallNodes = new Map<string, WallNode>();

    for (const node of Object.values(nodes)) {
      switch (node.type) {
        case "wall":
          wallNodes.set(node.id, node);
          this.insertWallIntoFloorGrid(node);
          break;

        case "item":
          this.insertItemIntoFloorGrid(node);
          break;

        case "door":
        case "window":
          // Defer until walls are collected
          break;

        // Zones, slabs, etc. are not inserted into collision grids
        // since they represent areas, not solid objects
        default:
          break;
      }
    }

    // Process wall-attached items (doors, windows)
    for (const node of Object.values(nodes)) {
      if (node.type === "door" || node.type === "window") {
        const wall = wallNodes.get(node.wallId);
        if (wall) {
          this.insertWallItemIntoGrid(node, wall);
        }
      }
    }
  }

  // ── Incremental updates ──────────────────────────────────────────────

  /**
   * Update a single node in the spatial grids.
   * Handles insert/update/remove based on node type.
   */
  updateNode(node: AnyNode, walls: Map<string, WallNode>): void {
    switch (node.type) {
      case "wall":
        this.insertWallIntoFloorGrid(node);
        break;
      case "item":
        this.insertItemIntoFloorGrid(node);
        break;
      case "door":
      case "window": {
        const wall = walls.get(node.wallId);
        if (wall) {
          this.insertWallItemIntoGrid(node, wall);
        }
        break;
      }
      default:
        break;
    }
  }

  /**
   * Remove a node from all spatial grids.
   */
  removeNode(id: string): void {
    if (this.trackedFloorIds.has(id)) {
      this.floorGrid.remove(id);
      this.trackedFloorIds.delete(id);
    }
    if (this.trackedWallItemIds.has(id)) {
      this.wallGrid.removeItem(id);
      this.trackedWallItemIds.delete(id);
    }
  }

  // ── Floor grid queries ───────────────────────────────────────────────

  /**
   * Check for floor-placed items that collide with the given bounds.
   *
   * @param bounds    - Proposed bounding box
   * @param excludeId - Item to exclude (the item being moved/placed)
   * @returns Set of colliding item IDs
   */
  checkFloorCollision(bounds: AABB, excludeId?: string): Set<string> {
    return this.floorGrid.checkCollision(bounds, excludeId);
  }

  /**
   * Get all floor-placed items in a region.
   */
  getItemsInArea(bounds: AABB, excludeId?: string): Set<string> {
    return this.floorGrid.query(bounds, excludeId);
  }

  // ── Wall grid queries ────────────────────────────────────────────────

  /**
   * Check if placing a door/window at a position on a wall would overlap.
   *
   * @param wallId    - The wall ID
   * @param position  - Center position as a 0-1 ratio along the wall
   * @param width     - Width of the item in meters
   * @param wallLength - Length of the wall in meters
   * @param excludeId - Item to exclude (for move operations)
   * @returns true if there is an overlap
   */
  checkWallOverlap(
    wallId: string,
    position: number,
    width: number,
    wallLength: number,
    excludeId?: string,
  ): boolean {
    if (wallLength <= 0) return false;
    const widthRatio = width / wallLength;
    return this.wallGrid.hasOverlapAtPosition(
      wallId,
      position,
      widthRatio,
      excludeId,
    );
  }

  /**
   * Get all items overlapping a position on a wall.
   */
  getWallItemsAtPosition(
    wallId: string,
    position: number,
    width: number,
    wallLength: number,
    excludeId?: string,
  ): Set<string> {
    if (wallLength <= 0) return new Set();
    const widthRatio = width / wallLength;
    const halfWidth = widthRatio / 2;
    return this.wallGrid.query(
      wallId,
      position - halfWidth,
      position + halfWidth,
      excludeId,
    );
  }

  // ── Clear ────────────────────────────────────────────────────────────

  /**
   * Clear both grids.
   */
  clear(): void {
    this.floorGrid.clear();
    this.wallGrid.clear();
    this.trackedFloorIds.clear();
    this.trackedWallItemIds.clear();
  }

  // ── Private helpers ──────────────────────────────────────────────────

  private insertWallIntoFloorGrid(wall: WallNode): void {
    const bounds = aabbFromWall(wall.start, wall.end, wall.thickness);
    this.floorGrid.insert(wall.id, bounds);
    this.trackedFloorIds.add(wall.id);
  }

  private insertItemIntoFloorGrid(item: ItemNode): void {
    // Items store position as [x, y, z]; floor plane is x/z
    const bounds = aabbFromCenter(
      item.position[0],
      item.position[2],
      item.width,
      item.depth,
    );
    this.floorGrid.insert(item.id, bounds);
    this.trackedFloorIds.add(item.id);
  }

  private insertWallItemIntoGrid(
    node: DoorNode | WindowNode,
    wall: WallNode,
  ): void {
    const wallLength = Math.hypot(
      wall.end[0] - wall.start[0],
      wall.end[1] - wall.start[1],
    );
    if (wallLength <= 0) return;

    const widthRatio = node.width / wallLength;
    const halfWidth = widthRatio / 2;
    const start = node.wallPosition - halfWidth;
    const end = node.wallPosition + halfWidth;

    this.wallGrid.insert(wall.id, node.id, start, end);
    this.trackedWallItemIds.add(node.id);
  }
}

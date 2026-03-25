"use client";

// lib/editor/hooks/use-tool-events.ts
// Subscribes to grid events and executes tool-specific actions.
//
// Selection: via hitNodeId in grid:click payloads
// Wall snapping: grid snap → 45° angle snap → wall join snap
// Zone: polygon with close-on-first-point detection
// Measure: two-click distance measurement
// Item: single-click placement, stays in mode for multiple placements

import { useEffect, useRef } from "react";
import { editorEmitter, type GridEventPayload } from "../events";
import { useEditorStore, useSceneStore } from "../stores";
import { snapPointToGrid, generateId, polygonArea, distance2D } from "../utils";
import {
  ITEM_DEFAULTS,
  DEFAULT_WALL_HEIGHT,
  DEFAULT_WALL_THICKNESS,
  DEFAULT_DOOR_WIDTH,
  DEFAULT_DOOR_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_SILL_HEIGHT,
  ZONE_COLORS,
  type HorecaItemType,
  type HorecaZoneType,
  type WallNode,
  type DoorNode,
  type WindowNode,
} from "../schema";

// ── Wall snapping constants ──────────────────────────────────────────────
const WALL_JOIN_SNAP_RADIUS = 0.35; // meters — snap to existing wall endpoints
const WALL_GRID_STEP = 0.5; // meters — coarser grid for wall placement
const ANGLE_SNAP_INCREMENT = Math.PI / 4; // 45 degrees

// ── Zone constants ───────────────────────────────────────────────────────
const CLOSE_POLYGON_THRESHOLD = 0.3; // meters
const MIN_WALL_LENGTH = 0.1; // meters

// ── Wall snapping helpers ────────────────────────────────────────────────

/** Find nearest wall endpoint within snap radius */
function findNearestWallEndpoint(
  point: [number, number],
): [number, number] | null {
  const nodes = useSceneStore.getState().nodes;
  let nearest: [number, number] | null = null;
  let nearestDist = WALL_JOIN_SNAP_RADIUS;

  for (const node of Object.values(nodes)) {
    if (node.type !== "wall") continue;
    for (const ep of [node.start, node.end]) {
      const dist = Math.hypot(ep[0] - point[0], ep[1] - point[1]);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = [ep[0], ep[1]];
      }
    }
  }

  return nearest;
}

/** Snap endpoint to nearest 45-degree angle from start point */
function snapToAngle45(
  start: [number, number],
  end: [number, number],
): [number, number] {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const angle = Math.atan2(dy, dx);
  const length = Math.hypot(dx, dy);

  const snappedAngle =
    Math.round(angle / ANGLE_SNAP_INCREMENT) * ANGLE_SNAP_INCREMENT;

  return [
    start[0] + length * Math.cos(snappedAngle),
    start[1] + length * Math.sin(snappedAngle),
  ];
}

/** Apply wall-specific snapping pipeline.
 *  Priority: join snap (on raw point) → angle snap → grid snap */
function snapWallPoint(
  rawPoint: [number, number],
  wallStart: [number, number] | null,
  isShiftHeld: boolean,
): [number, number] {
  // 1. Join snap first (highest priority) — check raw cursor position
  const joinSnap = findNearestWallEndpoint(rawPoint);
  if (joinSnap) {
    return joinSnap;
  }

  // 2. Grid snap (coarser for walls — 0.5m)
  let point: [number, number] = snapPointToGrid(rawPoint, WALL_GRID_STEP);

  // 3. Angle snap: when drawing from start, default 45°. Shift = free-form.
  //    Don't re-grid-snap after angle snap — that would break the 45° invariant.
  if (wallStart && !isShiftHeld) {
    point = snapToAngle45(wallStart, point);
  }

  return point;
}

// ── Door/Window placement constants ──────────────────────────────────────
const WALL_PROXIMITY_RADIUS = 0.5; // meters — how close cursor must be to a wall

/** Result of projecting a point onto a wall segment */
interface WallSnapResult {
  wallId: string;
  /** 0-1 ratio along the wall */
  position: number;
  /** Distance from the cursor to the wall */
  distance: number;
  /** The wall node */
  wall: WallNode;
}

/** Find the nearest wall to a 2D point, projecting onto the wall segment */
function findNearestWall(
  point: [number, number],
  maxDistance: number = WALL_PROXIMITY_RADIUS,
): WallSnapResult | null {
  const nodes = useSceneStore.getState().nodes;
  let nearest: WallSnapResult | null = null;

  for (const node of Object.values(nodes)) {
    if (node.type !== "wall") continue;

    const dx = node.end[0] - node.start[0];
    const dz = node.end[1] - node.start[1];
    const len = Math.hypot(dx, dz);
    if (len < 0.01) continue;

    // Project point onto wall segment, clamped to [0, 1]
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point[0] - node.start[0]) * dx + (point[1] - node.start[1]) * dz) /
          (len * len),
      ),
    );

    const projX = node.start[0] + t * dx;
    const projZ = node.start[1] + t * dz;
    const dist = Math.hypot(point[0] - projX, point[1] - projZ);

    if (dist < maxDistance && (!nearest || dist < nearest.distance)) {
      nearest = {
        wallId: node.id,
        position: t,
        distance: dist,
        wall: node,
      };
    }
  }

  return nearest;
}

/**
 * Check if placing a door/window at `position` on `wallId` would overlap
 * with any existing doors/windows on that wall.
 */
function checkOverlap(
  wallId: string,
  position: number,
  width: number,
  wallLength: number,
): boolean {
  const nodes = useSceneStore.getState().nodes;
  const halfRatio = wallLength > 0 ? (width / 2) / wallLength : 0;

  for (const node of Object.values(nodes)) {
    if (
      (node.type === "door" || node.type === "window") &&
      node.wallId === wallId
    ) {
      const existingHalfRatio =
        wallLength > 0 ? (node.width / 2) / wallLength : 0;
      const minDist = halfRatio + existingHalfRatio;
      if (Math.abs(position - node.wallPosition) < minDist) {
        return true; // overlap detected
      }
    }
  }

  return false;
}

/**
 * Compute the 3D position and Y rotation for a door/window placed on a wall.
 */
function computeWallPlacement(
  wall: WallNode,
  wallPosition: number,
): { worldPos: [number, number, number]; yRotation: number } {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const angle = Math.atan2(dz, dx);

  const px = wall.start[0] + dx * wallPosition;
  const pz = wall.start[1] + dz * wallPosition;

  return {
    worldPos: [px, 0, pz],
    yRotation: -angle,
  };
}

// ── Cycling zone colors ──────────────────────────────────────────────────
const ZONE_TYPE_CYCLE: HorecaZoneType[] = [
  "dining_area",
  "bar_area",
  "kitchen",
  "terrace",
  "entrance",
  "storage",
];

// ═══════════════════════════════════════════════════════════════════════════
// Main hook
// ═══════════════════════════════════════════════════════════════════════════

export function useToolEvents() {
  // Tool state refs
  const wallStartRef = useRef<[number, number] | null>(null);
  const zonePointsRef = useRef<[number, number][]>([]);
  const measureStartRef = useRef<[number, number] | null>(null);

  // Drag-to-move state
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef<[number, number] | null>(null);

  // Modifier keys
  const modifierRef = useRef({ ctrl: false, shift: false });

  // ── Track modifier keys ─────────────────────────────────────────────
  useEffect(() => {
    const update = (e: KeyboardEvent) => {
      modifierRef.current.ctrl = e.ctrlKey || e.metaKey;
      modifierRef.current.shift = e.shiftKey;
    };
    window.addEventListener("keydown", update);
    window.addEventListener("keyup", update);
    return () => {
      window.removeEventListener("keydown", update);
      window.removeEventListener("keyup", update);
    };
  }, []);

  // ── Reset tool refs when activeTool changes ───────────────────────────
  useEffect(() => {
    let prevTool = useEditorStore.getState().activeTool;
    const unsub = useEditorStore.subscribe((state) => {
      if (state.activeTool !== prevTool) {
        prevTool = state.activeTool;
        wallStartRef.current = null;
        zonePointsRef.current = [];
        measureStartRef.current = null;
        isDraggingRef.current = false;
        dragStartPosRef.current = null;
      }
    });
    return unsub;
  }, []);

  // ── Event handlers ────────────────────────────────────────────────────
  useEffect(() => {
    // ══════════════════════════════════════════════════════════════════════
    // GRID CLICK — main tool dispatch
    // ══════════════════════════════════════════════════════════════════════
    const handleGridClick = (payload: GridEventPayload) => {
      const store = useEditorStore.getState();
      const sceneStore = useSceneStore.getState();
      const { activeTool, placingItemType, gridSize } = store;

      const point: [number, number] = snapPointToGrid(
        payload.position,
        gridSize,
      );

      // ── SELECT TOOL ──────────────────────────────────────────────────
      if (activeTool === "select") {
        if (payload.hitNodeId) {
          // Auto-switch phase based on what was clicked
          const hitNode = sceneStore.nodes[payload.hitNodeId];
          if (hitNode) {
            const isStructuralNode =
              hitNode.type === "wall" ||
              hitNode.type === "zone" ||
              hitNode.type === "door" ||
              hitNode.type === "window";
            if (isStructuralNode && store.phase === "furnish") {
              store.setPhase("structure");
            }
            if (hitNode.type === "item" && store.phase === "structure") {
              store.setPhase("furnish");
            }
          }
          store.selectNode(payload.hitNodeId, modifierRef.current.ctrl);
        } else {
          store.clearSelection();
        }
        return;
      }

      // ── ITEM PLACEMENT ───────────────────────────────────────────────
      if (placingItemType) {
        const defaults = ITEM_DEFAULTS[placingItemType as HorecaItemType];
        if (defaults) {
          sceneStore.createNode({
            id: generateId(),
            type: "item",
            parentId: null,
            visible: true,
            position: [point[0], 0, point[1]],
            rotation: [0, 0, 0],
            itemType: placingItemType as HorecaItemType,
            width: defaults.width,
            depth: defaults.depth,
            height: defaults.height,
          });
          // Stay in item mode — don't stopPlacingItem
        }
        return;
      }

      // ── WALL TOOL (with snapping) ────────────────────────────────────
      if (activeTool === "wall") {
        const wallPoint = snapWallPoint(
          payload.position,
          wallStartRef.current,
          modifierRef.current.shift,
        );

        if (!wallStartRef.current) {
          wallStartRef.current = wallPoint;
          store.startDrawing();
          store.addDrawPoint(wallPoint);
        } else {
          const start = wallStartRef.current;
          const end = wallPoint;
          const length = distance2D(start, end);

          if (length >= MIN_WALL_LENGTH) {
            sceneStore.createNode({
              id: generateId(),
              type: "wall",
              parentId: null,
              visible: true,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              start,
              end,
              thickness: DEFAULT_WALL_THICKNESS,
              height: DEFAULT_WALL_HEIGHT,
              material: "brick",
            });

            // Chain: end becomes new start (atomic to prevent 1-frame flicker)
            wallStartRef.current = end;
            store.restartDrawingAt(end);
          }
        }
        return;
      }

      // ── ZONE TOOL (polygon with close detection) ─────────────────────
      if (activeTool === "zone") {
        const points = zonePointsRef.current;

        // Close polygon if near first point
        if (points.length >= 3) {
          const first = points[0];
          if (distance2D(point, first) < CLOSE_POLYGON_THRESHOLD) {
            const area = polygonArea(points);
            // Derive zone type from existing zone count (stable across remount/HMR)
            const existingZoneCount = Object.values(sceneStore.nodes).filter(
              (n) => n.type === "zone",
            ).length;
            const zoneType = ZONE_TYPE_CYCLE[existingZoneCount % ZONE_TYPE_CYCLE.length];

            sceneStore.createNode({
              id: generateId(),
              type: "zone",
              parentId: null,
              visible: true,
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              zoneType,
              polygon: [...points],
              area,
              color: ZONE_COLORS[zoneType],
              capacity: 0,
            });

            zonePointsRef.current = [];
            store.cancelDrawing();
            return;
          }
        }

        // Add point to polygon
        points.push(point);
        if (points.length === 1) {
          store.startDrawing();
        }
        store.addDrawPoint(point);
        return;
      }

      // ── MEASURE TOOL (two-click distance) ────────────────────────────
      if (activeTool === "measure") {
        if (!measureStartRef.current) {
          // First click: set start
          measureStartRef.current = point;
          store.startDrawing();
          store.addDrawPoint(point);
        } else {
          // Second click: show measurement, then reset
          store.addDrawPoint(point);
          measureStartRef.current = null;
          // Keep drawing state to show the measurement line
          // It will be cleared on next first click or tool switch
        }
        return;
      }

      // ── DOOR TOOL (place door on nearest wall) ─────────────────────
      if (activeTool === "door") {
        const snap = findNearestWall(payload.position);
        if (!snap) return;

        const wallLen = distance2D(snap.wall.start, snap.wall.end);
        const doorWidth = DEFAULT_DOOR_WIDTH;

        // Check overlap with existing openings
        if (checkOverlap(snap.wallId, snap.position, doorWidth, wallLen)) {
          return;
        }

        // Clamp position so door doesn't extend past wall ends
        const halfRatio = wallLen > 0 ? (doorWidth / 2) / wallLen : 0;
        const clampedPos = Math.max(halfRatio, Math.min(1 - halfRatio, snap.position));

        const { worldPos, yRotation } = computeWallPlacement(snap.wall, clampedPos);

        sceneStore.createNode({
          id: generateId(),
          type: "door",
          parentId: null,
          visible: true,
          position: worldPos,
          rotation: [0, yRotation, 0],
          width: doorWidth,
          height: DEFAULT_DOOR_HEIGHT,
          style: "single",
          wallId: snap.wallId,
          wallPosition: clampedPos,
        });

        // Stay in door tool for multiple placements
        return;
      }

      // ── WINDOW TOOL (place window on nearest wall) ─────────────────
      if (activeTool === "window") {
        const snap = findNearestWall(payload.position);
        if (!snap) return;

        const wallLen = distance2D(snap.wall.start, snap.wall.end);
        const windowWidth = DEFAULT_WINDOW_WIDTH;

        // Check overlap with existing openings
        if (checkOverlap(snap.wallId, snap.position, windowWidth, wallLen)) {
          return;
        }

        // Clamp position so window doesn't extend past wall ends
        const halfRatio = wallLen > 0 ? (windowWidth / 2) / wallLen : 0;
        const clampedPos = Math.max(halfRatio, Math.min(1 - halfRatio, snap.position));

        const { worldPos, yRotation } = computeWallPlacement(snap.wall, clampedPos);

        sceneStore.createNode({
          id: generateId(),
          type: "window",
          parentId: null,
          visible: true,
          position: worldPos,
          rotation: [0, yRotation, 0],
          width: windowWidth,
          height: DEFAULT_WINDOW_HEIGHT,
          sillHeight: DEFAULT_WINDOW_SILL_HEIGHT,
          style: "fixed",
          wallId: snap.wallId,
          wallPosition: clampedPos,
        });

        // Stay in window tool for multiple placements
        return;
      }
    };

    // ══════════════════════════════════════════════════════════════════════
    // HOVER + CURSOR
    // ══════════════════════════════════════════════════════════════════════
    let currentHoveredId: string | null = null;

    const handlePointerMove = (payload: GridEventPayload) => {
      const store = useEditorStore.getState();
      const newHoveredId = payload.hitNodeId ?? null;

      if (newHoveredId !== currentHoveredId) {
        currentHoveredId = newHoveredId;
        store.setHovered(newHoveredId);

        if (store.activeTool === "select") {
          document.body.style.cursor = newHoveredId ? "pointer" : "";
        }
      }

      // ── Drag-to-move ──────────────────────────────────────────────────
      if (isDraggingRef.current && dragStartPosRef.current) {
        const { selectedNodeIds, gridSize } = store;
        const sceneStore = useSceneStore.getState();
        const snapped = snapPointToGrid(payload.position, gridSize);
        const dx = snapped[0] - dragStartPosRef.current[0];
        const dz = snapped[1] - dragStartPosRef.current[1];

        if (Math.abs(dx) < 0.01 && Math.abs(dz) < 0.01) return;

        for (const id of selectedNodeIds) {
          const node = sceneStore.nodes[id];
          if (!node) continue;
          if (node.type === "item") {
            sceneStore.updateNode(id, {
              position: [
                node.position[0] + dx,
                node.position[1],
                node.position[2] + dz,
              ],
            });
          } else if (node.type === "wall") {
            sceneStore.updateNode(id, {
              start: [node.start[0] + dx, node.start[1] + dz],
              end: [node.end[0] + dx, node.end[1] + dz],
            });
          }
        }
        dragStartPosRef.current = snapped;
      }
    };

    // ══════════════════════════════════════════════════════════════════════
    // DRAG-TO-MOVE (only on selected nodes)
    // ══════════════════════════════════════════════════════════════════════
    const handlePointerDown = (payload: GridEventPayload) => {
      const { activeTool, selectedNodeIds, gridSize } =
        useEditorStore.getState();
      if (activeTool !== "select" || selectedNodeIds.length === 0) return;

      if (payload.hitNodeId && selectedNodeIds.includes(payload.hitNodeId)) {
        isDraggingRef.current = true;
        dragStartPosRef.current = snapPointToGrid(payload.position, gridSize);
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      dragStartPosRef.current = null;
    };

    // ══════════════════════════════════════════════════════════════════════
    // CANCEL / RESET
    // ══════════════════════════════════════════════════════════════════════
    const handleToolCancel = () => {
      wallStartRef.current = null;
      zonePointsRef.current = [];
      measureStartRef.current = null;
      isDraggingRef.current = false;
      dragStartPosRef.current = null;
      useEditorStore.getState().cancelDrawing();
      document.body.style.cursor = "";
    };

    editorEmitter.on("grid:click", handleGridClick);
    editorEmitter.on("grid:pointerdown", handlePointerDown);
    editorEmitter.on("grid:pointermove", handlePointerMove);
    editorEmitter.on("grid:pointerup", handlePointerUp);
    editorEmitter.on("tool:cancel", handleToolCancel);

    return () => {
      editorEmitter.off("grid:click", handleGridClick);
      editorEmitter.off("grid:pointerdown", handlePointerDown);
      editorEmitter.off("grid:pointermove", handlePointerMove);
      editorEmitter.off("grid:pointerup", handlePointerUp);
      editorEmitter.off("tool:cancel", handleToolCancel);
      document.body.style.cursor = "";
    };
  }, []);
}

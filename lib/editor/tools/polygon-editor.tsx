"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useSceneStore } from "../stores";
import { snapPointToGrid, midpoint2D } from "../utils";
import type { Vec2, ZoneNode } from "../schema";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DragState {
  isDragging: boolean;
  vertexIndex: number;
  initialPosition: Vec2;
  pointerId: number;
}

export interface PolygonEditorProps {
  /** ID of the zone node being edited */
  zoneId: string;
  /** Current polygon vertices (2D points) */
  polygon: Vec2[];
  /** Zone display color (hex) */
  color: string;
  /** Grid snap size in meters */
  gridSize: number;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** Vertical offset so handles sit above the zone slab */
const HANDLE_Y = 0.08;
/** Outline sits slightly above the zone slab */
const LINE_Y = 0.04;

const VERTEX_RADIUS = 0.12;
const MIDPOINT_RADIUS = 0.07;
const MIN_VERTICES = 3;

/* ------------------------------------------------------------------ */
/* VertexHandle                                                        */
/* ------------------------------------------------------------------ */

interface VertexHandleProps {
  index: number;
  position: Vec2;
  isDragging: boolean;
  isHovered: boolean;
  canDelete: boolean;
  onDragStart: (index: number, pointerId: number) => void;
  onHover: (index: number | null) => void;
  onDelete: (index: number) => void;
}

function VertexHandle({
  index,
  position,
  isDragging,
  isHovered,
  canDelete,
  onDragStart,
  onHover,
  onDelete,
}: VertexHandleProps) {
  const color = isDragging ? "#22c55e" : isHovered ? "#60a5fa" : "#3b82f6";

  return (
    <mesh
      position={[position[0], HANDLE_Y, position[1]]}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        onDragStart(index, e.pointerId);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover(index);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        if (canDelete) {
          onDelete(index);
        }
      }}
    >
      <cylinderGeometry args={[VERTEX_RADIUS, VERTEX_RADIUS, 0.15, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* MidpointHandle                                                      */
/* ------------------------------------------------------------------ */

interface MidpointHandleProps {
  index: number;
  position: Vec2;
  isHovered: boolean;
  onInsert: (afterIndex: number, position: Vec2) => void;
  onHover: (index: number | null) => void;
}

function MidpointHandle({
  index,
  position,
  isHovered,
  onInsert,
  onHover,
}: MidpointHandleProps) {
  return (
    <mesh
      position={[position[0], HANDLE_Y, position[1]]}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        onInsert(index, position);
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover(index);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onHover(null);
      }}
      onClick={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
      }}
    >
      <cylinderGeometry
        args={[MIDPOINT_RADIUS, MIDPOINT_RADIUS, 0.1, 16]}
      />
      <meshStandardMaterial
        color={isHovered ? "#4ade80" : "#22c55e"}
        transparent
        opacity={isHovered ? 1 : 0.7}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* PolygonEditor (main component)                                      */
/* ------------------------------------------------------------------ */

/**
 * Renders draggable vertex handles and midpoint insert handles on a zone's
 * polygon. Allows reshaping zones by dragging vertices, inserting new vertices
 * at edge midpoints, and deleting vertices via double-click.
 *
 * Adapted from Pascal Editor's polygon-editor.tsx for the Horecagrond
 * floor plan editor.
 */
export function PolygonEditor({
  zoneId,
  polygon,
  color,
  gridSize,
}: PolygonEditorProps) {
  const updateNode = useSceneStore((s) => s.updateNode);

  // Drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [previewPolygon, setPreviewPolygon] = useState<Vec2[] | null>(null);
  const previewPolygonRef = useRef<Vec2[] | null>(null);

  // Hover state
  const [hoveredVertex, setHoveredVertex] = useState<number | null>(null);
  const [hoveredMidpoint, setHoveredMidpoint] = useState<number | null>(null);

  // Raycasting ground plane for drag
  const groundPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  );
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Keep ref in sync with preview state
  useEffect(() => {
    previewPolygonRef.current = previewPolygon;
  }, [previewPolygon]);

  // Track the last polygon prop to detect external changes (undo/redo)
  const lastPolygonRef = useRef(polygon);
  if (polygon !== lastPolygonRef.current) {
    lastPolygonRef.current = polygon;
    // External change (undo/redo) — clear stale preview/drag state
    if (previewPolygon) setPreviewPolygon(null);
    if (dragState) setDragState(null);
  }

  // The polygon to display (preview during drag, or actual polygon)
  const displayPolygon = previewPolygon ?? polygon;

  // Calculate midpoints between consecutive vertices
  const midpoints = useMemo(() => {
    if (displayPolygon.length < 2) return [];
    return displayPolygon.map((_pt, index) => {
      const nextIndex = (index + 1) % displayPolygon.length;
      return midpoint2D(displayPolygon[index], displayPolygon[nextIndex]);
    });
  }, [displayPolygon]);

  // Build 3D line points for the polygon outline
  const linePoints = useMemo(() => {
    if (displayPolygon.length < 2) return [];
    const pts = displayPolygon.map(
      ([x, z]) => new THREE.Vector3(x, LINE_Y, z),
    );
    // Close the loop
    pts.push(new THREE.Vector3(displayPolygon[0][0], LINE_Y, displayPolygon[0][1]));
    return pts;
  }, [displayPolygon]);

  // --- Drag callbacks ---

  const commitPolygonChange = useCallback(() => {
    if (previewPolygonRef.current) {
      updateNode(zoneId, {
        polygon: previewPolygonRef.current,
      } as Partial<ZoneNode>);
    }
    setPreviewPolygon(null);
    setDragState(null);
  }, [updateNode, zoneId]);

  const handleDragStart = useCallback(
    (index: number, pointerId: number) => {
      const basePolygon = previewPolygonRef.current ?? polygon;
      setDragState({
        isDragging: true,
        vertexIndex: index,
        initialPosition: basePolygon[index],
        pointerId,
      });
    },
    [polygon],
  );

  // --- Insert vertex at midpoint ---

  const handleInsertVertex = useCallback(
    (afterIndex: number, position: Vec2) => {
      const basePolygon = previewPolygonRef.current ?? polygon;
      const snapped = snapPointToGrid(position, gridSize);
      const newPolygon: Vec2[] = [
        ...basePolygon.slice(0, afterIndex + 1),
        snapped,
        ...basePolygon.slice(afterIndex + 1),
      ];
      const newVertexIndex = afterIndex + 1;

      // Set preview and immediately start dragging the new vertex
      setPreviewPolygon(newPolygon);
      setDragState({
        isDragging: true,
        vertexIndex: newVertexIndex,
        initialPosition: snapped,
        pointerId: -1, // Will be updated on next pointer event
      });
      setHoveredMidpoint(null);
    },
    [polygon, gridSize],
  );

  // --- Delete vertex ---

  const handleDeleteVertex = useCallback(
    (index: number) => {
      const basePolygon = previewPolygonRef.current ?? polygon;
      if (basePolygon.length <= MIN_VERTICES) return;

      const newPolygon = basePolygon.filter((_, i) => i !== index);
      updateNode(zoneId, { polygon: newPolygon } as Partial<ZoneNode>);
      setPreviewPolygon(null);
    },
    [polygon, updateNode, zoneId],
  );

  // --- Global pointer listeners for drag ---

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Get the canvas element
      const canvas = document.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );

      // We need to get the camera from the canvas internals.
      // Use the raycaster with a plane intersection approach.
      // Access the R3F state via __r3f on the canvas root.
      const r3fState = (canvas as unknown as Record<string, unknown>)
        .__r3f as { store?: { getState: () => { camera: THREE.Camera } } } | undefined;
      const camera = r3fState?.store?.getState()?.camera;
      if (!camera) return;

      raycaster.setFromCamera(ndc, camera);
      const intersection = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(groundPlane, intersection);
      if (!hit) return;

      const snapped = snapPointToGrid(
        [intersection.x, intersection.z],
        gridSize,
      );

      setPreviewPolygon((prev) => {
        const basePolygon = prev ?? polygon;
        const newPolygon = [...basePolygon];
        newPolygon[dragState.vertexIndex] = snapped;
        return newPolygon;
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();

      // Suppress the follow-up click to prevent grid interaction
      const suppressClick = (ce: MouseEvent) => {
        ce.stopImmediatePropagation();
        ce.preventDefault();
        window.removeEventListener("click", suppressClick, true);
      };
      window.addEventListener("click", suppressClick, true);
      requestAnimationFrame(() => {
        window.removeEventListener("click", suppressClick, true);
      });

      commitPolygonChange();
    };

    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("pointercancel", handlePointerUp, true);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("pointerup", handlePointerUp, true);
      window.removeEventListener("pointercancel", handlePointerUp, true);
    };
  }, [
    dragState,
    commitPolygonChange,
    polygon,
    gridSize,
    groundPlane,
    raycaster,
  ]);

  // --- Render ---

  if (displayPolygon.length < MIN_VERTICES) return null;

  const canDelete = displayPolygon.length > MIN_VERTICES;

  return (
    <group>
      {/* Polygon outline */}
      {linePoints.length >= 2 && (
        <Line
          points={linePoints}
          color={color}
          lineWidth={2.5}
          transparent
          opacity={0.9}
          depthTest={false}
        />
      )}

      {/* Vertex handles */}
      {displayPolygon.map((pt, index) => (
        <VertexHandle
          key={`vertex-${index}`}
          index={index}
          position={pt}
          isDragging={dragState?.vertexIndex === index}
          isHovered={hoveredVertex === index}
          canDelete={canDelete}
          onDragStart={handleDragStart}
          onHover={setHoveredVertex}
          onDelete={handleDeleteVertex}
        />
      ))}

      {/* Midpoint handles (hidden while dragging) */}
      {!dragState &&
        midpoints.map((pt, index) => (
          <MidpointHandle
            key={`midpoint-${index}`}
            index={index}
            position={pt}
            isHovered={hoveredMidpoint === index}
            onInsert={handleInsertVertex}
            onHover={setHoveredMidpoint}
          />
        ))}
    </group>
  );
}

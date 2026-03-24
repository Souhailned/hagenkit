"use client";

import { useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { useSceneStore, useEditorStore } from "@/lib/editor/stores";
import { SceneRenderer } from "@/lib/editor/renderers";
import { useZoneSystem } from "@/lib/editor/systems";
import type { SceneData, HorecaItemType } from "@/lib/editor/schema";
import { ITEM_DEFAULTS, DEFAULT_WALL_HEIGHT, DEFAULT_WALL_THICKNESS } from "@/lib/editor/schema";
import { generateId, snapPointToGrid } from "@/lib/editor/utils";
import { EditorToolbar } from "./editor-toolbar";
import { AssetPanel } from "./asset-panel";
import { PropertiesPanel } from "./properties-panel";
import { ZoneLegend } from "./zone-legend";
import type { ThreeEvent } from "@react-three/fiber";

interface PropertyEditorProps {
  propertyId: string;
  floorPlanId?: string;
  initialScene?: SceneData;
  readOnly?: boolean;
  onSave?: (scene: SceneData) => void;
}

function FloorPlane({ readOnly }: { readOnly?: boolean }) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const gridSize = useEditorStore((s) => s.gridSize);
  const placingItemType = useEditorStore((s) => s.placingItemType);
  const isDrawing = useEditorStore((s) => s.isDrawing);
  const addDrawPoint = useEditorStore((s) => s.addDrawPoint);
  const startDrawing = useEditorStore((s) => s.startDrawing);
  const createNode = useSceneStore((s) => s.createNode);
  const stopPlacingItem = useEditorStore((s) => s.stopPlacingItem);
  const clearSelection = useEditorStore((s) => s.clearSelection);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (readOnly) return;

      const point: [number, number] = snapPointToGrid(
        [e.point.x, e.point.z],
        gridSize,
      );

      // Place item if an item type is selected
      if (placingItemType) {
        const defaults = ITEM_DEFAULTS[placingItemType as HorecaItemType];
        if (defaults) {
          createNode({
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
          stopPlacingItem();
        }
        return;
      }

      // Wall drawing
      if (activeTool === "wall") {
        if (!isDrawing) {
          startDrawing();
          addDrawPoint(point);
        } else {
          addDrawPoint(point);
        }
        return;
      }

      // Zone drawing
      if (activeTool === "zone") {
        if (!isDrawing) {
          startDrawing();
        }
        addDrawPoint(point);
        return;
      }

      // Select tool - clicking floor deselects
      if (activeTool === "select") {
        clearSelection();
      }
    },
    [
      readOnly,
      gridSize,
      placingItemType,
      activeTool,
      isDrawing,
      addDrawPoint,
      startDrawing,
      createNode,
      stopPlacingItem,
      clearSelection,
    ],
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} onClick={handleClick}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#f8f8f8" transparent opacity={0.3} />
    </mesh>
  );
}

function CameraSetup() {
  const viewMode = useEditorStore((s) => s.viewMode);

  if (viewMode === "2d") {
    return (
      <>
        <OrthographicCamera makeDefault position={[0, 20, 0]} zoom={40} />
        <OrbitControls
          enableRotate={false}
          enableZoom
          enablePan
          minZoom={5}
          maxZoom={200}
          mouseButtons={{ LEFT: 0, MIDDLE: 2, RIGHT: 2 }}
        />
      </>
    );
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={50} />
      <OrbitControls
        enableRotate
        enableZoom
        enablePan
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={50}
      />
    </>
  );
}

export function PropertyEditor({
  propertyId,
  floorPlanId,
  initialScene,
  readOnly = false,
  onSave,
}: PropertyEditorProps) {
  useZoneSystem();
  const loadScene = useSceneStore((s) => s.loadScene);
  const exportScene = useSceneStore((s) => s.exportScene);
  const deleteNode = useSceneStore((s) => s.deleteNode);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const finishDrawing = useEditorStore((s) => s.finishDrawing);
  const cancelDrawing = useEditorStore((s) => s.cancelDrawing);
  const activeTool = useEditorStore((s) => s.activeTool);
  const isDrawing = useEditorStore((s) => s.isDrawing);
  const createNode = useSceneStore((s) => s.createNode);
  const hasLoadedRef = useRef(false);

  // Load initial scene once
  useEffect(() => {
    if (initialScene && !hasLoadedRef.current) {
      loadScene(initialScene);
      hasLoadedRef.current = true;
    }
  }, [initialScene, loadScene]);

  // Keyboard shortcuts
  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      switch (e.key) {
        case "Delete":
        case "Backspace":
          for (const id of selectedNodeIds) {
            deleteNode(id);
          }
          clearSelection();
          break;
        case "Escape":
          if (isDrawing) {
            cancelDrawing();
          } else {
            clearSelection();
          }
          break;
        case "Enter":
          if (isDrawing) {
            completeDrawing();
          }
          break;
        case "g":
          if (!e.ctrlKey && !e.metaKey) {
            useEditorStore.getState().toggleGrid();
          }
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              useSceneStore.temporal.getState().redo();
            } else {
              useSceneStore.temporal.getState().undo();
            }
            e.preventDefault();
          }
          break;
        case "y":
          if (e.ctrlKey || e.metaKey) {
            useSceneStore.temporal.getState().redo();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readOnly, selectedNodeIds, deleteNode, clearSelection, isDrawing, cancelDrawing]);

  const completeDrawing = useCallback(() => {
    const points = finishDrawing();
    if (points.length < 2) return;

    if (activeTool === "wall") {
      // Create wall segments between consecutive points
      for (let i = 0; i < points.length - 1; i++) {
        createNode({
          id: generateId(),
          type: "wall",
          parentId: null,
          visible: true,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          start: points[i],
          end: points[i + 1],
          thickness: DEFAULT_WALL_THICKNESS,
          height: DEFAULT_WALL_HEIGHT,
          material: "brick",
        });
      }
    } else if (activeTool === "zone" && points.length >= 3) {
      createNode({
        id: generateId(),
        type: "zone",
        parentId: null,
        visible: true,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        zoneType: "dining_area",
        polygon: points,
        area: 0, // Will be calculated by ZoneSystem
        color: "#4CAF50",
        capacity: 0,
      });
    }
  }, [finishDrawing, activeTool, createNode]);

  const handleSave = useCallback(() => {
    const scene = exportScene();
    onSave?.(scene);
  }, [exportScene, onSave]);

  return (
    <div className="flex h-full w-full flex-col">
      {!readOnly && <EditorToolbar onSave={handleSave} />}
      <div className="flex flex-1 overflow-hidden">
        {!readOnly && <AssetPanel />}
        <div className="relative flex-1">
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true }}
            style={{ background: "#fafafa" }}
          >
            <CameraSetup />
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 15, 10]} intensity={0.8} castShadow />
            <SceneRenderer />
            <FloorPlane readOnly={readOnly} />
          </Canvas>
          <ZoneLegend />
        </div>
        {!readOnly && <PropertiesPanel />}
      </div>
    </div>
  );
}

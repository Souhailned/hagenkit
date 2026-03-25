"use client";

// lib/editor/hooks/use-grid-events.ts
// Attaches DOM event listeners to the Three.js canvas element and performs
// manual raycasting against both the ground plane (Y=0) and scene meshes.
//
// Every grid event payload includes:
//   - position: snappable [x, z] world coordinates (ground plane intersection)
//   - hitNodeId: ID of the closest interactive mesh under the pointer (if any)
//
// Click detection uses pixel-distance between pointerdown and pointerup.
// If the pointer moved < CLICK_THRESHOLD pixels, it is treated as a click.

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { editorEmitter, type GridEventPayload } from "../events";

/** Maximum pixel distance between pointerdown and pointerup to count as a click */
const CLICK_THRESHOLD = 5;

export function useGridEvents() {
  const { gl, camera, scene } = useThree();
  const canvas = gl.domElement;

  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const planeRef = useRef(
    new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), // Y=0 ground plane
  );

  useEffect(() => {
    /** Update the raycaster from screen coordinates */
    const updateRaycaster = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
    };

    /** Raycast to the Y=0 ground plane for position */
    const getGroundPosition = (): [number, number, number] | null => {
      const target = new THREE.Vector3();
      const hit = raycasterRef.current.ray.intersectPlane(
        planeRef.current,
        target,
      );
      if (!hit) return null;
      return [target.x, target.y, target.z];
    };

    /** Raycast against scene meshes to find the closest interactive node */
    const getHitNode = (): { nodeId: string; nodeType: string } | null => {
      const intersects = raycasterRef.current.intersectObjects(
        scene.children,
        true,
      );
      for (const intersect of intersects) {
        // Walk up the object tree to find the nearest ancestor with nodeId
        // Stop at scene root to avoid false positives from R3F internals
        let obj: THREE.Object3D | null = intersect.object;
        while (obj && obj !== scene) {
          if (obj.userData?.nodeId) {
            return {
              nodeId: obj.userData.nodeId as string,
              nodeType: (obj.userData.nodeType as string) ?? "unknown",
            };
          }
          obj = obj.parent;
        }
      }
      return null;
    };

    /** Build a complete event payload from screen coordinates */
    const buildPayload = (
      clientX: number,
      clientY: number,
    ): GridEventPayload | null => {
      updateRaycaster(clientX, clientY);
      const groundPos = getGroundPosition();
      if (!groundPos) return null;

      const hitNode = getHitNode();

      return {
        position: [groundPos[0], groundPos[2]],
        worldPosition: groundPos,
        hitNodeId: hitNode?.nodeId,
        hitNodeType: hitNode?.nodeType,
      };
    };

    // ── Pixel-distance click detection ──────────────────────────────────
    let pointerDownPos: { x: number; y: number } | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Left button only
      pointerDownPos = { x: e.clientX, y: e.clientY };

      const payload = buildPayload(e.clientX, e.clientY);
      if (payload) {
        editorEmitter.emit("grid:pointerdown", payload);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return;

      const payload = buildPayload(e.clientX, e.clientY);
      if (payload) {
        editorEmitter.emit("grid:pointerup", payload);
      }

      // Check pixel distance to decide if this was a click or a drag
      if (pointerDownPos) {
        const dx = e.clientX - pointerDownPos.x;
        const dy = e.clientY - pointerDownPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        pointerDownPos = null;

        if (distance < CLICK_THRESHOLD) {
          if (payload) {
            editorEmitter.emit("grid:click", payload);
          }
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const payload = buildPayload(e.clientX, e.clientY);
      if (payload) {
        editorEmitter.emit("grid:pointermove", payload);
      }
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [canvas, camera, scene]);
}

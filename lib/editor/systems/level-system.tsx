'use client';

// lib/editor/systems/level-system.tsx
// Manages the vertical arrangement of LevelNode groups in the 3D scene.
// Supports three display modes:
//   - stacked:  levels sit on top of each other at real heights
//   - exploded: levels are vertically separated by a configurable gap
//   - solo:     only the active level is visible

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores/scene-store';
import { useEditorStore } from '../stores/editor-store';
import { sceneRegistry } from '../registry/scene-registry';
import type { LevelNode } from '../schema/nodes';

/** Extra vertical gap between levels in exploded mode (meters) */
const EXPLODED_GAP = 5;

/** Lerp speed factor — higher = snappier transitions */
const LERP_SPEED = 12;

/**
 * R3F system component that runs inside <Canvas>.
 *
 * On every frame it reads the current `levelMode` and `activeLevelIndex`
 * from the editor store, collects all `level` nodes sorted by their
 * `level` index, and smoothly interpolates each level group's Y position
 * toward its target.
 *
 * This component renders nothing — it only drives animation via useFrame.
 */
export function LevelSystem() {
  // Ref to track last-known visibility per level to avoid re-setting every frame
  const visibilityRef = useRef(new Map<string, boolean>());

  useFrame((_, delta) => {
    const { levelMode, activeLevelIndex } = useEditorStore.getState();
    const nodes = useSceneStore.getState().nodes;

    // Collect level nodes sorted by their floor index
    const levels: LevelNode[] = [];
    for (const node of Object.values(nodes)) {
      if (node.type === 'level') {
        levels.push(node as LevelNode);
      }
    }

    // Nothing to do when there are no levels — scene uses flat rendering
    if (levels.length === 0) return;

    levels.sort((a, b) => a.level - b.level);

    let cumulativeY = 0;

    for (let i = 0; i < levels.length; i++) {
      const lvl = levels[i];
      const obj = sceneRegistry.get(lvl.id);
      if (!obj) continue;

      const levelHeight = lvl.height || 3;
      let targetY: number;
      let shouldBeVisible: boolean;

      switch (levelMode) {
        case 'stacked':
          targetY = cumulativeY;
          shouldBeVisible = true;
          break;

        case 'exploded':
          targetY = cumulativeY + i * EXPLODED_GAP;
          shouldBeVisible = true;
          break;

        case 'solo':
          targetY = 0;
          shouldBeVisible = lvl.level === activeLevelIndex;
          break;
      }

      cumulativeY += levelHeight;

      // Only update visibility when it actually changes to avoid unnecessary
      // THREE.js internal updates
      const prevVisible = visibilityRef.current.get(lvl.id);
      if (prevVisible !== shouldBeVisible) {
        obj.visible = shouldBeVisible;
        visibilityRef.current.set(lvl.id, shouldBeVisible);
      }

      // Smooth lerp to target Y position
      if (shouldBeVisible) {
        obj.position.y = THREE.MathUtils.lerp(
          obj.position.y,
          targetY,
          Math.min(1, delta * LERP_SPEED),
        );
      }
    }
  }, 5); // priority 5 — runs after default update cycle

  return null;
}

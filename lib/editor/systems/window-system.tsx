'use client';

// lib/editor/systems/window-system.tsx
// R3F system component that generates parametric window geometry.
// Ported from Pascal Editor's window-system.tsx with simplified BoxGeometry.
//
// For each dirty window node, generates a THREE.Group containing:
//   1. Frame — rectangular frame (4 box pieces)
//   2. Glass panes — transparent boxes based on columnRatios x rowRatios grid
//   3. Dividers — thin boxes between panes
//   4. Sill — horizontal shelf below window
//   5. Cutout mesh — for CSG (handled by wall-csg.ts, not here)
//
// Runs in useFrame at priority 3 (before WallSystem at 4).

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores';
import { sceneRegistry } from '../registry';
import type {
  WindowNode,
  WallNode,
  WindowFrame,
  WindowDivider,
  WindowSill,
} from '../schema';

// ── Default dimensions ───────────────────────────────────────────────

const DEFAULT_FRAME: Required<WindowFrame> = {
  width: 0.05,
  depth: 0.03,
  visible: true,
};

const DEFAULT_DIVIDER: Required<WindowDivider> = {
  width: 0.02,
  visible: false,
};

const DEFAULT_SILL: Required<WindowSill> = {
  depth: 0.05,
  visible: true,
};

const GLASS_THICKNESS = 0.006; // 6mm glass
const SILL_THICKNESS = 0.025; // 25mm sill

// ── Geometry cache key ───────────────────────────────────────────────

interface WindowGeometryKey {
  width: number;
  height: number;
  frameW: number;
  frameD: number;
  frameVisible: boolean;
  dividerW: number;
  dividerVisible: boolean;
  sillD: number;
  sillVisible: boolean;
  columnRatios: string; // JSON stringified
  rowRatios: string;
}

function windowKeyEqual(a: WindowGeometryKey, b: WindowGeometryKey): boolean {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.frameW === b.frameW &&
    a.frameD === b.frameD &&
    a.frameVisible === b.frameVisible &&
    a.dividerW === b.dividerW &&
    a.dividerVisible === b.dividerVisible &&
    a.sillD === b.sillD &&
    a.sillVisible === b.sillVisible &&
    a.columnRatios === b.columnRatios &&
    a.rowRatios === b.rowRatios
  );
}

// ── Geometry generation ──────────────────────────────────────────────

/**
 * Build a THREE.Group of meshes representing the window.
 * The window's local origin is at the bottom center of the opening
 * (sill height is applied externally by the system).
 */
function buildWindowGeometry(win: WindowNode): THREE.Group {
  const group = new THREE.Group();
  group.name = `window-geo-${win.id}`;

  const frame = win.frame ?? DEFAULT_FRAME;
  const divider = win.dividers ?? DEFAULT_DIVIDER;
  const sill = win.sill ?? DEFAULT_SILL;
  const fw = frame.width;
  const fd = frame.depth;

  // Materials
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.5,
    metalness: 0.1,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: '#87CEEB',
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const sillMat = new THREE.MeshStandardMaterial({
    color: '#D3D3D3',
    roughness: 0.6,
    metalness: 0.1,
  });

  const dividerMat = new THREE.MeshStandardMaterial({
    color: '#FFFFFF',
    roughness: 0.5,
    metalness: 0.1,
  });

  // ── Frame ──────────────────────────────────────────────────────────

  if (frame.visible) {
    // Bottom rail
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(win.width, fw, fd),
      frameMat,
    );
    bottom.position.set(0, fw / 2, 0);
    group.add(bottom);

    // Top rail
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(win.width, fw, fd),
      frameMat,
    );
    top.position.set(0, win.height - fw / 2, 0);
    group.add(top);

    // Left stile
    const left = new THREE.Mesh(
      new THREE.BoxGeometry(fw, win.height - fw * 2, fd),
      frameMat,
    );
    left.position.set(-win.width / 2 + fw / 2, win.height / 2, 0);
    group.add(left);

    // Right stile
    const right = new THREE.Mesh(
      new THREE.BoxGeometry(fw, win.height - fw * 2, fd),
      frameMat,
    );
    right.position.set(win.width / 2 - fw / 2, win.height / 2, 0);
    group.add(right);
  }

  // ── Glass panes with dividers ──────────────────────────────────────

  const columnRatios = win.columnRatios ?? [1];
  const rowRatios = win.rowRatios ?? [1];

  const innerWidth = win.width - (frame.visible ? fw * 2 : 0);
  const innerHeight = win.height - (frame.visible ? fw * 2 : 0);
  const innerLeft = -innerWidth / 2;
  const innerBottom = frame.visible ? fw : 0;

  // Normalize ratios
  const colTotal = columnRatios.reduce((s, v) => s + v, 0);
  const rowTotal = rowRatios.reduce((s, v) => s + v, 0);
  const normalizedCols = columnRatios.map((v) => v / colTotal);
  const normalizedRows = rowRatios.map((v) => v / rowTotal);

  const dw = divider.visible ? divider.width : 0;
  const numColGaps = Math.max(0, columnRatios.length - 1);
  const numRowGaps = Math.max(0, rowRatios.length - 1);
  const availableWidth = innerWidth - numColGaps * dw;
  const availableHeight = innerHeight - numRowGaps * dw;

  // Calculate pane positions and create glass + dividers
  let curX = innerLeft;
  for (let col = 0; col < normalizedCols.length; col++) {
    const paneWidth = normalizedCols[col] * availableWidth;
    let curY = innerBottom;

    for (let row = 0; row < normalizedRows.length; row++) {
      const paneHeight = normalizedRows[row] * availableHeight;

      // Glass pane
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(paneWidth, paneHeight, GLASS_THICKNESS),
        glassMat,
      );
      glass.position.set(
        curX + paneWidth / 2,
        curY + paneHeight / 2,
        0,
      );
      group.add(glass);

      curY += paneHeight;

      // Horizontal divider between rows (except after last row)
      if (divider.visible && row < normalizedRows.length - 1) {
        const hDiv = new THREE.Mesh(
          new THREE.BoxGeometry(paneWidth, dw, fd * 0.8),
          dividerMat,
        );
        hDiv.position.set(curX + paneWidth / 2, curY + dw / 2, 0);
        group.add(hDiv);
        curY += dw;
      }
    }

    curX += paneWidth;

    // Vertical divider between columns (except after last column)
    if (divider.visible && col < normalizedCols.length - 1) {
      const vDiv = new THREE.Mesh(
        new THREE.BoxGeometry(dw, innerHeight, fd * 0.8),
        dividerMat,
      );
      vDiv.position.set(
        curX + dw / 2,
        innerBottom + innerHeight / 2,
        0,
      );
      group.add(vDiv);
      curX += dw;
    }
  }

  // ── Sill ───────────────────────────────────────────────────────────

  if (sill.visible) {
    const sillWidth = win.width + sill.depth * 0.4; // Sill slightly wider than window
    const sillMesh = new THREE.Mesh(
      new THREE.BoxGeometry(sillWidth, SILL_THICKNESS, fd + sill.depth),
      sillMat,
    );
    sillMesh.position.set(0, -SILL_THICKNESS / 2, sill.depth / 2);
    group.add(sillMesh);
  }

  return group;
}

/**
 * Compute world-space position and Y rotation for a window on its parent wall.
 */
function computeWindowTransform(
  win: WindowNode,
  wall: WallNode,
): { px: number; py: number; pz: number; rotY: number } {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const wallAngle = Math.atan2(dz, dx);

  const px = wall.start[0] + dx * win.wallPosition;
  const pz = wall.start[1] + dz * win.wallPosition;
  const py = win.sillHeight;

  return { px, py, pz, rotY: -wallAngle };
}

// ── System component ─────────────────────────────────────────────────

/**
 * WindowSystem — invisible R3F component that manages window geometry.
 *
 * On each frame, checks for dirty window nodes. For each dirty window:
 * 1. Reads its parent wall to compute position/rotation
 * 2. Generates parametric frame + glass + divider + sill geometry
 * 3. Replaces children on the window's registered Object3D
 * 4. Marks the window clean
 */
export function WindowSystem() {
  const geometryCache = useRef<Map<string, WindowGeometryKey>>(new Map());

  useFrame(() => {
    const { nodes, dirtyNodes, markClean } = useSceneStore.getState();

    const dirtyWindowIds: string[] = [];
    for (const id of dirtyNodes) {
      const node = nodes[id];
      if (node?.type === 'window') {
        dirtyWindowIds.push(id);
      }
    }

    if (dirtyWindowIds.length === 0) return;

    for (const winId of dirtyWindowIds) {
      const node = nodes[winId];
      if (!node || node.type !== 'window') {
        markClean(winId);
        continue;
      }

      const win = node as WindowNode;
      const frame = win.frame ?? DEFAULT_FRAME;
      const divider = win.dividers ?? DEFAULT_DIVIDER;
      const sill = win.sill ?? DEFAULT_SILL;

      // Check if geometry actually changed
      const newKey: WindowGeometryKey = {
        width: win.width,
        height: win.height,
        frameW: frame.width,
        frameD: frame.depth,
        frameVisible: frame.visible,
        dividerW: divider.width,
        dividerVisible: divider.visible,
        sillD: sill.depth,
        sillVisible: sill.visible,
        columnRatios: JSON.stringify(win.columnRatios ?? [1]),
        rowRatios: JSON.stringify(win.rowRatios ?? [1]),
      };

      const cached = geometryCache.current.get(winId);
      if (cached && windowKeyEqual(cached, newKey)) {
        // Geometry unchanged — only update transform
        const wallNode = nodes[win.wallId];
        if (wallNode?.type === 'wall') {
          const obj = sceneRegistry.get(winId);
          if (obj) {
            const { px, py, pz, rotY } = computeWindowTransform(
              win,
              wallNode as WallNode,
            );
            obj.position.set(px, py, pz);
            obj.rotation.set(0, rotY, 0);
          }
        }
        markClean(winId);
        continue;
      }

      const obj = sceneRegistry.get(winId);
      if (!obj) {
        // Not yet mounted — retry next frame
        continue;
      }

      // Dispose old children
      while (obj.children.length > 0) {
        const child = obj.children[0];
        obj.remove(child);
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      }

      // Build new geometry group
      const geoGroup = buildWindowGeometry(win);

      // Add all children from the built group to the registered object
      while (geoGroup.children.length > 0) {
        const child = geoGroup.children[0];
        geoGroup.remove(child);
        obj.add(child);
      }

      // Position based on parent wall
      const wallNode = nodes[win.wallId];
      if (wallNode?.type === 'wall') {
        const { px, py, pz, rotY } = computeWindowTransform(
          win,
          wallNode as WallNode,
        );
        obj.position.set(px, py, pz);
        obj.rotation.set(0, rotY, 0);
      }

      // Update cache and mark clean
      geometryCache.current.set(winId, newKey);
      markClean(winId);
    }

    // Clean up cache for deleted windows
    for (const cachedId of geometryCache.current.keys()) {
      if (!nodes[cachedId]) {
        geometryCache.current.delete(cachedId);
      }
    }
  }, 3); // priority 3: before WallSystem (4)

  return null;
}

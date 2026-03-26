'use client';

// lib/editor/systems/door-system.tsx
// R3F system component that generates parametric door geometry.
// Ported from Pascal Editor's door-system.tsx with simplified BoxGeometry parts.
//
// For each dirty door node, generates a THREE.Group containing:
//   1. Frame — two vertical posts + horizontal head bar
//   2. Leaf — panel (solid) or glass (transparent) or empty (nothing)
//   3. Handle — small box at handle height
//   4. Cutout mesh — invisible box used for CSG wall subtraction
//
// Runs in useFrame at priority 3 (before WallSystem at 4, which uses
// door positions for CSG subtraction).

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../stores';
import { sceneRegistry } from '../registry';
import type { DoorNode, WallNode, DoorFrame, DoorHandle } from '../schema';

// ── Default dimensions ───────────────────────────────────────────────

const DEFAULT_FRAME: Required<DoorFrame> = {
  width: 0.05,
  depth: 0.03,
  visible: true,
};

const DEFAULT_HANDLE: Required<DoorHandle> = {
  type: 'lever',
  height: 1.0,
  visible: true,
};

// Handle dimensions (meters)
const HANDLE_WIDTH = 0.12;
const HANDLE_HEIGHT = 0.03;
const HANDLE_DEPTH = 0.04;

// ── Geometry cache key ───────────────────────────────────────────────

interface DoorGeometryKey {
  width: number;
  height: number;
  frameW: number;
  frameD: number;
  frameVisible: boolean;
  handleType: string;
  handleHeight: number;
  handleVisible: boolean;
  style: string;
}

function doorKeyEqual(a: DoorGeometryKey, b: DoorGeometryKey): boolean {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.frameW === b.frameW &&
    a.frameD === b.frameD &&
    a.frameVisible === b.frameVisible &&
    a.handleType === b.handleType &&
    a.handleHeight === b.handleHeight &&
    a.handleVisible === b.handleVisible &&
    a.style === b.style
  );
}

// ── Geometry generation ──────────────────────────────────────────────

/**
 * Build a THREE.Group of meshes representing the door.
 * All meshes are created relative to the door center at Y=0.
 * The door's local origin is at the bottom center of the opening.
 */
function buildDoorGeometry(door: DoorNode): THREE.Group {
  const group = new THREE.Group();
  group.name = `door-geo-${door.id}`;

  const frame = door.frame ?? DEFAULT_FRAME;
  const handle = door.handle ?? DEFAULT_HANDLE;
  const fw = frame.width;
  const fd = frame.depth;

  // Frame material
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#8B6914',
    roughness: 0.7,
    metalness: 0.1,
  });

  // Leaf (panel) material
  const isGlass = door.style === 'sliding' || door.style === 'revolving';
  const leafMat = new THREE.MeshStandardMaterial({
    color: isGlass ? '#87CEEB' : '#A0522D',
    transparent: isGlass,
    opacity: isGlass ? 0.35 : 1.0,
    roughness: isGlass ? 0.1 : 0.6,
    metalness: isGlass ? 0.0 : 0.1,
  });

  // Handle material
  const handleMat = new THREE.MeshStandardMaterial({
    color: '#C0C0C0',
    roughness: 0.3,
    metalness: 0.7,
  });

  // ── Frame ──────────────────────────────────────────────────────────

  if (frame.visible) {
    // Left post
    const leftPost = new THREE.Mesh(
      new THREE.BoxGeometry(fw, door.height, fd),
      frameMat,
    );
    leftPost.position.set(-door.width / 2 + fw / 2, door.height / 2, 0);
    group.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(
      new THREE.BoxGeometry(fw, door.height, fd),
      frameMat,
    );
    rightPost.position.set(door.width / 2 - fw / 2, door.height / 2, 0);
    group.add(rightPost);

    // Head bar (horizontal top piece)
    const headBar = new THREE.Mesh(
      new THREE.BoxGeometry(door.width, fw, fd),
      frameMat,
    );
    headBar.position.set(0, door.height - fw / 2, 0);
    group.add(headBar);
  }

  // ── Leaf (door panel) ──────────────────────────────────────────────

  if (door.style !== 'opening') {
    // Opening style means no panel — just the frame
    const leafWidth = door.width - (frame.visible ? fw * 2 : 0);
    const leafHeight = door.height - (frame.visible ? fw : 0);
    const leafThickness = 0.04; // 4cm door panel

    if (door.style === 'double') {
      // Two half-width leaves
      const halfWidth = leafWidth / 2 - 0.005; // 5mm gap between
      for (let i = 0; i < 2; i++) {
        const leaf = new THREE.Mesh(
          new THREE.BoxGeometry(halfWidth, leafHeight, leafThickness),
          leafMat,
        );
        const xOff = i === 0
          ? -leafWidth / 4 - 0.0025
          : leafWidth / 4 + 0.0025;
        leaf.position.set(xOff, leafHeight / 2, 0);
        group.add(leaf);
      }
    } else {
      // Single leaf (single, sliding, folding, revolving, garage)
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(leafWidth, leafHeight, leafThickness),
        leafMat,
      );
      leaf.position.set(0, leafHeight / 2, 0);
      group.add(leaf);
    }
  }

  // ── Handle ─────────────────────────────────────────────────────────

  if (handle.visible && door.style !== 'opening' && door.style !== 'garage') {
    const handleGeo = new THREE.BoxGeometry(
      HANDLE_WIDTH,
      HANDLE_HEIGHT,
      HANDLE_DEPTH,
    );

    // Place handle on the opening side
    const side = door.side === 'right' ? -1 : 1;
    const hx = side * (door.width / 2 - (frame.visible ? fw : 0) - 0.08);

    const frontHandle = new THREE.Mesh(handleGeo, handleMat);
    frontHandle.position.set(hx, handle.height, fd / 2 + HANDLE_DEPTH / 2);
    group.add(frontHandle);

    const backHandle = new THREE.Mesh(handleGeo, handleMat);
    backHandle.position.set(hx, handle.height, -(fd / 2 + HANDLE_DEPTH / 2));
    group.add(backHandle);
  }

  return group;
}

/**
 * Compute world-space position and Y rotation for a door on its parent wall.
 */
function computeDoorTransform(
  door: DoorNode,
  wall: WallNode,
): { px: number; py: number; pz: number; rotY: number } {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const wallAngle = Math.atan2(dz, dx);

  // Position along the wall's centerline
  const px = wall.start[0] + dx * door.wallPosition;
  const pz = wall.start[1] + dz * door.wallPosition;
  const py = door.elevation ?? 0;

  return { px, py, pz, rotY: -wallAngle };
}

// ── System component ─────────────────────────────────────────────────

/**
 * DoorSystem — invisible R3F component that manages door geometry.
 *
 * On each frame, checks for dirty door nodes. For each dirty door:
 * 1. Reads its parent wall to compute position/rotation
 * 2. Generates parametric frame + leaf + handle geometry
 * 3. Replaces children on the door's registered Object3D
 * 4. Marks the door clean
 */
export function DoorSystem() {
  const geometryCache = useRef<Map<string, DoorGeometryKey>>(new Map());

  useFrame(() => {
    const { nodes, dirtyNodes, markClean } = useSceneStore.getState();

    const dirtyDoorIds: string[] = [];
    for (const id of dirtyNodes) {
      const node = nodes[id];
      if (node?.type === 'door') {
        dirtyDoorIds.push(id);
      }
    }

    if (dirtyDoorIds.length === 0) return;

    for (const doorId of dirtyDoorIds) {
      const node = nodes[doorId];
      if (!node || node.type !== 'door') {
        markClean(doorId);
        continue;
      }

      const door = node as DoorNode;
      const frame = door.frame ?? DEFAULT_FRAME;
      const handle = door.handle ?? DEFAULT_HANDLE;

      // Check if geometry actually changed
      const newKey: DoorGeometryKey = {
        width: door.width,
        height: door.height,
        frameW: frame.width,
        frameD: frame.depth,
        frameVisible: frame.visible,
        handleType: handle.type,
        handleHeight: handle.height,
        handleVisible: handle.visible,
        style: door.style,
      };

      const cached = geometryCache.current.get(doorId);
      if (cached && doorKeyEqual(cached, newKey)) {
        // Geometry shape unchanged — only update transform
        const wallNode = nodes[door.wallId];
        if (wallNode?.type === 'wall') {
          const obj = sceneRegistry.get(doorId);
          if (obj) {
            const { px, py, pz, rotY } = computeDoorTransform(
              door,
              wallNode as WallNode,
            );
            obj.position.set(px, py, pz);
            obj.rotation.set(0, rotY, 0);
          }
        }
        markClean(doorId);
        continue;
      }

      // Get the registered Object3D (should be a Group or Mesh)
      const obj = sceneRegistry.get(doorId);
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
      const geoGroup = buildDoorGeometry(door);

      // Add all children from the built group to the registered object
      while (geoGroup.children.length > 0) {
        const child = geoGroup.children[0];
        geoGroup.remove(child);
        obj.add(child);
      }

      // Position based on parent wall
      const wallNode = nodes[door.wallId];
      if (wallNode?.type === 'wall') {
        const { px, py, pz, rotY } = computeDoorTransform(
          door,
          wallNode as WallNode,
        );
        obj.position.set(px, py, pz);
        obj.rotation.set(0, rotY, 0);
      }

      // Update cache and mark clean
      geometryCache.current.set(doorId, newKey);
      markClean(doorId);
    }

    // Clean up cache for deleted doors
    for (const cachedId of geometryCache.current.keys()) {
      if (!nodes[cachedId]) {
        geometryCache.current.delete(cachedId);
      }
    }
  }, 3); // priority 3: before WallSystem (4) which does CSG

  return null;
}

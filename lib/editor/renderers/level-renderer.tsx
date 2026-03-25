'use client';

// lib/editor/renderers/level-renderer.tsx
// Renders a LevelNode as a <group> that acts as a transform parent
// for all child nodes on this floor. Registers itself with the scene
// registry so the LevelSystem can animate its Y position.

import { useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { useRegistry } from '../registry/use-registry';
import type { LevelNode } from '../schema/nodes';

interface LevelRendererProps {
  node: LevelNode;
  children?: ReactNode;
}

/**
 * Group wrapper for a single building level (floor).
 *
 * The LevelSystem drives the `position.y` of this group in the
 * animation loop, so we only set the initial X/Z from the node data
 * and leave Y at 0 (the system takes over from there).
 */
export function LevelRenderer({ node, children }: LevelRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  useRegistry(node.id, 'level', groupRef);

  return (
    <group
      ref={groupRef}
      position={[node.position[0], 0, node.position[2]]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      visible={node.visible}
    >
      {children}
    </group>
  );
}

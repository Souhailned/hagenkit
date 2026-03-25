'use client';

// lib/editor/renderers/building-renderer.tsx
// Renders a BuildingNode as a <group> container.

import { useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { useRegistry } from '../registry/use-registry';
import type { BuildingNode } from '../schema/nodes';

interface BuildingRendererProps {
  node: BuildingNode;
  children?: ReactNode;
}

export function BuildingRenderer({ node, children }: BuildingRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  useRegistry(node.id, 'building', groupRef);

  return (
    <group
      ref={groupRef}
      position={[node.position[0], node.position[1], node.position[2]]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      visible={node.visible}
    >
      {children}
    </group>
  );
}

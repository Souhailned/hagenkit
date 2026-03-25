'use client';

// lib/editor/renderers/site-renderer.tsx
// Renders a SiteNode as a <group> container.

import { useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { useRegistry } from '../registry/use-registry';
import type { SiteNode } from '../schema/nodes';

interface SiteRendererProps {
  node: SiteNode;
  children?: ReactNode;
}

export function SiteRenderer({ node, children }: SiteRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  useRegistry(node.id, 'site', groupRef);

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

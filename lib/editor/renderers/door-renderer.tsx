'use client';

// lib/editor/renderers/door-renderer.tsx
// Door renderer — creates a group that the DoorSystem populates with
// parametric frame, leaf, and handle meshes.
//
// The renderer handles:
//   - Group ref + scene registry registration
//   - Initial position based on wall (DoorSystem refines on next frame)
//   - userData for raycasting

import { memo, useRef } from 'react';
import * as THREE from 'three';
import type { DoorNode } from '../schema';
import { useRegistry } from '../registry';

interface DoorRendererProps {
  node: DoorNode;
  selected: boolean;
  hovered: boolean;
  doorColor: string;
  selectedColor: string;
}

function DoorRendererInner({
  node,
  selected,
  hovered,
  doorColor,
  selectedColor,
}: DoorRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  useRegistry(node.id, 'door', groupRef);

  return (
    <group
      ref={groupRef}
      position={[
        node.position[0],
        node.position[1],
        node.position[2],
      ]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      userData={{ nodeId: node.id, nodeType: 'door' }}
    />
  );
}

export const DoorRenderer = memo(DoorRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.doorColor === next.doorColor &&
    prev.selectedColor === next.selectedColor
  );
});

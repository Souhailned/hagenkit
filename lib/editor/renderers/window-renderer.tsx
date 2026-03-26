'use client';

// lib/editor/renderers/window-renderer.tsx
// Window renderer — creates a group that the WindowSystem populates with
// parametric frame, glass pane, divider, and sill meshes.
//
// The renderer handles:
//   - Group ref + scene registry registration
//   - Initial position based on wall (WindowSystem refines on next frame)
//   - userData for raycasting

import { memo, useRef } from 'react';
import * as THREE from 'three';
import type { WindowNode } from '../schema';
import { useRegistry } from '../registry';

interface WindowRendererProps {
  node: WindowNode;
  selected: boolean;
  hovered: boolean;
  windowColor: string;
  selectedColor: string;
}

function WindowRendererInner({
  node,
  selected,
  hovered,
  windowColor,
  selectedColor,
}: WindowRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  useRegistry(node.id, 'window', groupRef);

  return (
    <group
      ref={groupRef}
      position={[
        node.position[0],
        node.position[1] + node.sillHeight,
        node.position[2],
      ]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      userData={{ nodeId: node.id, nodeType: 'window' }}
    />
  );
}

export const WindowRenderer = memo(WindowRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.windowColor === next.windowColor &&
    prev.selectedColor === next.selectedColor
  );
});

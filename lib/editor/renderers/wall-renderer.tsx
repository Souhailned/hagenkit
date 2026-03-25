'use client';

// lib/editor/renderers/wall-renderer.tsx
// "Thin" wall renderer — creates a mesh with a placeholder BoxGeometry.
// The WallSystem replaces this geometry each frame with a properly mitered
// ExtrudeGeometry. This renderer only handles:
//   - Mesh ref + scene registry registration
//   - Material (color, transparency, hover/selection effects)
//   - userData for raycasting

import { memo, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { WallMaterial, WallNode } from '../schema';
import { useRegistry } from '../registry';

interface WallRendererProps {
  node: WallNode;
  selected: boolean;
  hovered: boolean;
  materialColors: Record<WallMaterial, string>;
  selectedColor: string;
}

function WallRendererInner({
  node,
  selected,
  hovered,
  materialColors,
  selectedColor,
}: WallRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'wall', meshRef);

  // Create a small placeholder geometry. The WallSystem will replace this
  // with a properly mitered ExtrudeGeometry on the next frame.
  // We still compute approximate dimensions so there's something visible
  // on the first render frame before the WallSystem kicks in.
  const placeholderGeometry = useMemo(() => {
    const dx = node.end[0] - node.start[0];
    const dy = node.end[1] - node.start[1];
    const length = Math.hypot(dx, dy);
    return new THREE.BoxGeometry(
      Math.max(length, 0.01),
      node.height,
      node.thickness,
    );
  }, [node.start, node.end, node.height, node.thickness]);

  // Compute initial position/rotation for the placeholder geometry.
  // Once WallSystem replaces the geometry, it resets position to [0,0,0]
  // and rotation to [0,0,0] because the mitered geometry is in world coords.
  const { midpoint, angle } = useMemo(() => {
    const dx = node.end[0] - node.start[0];
    const dy = node.end[1] - node.start[1];
    return {
      midpoint: [
        (node.start[0] + node.end[0]) / 2,
        (node.start[1] + node.end[1]) / 2,
      ] as const,
      angle: Math.atan2(dy, dx),
    };
  }, [node.start, node.end]);

  useEffect(() => {
    return () => {
      placeholderGeometry.dispose();
    };
  }, [placeholderGeometry]);

  const materialColor = selected
    ? selectedColor
    : materialColors[node.material];

  const isGlass = node.material === 'glass';

  return (
    <mesh
      ref={meshRef}
      geometry={placeholderGeometry}
      position={[midpoint[0], node.height / 2, midpoint[1]]}
      rotation={[0, -angle, 0]}
      userData={{ nodeId: node.id, nodeType: 'wall' }}
    >
      <meshStandardMaterial
        color={materialColor}
        transparent={isGlass}
        opacity={isGlass ? 0.35 : 1}
        roughness={isGlass ? 0.1 : 0.8}
        metalness={isGlass ? 0.0 : 0.1}
      />
    </mesh>
  );
}

export const WallRenderer = memo(WallRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.materialColors === next.materialColors &&
    prev.selectedColor === next.selectedColor
  );
});

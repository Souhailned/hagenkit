'use client';

// lib/editor/renderers/ceiling-renderer.tsx
// "Thin" ceiling renderer — creates a mesh with a placeholder geometry.
// The CeilingSystem replaces this geometry each frame with a properly
// shaped flat plane from the ceiling's polygon + holes.
//
// This renderer only handles:
//   - Mesh ref + scene registry registration
//   - Material (color, transparency, selection)
//   - userData for raycasting

import { memo, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { CeilingNode } from '../schema';
import { useRegistry } from '../registry';

interface CeilingRendererProps {
  node: CeilingNode;
  selected: boolean;
  hovered: boolean;
  ceilingColor: string;
  selectedColor: string;
}

function CeilingRendererInner({
  node,
  selected,
  hovered,
  ceilingColor,
  selectedColor,
}: CeilingRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'ceiling', meshRef);

  // Placeholder geometry — will be replaced by CeilingSystem
  const placeholderGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.1, 0.02, 0.1);
  }, []);

  useEffect(() => {
    return () => {
      placeholderGeometry.dispose();
    };
  }, [placeholderGeometry]);

  const color = selected ? selectedColor : ceilingColor;

  return (
    <mesh
      ref={meshRef}
      geometry={placeholderGeometry}
      position={[0, node.height, 0]}
      userData={{ nodeId: node.id, nodeType: 'ceiling' }}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.8}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const CeilingRenderer = memo(CeilingRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.ceilingColor === next.ceilingColor &&
    prev.selectedColor === next.selectedColor
  );
});

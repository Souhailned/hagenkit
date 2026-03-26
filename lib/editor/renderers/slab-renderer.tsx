'use client';

// lib/editor/renderers/slab-renderer.tsx
// "Thin" slab renderer — creates a mesh with a placeholder geometry.
// The SlabSystem replaces this geometry each frame with a properly
// extruded shape from the slab's polygon + holes.
//
// This renderer only handles:
//   - Mesh ref + scene registry registration
//   - Material (color, selection)
//   - userData for raycasting

import { memo, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { SlabNode } from '../schema';
import { useRegistry } from '../registry';

interface SlabRendererProps {
  node: SlabNode;
  selected: boolean;
  hovered: boolean;
  slabColor: string;
  selectedColor: string;
}

function SlabRendererInner({
  node,
  selected,
  hovered,
  slabColor,
  selectedColor,
}: SlabRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'slab', meshRef);

  // Placeholder geometry — will be replaced by SlabSystem
  const placeholderGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.1, node.thickness, 0.1);
  }, [node.thickness]);

  useEffect(() => {
    return () => {
      placeholderGeometry.dispose();
    };
  }, [placeholderGeometry]);

  const color = selected ? selectedColor : slabColor;
  const elevation = node.elevation ?? 0;

  return (
    <mesh
      ref={meshRef}
      geometry={placeholderGeometry}
      position={[0, elevation, 0]}
      userData={{ nodeId: node.id, nodeType: 'slab' }}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const SlabRenderer = memo(SlabRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.slabColor === next.slabColor &&
    prev.selectedColor === next.selectedColor
  );
});

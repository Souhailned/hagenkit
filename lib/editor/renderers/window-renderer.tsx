'use client';

import { memo, useMemo, useRef, useEffect } from 'react';
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

/** Frame depth in meters for the window */
const FRAME_DEPTH = 0.06;

function WindowRendererInner({
  node,
  selected,
  hovered,
  windowColor,
  selectedColor,
}: WindowRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'window', meshRef);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(node.width, node.height, FRAME_DEPTH),
    [node.width, node.height],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const color = selected ? selectedColor : windowColor;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[
        node.position[0],
        node.position[1] + node.sillHeight + node.height / 2,
        node.position[2],
      ]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      userData={{ nodeId: node.id, nodeType: 'window' }}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        roughness={0.1}
        metalness={0.0}
      />
    </mesh>
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

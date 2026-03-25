'use client';

import { memo, useMemo, useRef, useEffect } from 'react';
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

/** Frame thickness in meters for the door outline */
const FRAME_DEPTH = 0.08;

function DoorRendererInner({
  node,
  selected,
  hovered,
  doorColor,
  selectedColor,
}: DoorRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'door', meshRef);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(node.width, node.height, FRAME_DEPTH),
    [node.width, node.height],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const color = selected ? selectedColor : doorColor;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[
        node.position[0],
        node.position[1] + node.height / 2,
        node.position[2],
      ]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      userData={{ nodeId: node.id, nodeType: 'door' }}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
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

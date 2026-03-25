'use client';

import { memo, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { ZoneNode } from '../schema';
import { useRegistry } from '../registry';

interface ZoneRendererProps {
  node: ZoneNode;
  selected: boolean;
  hovered: boolean;
  zoneColor: string;
}

/** Thin extrude depth for the zone floor slab */
const ZONE_EXTRUDE_HEIGHT = 0.02;

function ZoneRendererInner({
  node,
  selected,
  hovered,
  zoneColor,
}: ZoneRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'zone', meshRef);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const [first, ...rest] = node.polygon;
    if (!first) return new THREE.Shape();
    s.moveTo(first[0], first[1]);
    for (const point of rest) {
      s.lineTo(point[0], point[1]);
    }
    s.closePath();
    return s;
  }, [node.polygon]);

  const geometry = useMemo(() => {
    const settings: THREE.ExtrudeGeometryOptions = {
      depth: ZONE_EXTRUDE_HEIGHT,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, settings);
  }, [shape]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const opacity = selected ? 0.6 : hovered ? 0.55 : 0.4;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      userData={{ nodeId: node.id, nodeType: 'zone' }}
    >
      <meshStandardMaterial
        color={zoneColor}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export const ZoneRenderer = memo(ZoneRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.zoneColor === next.zoneColor
  );
});

'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { ZoneNode } from '../schema';
import { ZONE_LABELS } from '../schema';

interface ZoneRendererProps {
  node: ZoneNode;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** Thin extrude depth for the zone floor slab */
const ZONE_EXTRUDE_HEIGHT = 0.02;

export function ZoneRenderer({ node, selected, onSelect }: ZoneRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);

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

  const centroid = useMemo(() => {
    if (node.polygon.length === 0) return [0, 0] as const;
    let cx = 0;
    let cy = 0;
    for (const [x, y] of node.polygon) {
      cx += x;
      cy += y;
    }
    const n = node.polygon.length;
    return [cx / n, cy / n] as const;
  }, [node.polygon]);

  const label = ZONE_LABELS[node.zoneType];
  const areaText = `${Math.round(node.area)}m\u00B2`;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  return (
    <group>
      {/* Zone floor shape - ExtrudeGeometry creates shape in XY plane,
          rotate to lie flat on XZ plane */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial
          color={node.color}
          transparent
          opacity={selected ? 0.6 : 0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Floating label above the centroid */}
      <Html
        position={[centroid[0], 0.3, centroid[1]]}
        center
        distanceFactor={10}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'system-ui, sans-serif',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ opacity: 0.8 }}>{areaText}</div>
        </div>
      </Html>
    </group>
  );
}

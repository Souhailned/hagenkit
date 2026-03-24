'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Edges } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { HorecaItemType, ItemNode } from '../schema';

interface ItemRendererProps {
  node: ItemNode;
  selected: boolean;
  onSelect: (id: string) => void;
}

type ItemCategory = 'table' | 'seating' | 'kitchen' | 'bar' | 'decor';

/** Map item types to visual categories */
const ITEM_CATEGORY: Record<HorecaItemType, ItemCategory> = {
  table_round: 'table',
  table_square: 'table',
  table_long: 'table',
  chair: 'seating',
  barstool: 'seating',
  bar_counter: 'bar',
  kitchen_counter: 'kitchen',
  oven: 'kitchen',
  stove: 'kitchen',
  fridge: 'kitchen',
  sink: 'kitchen',
  coffee_machine: 'kitchen',
  display_case: 'kitchen',
  register: 'kitchen',
  booth: 'seating',
  planter: 'decor',
  parasol: 'decor',
};

/** Color per item category */
const CATEGORY_COLORS: Record<ItemCategory, string> = {
  table: '#8B4513',
  seating: '#DEB887',
  kitchen: '#C0C0C0',
  bar: '#4a3728',
  decor: '#228B22',
};

const SELECTED_EDGE_COLOR = '#3b82f6';

export function ItemRenderer({ node, selected, onSelect }: ItemRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(node.width, node.height, node.depth),
    [node.width, node.height, node.depth],
  );

  const category = ITEM_CATEGORY[node.itemType];
  const color = CATEGORY_COLORS[category];

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(node.id);
  };

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
      onClick={handleClick}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={category === 'kitchen' ? 0.4 : 0.1}
      />
      {selected && (
        <Edges
          threshold={15}
          color={SELECTED_EDGE_COLOR}
          lineWidth={2}
        />
      )}
    </mesh>
  );
}

'use client';

import { memo, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { HorecaItemType, ItemNode } from '../schema';
import { useRegistry } from '../registry';

export type ItemCategory = 'table' | 'seating' | 'kitchen' | 'bar' | 'decor';

/** Map item types to visual categories */
export const ITEM_CATEGORY: Record<HorecaItemType, ItemCategory> = {
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

interface ItemRendererProps {
  node: ItemNode;
  selected: boolean;
  hovered: boolean;
  categoryColors: Record<ItemCategory, string>;
  selectedColor: string;
}

function ItemRendererInner({
  node,
  selected,
  hovered,
  categoryColors,
  selectedColor,
}: ItemRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  useRegistry(node.id, 'item', meshRef);

  const geometry = useMemo(
    () => new THREE.BoxGeometry(node.width, node.height, node.depth),
    [node.width, node.height, node.depth],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const category = ITEM_CATEGORY[node.itemType];
  const color = categoryColors[category];

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
      userData={{ nodeId: node.id, nodeType: 'item' }}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.7}
        metalness={category === 'kitchen' ? 0.4 : 0.1}
      />
    </mesh>
  );
}

export const ItemRenderer = memo(ItemRendererInner, (prev, next) => {
  return (
    prev.node === next.node &&
    prev.selected === next.selected &&
    prev.hovered === next.hovered &&
    prev.categoryColors === next.categoryColors &&
    prev.selectedColor === next.selectedColor
  );
});

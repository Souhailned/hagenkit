'use client';

// lib/editor/renderers/item-renderer.tsx
// Renders items in the 3D scene. Supports two rendering modes:
//   1. GLTF model — when node.src is set, loads the 3D model via the asset pipeline
//   2. Colored box fallback — default when no model is specified
//
// The GLTF model is loaded inside a Suspense boundary with the colored box
// as the fallback, so the item is always visible (even while loading).

import { memo, useMemo, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import type { HorecaItemType, ItemNode } from '../schema';
import { useRegistry } from '../registry';
import { useGltfModel } from '../assets';

// ---------------------------------------------------------------------------
// Visual categories for fallback box coloring
// ---------------------------------------------------------------------------

export type ItemCategory =
  | 'table'
  | 'seating'
  | 'kitchen'
  | 'bar'
  | 'sanitair'
  | 'terras'
  | 'lighting'
  | 'storage'
  | 'decor';

/** Map item types to visual categories */
export const ITEM_CATEGORY: Record<HorecaItemType, ItemCategory> = {
  // Meubilair
  table_round: 'table',
  table_square: 'table',
  table_long: 'table',
  chair: 'seating',
  barstool: 'seating',
  booth: 'seating',

  // Keuken
  kitchen_counter: 'kitchen',
  oven: 'kitchen',
  stove: 'kitchen',
  fridge: 'kitchen',
  sink: 'kitchen',
  coffee_machine: 'kitchen',
  display_case: 'kitchen',
  register: 'kitchen',
  exhaust_hood: 'kitchen',
  dishwasher: 'kitchen',
  prep_table: 'kitchen',
  warming_cabinet: 'kitchen',
  freezer: 'kitchen',
  pizza_oven: 'kitchen',
  grill: 'kitchen',
  deep_fryer: 'kitchen',

  // Bar
  bar_counter: 'bar',
  beer_tap: 'bar',
  wine_cooler: 'bar',
  ice_machine: 'bar',
  glass_washer: 'bar',
  cocktail_station: 'bar',
  espresso_machine: 'bar',

  // Sanitair
  toilet: 'sanitair',
  urinal: 'sanitair',
  hand_basin: 'sanitair',
  mirror_cabinet: 'sanitair',

  // Terras / Outdoor
  parasol: 'terras',
  planter: 'decor',
  terrace_heater: 'terras',
  windscreen: 'terras',
  outdoor_table: 'terras',
  outdoor_chair: 'terras',
  flower_box: 'decor',

  // Verlichting & Klimaat
  ceiling_light: 'lighting',
  wall_light: 'lighting',
  airco_unit: 'lighting',
  ventilation: 'lighting',
  smoke_detector: 'lighting',
  fire_extinguisher: 'lighting',

  // Opslag
  shelf_unit: 'storage',
  storage_rack: 'storage',
  coat_rack: 'storage',
};

/** Default colors per category (used for fallback boxes) */
export const CATEGORY_COLORS: Record<ItemCategory, string> = {
  table: '#8B6914',
  seating: '#A0522D',
  kitchen: '#708090',
  bar: '#CD853F',
  sanitair: '#B0C4DE',
  terras: '#228B22',
  lighting: '#FFD700',
  storage: '#696969',
  decor: '#2E8B57',
};

// ---------------------------------------------------------------------------
// Fallback box component (current behavior, preserved for backward compat)
// ---------------------------------------------------------------------------

interface FallbackBoxProps {
  node: ItemNode;
  meshRef: React.RefObject<THREE.Mesh | null>;
  color: string;
  category: ItemCategory;
}

function FallbackBox({ node, meshRef, color, category }: FallbackBoxProps) {
  const geometry = useMemo(
    () => new THREE.BoxGeometry(node.width, node.height, node.depth),
    [node.width, node.height, node.depth],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

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

// ---------------------------------------------------------------------------
// GLTF model component
// ---------------------------------------------------------------------------

interface GltfItemProps {
  node: ItemNode;
  groupRef: React.RefObject<THREE.Group | null>;
}

function GltfItemInner({ node, groupRef }: GltfItemProps) {
  const { scene, isLoaded } = useGltfModel(node.src);

  if (!isLoaded || !scene) {
    return null;
  }

  // Apply node scale if specified, otherwise use default [1,1,1]
  const scale = node.scale ?? [1, 1, 1];

  return (
    <group
      ref={groupRef}
      position={[
        node.position[0],
        node.position[1] + node.height / 2,
        node.position[2],
      ]}
      rotation={[node.rotation[0], node.rotation[1], node.rotation[2]]}
      scale={[scale[0], scale[1], scale[2]]}
      userData={{ nodeId: node.id, nodeType: 'item' }}
    >
      <primitive object={scene} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main item renderer
// ---------------------------------------------------------------------------

interface ItemRendererProps {
  node: ItemNode;
  selected: boolean;
  hovered: boolean;
  categoryColors?: Partial<Record<ItemCategory, string>>;
  selectedColor?: string;
}

function ItemRendererInner({
  node,
  selected,
  hovered,
  categoryColors,
  selectedColor,
}: ItemRendererProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Register whichever ref is active (mesh for fallback, group for GLTF)
  // The registry needs to pick up the right one. We register the group
  // when GLTF is active, otherwise the mesh.
  const hasSrc = !!node.src;
  useRegistry(node.id, 'item', hasSrc ? groupRef : meshRef);

  const category = ITEM_CATEGORY[node.itemType];
  const mergedColors = categoryColors
    ? { ...CATEGORY_COLORS, ...categoryColors }
    : CATEGORY_COLORS;
  const color = mergedColors[category];

  // When node has a 3D model source, try to load it
  if (hasSrc) {
    return (
      <Suspense
        fallback={
          <FallbackBox
            node={node}
            meshRef={meshRef}
            color={color}
            category={category}
          />
        }
      >
        <GltfItemInner node={node} groupRef={groupRef} />
      </Suspense>
    );
  }

  // Default: colored box fallback
  return (
    <FallbackBox
      node={node}
      meshRef={meshRef}
      color={color}
      category={category}
    />
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

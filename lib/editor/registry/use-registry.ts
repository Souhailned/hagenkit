'use client';

// lib/editor/registry/use-registry.ts
// Hook that registers/unregisters a THREE.Object3D in the scene registry
// on mount/unmount. Drop into any renderer component.

import { useLayoutEffect, type RefObject } from 'react';
import type * as THREE from 'three';
import { sceneRegistry, type RegistryNodeType } from './scene-registry';

/**
 * Registers a THREE.Object3D reference in the global scene registry.
 *
 * Call this in any renderer component that holds a mesh ref:
 * ```tsx
 * const meshRef = useRef<THREE.Mesh>(null);
 * useRegistry(node.id, 'wall', meshRef);
 * ```
 *
 * The object is automatically unregistered when the component unmounts
 * or when the id/type/ref changes.
 */
export function useRegistry(
  id: string,
  type: RegistryNodeType,
  ref: RefObject<THREE.Object3D | null>,
): void {
  useLayoutEffect(() => {
    const obj = ref.current;
    if (!obj) return;

    sceneRegistry.register(id, type, obj);
    return () => {
      sceneRegistry.unregister(id, type);
    };
  }, [id, type, ref]);
}

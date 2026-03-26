'use client';

// lib/editor/assets/use-gltf-model.ts
// React hook for loading GLTF/GLB models using drei's useGLTF.
//
// Resolves the src URL (which may be an asset:// reference) to a
// renderable URL, then loads the GLTF model.
//
// Usage:
//   const { scene, isLoaded } = useGltfModel(node.src);
//   if (scene) return <primitive object={scene} />;

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAssetUrl } from './use-asset-url';

/** Sentinel URL used when no real URL is available yet (loading state).
 *  drei's useGLTF always needs a string, so we use a data URI that
 *  produces a minimal valid empty GLB. */
const EMPTY_GLB_DATA_URI =
  'data:model/gltf-binary;base64,Z2xURgIAAABMAAAAHAAAAEpTT057ImFzc2V0Ijp7InZlcnNpb24iOiIyLjAifSwic2NlbmUiOjAsInNjZW5lcyI6W3sibm9kZXMiOltdfV19IAAAAEJJTgA=';

interface GltfModelResult {
  /** The cloned scene graph, ready to be inserted as a <primitive> */
  scene: THREE.Group | null;
  /** Whether the model has finished loading */
  isLoaded: boolean;
}

/**
 * Load a GLTF/GLB model from a source URL.
 *
 * @param src - Model source (asset://, http(s)://, or relative path)
 * @returns { scene, isLoaded }
 */
export function useGltfModel(src?: string): GltfModelResult {
  const resolvedUrl = useAssetUrl(src);
  const urlToLoad = resolvedUrl ?? EMPTY_GLB_DATA_URI;
  const isPlaceholder = !resolvedUrl;

  const gltf = useGLTF(urlToLoad);

  // Clone the scene so each instance gets its own materials/transforms.
  // This prevents shared-state bugs when the same model is used by
  // multiple items.
  const clonedScene = useMemo(() => {
    if (isPlaceholder || !gltf.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf.scene, isPlaceholder]);

  return {
    scene: clonedScene,
    isLoaded: !isPlaceholder && !!clonedScene,
  };
}

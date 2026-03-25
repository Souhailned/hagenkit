'use client';

import { useMemo } from 'react';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type * as THREE from 'three';
import { useEditorStore } from '../stores';
import { sceneRegistry } from '../registry';

/**
 * Post-processing outline effects for selected and hovered objects.
 *
 * Uses @react-three/postprocessing Outline effect with the `selection` prop
 * pointing at Object3D refs from the scene registry.
 *
 * Selected objects get a solid blue outline; hovered objects get a subtler
 * gray pulsing outline.
 */
export function EditorOutlines() {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const hoveredNodeId = useEditorStore((s) => s.hoveredNodeId);

  const selectedObjects = useMemo(() => {
    return selectedNodeIds
      .map((id) => sceneRegistry.get(id))
      .filter((obj): obj is THREE.Object3D => obj != null);
  }, [selectedNodeIds]);

  const hoveredObjects = useMemo(() => {
    if (!hoveredNodeId) return [];
    if (selectedNodeIds.includes(hoveredNodeId)) return [];
    const obj = sceneRegistry.get(hoveredNodeId);
    return obj ? [obj] : [];
  }, [hoveredNodeId, selectedNodeIds]);

  const hasOutlines = selectedObjects.length > 0 || hoveredObjects.length > 0;
  if (!hasOutlines) return null;

  // Merge all outlined objects into one pass to avoid EffectComposer
  // children type issues with conditional rendering
  const allObjects = [...selectedObjects, ...hoveredObjects];

  return (
    <EffectComposer multisampling={4} autoClear={false}>
      <Outline
        selection={allObjects}
        visibleEdgeColor={0x3b82f6}
        hiddenEdgeColor={0x1d4ed8}
        edgeStrength={3}
        pulseSpeed={0}
        blur
        xRay={false}
        blendFunction={BlendFunction.ALPHA}
      />
    </EffectComposer>
  );
}

'use client';

import { useSceneStore } from '../stores';
import { useEditorStore } from '../stores';
import { WallRenderer } from './wall-renderer';
import { ZoneRenderer } from './zone-renderer';
import { ItemRenderer } from './item-renderer';
import { GridRenderer } from './grid-renderer';
import type { AnyNode } from '../schema';

/**
 * Main scene renderer that iterates over all nodes in the scene store
 * and dispatches each to the appropriate type-specific renderer.
 */
export function SceneRenderer() {
  const nodes = useSceneStore((s) => s.nodes);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const gridVisible = useEditorStore((s) => s.gridVisible);
  const selectNode = useEditorStore((s) => s.selectNode);

  const handleSelect = (id: string) => {
    selectNode(id);
  };

  return (
    <>
      <GridRenderer visible={gridVisible} />
      {Object.values(nodes).map((node: AnyNode) => {
        if (!node.visible) return null;

        const isSelected = selectedNodeIds.includes(node.id);

        switch (node.type) {
          case 'wall':
            return (
              <WallRenderer
                key={node.id}
                node={node}
                selected={isSelected}
                onSelect={handleSelect}
              />
            );
          case 'zone':
            return (
              <ZoneRenderer
                key={node.id}
                node={node}
                selected={isSelected}
                onSelect={handleSelect}
              />
            );
          case 'item':
            return (
              <ItemRenderer
                key={node.id}
                node={node}
                selected={isSelected}
                onSelect={handleSelect}
              />
            );
          case 'slab':
            // Slab renderer not yet implemented; skip for now
            return null;
          default:
            return null;
        }
      })}
    </>
  );
}

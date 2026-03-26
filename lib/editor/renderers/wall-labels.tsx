'use client';

// lib/editor/renderers/wall-labels.tsx
// Renders length measurement labels on walls in 2D mode.
// Each label sits at the midpoint of a wall segment and shows the length in meters.

import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useSceneStore, useEditorStore } from '../stores';
import type { WallNode } from '../schema';

export function WallLabels() {
  const nodes = useSceneStore((s) => s.nodes);
  const viewMode = useEditorStore((s) => s.viewMode);

  const walls = useMemo(() => {
    return Object.values(nodes).filter(
      (n): n is WallNode => n.type === 'wall',
    );
  }, [nodes]);

  if (viewMode !== '2d') return null;
  if (walls.length === 0) return null;

  return (
    <group>
      {walls.map((wall) => {
        const dx = wall.end[0] - wall.start[0];
        const dz = wall.end[1] - wall.start[1];
        const length = Math.hypot(dx, dz);

        // Skip very short walls (label would overlap the wall itself)
        if (length < 0.3) return null;

        // Midpoint of the wall, slightly above the floor
        const mx = (wall.start[0] + wall.end[0]) / 2;
        const mz = (wall.start[1] + wall.end[1]) / 2;

        return (
          <Html
            key={wall.id}
            position={[mx, 0.15, mz]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div className="rounded bg-background/80 px-1 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/50 whitespace-nowrap shadow-sm">
              {length.toFixed(2)}m
            </div>
          </Html>
        );
      })}
    </group>
  );
}

'use client';

import { Grid } from '@react-three/drei';

interface GridRendererProps {
  /** Grid total size in meters */
  size?: number;
  /** Cell size in meters */
  cellSize?: number;
  /** Whether the grid is visible */
  visible?: boolean;
}

const GRID_CELL_COLOR = '#888888';
const GRID_SECTION_COLOR = '#555555';

export function GridRenderer({
  size = 30,
  cellSize = 1,
  visible = true,
}: GridRendererProps) {
  if (!visible) return null;

  return (
    <Grid
      position={[0, 0, 0]}
      args={[size, size]}
      cellSize={cellSize}
      cellThickness={0.5}
      cellColor={GRID_CELL_COLOR}
      sectionSize={cellSize * 5}
      sectionThickness={1.2}
      sectionColor={GRID_SECTION_COLOR}
      fadeDistance={size * 0.8}
      fadeStrength={1.5}
      fadeFrom={1}
      infiniteGrid={false}
    />
  );
}

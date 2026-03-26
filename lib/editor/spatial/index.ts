// lib/editor/spatial/index.ts
// Barrel export for the spatial grid system.

// Core data structures (pure TypeScript, no React)
export { SpatialGrid, aabbOverlap, aabbFromCenter, aabbFromWall, aabbFromPolygon } from "./spatial-grid";
export type { AABB } from "./spatial-grid";

export { WallSpatialGrid } from "./wall-spatial-grid";
export type { WallInterval } from "./wall-spatial-grid";

export { SpatialGridManager } from "./spatial-grid-manager";

// Space detection (pure TypeScript)
export { detectSpaces, isPointInterior } from "./space-detection";
export type { WallSideClassification } from "./space-detection";

// React hooks
export { useSpatialGridSync } from "./spatial-grid-sync";
export { useSpatialQuery } from "./use-spatial-query";
export type { SpatialQueryAPI } from "./use-spatial-query";

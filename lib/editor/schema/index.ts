// lib/editor/schema/index.ts
// Re-exports all editor schema types and constants.

export type {
  Vec2,
  Vec3,
  BaseNode,
  WallMaterial,
  WallNode,
  SlabNode,
  HorecaZoneType,
  ZoneNode,
  HorecaItemType,
  ItemNode,
  DoorStyle,
  DoorNode,
  WindowStyle,
  WindowNode,
  SiteNode,
  BuildingNode,
  LevelNode,
  AnyNode,
  NodeOfType,
  SceneData,
} from "./nodes";

export type { ItemDefault } from "./constants";

export {
  DEFAULT_WALL_HEIGHT,
  DEFAULT_WALL_THICKNESS,
  DEFAULT_DOOR_WIDTH,
  DEFAULT_DOOR_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_SILL_HEIGHT,
  ZONE_COLORS,
  ZONE_COLOR_TOKENS,
  ZONE_LABELS,
  ITEM_DEFAULTS,
} from "./constants";

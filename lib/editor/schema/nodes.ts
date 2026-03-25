// lib/editor/schema/nodes.ts
// Node type definitions for the 3D horeca property floor plan editor.

/** 3D coordinate tuple [x, y, z] in meters */
export type Vec3 = [number, number, number];

/** 2D coordinate tuple [x, y] in meters */
export type Vec2 = [number, number];

/** Base node interface - flat node dictionary pattern */
export interface BaseNode {
  id: string;
  type: string;
  parentId: string | null;
  visible: boolean;
  position: Vec3;
  rotation: Vec3;
  metadata?: Record<string, unknown>;
}

/** Wall materials available in horeca properties */
export type WallMaterial = "brick" | "glass" | "drywall" | "concrete";

/** Wall node - defines a wall segment between two 2D points */
export interface WallNode extends BaseNode {
  type: "wall";
  start: Vec2;
  end: Vec2;
  /** Wall thickness in meters */
  thickness: number;
  /** Wall height in meters */
  height: number;
  material: WallMaterial;
}

/** Floor slab node - a horizontal surface defined by a polygon outline */
export interface SlabNode extends BaseNode {
  type: "slab";
  /** 2D outline points defining the slab boundary */
  polygon: Vec2[];
  /** Slab thickness in meters */
  thickness: number;
}

/** Zone types specific to horeca (hospitality) venues */
export type HorecaZoneType =
  | "dining_area"
  | "bar_area"
  | "kitchen"
  | "storage"
  | "terrace"
  | "entrance"
  | "restroom"
  | "office"
  | "prep_area"
  | "walk_in_cooler"
  | "seating_outside"
  | "hallway";

/** Zone node - a labeled area within the floor plan */
export interface ZoneNode extends BaseNode {
  type: "zone";
  zoneType: HorecaZoneType;
  /** 2D outline points defining the zone boundary */
  polygon: Vec2[];
  /** Auto-calculated area in square meters */
  area: number;
  /** Hex color string for visualization */
  color: string;
  /** Optional seating capacity for this zone */
  capacity?: number;
}

/** Item types for horeca furniture and equipment */
export type HorecaItemType =
  | "table_round"
  | "table_square"
  | "table_long"
  | "chair"
  | "barstool"
  | "bar_counter"
  | "kitchen_counter"
  | "oven"
  | "stove"
  | "fridge"
  | "sink"
  | "coffee_machine"
  | "display_case"
  | "register"
  | "booth"
  | "planter"
  | "parasol";

/** Furniture or equipment node placed within the floor plan */
export interface ItemNode extends BaseNode {
  type: "item";
  itemType: HorecaItemType;
  /** Width in meters */
  width: number;
  /** Depth in meters */
  depth: number;
  /** Height in meters */
  height: number;
  /** Optional 3D model reference for future rendering */
  model?: string;
}

/** Door styles available for placement in walls */
export type DoorStyle = "single" | "double" | "sliding";

/** Door node - placed within a wall segment */
export interface DoorNode extends BaseNode {
  type: "door";
  /** Width of the door opening in meters */
  width: number;
  /** Height of the door in meters */
  height: number;
  /** Visual style of the door */
  style: DoorStyle;
  /** ID of the wall this door belongs to */
  wallId: string;
  /** Position along the wall as a ratio 0-1 */
  wallPosition: number;
}

/** Window styles available for placement in walls */
export type WindowStyle = "fixed" | "casement" | "sliding";

/** Window node - placed within a wall segment at a given sill height */
export interface WindowNode extends BaseNode {
  type: "window";
  /** Width of the window in meters */
  width: number;
  /** Height of the window in meters */
  height: number;
  /** Height of the window sill from floor level in meters */
  sillHeight: number;
  /** Visual style of the window */
  style: WindowStyle;
  /** ID of the wall this door belongs to */
  wallId: string;
  /** Position along the wall as a ratio 0-1 */
  wallPosition: number;
}

/* ------------------------------------------------------------------ */
/* Hierarchy nodes — site > building > level structure                  */
/* ------------------------------------------------------------------ */

/** Site node — top-level container for one or more buildings */
export interface SiteNode extends BaseNode {
  type: "site";
  name?: string;
}

/** Building node — groups levels; parent is a site or null */
export interface BuildingNode extends BaseNode {
  type: "building";
  name?: string;
}

/** Level node — a single storey within a building */
export interface LevelNode extends BaseNode {
  type: "level";
  /** Floor index: 0 = ground, 1 = first floor, -1 = basement */
  level: number;
  /** Height of this level in meters */
  height: number;
  name?: string;
}

/** Discriminated union of all possible node types */
export type AnyNode =
  | WallNode
  | SlabNode
  | ZoneNode
  | ItemNode
  | DoorNode
  | WindowNode
  | SiteNode
  | BuildingNode
  | LevelNode;

/** Extracts the node type matching a given type string */
export type NodeOfType<T extends AnyNode["type"]> = Extract<AnyNode, { type: T }>;

/** Scene data structure stored in the database as JSON */
export interface SceneData {
  nodes: Record<string, AnyNode>;
  rootNodeIds: string[];
}

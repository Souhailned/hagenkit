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

/** Discriminated union of all possible node types */
export type AnyNode = WallNode | SlabNode | ZoneNode | ItemNode;

/** Extracts the node type matching a given type string */
export type NodeOfType<T extends AnyNode["type"]> = Extract<AnyNode, { type: T }>;

/** Scene data structure stored in the database as JSON */
export interface SceneData {
  nodes: Record<string, AnyNode>;
  rootNodeIds: string[];
}

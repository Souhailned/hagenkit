// lib/editor/events.ts
// Full typed event bus matching Pascal Editor's event system.
// Per-node-type events (14 types x 8 suffixes) + grid + camera + tool + SFX events.

import mitt from "mitt";
import type { AnyNode } from "./schema";

// ── Grid Events ──────────────────────────────────────────────────────────

export type GridEventPayload = {
  /** Snappable 2D position [x, z] in world coordinates */
  position: [number, number];
  /** Full 3D world position [x, y, z] */
  worldPosition: [number, number, number];
  /** ID of the topmost interactive node mesh under the pointer, if any */
  hitNodeId?: string;
  /** Type of the hit node (wall, zone, item, etc.) */
  hitNodeType?: string;
};

// ── Node Events ──────────────────────────────────────────────────────────

export interface NodeEventPayload<T extends AnyNode = AnyNode> {
  node: T;
  /** World position [x, y, z] of the interaction point */
  position: [number, number, number];
  /** Position in the node's local coordinate space */
  localPosition?: [number, number, number];
  /** Surface normal at the interaction point */
  normal?: [number, number, number];
  /** Prevent the event from propagating to parent/sibling handlers */
  stopPropagation: () => void;
}

// Event suffixes — exported for use in hooks that need to iterate
export const EVENT_SUFFIXES = [
  "click",
  "move",
  "enter",
  "leave",
  "pointerdown",
  "pointerup",
  "context-menu",
  "double-click",
] as const;

export type EventSuffix = (typeof EVENT_SUFFIXES)[number];

// All node type prefixes
export type NodeTypePrefix =
  | "site"
  | "building"
  | "level"
  | "wall"
  | "door"
  | "window"
  | "zone"
  | "item"
  | "slab"
  | "ceiling"
  | "roof"
  | "roof-segment"
  | "scan"
  | "guide";

// ── Camera Control Events ────────────────────────────────────────────────

export interface CameraControlEvent {
  nodeId: string;
}

export interface ThumbnailGenerateEvent {
  projectId: string;
}

// ── SFX Events ───────────────────────────────────────────────────────────

export type SfxType =
  | "grid-snap"
  | "item-place"
  | "item-delete"
  | "item-rotate"
  | "item-pick"
  | "structure-build"
  | "structure-delete";

// ── Composite Event Map ──────────────────────────────────────────────────

/** Helper: generates { "prefix:click": E, "prefix:move": E, ... } for each suffix */
type NodeEvents<Prefix extends string, E> = {
  [K in `${Prefix}:${EventSuffix}`]: E;
};

type GridEvents = {
  [K in `grid:${EventSuffix}`]: GridEventPayload;
} & {
  // Backward-compatible aliases used by Horecagrond's useGridEvents
  "grid:pointermove": GridEventPayload;
};

type CameraControlEvents = {
  "camera-controls:view": CameraControlEvent;
  "camera-controls:focus": CameraControlEvent;
  "camera-controls:capture": CameraControlEvent;
  "camera-controls:top-view": undefined;
  "camera-controls:orbit-cw": undefined;
  "camera-controls:orbit-ccw": undefined;
  "camera-controls:generate-thumbnail": ThumbnailGenerateEvent;
};

type ToolEvents = {
  "tool:cancel": undefined;
  "tool:activate": { tool: string };
};

type PresetEvents = {
  "preset:generate-thumbnail": { presetId: string; nodeId: string };
  "preset:thumbnail-updated": { presetId: string; thumbnailUrl: string };
};

type SfxEvents = {
  [K in `sfx:${SfxType}`]: undefined;
};

// ── Full Editor Events Type ──────────────────────────────────────────────

export type EditorEvents = GridEvents &
  NodeEvents<"wall", NodeEventPayload> &
  NodeEvents<"item", NodeEventPayload> &
  NodeEvents<"site", NodeEventPayload> &
  NodeEvents<"building", NodeEventPayload> &
  NodeEvents<"level", NodeEventPayload> &
  NodeEvents<"zone", NodeEventPayload> &
  NodeEvents<"slab", NodeEventPayload> &
  NodeEvents<"ceiling", NodeEventPayload> &
  NodeEvents<"roof", NodeEventPayload> &
  NodeEvents<"roof-segment", NodeEventPayload> &
  NodeEvents<"window", NodeEventPayload> &
  NodeEvents<"door", NodeEventPayload> &
  NodeEvents<"scan", NodeEventPayload> &
  NodeEvents<"guide", NodeEventPayload> &
  CameraControlEvents &
  ToolEvents &
  PresetEvents &
  SfxEvents;

export const editorEmitter = mitt<EditorEvents>();

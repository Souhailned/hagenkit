// lib/editor/events.ts
// Mitt event emitter for editor canvas interaction.
// All grid/tool events flow through this emitter instead of R3F onClick on meshes.

import mitt from "mitt";

export type GridEventPayload = {
  /** Snappable 2D position [x, z] in world coordinates */
  position: [number, number];
  /** Full 3D world position [x, y, z] */
  worldPosition: [number, number, number];
  /** ID of the topmost interactive node mesh under the pointer, if any */
  hitNodeId?: string;
  /** Type of the hit node (wall, zone, item) */
  hitNodeType?: string;
};

export type EditorEvents = {
  "grid:click": GridEventPayload;
  "grid:pointerdown": GridEventPayload;
  "grid:pointermove": GridEventPayload;
  "grid:pointerup": GridEventPayload;
  "tool:cancel": void;
};

export const editorEmitter = mitt<EditorEvents>();

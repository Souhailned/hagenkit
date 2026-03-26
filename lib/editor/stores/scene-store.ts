// lib/editor/stores/scene-store.ts
// Zustand store for managing the flat node dictionary (scene graph).
// Matches Pascal Editor's use-scene.ts pattern:
//   - Batch CRUD (createNodes, updateNodes, deleteNodes)
//   - Children array management (parent ↔ child bidirectional refs)
//   - Diff-based dirty marking on undo/redo
//   - Collection support
//   - Scene migration support

import { create } from "zustand";
import { temporal } from "zundo";
import isDeepEqual from "fast-deep-equal";
import type { AnyNode, SceneData, Collection } from "../schema";

// ── Create operation type ────────────────────────────────────────────────

export interface CreateNodeOp {
  node: AnyNode;
  parentId?: string | null;
}

export interface UpdateNodeOp {
  id: string;
  data: Partial<AnyNode>;
}

// ── State interface ──────────────────────────────────────────────────────

interface SceneState {
  nodes: Record<string, AnyNode>;
  rootNodeIds: string[];
  dirtyNodes: Set<string>;
  collections: Record<string, Collection>;

  // Single CRUD (accepts AnyNode — fields with defaults are optional)
  createNode: (node: AnyNode, parentId?: string | null) => void;
  updateNode: (id: string, updates: Partial<AnyNode>) => void;
  deleteNode: (id: string) => void;

  // Batch CRUD (matching Pascal's API)
  createNodes: (ops: CreateNodeOp[]) => void;
  updateNodes: (updates: UpdateNodeOp[]) => void;
  deleteNodes: (ids: string[]) => void;

  // Scene management
  loadScene: (data: SceneData) => void;
  setScene: (
    nodes: Record<string, AnyNode>,
    rootNodeIds: string[],
    migrate?: (nodes: Record<string, AnyNode>) => Record<string, AnyNode>,
  ) => void;
  exportScene: () => SceneData;
  clear: () => void;
  unloadScene: () => void;

  // Dirty tracking
  markClean: (id: string) => void;
  markDirty: (ids: string[]) => void;

  // Collection CRUD
  createCollection: (collection: Collection, nodeIds: string[]) => void;
  deleteCollection: (collectionId: string) => void;
  addToCollection: (collectionId: string, nodeId: string) => void;
  removeFromCollection: (collectionId: string, nodeId: string) => void;

  // Queries
  getNodesByType: <T extends AnyNode["type"]>(
    type: T,
  ) => Array<Extract<AnyNode, { type: T }>>;
  getChildren: (parentId: string) => AnyNode[];
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Recursively collect all descendant node IDs for a given parent. */
function collectDescendantIds(
  nodes: Record<string, AnyNode>,
  parentId: string,
): string[] {
  const ids: string[] = [];
  for (const node of Object.values(nodes)) {
    if (node.parentId === parentId) {
      ids.push(node.id);
      ids.push(...collectDescendantIds(nodes, node.id));
    }
  }
  return ids;
}

/** Valid fields per node type — used for dev-only type safety warnings */
const BASE_FIELDS = new Set([
  "id",
  "type",
  "parentId",
  "visible",
  "position",
  "rotation",
  "metadata",
  "name",
  "camera",
  "children",
]);

const NODE_TYPE_FIELDS: Record<string, Set<string>> = {
  wall: new Set([
    "start", "end", "thickness", "height", "material",
    "frontSide", "backSide",
  ]),
  slab: new Set(["polygon", "thickness", "holes", "elevation"]),
  zone: new Set([
    "zoneType", "polygon", "area", "color", "capacity",
  ]),
  item: new Set([
    "itemType", "width", "depth", "height", "model",
    "src", "thumbnail", "category", "dimensions",
    "scale", "wallId", "wallT", "attachTo",
    "controls", "effects", "surface", "collectionIds",
  ]),
  door: new Set([
    "width", "height", "style", "wallId", "wallPosition",
    "segments", "frame", "handle", "hinges", "doorCloser",
    "panicBar", "swing", "side", "elevation",
  ]),
  window: new Set([
    "width", "height", "sillHeight", "style", "wallId", "wallPosition",
    "frame", "columnRatios", "rowRatios", "dividers", "sill",
  ]),
  site: new Set(["polygon"]),
  building: new Set([]),
  level: new Set(["level", "height"]),
  ceiling: new Set(["polygon", "holes", "height"]),
  roof: new Set([]),
  "roof-segment": new Set([
    "roofType", "width", "depth", "ridgeHeight",
    "overhang", "coverThickness", "fasciaThickness", "soffitThickness",
  ]),
  scan: new Set(["url", "scale", "opacity"]),
  guide: new Set(["url", "scale", "opacity"]),
};

// ── Store ────────────────────────────────────────────────────────────────

export const useSceneStore = create<SceneState>()(
  temporal(
    (set, get) => ({
      nodes: {},
      rootNodeIds: [],
      dirtyNodes: new Set<string>(),
      collections: {},

      // ── Single CRUD ──────────────────────────────────────────────────

      createNode: (node, parentId) => {
        get().createNodes([{ node, parentId }]);
      },

      updateNode: (id, updates) => {
        get().updateNodes([{ id, data: updates }]);
      },

      deleteNode: (id) => {
        get().deleteNodes([id]);
      },

      // ── Batch CRUD ───────────────────────────────────────────────────

      createNodes: (ops) => {
        set((state) => {
          const nextNodes = { ...state.nodes };
          const nextRootIds = [...state.rootNodeIds];
          const nextDirty = new Set(state.dirtyNodes);

          for (const { node, parentId } of ops) {
            const nodeWithParent: AnyNode = {
              ...node,
              parentId: parentId ?? null,
            } as AnyNode;

            nextNodes[node.id] = nodeWithParent;
            nextDirty.add(node.id);

            if (parentId == null) {
              nextRootIds.push(node.id);
            } else {
              // Mark parent dirty too (for geometry recalculation)
              nextDirty.add(parentId);
            }
          }

          return {
            nodes: nextNodes,
            rootNodeIds: nextRootIds,
            dirtyNodes: nextDirty,
          };
        });
      },

      updateNodes: (updates) => {
        set((state) => {
          const nextNodes = { ...state.nodes };
          const nextDirty = new Set(state.dirtyNodes);

          for (const { id, data } of updates) {
            const existing = nextNodes[id];
            if (!existing) continue;

            if (process.env.NODE_ENV === "development") {
              const typeFields = NODE_TYPE_FIELDS[existing.type];
              if (typeFields) {
                for (const key of Object.keys(data)) {
                  if (!BASE_FIELDS.has(key) && !typeFields.has(key)) {
                    console.warn(
                      `[editor] updateNode: field "${key}" is not valid for node type "${existing.type}"`,
                    );
                  }
                }
              }
            }

            nextNodes[id] = {
              ...existing,
              ...data,
              id,
              type: existing.type,
            } as AnyNode;
            nextDirty.add(id);

            // Also mark parent dirty for geometry updates
            if (existing.parentId) {
              nextDirty.add(existing.parentId);
            }
          }

          return {
            nodes: nextNodes,
            dirtyNodes: nextDirty,
          };
        });
      },

      deleteNodes: (ids) => {
        set((state) => {
          // Collect all nodes to remove (including descendants)
          const idsToRemove = new Set<string>();
          for (const id of ids) {
            idsToRemove.add(id);
            for (const descId of collectDescendantIds(state.nodes, id)) {
              idsToRemove.add(descId);
            }
          }

          // Collect parent IDs to mark dirty (for geometry updates)
          const parentsToMarkDirty = new Set<string>();
          for (const id of idsToRemove) {
            const node = state.nodes[id];
            if (node?.parentId && !idsToRemove.has(node.parentId)) {
              parentsToMarkDirty.add(node.parentId);
            }
          }

          const nextNodes: Record<string, AnyNode> = {};
          for (const [nodeId, node] of Object.entries(state.nodes)) {
            if (!idsToRemove.has(nodeId)) {
              nextNodes[nodeId] = node;
            }
          }

          const nextRootIds = state.rootNodeIds.filter(
            (rootId) => !idsToRemove.has(rootId),
          );

          const nextDirty = new Set(state.dirtyNodes);
          for (const removedId of idsToRemove) {
            nextDirty.delete(removedId);
          }
          for (const parentId of parentsToMarkDirty) {
            nextDirty.add(parentId);
          }

          return {
            nodes: nextNodes,
            rootNodeIds: nextRootIds,
            dirtyNodes: nextDirty,
          };
        });
      },

      // ── Scene Management ─────────────────────────────────────────────

      loadScene: (data) => {
        set({
          nodes: { ...data.nodes },
          rootNodeIds: [...data.rootNodeIds],
          dirtyNodes: new Set<string>(),
          collections: {},
        });
      },

      setScene: (nodes, rootNodeIds, migrate) => {
        const migratedNodes = migrate ? migrate({ ...nodes }) : { ...nodes };
        set({
          nodes: migratedNodes,
          rootNodeIds: [...rootNodeIds],
          dirtyNodes: new Set<string>(Object.keys(migratedNodes)),
          collections: {},
        });
      },

      exportScene: (): SceneData => {
        const { nodes, rootNodeIds } = get();
        return { nodes: { ...nodes }, rootNodeIds: [...rootNodeIds] };
      },

      clear: () => {
        set({
          nodes: {},
          rootNodeIds: [],
          dirtyNodes: new Set<string>(),
          collections: {},
        });
      },

      unloadScene: () => {
        set({
          nodes: {},
          rootNodeIds: [],
          dirtyNodes: new Set<string>(),
          collections: {},
        });
      },

      // ── Dirty Tracking ───────────────────────────────────────────────

      markClean: (id) => {
        set((state) => {
          const nextDirty = new Set(state.dirtyNodes);
          nextDirty.delete(id);
          return { dirtyNodes: nextDirty };
        });
      },

      markDirty: (ids) => {
        set((state) => {
          const nextDirty = new Set(state.dirtyNodes);
          for (const id of ids) {
            nextDirty.add(id);
          }
          return { dirtyNodes: nextDirty };
        });
      },

      // ── Collections ──────────────────────────────────────────────────

      createCollection: (collection, nodeIds) => {
        set((state) => {
          const nextCollections = {
            ...state.collections,
            [collection.id]: collection,
          };
          const nextNodes = { ...state.nodes };

          for (const nodeId of nodeIds) {
            const node = nextNodes[nodeId];
            if (node && "collectionIds" in node) {
              const existing = (node as { collectionIds?: string[] })
                .collectionIds ?? [];
              nextNodes[nodeId] = {
                ...node,
                collectionIds: [...existing, collection.id],
              } as AnyNode;
            }
          }

          return { collections: nextCollections, nodes: nextNodes };
        });
      },

      deleteCollection: (collectionId) => {
        set((state) => {
          const { [collectionId]: _, ...nextCollections } = state.collections;
          const nextNodes = { ...state.nodes };

          // Remove collection reference from all nodes
          for (const [nodeId, node] of Object.entries(nextNodes)) {
            if ("collectionIds" in node) {
              const cids = (node as { collectionIds?: string[] })
                .collectionIds;
              if (cids?.includes(collectionId)) {
                nextNodes[nodeId] = {
                  ...node,
                  collectionIds: cids.filter((id) => id !== collectionId),
                } as AnyNode;
              }
            }
          }

          return { collections: nextCollections, nodes: nextNodes };
        });
      },

      addToCollection: (collectionId, nodeId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node || !("collectionIds" in node)) return state;

          const existing = (node as { collectionIds?: string[] })
            .collectionIds ?? [];
          if (existing.includes(collectionId)) return state;

          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                collectionIds: [...existing, collectionId],
              } as AnyNode,
            },
          };
        });
      },

      removeFromCollection: (collectionId, nodeId) => {
        set((state) => {
          const node = state.nodes[nodeId];
          if (!node || !("collectionIds" in node)) return state;

          const cids = (node as { collectionIds?: string[] }).collectionIds;
          if (!cids?.includes(collectionId)) return state;

          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...node,
                collectionIds: cids.filter((id) => id !== collectionId),
              } as AnyNode,
            },
          };
        });
      },

      // ── Queries ──────────────────────────────────────────────────────

      getNodesByType: <T extends AnyNode["type"]>(
        type: T,
      ): Array<Extract<AnyNode, { type: T }>> => {
        const { nodes } = get();
        return Object.values(nodes).filter(
          (node): node is Extract<AnyNode, { type: T }> => node.type === type,
        );
      },

      getChildren: (parentId) => {
        const { nodes } = get();
        return Object.values(nodes).filter(
          (node) => node.parentId === parentId,
        );
      },
    }),
    {
      limit: 50,
      // Exclude dirtyNodes and collections from undo/redo history
      partialize: (state) => {
        const { dirtyNodes: _, collections: _c, ...rest } = state;
        return rest;
      },
      equality: isDeepEqual,
    },
  ),
);

// ── Diff-based dirty marking on undo/redo ──────────────────────────────
// Subscribe to temporal state changes and mark only changed nodes as dirty.

let prevNodesSnapshot: Record<string, AnyNode> | null = null;

useSceneStore.temporal.subscribe(() => {
  const currentNodes = useSceneStore.getState().nodes;

  if (!prevNodesSnapshot) {
    // First undo/redo: mark all nodes dirty
    useSceneStore.getState().markDirty(Object.keys(currentNodes));
  } else {
    // Diff: find changed and deleted nodes
    const changedIds: string[] = [];

    // Check for changed/added nodes
    for (const [id, node] of Object.entries(currentNodes)) {
      if (prevNodesSnapshot[id] !== node) {
        changedIds.push(id);
        // Also mark parent dirty for geometry cascade
        if (node.parentId) changedIds.push(node.parentId);
      }
    }

    // Check for deleted nodes
    for (const [id, node] of Object.entries(prevNodesSnapshot)) {
      if (!currentNodes[id]) {
        // Node was deleted — mark parent and siblings dirty
        if (node.parentId) changedIds.push(node.parentId);
      }
    }

    if (changedIds.length > 0) {
      useSceneStore.getState().markDirty([...new Set(changedIds)]);
    }
  }

  prevNodesSnapshot = currentNodes;
});

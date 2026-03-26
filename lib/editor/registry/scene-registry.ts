// lib/editor/registry/scene-registry.ts
// Global singleton that maps node IDs to THREE.Object3D refs.
// Allows any system (export, raycasting, measurements, AI tools)
// to look up the live THREE object for a given node.

import type * as THREE from 'three';

/** The set of node types tracked by the registry */
export type RegistryNodeType = 'wall' | 'zone' | 'item' | 'slab' | 'site' | 'building' | 'level' | 'door' | 'window' | 'ceiling' | 'roof' | 'roof-segment' | 'scan' | 'guide';

interface SceneRegistry {
  /** Primary lookup: node ID -> THREE.Object3D */
  nodes: Map<string, THREE.Object3D>;

  /** Secondary index: node type -> set of node IDs */
  byType: Record<RegistryNodeType, Set<string>>;

  /** Register a THREE object under the given node id and type */
  register(id: string, type: RegistryNodeType, obj: THREE.Object3D): void;

  /** Unregister a node, removing it from both indices */
  unregister(id: string, type: RegistryNodeType): void;

  /** Get a node's THREE object by ID (or undefined if not registered) */
  get(id: string): THREE.Object3D | undefined;

  /** Get all node IDs for a given type */
  getIdsByType(type: RegistryNodeType): ReadonlySet<string>;

  /** Clear all registrations (e.g. when loading a new scene) */
  clear(): void;
}

function createSceneRegistry(): SceneRegistry {
  const nodes = new Map<string, THREE.Object3D>();

  const byType: Record<RegistryNodeType, Set<string>> = {
    wall: new Set<string>(),
    zone: new Set<string>(),
    item: new Set<string>(),
    slab: new Set<string>(),
    site: new Set<string>(),
    building: new Set<string>(),
    level: new Set<string>(),
    door: new Set<string>(),
    window: new Set<string>(),
    ceiling: new Set<string>(),
    roof: new Set<string>(),
    'roof-segment': new Set<string>(),
    scan: new Set<string>(),
    guide: new Set<string>(),
  };

  return {
    nodes,
    byType,

    register(id: string, type: RegistryNodeType, obj: THREE.Object3D) {
      nodes.set(id, obj);
      byType[type].add(id);
    },

    unregister(id: string, type: RegistryNodeType) {
      nodes.delete(id);
      byType[type].delete(id);
    },

    get(id: string) {
      return nodes.get(id);
    },

    getIdsByType(type: RegistryNodeType) {
      return byType[type];
    },

    clear() {
      nodes.clear();
      for (const set of Object.values(byType)) {
        set.clear();
      }
    },
  };
}

/** Global singleton scene registry */
export const sceneRegistry = createSceneRegistry();

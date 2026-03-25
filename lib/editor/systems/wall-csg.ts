// lib/editor/systems/wall-csg.ts
// CSG subtraction system: cuts openings in wall geometry for doors/windows.
//
// Uses three-bvh-csg to perform boolean subtraction. For each wall, collects
// its child door/window nodes, creates box geometries at the correct position
// along the wall, and subtracts them from the extruded wall geometry.
//
// If CSG fails for any reason, falls back to the original wall geometry.

import * as THREE from "three";
import { Evaluator, Operation, Brush, SUBTRACTION } from "three-bvh-csg";
import type { WallNode, DoorNode, WindowNode, AnyNode } from "../schema";

/** Shared CSG evaluator instance (reused across frames for performance) */
let evaluator: Evaluator | null = null;

function getEvaluator(): Evaluator {
  if (!evaluator) {
    evaluator = new Evaluator();
  }
  return evaluator;
}

/**
 * Compute the world-space position and rotation for a door/window cutout box.
 *
 * @param wall - The parent wall node
 * @param wallPosition - Position along the wall as a 0-1 ratio
 * @param width - Width of the opening
 * @param height - Height of the opening
 * @param yOffset - Vertical offset from floor (0 for doors, sillHeight for windows)
 * @returns Object with position and rotation for the cutout box
 */
function computeCutoutTransform(
  wall: WallNode,
  wallPosition: number,
  width: number,
  height: number,
  yOffset: number,
): { position: THREE.Vector3; rotation: number } {
  const dx = wall.end[0] - wall.start[0];
  const dz = wall.end[1] - wall.start[1];
  const wallAngle = Math.atan2(dz, dx);

  // Position along the wall
  const px = wall.start[0] + dx * wallPosition;
  const pz = wall.start[1] + dz * wallPosition;

  return {
    position: new THREE.Vector3(px, yOffset + height / 2, pz),
    rotation: wallAngle,
  };
}

/**
 * Create a box geometry oriented along a wall for CSG subtraction.
 * The box is slightly thicker than the wall to ensure clean cuts.
 */
function createCutoutBox(
  wall: WallNode,
  wallPosition: number,
  width: number,
  height: number,
  yOffset: number,
): THREE.BufferGeometry {
  // Make the cutout slightly thicker than the wall for clean boolean subtraction
  const cutoutDepth = wall.thickness + 0.02;
  const geometry = new THREE.BoxGeometry(width, height, cutoutDepth);

  const { position, rotation } = computeCutoutTransform(
    wall,
    wallPosition,
    width,
    height,
    yOffset,
  );

  // Apply rotation around Y axis (wall angle) then translate
  const matrix = new THREE.Matrix4();
  matrix.makeRotationY(-rotation);
  matrix.setPosition(position);
  geometry.applyMatrix4(matrix);

  return geometry;
}

/**
 * Collect all door and window nodes that belong to a specific wall.
 */
export function getWallOpenings(
  wallId: string,
  nodes: Record<string, AnyNode>,
): Array<DoorNode | WindowNode> {
  const openings: Array<DoorNode | WindowNode> = [];
  for (const node of Object.values(nodes)) {
    if (
      (node.type === "door" || node.type === "window") &&
      node.wallId === wallId
    ) {
      openings.push(node);
    }
  }
  return openings;
}

/**
 * Apply CSG subtraction to cut door/window openings from a wall geometry.
 *
 * @param wallGeometry - The base wall geometry (extruded from mitered footprint)
 * @param wall - The wall node
 * @param openings - Door and window nodes attached to this wall
 * @returns The geometry with openings cut out, or the original if CSG fails
 */
export function subtractOpenings(
  wallGeometry: THREE.BufferGeometry,
  wall: WallNode,
  openings: Array<DoorNode | WindowNode>,
): THREE.BufferGeometry {
  if (openings.length === 0) return wallGeometry;

  try {
    const csgEval = getEvaluator();

    // Wrap the wall geometry as a CSG Operation
    const wallOp = new Operation(wallGeometry);

    for (const opening of openings) {
      const yOffset = opening.type === "window" ? opening.sillHeight : 0;
      const cutoutGeo = createCutoutBox(
        wall,
        opening.wallPosition,
        opening.width,
        opening.height,
        yOffset,
      );

      const cutoutOp = new Operation(cutoutGeo);
      cutoutOp.operation = SUBTRACTION;

      // Chain: add cutout as child of wall operation
      wallOp.add(cutoutOp);
    }

    // Use evaluateHierarchy for parent-child CSG operations
    const resultMesh = new Brush();
    csgEval.evaluateHierarchy(wallOp, resultMesh);

    // Clean up intermediate geometries
    for (const opening of openings) {
      // Cutout geometries are managed by the Operation objects
    }

    const resultGeo = resultMesh.geometry;
    resultGeo.computeVertexNormals();

    return resultGeo;
  } catch (error) {
    // CSG failed — return original geometry unmodified
    if (process.env.NODE_ENV === "development") {
      console.warn("[wall-csg] CSG subtraction failed, using original geometry:", error);
    }
    return wallGeometry;
  }
}

import { describe, it, expect } from "vitest";
import {
  polygonArea,
  polygonCentroid,
  distance2D,
  snapToGrid,
  snapPointToGrid,
  computeSceneBounds,
} from "../geometry";

/* ------------------------------------------------------------------ */
/* polygonArea                                                         */
/* ------------------------------------------------------------------ */

describe("polygonArea", () => {
  it("returns 0 for empty array", () => {
    expect(polygonArea([])).toBe(0);
  });

  it("returns 0 for a single point", () => {
    expect(polygonArea([[3, 4]])).toBe(0);
  });

  it("returns 0 for two points (not a polygon)", () => {
    expect(polygonArea([[0, 0], [5, 5]])).toBe(0);
  });

  it("calculates area of a right triangle", () => {
    // Triangle with vertices (0,0), (4,0), (0,3) => area = 0.5 * 4 * 3 = 6
    const area = polygonArea([[0, 0], [4, 0], [0, 3]]);
    expect(area).toBeCloseTo(6);
  });

  it("calculates area of a unit square", () => {
    const area = polygonArea([[0, 0], [1, 0], [1, 1], [0, 1]]);
    expect(area).toBeCloseTo(1);
  });

  it("calculates area of a larger square", () => {
    const area = polygonArea([[0, 0], [10, 0], [10, 8], [0, 8]]);
    expect(area).toBeCloseTo(80);
  });

  it("calculates area of an irregular polygon", () => {
    // L-shape: (0,0), (4,0), (4,2), (2,2), (2,4), (0,4)
    // Area = 4*2 + 2*2 = 12
    const area = polygonArea([
      [0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4],
    ]);
    expect(area).toBeCloseTo(12);
  });

  it("gives same area regardless of winding order", () => {
    const cw = polygonArea([[0, 0], [1, 0], [1, 1], [0, 1]]);
    const ccw = polygonArea([[0, 0], [0, 1], [1, 1], [1, 0]]);
    expect(cw).toBeCloseTo(ccw);
  });
});

/* ------------------------------------------------------------------ */
/* distance2D                                                          */
/* ------------------------------------------------------------------ */

describe("distance2D", () => {
  it("returns 0 for same point", () => {
    expect(distance2D([3, 4], [3, 4])).toBe(0);
  });

  it("calculates horizontal distance", () => {
    expect(distance2D([0, 0], [5, 0])).toBe(5);
  });

  it("calculates vertical distance", () => {
    expect(distance2D([0, 0], [0, 7])).toBe(7);
  });

  it("calculates diagonal distance (3-4-5 triangle)", () => {
    expect(distance2D([0, 0], [3, 4])).toBeCloseTo(5);
  });

  it("works with negative coordinates", () => {
    expect(distance2D([-1, -1], [2, 3])).toBeCloseTo(5);
  });
});

/* ------------------------------------------------------------------ */
/* snapToGrid                                                          */
/* ------------------------------------------------------------------ */

describe("snapToGrid", () => {
  it("snaps to nearest 0.5 grid", () => {
    expect(snapToGrid(1.3, 0.5)).toBeCloseTo(1.5);
    expect(snapToGrid(1.2, 0.5)).toBeCloseTo(1.0);
  });

  it("snaps to nearest 1.0 grid", () => {
    expect(snapToGrid(2.7, 1)).toBe(3);
    expect(snapToGrid(2.3, 1)).toBe(2);
  });

  it("snaps exact values to themselves", () => {
    expect(snapToGrid(3.0, 0.5)).toBeCloseTo(3.0);
  });

  it("handles negative values", () => {
    expect(snapToGrid(-1.3, 0.5)).toBeCloseTo(-1.5);
    expect(snapToGrid(-1.2, 0.5)).toBeCloseTo(-1.0);
  });

  it("handles zero", () => {
    expect(snapToGrid(0, 0.25)).toBe(0);
  });

  it("snaps to a fine grid (0.1)", () => {
    expect(snapToGrid(1.37, 0.1)).toBeCloseTo(1.4);
  });
});

/* ------------------------------------------------------------------ */
/* snapPointToGrid                                                     */
/* ------------------------------------------------------------------ */

describe("snapPointToGrid", () => {
  it("snaps both coordinates", () => {
    const result = snapPointToGrid([1.3, 2.7], 0.5);
    expect(result[0]).toBeCloseTo(1.5);
    expect(result[1]).toBeCloseTo(2.5);
  });

  it("handles negative coordinates", () => {
    const result = snapPointToGrid([-0.8, -3.2], 1);
    expect(result[0]).toBe(-1);
    expect(result[1]).toBe(-3);
  });

  it("exact grid values stay the same", () => {
    const result = snapPointToGrid([2, 4], 0.5);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(4);
  });
});

/* ------------------------------------------------------------------ */
/* polygonCentroid                                                     */
/* ------------------------------------------------------------------ */

describe("polygonCentroid", () => {
  it("returns [0,0] for empty array", () => {
    const [cx, cy] = polygonCentroid([]);
    expect(cx).toBe(0);
    expect(cy).toBe(0);
  });

  it("returns the point itself for a single point", () => {
    const [cx, cy] = polygonCentroid([[5, 7]]);
    expect(cx).toBe(5);
    expect(cy).toBe(7);
  });

  it("calculates centroid of a triangle", () => {
    const [cx, cy] = polygonCentroid([[0, 0], [6, 0], [3, 6]]);
    expect(cx).toBeCloseTo(3);
    expect(cy).toBeCloseTo(2);
  });

  it("calculates centroid of a square", () => {
    const [cx, cy] = polygonCentroid([[0, 0], [4, 0], [4, 4], [0, 4]]);
    expect(cx).toBeCloseTo(2);
    expect(cy).toBeCloseTo(2);
  });

  it("calculates centroid with offset coordinates", () => {
    // Square from (2,2) to (6,6), centroid should be (4,4)
    const [cx, cy] = polygonCentroid([[2, 2], [6, 2], [6, 6], [2, 6]]);
    expect(cx).toBeCloseTo(4);
    expect(cy).toBeCloseTo(4);
  });
});

/* ------------------------------------------------------------------ */
/* computeSceneBounds                                                  */
/* ------------------------------------------------------------------ */

describe("computeSceneBounds", () => {
  // Test helper: computeSceneBounds only reads `type`, `start`, `end`,
  // `polygon`, and `position` — we cast partial objects for brevity.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bounds = (nodes: Record<string, any>) => computeSceneBounds(nodes);

  it("returns null for empty nodes", () => {
    expect(bounds({})).toBeNull();
  });

  it("computes bounds from wall nodes", () => {
    const result = bounds({
      w1: { type: "wall", start: [0, 0], end: [10, 0] },
      w2: { type: "wall", start: [10, 0], end: [10, 8] },
    });
    expect(result).not.toBeNull();
    expect(result!.minX).toBe(0);
    expect(result!.maxX).toBe(10);
    expect(result!.minZ).toBe(0);
    expect(result!.maxZ).toBe(8);
    expect(result!.centerX).toBe(5);
    expect(result!.centerZ).toBe(4);
    expect(result!.width).toBe(10);
    expect(result!.depth).toBe(8);
  });

  it("computes bounds from zone polygons", () => {
    const result = bounds({
      z1: {
        type: "zone",
        polygon: [[1, 1], [5, 1], [5, 4], [1, 4]],
      },
    });
    expect(result).not.toBeNull();
    expect(result!.minX).toBe(1);
    expect(result!.maxX).toBe(5);
    expect(result!.minZ).toBe(1);
    expect(result!.maxZ).toBe(4);
  });

  it("computes bounds from item positions (uses position[0] as X and position[2] as Z)", () => {
    const result = bounds({
      i1: { type: "item", position: [3, 0, 7] },
      i2: { type: "item", position: [8, 0, 2] },
    });
    expect(result).not.toBeNull();
    expect(result!.minX).toBe(3);
    expect(result!.maxX).toBe(8);
    expect(result!.minZ).toBe(2);
    expect(result!.maxZ).toBe(7);
  });

  it("combines bounds from mixed node types", () => {
    const result = bounds({
      w1: { type: "wall", start: [0, 0], end: [10, 0] },
      z1: { type: "zone", polygon: [[2, 2], [8, 2], [8, 12], [2, 12]] },
      i1: { type: "item", position: [-1, 0, 5] },
    });
    expect(result).not.toBeNull();
    expect(result!.minX).toBe(-1); // item is leftmost
    expect(result!.maxX).toBe(10); // wall end
    expect(result!.minZ).toBe(0);  // wall start
    expect(result!.maxZ).toBe(12); // zone polygon
  });

  it("ignores unknown node types", () => {
    expect(bounds({ x1: { type: "unknown_thing", data: "foo" } })).toBeNull();
  });
});

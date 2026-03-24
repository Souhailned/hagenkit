"use server";

import { z } from "zod";
import { generateText } from "ai";
import { requirePermission } from "@/lib/session";
import type { ActionResult } from "@/types/actions";
import type {
  SceneData,
  ZoneNode,
  WallNode,
  ItemNode,
  HorecaZoneType,
  HorecaItemType,
  AnyNode,
} from "@/lib/editor/schema";
import {
  ZONE_COLORS,
  ITEM_DEFAULTS,
  DEFAULT_WALL_HEIGHT,
  DEFAULT_WALL_THICKNESS,
} from "@/lib/editor/schema";

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const generateFloorPlanSchema = z.object({
  surfaceTotal: z.number().min(10).max(10000),
  propertyType: z.string(),
  floors: z.number().int().min(1).max(5).default(1),
  seatingCapacityInside: z.number().optional(),
  hasTerrace: z.boolean().default(false),
  hasKitchen: z.boolean().default(true),
  hasStorage: z.boolean().default(true),
});

type GenerateFloorPlanInput = z.infer<typeof generateFloorPlanSchema>;

// ---------------------------------------------------------------------------
// LLM provider
// ---------------------------------------------------------------------------

async function getModel() {
  if (process.env.GROQ_API_KEY) {
    const { createGroq } = await import("@ai-sdk/groq");
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return groq("llama-3.3-70b-versatile");
  }
  if (process.env.OPENAI_API_KEY) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o-mini");
  }
  return null;
}

// ---------------------------------------------------------------------------
// Property type labels for the prompt
// ---------------------------------------------------------------------------

const typeLabels: Record<string, string> = {
  RESTAURANT: "restaurant",
  CAFE: "café",
  BAR: "bar",
  HOTEL: "hotel",
  EETCAFE: "eetcafé",
  LUNCHROOM: "lunchroom",
  KOFFIEBAR: "koffiebar",
  PIZZERIA: "pizzeria",
  BAKERY: "bakkerij",
  DARK_KITCHEN: "dark kitchen",
  SNACKBAR: "snackbar",
  GRAND_CAFE: "grand café",
  COCKTAILBAR: "cocktailbar",
  NIGHTCLUB: "nachtclub",
};

// ---------------------------------------------------------------------------
// Valid zone / item types (for filtering LLM output)
// ---------------------------------------------------------------------------

const VALID_ZONE_TYPES = new Set<string>([
  "dining_area",
  "bar_area",
  "kitchen",
  "storage",
  "terrace",
  "entrance",
  "restroom",
  "office",
  "prep_area",
  "walk_in_cooler",
  "seating_outside",
  "hallway",
]);

const VALID_ITEM_TYPES = new Set<string>([
  "table_round",
  "table_square",
  "table_long",
  "chair",
  "barstool",
  "bar_counter",
  "kitchen_counter",
  "oven",
  "stove",
  "fridge",
  "sink",
  "coffee_machine",
  "display_case",
  "register",
  "booth",
  "planter",
  "parasol",
]);

// ---------------------------------------------------------------------------
// LLM prompt
// ---------------------------------------------------------------------------

function buildPrompt(input: GenerateFloorPlanInput): string {
  const type = typeLabels[input.propertyType] || input.propertyType.toLowerCase();
  const widthEstimate = Math.round(Math.sqrt(input.surfaceTotal) * 1.2);
  const lengthEstimate = Math.round(input.surfaceTotal / widthEstimate);

  return `You are a horeca floor plan generator. Generate a realistic JSON floor plan layout for a ${type}.

Property details:
- Total surface: ${input.surfaceTotal} m²
- Estimated building dimensions: approx ${widthEstimate}m wide x ${lengthEstimate}m deep
- Floors: ${input.floors}
- Seating capacity inside: ${input.seatingCapacityInside ?? "not specified"}
- Has terrace: ${input.hasTerrace}
- Has kitchen: ${input.hasKitchen}
- Has storage: ${input.hasStorage}

Output ONLY valid JSON matching this exact structure (no text before or after):

{
  "buildingWidth": <number in meters>,
  "buildingLength": <number in meters>,
  "zones": [
    {
      "type": "<zone_type>",
      "x": <x offset in meters from origin>,
      "y": <y offset in meters from origin>,
      "width": <width in meters>,
      "length": <length in meters>
    }
  ],
  "items": [
    {
      "type": "<item_type>",
      "x": <x position in meters>,
      "y": <y position in meters>,
      "rotation": <rotation in degrees, 0 or 90>
    }
  ]
}

Valid zone types: dining_area, bar_area, kitchen, storage, terrace, entrance, restroom, office, prep_area, walk_in_cooler, seating_outside, hallway.
Valid item types: table_round, table_square, table_long, chair, barstool, bar_counter, kitchen_counter, oven, stove, fridge, sink, coffee_machine, display_case, register, booth, planter, parasol.

Rules:
- Zones should tile to fill the building without overlapping
- Include an entrance zone near y=0
- Kitchen goes in the back if present
- Add appropriate furniture items inside each zone
- Place tables and chairs in dining areas, bar stools and bar counter in bar areas, kitchen equipment in kitchens
- For a restaurant with ${input.seatingCapacityInside ?? 40} seats, include roughly ${Math.ceil((input.seatingCapacityInside ?? 40) / 4)} tables and ${input.seatingCapacityInside ?? 40} chairs in dining areas
- Keep item positions within their respective zone boundaries
- All coordinates in meters from origin (0,0)`;
}

// ---------------------------------------------------------------------------
// LLM response types (what we expect back)
// ---------------------------------------------------------------------------

interface LlmZone {
  type: string;
  x: number;
  y: number;
  width: number;
  length: number;
}

interface LlmItem {
  type: string;
  x: number;
  y: number;
  rotation?: number;
}

interface LlmFloorPlan {
  buildingWidth: number;
  buildingLength: number;
  zones: LlmZone[];
  items: LlmItem[];
}

// ---------------------------------------------------------------------------
// Transform LLM output → SceneData
// ---------------------------------------------------------------------------

function transformToSceneData(plan: LlmFloorPlan): SceneData {
  const nodes: Record<string, AnyNode> = {};
  const rootNodeIds: string[] = [];

  const id = () => crypto.randomUUID();

  // --- Perimeter walls ---
  const w = plan.buildingWidth;
  const l = plan.buildingLength;
  const t = DEFAULT_WALL_THICKNESS;
  const h = DEFAULT_WALL_HEIGHT;

  const perimeterSegments: { start: [number, number]; end: [number, number] }[] = [
    { start: [0, 0], end: [w, 0] },       // bottom
    { start: [w, 0], end: [w, l] },        // right
    { start: [w, l], end: [0, l] },        // top
    { start: [0, l], end: [0, 0] },        // left
  ];

  for (const seg of perimeterSegments) {
    const wallId = id();
    const wall: WallNode = {
      id: wallId,
      type: "wall",
      parentId: null,
      visible: true,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      start: seg.start,
      end: seg.end,
      thickness: t,
      height: h,
      material: "brick",
    };
    nodes[wallId] = wall;
    rootNodeIds.push(wallId);
  }

  // --- Zones ---
  for (const z of plan.zones) {
    if (!VALID_ZONE_TYPES.has(z.type)) continue;

    const zoneType = z.type as HorecaZoneType;
    const zoneId = id();
    const zw = Math.max(z.width, 1);
    const zl = Math.max(z.length, 1);
    const zx = z.x;
    const zy = z.y;

    const polygon: [number, number][] = [
      [zx, zy],
      [zx + zw, zy],
      [zx + zw, zy + zl],
      [zx, zy + zl],
    ];

    const zone: ZoneNode = {
      id: zoneId,
      type: "zone",
      parentId: null,
      visible: true,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      zoneType,
      polygon,
      area: zw * zl,
      color: ZONE_COLORS[zoneType],
    };
    nodes[zoneId] = zone;
    rootNodeIds.push(zoneId);

    // Add interior walls between zones (simplified: one wall on the right and top edge)
    // We skip this to avoid doubling walls — perimeter is sufficient for a generated plan.
  }

  // --- Items ---
  for (const item of plan.items) {
    if (!VALID_ITEM_TYPES.has(item.type)) continue;

    const itemType = item.type as HorecaItemType;
    const defaults = ITEM_DEFAULTS[itemType];
    const itemId = id();
    const rotY = item.rotation === 90 ? Math.PI / 2 : 0;

    const itemNode: ItemNode = {
      id: itemId,
      type: "item",
      parentId: null,
      visible: true,
      position: [item.x, 0, item.y],
      rotation: [0, rotY, 0],
      itemType,
      width: defaults.width,
      depth: defaults.depth,
      height: defaults.height,
    };
    nodes[itemId] = itemNode;
    rootNodeIds.push(itemId);
  }

  return { nodes, rootNodeIds };
}

// ---------------------------------------------------------------------------
// Fallback generator (when no LLM is available)
// ---------------------------------------------------------------------------

function generateFallbackPlan(input: GenerateFloorPlanInput): SceneData {
  const w = Math.round(Math.sqrt(input.surfaceTotal) * 1.2);
  const l = Math.round(input.surfaceTotal / w);

  const zones: LlmZone[] = [];
  let yOffset = 0;

  // Entrance
  zones.push({ type: "entrance", x: 0, y: yOffset, width: w, length: 2 });
  yOffset += 2;

  // Restroom
  zones.push({ type: "restroom", x: 0, y: yOffset, width: 3, length: 3 });

  // Dining area
  const diningWidth = w - (input.hasKitchen ? 0 : 0);
  const kitchenLength = input.hasKitchen ? Math.max(4, Math.round(l * 0.25)) : 0;
  const storageLength = input.hasStorage ? Math.max(2, Math.round(l * 0.1)) : 0;
  const diningLength = l - yOffset - kitchenLength - storageLength;

  zones.push({
    type: "dining_area",
    x: 3,
    y: yOffset,
    width: diningWidth - 3,
    length: diningLength,
  });
  yOffset += Math.max(diningLength, 3);

  if (input.hasKitchen) {
    zones.push({ type: "kitchen", x: 0, y: yOffset, width: w, length: kitchenLength });
    yOffset += kitchenLength;
  }

  if (input.hasStorage) {
    zones.push({ type: "storage", x: 0, y: yOffset, width: w, length: storageLength });
    yOffset += storageLength;
  }

  if (input.hasTerrace) {
    zones.push({ type: "terrace", x: 0, y: -4, width: w, length: 4 });
  }

  // Simple items: a few tables in dining area
  const items: LlmItem[] = [];
  const dining = zones.find((z) => z.type === "dining_area");
  if (dining) {
    const tables = Math.min(6, Math.floor((dining.width * dining.length) / 6));
    for (let i = 0; i < tables; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const tx = dining.x + 1.5 + col * 2.5;
      const ty = dining.y + 1.5 + row * 2.5;
      items.push({ type: "table_square", x: tx, y: ty, rotation: 0 });
      // Four chairs around each table
      items.push({ type: "chair", x: tx - 0.6, y: ty, rotation: 0 });
      items.push({ type: "chair", x: tx + 0.6, y: ty, rotation: 0 });
      items.push({ type: "chair", x: tx, y: ty - 0.6, rotation: 90 });
      items.push({ type: "chair", x: tx, y: ty + 0.6, rotation: 90 });
    }
  }

  if (input.hasKitchen) {
    const kitchen = zones.find((z) => z.type === "kitchen");
    if (kitchen) {
      items.push({ type: "kitchen_counter", x: kitchen.x + 1, y: kitchen.y + 1, rotation: 0 });
      items.push({ type: "stove", x: kitchen.x + 3, y: kitchen.y + 1, rotation: 0 });
      items.push({ type: "sink", x: kitchen.x + 4.5, y: kitchen.y + 1, rotation: 0 });
      items.push({ type: "fridge", x: kitchen.x + 6, y: kitchen.y + 1, rotation: 0 });
    }
  }

  return transformToSceneData({
    buildingWidth: w,
    buildingLength: l,
    zones,
    items,
  });
}

// ---------------------------------------------------------------------------
// Parse LLM JSON response (robust)
// ---------------------------------------------------------------------------

function parseLlmResponse(text: string): LlmFloorPlan | null {
  // Try to extract JSON from the response (handle markdown code blocks, etc.)
  let jsonStr = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  // Find the first { ... } block
  const start = jsonStr.indexOf("{");
  const end = jsonStr.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  jsonStr = jsonStr.slice(start, end + 1);

  try {
    const parsed = JSON.parse(jsonStr);

    // Basic validation
    if (
      typeof parsed.buildingWidth !== "number" ||
      typeof parsed.buildingLength !== "number" ||
      !Array.isArray(parsed.zones)
    ) {
      return null;
    }

    return {
      buildingWidth: parsed.buildingWidth,
      buildingLength: parsed.buildingLength,
      zones: Array.isArray(parsed.zones) ? parsed.zones : [],
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

export async function generateAiFloorPlan(
  input: z.input<typeof generateFloorPlanSchema>
): Promise<ActionResult<SceneData>> {
  // 1. Permission check
  const authCheck = await requirePermission("properties:edit-own");
  if (!authCheck.success) {
    return { success: false, error: authCheck.error };
  }

  // 2. Validate input
  const parsed = generateFloorPlanSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Ongeldige invoer: controleer de opgegeven waarden.",
    };
  }

  const validInput = parsed.data;

  // 3. Get LLM model
  const model = await getModel();
  if (!model) {
    // No AI provider — use deterministic fallback
    const fallback = generateFallbackPlan(validInput);
    return { success: true, data: fallback };
  }

  // 4. Generate floor plan via LLM
  try {
    const prompt = buildPrompt(validInput);

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.3,
      maxOutputTokens: 4000,
    });

    // 5. Parse LLM response
    const llmPlan = parseLlmResponse(text);
    if (!llmPlan) {
      console.error("AI floor plan: kon LLM-response niet parsen", text.slice(0, 500));
      // Fallback to deterministic plan
      const fallback = generateFallbackPlan(validInput);
      return { success: true, data: fallback };
    }

    // 6. Transform to SceneData
    const sceneData = transformToSceneData(llmPlan);
    return { success: true, data: sceneData };
  } catch (error) {
    console.error("AI floor plan generatie mislukt:", error);
    // Fallback to deterministic plan on any error
    const fallback = generateFallbackPlan(validInput);
    return { success: true, data: fallback };
  }
}

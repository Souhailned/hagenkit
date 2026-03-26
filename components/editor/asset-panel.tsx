"use client";

import { useState, useMemo } from "react";
import { useEditorStore } from "@/lib/editor/stores";
import { ITEM_DEFAULTS } from "@/lib/editor/schema";
import type { HorecaItemType, AttachTo } from "@/lib/editor/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

type ItemCategory =
  | "meubilair"
  | "keuken"
  | "bar"
  | "sanitair"
  | "terras"
  | "verlichting"
  | "opslag";

const CATEGORIES: {
  id: ItemCategory;
  label: string;
  items: HorecaItemType[];
}[] = [
  {
    id: "meubilair",
    label: "Meubilair",
    items: [
      "table_round",
      "table_square",
      "table_long",
      "chair",
      "barstool",
      "booth",
    ],
  },
  {
    id: "keuken",
    label: "Keuken",
    items: [
      "kitchen_counter",
      "oven",
      "stove",
      "fridge",
      "sink",
      "coffee_machine",
      "display_case",
      "register",
      "exhaust_hood",
      "dishwasher",
      "prep_table",
      "warming_cabinet",
      "freezer",
      "pizza_oven",
      "grill",
      "deep_fryer",
    ],
  },
  {
    id: "bar",
    label: "Bar",
    items: [
      "bar_counter",
      "beer_tap",
      "wine_cooler",
      "ice_machine",
      "glass_washer",
      "cocktail_station",
      "espresso_machine",
    ],
  },
  {
    id: "sanitair",
    label: "Sanitair",
    items: ["toilet", "urinal", "hand_basin", "mirror_cabinet"],
  },
  {
    id: "terras",
    label: "Terras",
    items: [
      "parasol",
      "planter",
      "terrace_heater",
      "windscreen",
      "outdoor_table",
      "outdoor_chair",
      "flower_box",
    ],
  },
  {
    id: "verlichting",
    label: "Verlichting",
    items: [
      "ceiling_light",
      "wall_light",
      "airco_unit",
      "ventilation",
      "smoke_detector",
      "fire_extinguisher",
    ],
  },
  {
    id: "opslag",
    label: "Opslag",
    items: ["shelf_unit", "storage_rack", "coat_rack"],
  },
];

// ---------------------------------------------------------------------------
// Attachment type icons (small indicator per item)
// ---------------------------------------------------------------------------

/** Small inline SVG icon showing attachment type */
function AttachIcon({ attachTo }: { attachTo?: AttachTo }) {
  if (!attachTo || attachTo === "floor") return null;

  // Wall icon: small rectangle on left side
  if (attachTo === "wall") {
    return (
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-blue-500/20 text-blue-600"
        title="Wandmontage"
      >
        <svg
          viewBox="0 0 12 12"
          className="h-2.5 w-2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <rect x="1" y="1" width="3" height="10" rx="0.5" />
          <rect x="5" y="4" width="6" height="4" rx="0.5" />
        </svg>
      </span>
    );
  }

  // Ceiling icon: rectangle hanging from top
  if (attachTo === "ceiling") {
    return (
      <span
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm bg-amber-500/20 text-amber-600"
        title="Plafondmontage"
      >
        <svg
          viewBox="0 0 12 12"
          className="h-2.5 w-2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <line x1="1" y1="1.5" x2="11" y2="1.5" />
          <rect x="3" y="2.5" width="6" height="5" rx="0.5" />
        </svg>
      </span>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssetPanel() {
  const [activeCategory, setActiveCategory] =
    useState<ItemCategory>("meubilair");
  const [search, setSearch] = useState("");
  const startPlacingItem = useEditorStore((s) => s.startPlacingItem);
  const placingItemType = useEditorStore((s) => s.placingItemType);

  const category = CATEGORIES.find((c) => c.id === activeCategory)!;

  // Filter items based on search query (matches against Dutch label)
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return category.items;
    return category.items.filter((itemType) => {
      const def = ITEM_DEFAULTS[itemType];
      return def.label.toLowerCase().includes(query);
    });
  }, [category.items, search]);

  // When search is active, show matches across ALL categories
  const crossCategoryResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return null;
    const allItems: HorecaItemType[] = [];
    for (const cat of CATEGORIES) {
      for (const itemType of cat.items) {
        const def = ITEM_DEFAULTS[itemType];
        if (def.label.toLowerCase().includes(query)) {
          allItems.push(itemType);
        }
      }
    }
    return allItems;
  }, [search]);

  const itemsToShow = crossCategoryResults ?? filteredItems;

  return (
    <div className="flex h-full w-[200px] flex-col border-r border-border bg-background">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold text-foreground">Inventaris</h2>
      </div>

      {/* Search input */}
      <div className="border-b border-border px-2 py-1.5">
        <Input
          type="text"
          placeholder="Zoek items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      {/* Category tabs (hidden when search is active) */}
      {!crossCategoryResults && (
        <div className="flex flex-wrap gap-1 border-b border-border px-2 py-1.5">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "ghost"}
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      )}

      {/* Items grid */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-1.5 p-2">
          {itemsToShow.map((itemType) => {
            const def = ITEM_DEFAULTS[itemType];
            const isActive = placingItemType === itemType;

            return (
              <button
                key={itemType}
                onClick={() => startPlacingItem(itemType)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border border-border p-2 text-center transition-colors hover:bg-accent",
                  isActive &&
                    "border-primary bg-primary/10 ring-1 ring-primary",
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                  {def.width.toFixed(1)}m
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] leading-tight text-foreground">
                    {def.label}
                  </span>
                  <AttachIcon attachTo={"attachTo" in def ? def.attachTo : undefined} />
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {def.width}&times;{def.depth}m
                </span>
              </button>
            );
          })}

          {itemsToShow.length === 0 && (
            <div className="col-span-2 py-4 text-center text-xs text-muted-foreground">
              Geen items gevonden
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

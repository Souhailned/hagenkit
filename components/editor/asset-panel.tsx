"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ITEM_DEFAULTS } from "@/lib/editor/schema";
import type { HorecaItemType } from "@/lib/editor/schema";
import { useEditorStore } from "@/lib/editor/stores";
import { cn } from "@/lib/utils";

interface AssetCategory {
  label: string;
  items: HorecaItemType[];
}

const CATEGORIES: AssetCategory[] = [
  {
    label: "Tafels",
    items: ["table_round", "table_square", "table_long"],
  },
  {
    label: "Zitplaatsen",
    items: ["chair", "barstool", "booth"],
  },
  {
    label: "Bar",
    items: ["bar_counter"],
  },
  {
    label: "Keuken",
    items: [
      "kitchen_counter",
      "oven",
      "stove",
      "fridge",
      "sink",
      "coffee_machine",
    ],
  },
  {
    label: "Overig",
    items: ["display_case", "register", "planter", "parasol"],
  },
];

function formatDimensions(w: number, d: number): string {
  return `${(w * 100).toFixed(0)}×${(d * 100).toFixed(0)} cm`;
}

interface CategorySectionProps {
  category: AssetCategory;
  defaultOpen?: boolean;
}

function CategorySection({ category, defaultOpen = true }: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const startPlacingItem = useEditorStore((s) => s.startPlacingItem);
  const placingItemType = useEditorStore((s) => s.placingItemType);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        {open ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronRight className="size-3.5" />
        )}
        {category.label}
        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
          {category.items.length}
        </Badge>
      </button>
      {open && (
        <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">
          {category.items.map((itemType) => {
            const defaults = ITEM_DEFAULTS[itemType];
            const isActive = placingItemType === itemType;

            return (
              <button
                key={itemType}
                type="button"
                onClick={() => startPlacingItem(itemType)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary/10 text-primary ring-1 ring-primary/20"
                )}
              >
                <span className="truncate font-medium">{defaults.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDimensions(defaults.width, defaults.depth)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AssetPanel() {
  return (
    <div className="flex h-full w-[200px] flex-col border-r border-border bg-background">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold text-foreground">Inventaris</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-1">
          {CATEGORIES.map((category) => (
            <CategorySection key={category.label} category={category} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

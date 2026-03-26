"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore, useSceneStore } from "@/lib/editor/stores";
import { ZONE_LABELS, ITEM_DEFAULTS } from "@/lib/editor/schema";
import type {
  WallNode,
  ZoneNode,
  ItemNode,
  AnyNode,
  WallMaterial,
  HorecaZoneType,
  HorecaItemType,
  AttachTo,
} from "@/lib/editor/schema";
import { cn } from "@/lib/utils";

// ---- helpers ----

function parseNum(value: string, fallback: number): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ---- sub-components ----

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function FieldRow({ label, children, className }: FieldRowProps) {
  return (
    <div className={cn("grid grid-cols-[80px_1fr] items-center gap-2", className)}>
      <Label className="text-xs text-muted-foreground truncate">{label}</Label>
      {children}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  readOnly?: boolean;
}

function NumberField({
  label,
  value,
  onChange,
  step = 0.01,
  min = 0,
  max,
  unit,
  readOnly,
}: NumberFieldProps) {
  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={value.toFixed(2)}
          onChange={(e) => onChange(parseNum(e.target.value, value))}
          step={step}
          min={min}
          max={max}
          readOnly={readOnly}
          className="h-7 text-xs"
        />
        {unit && (
          <span className="text-xs text-muted-foreground shrink-0">{unit}</span>
        )}
      </div>
    </FieldRow>
  );
}

// ---- Wall properties ----

function WallProperties({ node }: { node: WallNode }) {
  const updateNode = useSceneStore((s) => s.updateNode);

  const update = useCallback(
    (updates: Partial<WallNode>) => updateNode(node.id, updates),
    [node.id, updateNode]
  );

  const WALL_MATERIALS: { value: WallMaterial; label: string }[] = [
    { value: "brick", label: "Baksteen" },
    { value: "glass", label: "Glas" },
    { value: "drywall", label: "Gipsplaat" },
    { value: "concrete", label: "Beton" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Muur
      </h3>

      {/* Start / End coords */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground">Startpunt</span>
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField
            label="X"
            value={node.start[0]}
            onChange={(v) => update({ start: [v, node.start[1]] })}
            unit="m"
          />
          <NumberField
            label="Y"
            value={node.start[1]}
            onChange={(v) => update({ start: [node.start[0], v] })}
            unit="m"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground">Eindpunt</span>
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField
            label="X"
            value={node.end[0]}
            onChange={(v) => update({ end: [v, node.end[1]] })}
            unit="m"
          />
          <NumberField
            label="Y"
            value={node.end[1]}
            onChange={(v) => update({ end: [node.end[0], v] })}
            unit="m"
          />
        </div>
      </div>

      <Separator />

      {/* Thickness slider */}
      <FieldRow label="Dikte">
        <div className="flex items-center gap-2">
          <Slider
            value={[node.thickness]}
            onValueChange={([v]) => update({ thickness: v })}
            min={0.05}
            max={0.5}
            step={0.01}
            className="flex-1"
          />
          <span className="w-12 text-right text-xs text-muted-foreground">
            {(node.thickness * 100).toFixed(0)} cm
          </span>
        </div>
      </FieldRow>

      {/* Height */}
      <NumberField
        label="Hoogte"
        value={node.height}
        onChange={(v) => update({ height: v })}
        step={0.1}
        min={0.5}
        max={6}
        unit="m"
      />

      {/* Material */}
      <FieldRow label="Materiaal">
        <Select
          value={node.material}
          onValueChange={(v) => update({ material: v as WallMaterial })}
        >
          <SelectTrigger size="sm" className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WALL_MATERIALS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>
    </div>
  );
}

// ---- Zone properties ----

function ZoneProperties({ node }: { node: ZoneNode }) {
  const updateNode = useSceneStore((s) => s.updateNode);

  const update = useCallback(
    (updates: Partial<ZoneNode>) => updateNode(node.id, updates),
    [node.id, updateNode]
  );

  const zoneTypeEntries = Object.entries(ZONE_LABELS) as [HorecaZoneType, string][];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Zone
      </h3>

      {/* Zone type */}
      <FieldRow label="Type">
        <Select
          value={node.zoneType}
          onValueChange={(v) => update({ zoneType: v as HorecaZoneType })}
        >
          <SelectTrigger size="sm" className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zoneTypeEntries.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <Separator />

      {/* Read-only info */}
      <FieldRow label="Punten">
        <span className="text-xs text-foreground">{node.polygon.length}</span>
      </FieldRow>
      <FieldRow label="Oppervlakte">
        <span className="text-xs text-foreground">
          {node.area.toFixed(1)} m&sup2;
        </span>
      </FieldRow>
      <FieldRow label="Capaciteit">
        <Input
          type="number"
          value={node.capacity ?? 0}
          onChange={(e) =>
            update({ capacity: parseNum(e.target.value, 0) })
          }
          min={0}
          step={1}
          className="h-7 text-xs"
        />
      </FieldRow>
    </div>
  );
}

// ---- Item properties ----

function ItemProperties({ node }: { node: ItemNode }) {
  const updateNode = useSceneStore((s) => s.updateNode);

  const update = useCallback(
    (updates: Partial<ItemNode>) => updateNode(node.id, updates),
    [node.id, updateNode]
  );

  const itemTypeEntries = Object.entries(ITEM_DEFAULTS) as [
    HorecaItemType,
    (typeof ITEM_DEFAULTS)[HorecaItemType],
  ][];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Inventaris
      </h3>

      {/* Item type */}
      <FieldRow label="Type">
        <Select
          value={node.itemType}
          onValueChange={(v) => {
            const itemType = v as HorecaItemType;
            const defaults = ITEM_DEFAULTS[itemType];
            update({
              itemType,
              width: defaults.width,
              depth: defaults.depth,
              height: defaults.height,
            });
          }}
        >
          <SelectTrigger size="sm" className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {itemTypeEntries.map(([value, def]) => (
              <SelectItem key={value} value={value}>
                {def.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      <Separator />

      {/* Dimensions */}
      <span className="text-xs font-medium text-foreground">Afmetingen</span>
      <NumberField
        label="Breedte"
        value={node.width}
        onChange={(v) => update({ width: v })}
        step={0.05}
        min={0.1}
        max={10}
        unit="m"
      />
      <NumberField
        label="Diepte"
        value={node.depth}
        onChange={(v) => update({ depth: v })}
        step={0.05}
        min={0.1}
        max={10}
        unit="m"
      />
      <NumberField
        label="Hoogte"
        value={node.height}
        onChange={(v) => update({ height: v })}
        step={0.05}
        min={0.1}
        max={5}
        unit="m"
      />

      <Separator />

      {/* Attachment */}
      <FieldRow label="Bevestiging">
        <Select
          value={node.attachTo ?? "floor"}
          onValueChange={(v) => update({ attachTo: v as AttachTo })}
        >
          <SelectTrigger size="sm" className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="floor">Vloer</SelectItem>
            <SelectItem value="wall">Muur</SelectItem>
            <SelectItem value="ceiling">Plafond</SelectItem>
            <SelectItem value="none">Vrij</SelectItem>
          </SelectContent>
        </Select>
      </FieldRow>

      <Separator />

      {/* Position */}
      <span className="text-xs font-medium text-foreground">Positie</span>
      <NumberField
        label="X"
        value={node.position[0]}
        onChange={(v) =>
          update({ position: [v, node.position[1], node.position[2]] })
        }
        unit="m"
      />
      <NumberField
        label="Y"
        value={node.position[1]}
        onChange={(v) =>
          update({ position: [node.position[0], v, node.position[2]] })
        }
        unit="m"
      />
      <NumberField
        label="Z"
        value={node.position[2]}
        onChange={(v) =>
          update({ position: [node.position[0], node.position[1], v] })
        }
        unit="m"
      />
    </div>
  );
}

// ---- Main panel ----

function NodeProperties({ node }: { node: AnyNode }) {
  switch (node.type) {
    case "wall":
      return <WallProperties node={node} />;
    case "zone":
      return <ZoneProperties node={node} />;
    case "item":
      return <ItemProperties node={node} />;
    default:
      return (
        <p className="text-xs text-muted-foreground">
          Geen bewerkbare eigenschappen.
        </p>
      );
  }
}

export function PropertiesPanel() {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const nodes = useSceneStore((s) => s.nodes);

  const selectedNode =
    selectedNodeIds.length === 1 ? nodes[selectedNodeIds[0]] : null;

  return (
    <div className="flex h-full w-[250px] flex-col border-l border-border bg-background">
      <div className="border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold text-foreground">
          Eigenschappen
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3">
          {selectedNodeIds.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Selecteer een element
              </p>
              <p className="text-xs text-muted-foreground/70">
                Klik op een muur, zone of item om de eigenschappen te bewerken.
              </p>
            </div>
          )}
          {selectedNodeIds.length > 1 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {selectedNodeIds.length} elementen geselecteerd
              </p>
              <p className="text-xs text-muted-foreground/70">
                Selecteer een enkel element om de eigenschappen te bewerken.
              </p>
            </div>
          )}
          {selectedNode && <NodeProperties node={selectedNode} />}
        </div>
      </ScrollArea>
    </div>
  );
}

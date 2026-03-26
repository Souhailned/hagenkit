"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import { useEditorStore, useSceneStore } from "@/lib/editor/stores";
import type { EditorTool, EditorPhase, ViewMode, LevelMode } from "@/lib/editor/stores";
import { editorEmitter } from "@/lib/editor/events";
import {
  MousePointer2,
  Square,
  PenTool,
  Armchair,
  Ruler,
  Move,
  Undo2,
  Redo2,
  Grid3X3,
  Save,
  Box,
  Layers2,
  DoorOpen,
  AppWindow,
  Trash2,
  Copy,
  ClipboardPaste,
  RotateCw,
  Hammer,
  Sofa,
  ArrowUp,
  ArrowDown,
  RectangleHorizontal,
  SquareDashed,
} from "lucide-react";

interface CommandPaletteProps {
  onSave?: () => void;
}

export function CommandPalette({ onSave }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  // Listen for Cmd+K and tool:activate command-palette event
  useEffect(() => {
    const handleToolActivate = (payload: { tool: string }) => {
      if (payload.tool === "command-palette") {
        setOpen(true);
      }
    };
    editorEmitter.on("tool:activate", handleToolActivate);
    return () => {
      editorEmitter.off("tool:activate", handleToolActivate);
    };
  }, []);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [],
  );

  const store = useEditorStore;
  const sceneStore = useSceneStore;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Zoek een commando..." />
      <CommandList>
        <CommandEmpty>Geen resultaten gevonden.</CommandEmpty>

        {/* ── Tools ─────────────────────────────────────────── */}
        <CommandGroup heading="Gereedschappen">
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("select"))}
          >
            <MousePointer2 className="mr-2 size-4" />
            <span>Selecteren</span>
            <CommandShortcut>Esc</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("wall"))}
          >
            <Square className="mr-2 size-4" />
            <span>Muur tekenen</span>
            <CommandShortcut>W</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("zone"))}
          >
            <PenTool className="mr-2 size-4" />
            <span>Zone tekenen</span>
            <CommandShortcut>Q</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("door"))}
          >
            <DoorOpen className="mr-2 size-4" />
            <span>Deur plaatsen</span>
            <CommandShortcut>D</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("window"))}
          >
            <AppWindow className="mr-2 size-4" />
            <span>Raam plaatsen</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("slab"))}
          >
            <RectangleHorizontal className="mr-2 size-4" />
            <span>Vloer tekenen</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("ceiling"))}
          >
            <SquareDashed className="mr-2 size-4" />
            <span>Plafond tekenen</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("item"))}
          >
            <Armchair className="mr-2 size-4" />
            <span>Inventaris plaatsen</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("measure"))}
          >
            <Ruler className="mr-2 size-4" />
            <span>Opmeten</span>
            <CommandShortcut>M</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => store.getState().setTool("pan"))}
          >
            <Move className="mr-2 size-4" />
            <span>Verplaatsen</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ── Acties ─────────────────────────────────────────── */}
        <CommandGroup heading="Acties">
          {onSave && (
            <CommandItem onSelect={() => runCommand(onSave)}>
              <Save className="mr-2 size-4" />
              <span>Opslaan</span>
              <CommandShortcut>Ctrl+S</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem
            onSelect={() =>
              runCommand(() => sceneStore.temporal.getState().undo())
            }
          >
            <Undo2 className="mr-2 size-4" />
            <span>Ongedaan maken</span>
            <CommandShortcut>Ctrl+Z</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => sceneStore.temporal.getState().redo())
            }
          >
            <Redo2 className="mr-2 size-4" />
            <span>Opnieuw uitvoeren</span>
            <CommandShortcut>Ctrl+Y</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().copySelection())
            }
          >
            <Copy className="mr-2 size-4" />
            <span>Kopieren</span>
            <CommandShortcut>Ctrl+C</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().pasteClipboard())
            }
          >
            <ClipboardPaste className="mr-2 size-4" />
            <span>Plakken</span>
            <CommandShortcut>Ctrl+V</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const allIds = Object.keys(sceneStore.getState().nodes);
                for (const id of allIds) {
                  store.getState().selectNode(id, true);
                }
              })
            }
          >
            <span className="mr-2 size-4 flex items-center justify-center text-xs font-bold">A</span>
            <span>Alles selecteren</span>
            <CommandShortcut>Ctrl+A</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const ids = store.getState().selectedNodeIds;
                for (const id of ids) {
                  sceneStore.getState().deleteNode(id);
                }
                store.getState().clearSelection();
              })
            }
          >
            <Trash2 className="mr-2 size-4" />
            <span>Selectie verwijderen</span>
            <CommandShortcut>Delete</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const ids = store.getState().selectedNodeIds;
                for (const id of ids) {
                  const node = sceneStore.getState().nodes[id];
                  if (node?.type === "item") {
                    sceneStore.getState().updateNode(id, {
                      rotation: [
                        node.rotation[0],
                        node.rotation[1] + Math.PI / 2,
                        node.rotation[2],
                      ],
                    });
                  }
                }
              })
            }
          >
            <RotateCw className="mr-2 size-4" />
            <span>Selectie 90\u00B0 draaien</span>
            <CommandShortcut>R</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ── Weergave ───────────────────────────────────────── */}
        <CommandGroup heading="Weergave">
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setViewMode("2d"))
            }
          >
            <Layers2 className="mr-2 size-4" />
            <span>2D weergave</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setViewMode("3d"))
            }
          >
            <Box className="mr-2 size-4" />
            <span>3D weergave</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().toggleGrid())
            }
          >
            <Grid3X3 className="mr-2 size-4" />
            <span>Raster aan/uit</span>
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ── Fase ───────────────────────────────────────────── */}
        <CommandGroup heading="Fase">
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setPhase("structure"))
            }
          >
            <Hammer className="mr-2 size-4" />
            <span>Structuur</span>
            <CommandShortcut>1</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setPhase("furnish"))
            }
          >
            <Sofa className="mr-2 size-4" />
            <span>Inrichting</span>
            <CommandShortcut>2</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* ── Verdieping ─────────────────────────────────────── */}
        <CommandGroup heading="Verdieping">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const s = store.getState();
                s.setActiveLevel(s.activeLevelIndex + 1);
              })
            }
          >
            <ArrowUp className="mr-2 size-4" />
            <span>Volgende verdieping</span>
            <CommandShortcut>Ctrl+Up</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                const s = store.getState();
                s.setActiveLevel(Math.max(0, s.activeLevelIndex - 1));
              })
            }
          >
            <ArrowDown className="mr-2 size-4" />
            <span>Vorige verdieping</span>
            <CommandShortcut>Ctrl+Down</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setLevelMode("stacked"))
            }
          >
            <Layers2 className="mr-2 size-4" />
            <span>Gestapeld</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setLevelMode("exploded"))
            }
          >
            <Layers2 className="mr-2 size-4" />
            <span>Uitgevouwen</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => store.getState().setLevelMode("solo"))
            }
          >
            <Layers2 className="mr-2 size-4" />
            <span>Solo</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

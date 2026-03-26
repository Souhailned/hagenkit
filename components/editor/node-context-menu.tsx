"use client";

import { useCallback, useState, useEffect, type ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEditorStore, useSceneStore } from "@/lib/editor/stores";
import {
  Copy,
  ClipboardPaste,
  Trash2,
  RotateCw,
  CopyPlus,
  Settings2,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react";
import { generateId } from "@/lib/editor/utils";
import type { AnyNode } from "@/lib/editor/schema";

interface NodeContextMenuProps {
  children: ReactNode;
}

export function NodeContextMenu({ children }: NodeContextMenuProps) {
  const [hasSelection, setHasSelection] = useState(false);

  // Subscribe to selection changes
  useEffect(() => {
    const unsub = useEditorStore.subscribe((state) => {
      setHasSelection(state.selectedNodeIds.length > 0);
    });
    return unsub;
  }, []);

  const handleCopy = useCallback(() => {
    useEditorStore.getState().copySelection();
  }, []);

  const handlePaste = useCallback(() => {
    useEditorStore.getState().pasteClipboard();
  }, []);

  const handleDuplicate = useCallback(() => {
    const store = useEditorStore.getState();
    const sceneStore = useSceneStore.getState();
    const { selectedNodeIds } = store;
    const newIds: string[] = [];

    for (const id of selectedNodeIds) {
      const node = sceneStore.nodes[id];
      if (!node) continue;

      const newId = generateId();
      const offset = 0.5;
      const newNode = {
        ...node,
        id: newId,
        position: [
          node.position[0] + offset,
          node.position[1],
          node.position[2] + offset,
        ] as [number, number, number],
      };
      sceneStore.createNode(newNode as AnyNode);
      newIds.push(newId);
    }

    // Select the duplicated nodes
    store.clearSelection();
    for (const id of newIds) {
      store.selectNode(id, true);
    }
  }, []);

  const handleDelete = useCallback(() => {
    const store = useEditorStore.getState();
    const sceneStore = useSceneStore.getState();
    for (const id of store.selectedNodeIds) {
      sceneStore.deleteNode(id);
    }
    store.clearSelection();
  }, []);

  const handleRotate = useCallback(() => {
    const store = useEditorStore.getState();
    const sceneStore = useSceneStore.getState();
    for (const id of store.selectedNodeIds) {
      const node = sceneStore.nodes[id];
      if (node && node.type === "item") {
        sceneStore.updateNode(id, {
          rotation: [
            node.rotation[0],
            node.rotation[1] + Math.PI / 2,
            node.rotation[2],
          ],
        });
      }
    }
  }, []);

  const handleToggleVisibility = useCallback(() => {
    const store = useEditorStore.getState();
    const sceneStore = useSceneStore.getState();
    for (const id of store.selectedNodeIds) {
      const node = sceneStore.nodes[id];
      if (node) {
        sceneStore.updateNode(id, { visible: !node.visible });
      }
    }
  }, []);

  const handleSelectProperties = useCallback(() => {
    // The properties panel already shows when nodes are selected.
    // This is a no-op beyond ensuring the panel is visible.
    // The selection is already active, so the properties panel will show.
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={handleCopy} disabled={!hasSelection}>
          <Copy className="mr-2 size-4" />
          Kopieren
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handlePaste}>
          <ClipboardPaste className="mr-2 size-4" />
          Plakken
          <ContextMenuShortcut>Ctrl+V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleDuplicate} disabled={!hasSelection}>
          <CopyPlus className="mr-2 size-4" />
          Dupliceren
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onSelect={handleRotate} disabled={!hasSelection}>
          <RotateCw className="mr-2 size-4" />
          Roteren 90\u00B0
          <ContextMenuShortcut>R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={handleToggleVisibility} disabled={!hasSelection}>
          <Settings2 className="mr-2 size-4" />
          Zichtbaarheid wisselen
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onSelect={handleDelete}
          disabled={!hasSelection}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          Verwijderen
          <ContextMenuShortcut>Delete</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

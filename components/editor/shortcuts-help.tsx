"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutEntry {
  keys: string[];
  action: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Algemeen",
    shortcuts: [
      { keys: ["Ctrl+S"], action: "Opslaan" },
      { keys: ["Ctrl+Z"], action: "Ongedaan maken" },
      { keys: ["Ctrl+Y", "Ctrl+Shift+Z"], action: "Opnieuw uitvoeren" },
      { keys: ["Ctrl+C"], action: "Selectie kopieren" },
      { keys: ["Ctrl+V"], action: "Plakken" },
      { keys: ["Ctrl+A"], action: "Alles selecteren" },
      { keys: ["Ctrl+K"], action: "Commandopalet openen" },
      { keys: ["Delete", "Backspace"], action: "Geselecteerde elementen verwijderen" },
      { keys: ["Escape"], action: "Tekening annuleren / deselecteren" },
      { keys: ["Enter"], action: "Tekening afronden" },
      { keys: ["?"], action: "Deze sneltoetsen tonen" },
    ],
  },
  {
    title: "Fasen",
    shortcuts: [
      { keys: ["1", "S"], action: "Structuur fase" },
      { keys: ["2", "F"], action: "Inrichting fase" },
    ],
  },
  {
    title: "Gereedschappen (Structuur)",
    shortcuts: [
      { keys: ["W"], action: "Muur tekenen" },
      { keys: ["Q"], action: "Zone tekenen" },
      { keys: ["D"], action: "Deur plaatsen" },
    ],
  },
  {
    title: "Gereedschappen (Algemeen)",
    shortcuts: [
      { keys: ["M"], action: "Opmeten" },
      { keys: ["G"], action: "Raster aan/uit" },
      { keys: ["R"], action: "Geselecteerd item 90\u00B0 draaien" },
    ],
  },
  {
    title: "Navigatie",
    shortcuts: [
      { keys: ["Ctrl+\u2191"], action: "Volgende verdieping" },
      { keys: ["Ctrl+\u2193"], action: "Vorige verdieping" },
    ],
  },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sneltoetsen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h4>
              <div className="grid gap-1">
                {group.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-1">
                    <span className="text-sm text-foreground">{s.action}</span>
                    <div className="flex gap-1 shrink-0">
                      {s.keys.map((key) => (
                        <kbd
                          key={key}
                          className="inline-flex h-6 items-center rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

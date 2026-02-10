"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(key: string, callback: () => void, modifier?: "ctrl" | "meta") {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      const modifierMatch = !modifier
        || (modifier === "ctrl" && e.ctrlKey)
        || (modifier === "meta" && e.metaKey);

      if (e.key === key && modifierMatch) {
        e.preventDefault();
        callback();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifier]);
}

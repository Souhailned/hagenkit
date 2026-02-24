"use client";

import * as React from "react";

interface OptimisticEntry {
  value: unknown;
  timestamp: number;
}

interface UseOptimisticUpdateReturn {
  /** Get the optimistic value for a cell, or undefined if none */
  getOptimistic: (cellId: string) => unknown | undefined;
  /** Set an optimistic value for a cell */
  setOptimistic: (cellId: string, value: unknown) => void;
  /** Clear the optimistic value (e.g. after server confirms or on error revert) */
  clearOptimistic: (cellId: string) => void;
  /** Check if a cell has a pending optimistic value */
  isPending: (cellId: string) => boolean;
}

const AUTO_CLEAR_MS = 10_000;

export function useOptimisticUpdate(): UseOptimisticUpdateReturn {
  const [entries, setEntries] = React.useState<Map<string, OptimisticEntry>>(
    () => new Map()
  );

  // Auto-clear stale entries
  React.useEffect(() => {
    if (entries.size === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setEntries((prev) => {
        const next = new Map(prev);
        let changed = false;
        for (const [key, entry] of next) {
          if (now - entry.timestamp > AUTO_CLEAR_MS) {
            next.delete(key);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [entries.size]);

  const getOptimistic = React.useCallback(
    (cellId: string) => entries.get(cellId)?.value,
    [entries]
  );

  const setOptimistic = React.useCallback(
    (cellId: string, value: unknown) => {
      setEntries((prev) => {
        const next = new Map(prev);
        next.set(cellId, { value, timestamp: Date.now() });
        return next;
      });
    },
    []
  );

  const clearOptimistic = React.useCallback((cellId: string) => {
    setEntries((prev) => {
      if (!prev.has(cellId)) return prev;
      const next = new Map(prev);
      next.delete(cellId);
      return next;
    });
  }, []);

  const isPending = React.useCallback(
    (cellId: string) => entries.has(cellId),
    [entries]
  );

  return { getOptimistic, setOptimistic, clearOptimistic, isPending };
}

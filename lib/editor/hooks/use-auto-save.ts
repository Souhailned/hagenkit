'use client';

// lib/editor/hooks/use-auto-save.ts
// Debounced auto-save hook for the floor plan editor.
// Subscribes to scene store changes and triggers save after a delay.
// Includes localStorage fallback for offline resilience, beforeunload flush,
// and exposes save status for UI indicators.

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSceneStore } from '../stores';
import type { SceneData } from '../schema';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  /** Callback to persist the scene */
  onSave: (scene: SceneData) => Promise<void>;
  /** Debounce delay in ms (default: 3000) */
  delay?: number;
  /** Whether auto-save is enabled */
  enabled?: boolean;
  /** localStorage key for offline fallback (optional) */
  localStorageKey?: string;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
  /** Manually trigger a save immediately */
  forceSave: () => Promise<void>;
}

export function useAutoSave({
  onSave,
  delay = 3000,
  enabled = true,
  localStorageKey,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);
  const pendingRef = useRef(false);

  // Keep refs up to date without re-subscribing
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Core save function
  const executeSave = useCallback(async () => {
    const scene = useSceneStore.getState().exportScene();
    const nodeCount = Object.keys(scene.nodes).length;
    if (nodeCount === 0) return;

    pendingRef.current = false;
    setStatus('saving');

    try {
      await onSaveRef.current(scene);
      setStatus('saved');
      setLastSaved(new Date());

      // Clear localStorage fallback on successful save
      if (localStorageKey) {
        try {
          localStorage.removeItem(localStorageKey);
        } catch {
          // localStorage may be unavailable
        }
      }
    } catch (error) {
      console.error('[auto-save] Save failed:', error);
      setStatus('error');

      // Persist to localStorage as offline fallback
      if (localStorageKey) {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(scene));
        } catch {
          // localStorage may be full or unavailable
        }
      }
    }
  }, [localStorageKey]);

  // Force save (exposed to callers)
  const forceSave = useCallback(async () => {
    // Clear any pending debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await executeSave();
  }, [executeSave]);

  // Subscribe to scene store changes and debounce saves
  useEffect(() => {
    if (!enabled) return;

    const unsub = useSceneStore.subscribe((state, prevState) => {
      // Only trigger save when nodes actually change
      if (state.nodes === prevState.nodes) return;
      if (Object.keys(state.nodes).length === 0) return;

      pendingRef.current = true;

      // Clear previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new debounce timer
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        executeSave();
      }, delay);
    });

    return () => {
      unsub();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, delay, executeSave]);

  // Flush pending save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!pendingRef.current) return;

      // Attempt synchronous localStorage save as last resort
      if (localStorageKey) {
        try {
          const scene = useSceneStore.getState().exportScene();
          localStorage.setItem(localStorageKey, JSON.stringify(scene));
        } catch {
          // Best effort
        }
      }

      // Show browser confirmation dialog
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [localStorageKey]);

  return { status, lastSaved, forceSave };
}

/**
 * Recover a scene that was saved to localStorage during a failed save or page close.
 * Returns the scene data if found, or null.
 */
export function recoverLocalScene(key: string): SceneData | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SceneData;
    if (parsed && typeof parsed.nodes === 'object' && Array.isArray(parsed.rootNodeIds)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

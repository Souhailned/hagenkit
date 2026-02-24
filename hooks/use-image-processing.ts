"use client";

import * as React from "react";

export type ProcessingStep =
  | "fetching"
  | "uploading"
  | "generating"
  | "saving"
  | "done"
  | "error";

export interface ProcessingState {
  step: ProcessingStep;
  pct: number;
}

const STEP_LABELS: Record<ProcessingStep, string> = {
  fetching: "Fetching image...",
  uploading: "Uploading to AI...",
  generating: "Generating result...",
  saving: "Saving result...",
  done: "Complete",
  error: "Failed",
};

/**
 * Time-based progress estimation for PROCESSING images.
 * Mirrors the SSE pipeline steps: fetching → uploading → generating → saving.
 * Caps at 90% until DB polling confirms completion.
 */
export function useImageProcessing(processingImageIds: string[]) {
  const [progressMap, setProgressMap] = React.useState<
    Map<string, ProcessingState>
  >(new Map());

  const startTimesRef = React.useRef<Map<string, number>>(new Map());

  // Stable key for dependency array
  const idsKey = processingImageIds.join(",");

  React.useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    const now = Date.now();

    // Register start times for new images
    for (const id of ids) {
      if (!startTimesRef.current.has(id)) {
        startTimesRef.current.set(id, now);
      }
    }

    // Cleanup removed images
    const currentIds = new Set(ids);
    for (const id of Array.from(startTimesRef.current.keys())) {
      if (!currentIds.has(id)) {
        startTimesRef.current.delete(id);
      }
    }

    if (ids.length === 0) {
      setProgressMap(new Map());
      return;
    }

    const computeProgress = () => {
      setProgressMap(() => {
        const next = new Map<string, ProcessingState>();
        for (const id of ids) {
          const startTime = startTimesRef.current.get(id) ?? Date.now();
          const elapsed = (Date.now() - startTime) / 1000;
          next.set(id, estimateProgress(elapsed));
        }
        return next;
      });
    };

    computeProgress();
    const interval = setInterval(computeProgress, 1000);
    return () => clearInterval(interval);
  }, [idsKey]);

  return { progressMap };
}

function estimateProgress(elapsedSeconds: number): ProcessingState {
  // 0-3s:   fetching   (5-10%)
  // 3-8s:   uploading  (10-30%)
  // 8-40s:  generating (30-75%)
  // 40-60s: saving     (75-90%)
  // 60s+:   saving     (cap 90%)
  if (elapsedSeconds < 3) {
    return { step: "fetching", pct: Math.round(5 + (elapsedSeconds / 3) * 5) };
  }
  if (elapsedSeconds < 8) {
    return {
      step: "uploading",
      pct: Math.round(10 + ((elapsedSeconds - 3) / 5) * 20),
    };
  }
  if (elapsedSeconds < 40) {
    return {
      step: "generating",
      pct: Math.min(75, Math.round(30 + ((elapsedSeconds - 8) / 32) * 45)),
    };
  }
  if (elapsedSeconds < 60) {
    return {
      step: "saving",
      pct: Math.min(90, Math.round(75 + ((elapsedSeconds - 40) / 20) * 15)),
    };
  }
  return { step: "saving", pct: 90 };
}

export function getStepLabel(step: ProcessingStep): string {
  return STEP_LABELS[step];
}

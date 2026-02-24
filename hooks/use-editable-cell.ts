"use client";

import * as React from "react";
import type { CellEditState } from "@/types/editable-data-table";

function makeCellId(rowId: string, columnId: string) {
  return `${rowId}-${columnId}`;
}

interface UseEditableCellReturn {
  /** Currently active edit state, or null if no cell is being edited */
  activeCell: CellEditState | null;
  /** Start editing a cell */
  startEdit: (
    rowId: string,
    columnId: string,
    currentValue: unknown
  ) => void;
  /** Update the draft value of the active cell */
  setDraftValue: (value: unknown) => void;
  /** Save the current draft and clear edit state. Returns the draft value. */
  save: () => unknown | null;
  /** Cancel editing and revert */
  cancel: () => void;
  /** Check if a specific cell is currently being edited */
  isEditing: (rowId: string, columnId: string) => boolean;
}

export function useEditableCell(): UseEditableCellReturn {
  const [activeCell, setActiveCell] = React.useState<CellEditState | null>(
    null
  );

  const startEdit = React.useCallback(
    (rowId: string, columnId: string, currentValue: unknown) => {
      setActiveCell({
        cellId: makeCellId(rowId, columnId),
        rowId,
        columnId,
        draftValue: currentValue,
        originalValue: currentValue,
      });
    },
    []
  );

  const setDraftValue = React.useCallback((value: unknown) => {
    setActiveCell((prev) => (prev ? { ...prev, draftValue: value } : null));
  }, []);

  const save = React.useCallback(() => {
    if (!activeCell) return null;
    const value = activeCell.draftValue;
    setActiveCell(null);
    return value;
  }, [activeCell]);

  const cancel = React.useCallback(() => {
    setActiveCell(null);
  }, []);

  const isEditing = React.useCallback(
    (rowId: string, columnId: string) => {
      if (!activeCell) return false;
      return activeCell.cellId === makeCellId(rowId, columnId);
    },
    [activeCell]
  );

  return { activeCell, startEdit, setDraftValue, save, cancel, isEditing };
}

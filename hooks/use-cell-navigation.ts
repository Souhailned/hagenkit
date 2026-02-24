"use client";

import * as React from "react";

export interface CellPosition {
  /** Row index in the visible row model (0-based) */
  rowIndex: number;
  /** Column index in the visible columns (0-based) */
  colIndex: number;
}

interface UseCellNavigationReturn {
  /** Currently focused cell position, or null if no cell focused */
  focusedCell: CellPosition | null;
  /** Set focus to a specific cell */
  setFocusedCell: (pos: CellPosition | null) => void;
  /** Check if a specific cell is focused */
  isFocused: (rowIndex: number, colIndex: number) => boolean;
  /** Move focus in a direction */
  moveFocus: (direction: "up" | "down" | "left" | "right") => void;
  /** Clear focus */
  clearFocus: () => void;
}

export function useCellNavigation(
  rowCount: number,
  colCount: number
): UseCellNavigationReturn {
  const [focusedCell, setFocusedCell] = React.useState<CellPosition | null>(
    null
  );

  const moveFocus = React.useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      setFocusedCell((current) => {
        if (!current) return { rowIndex: 0, colIndex: 0 };

        switch (direction) {
          case "up":
            return {
              ...current,
              rowIndex: Math.max(0, current.rowIndex - 1),
            };
          case "down":
            return {
              ...current,
              rowIndex: Math.min(rowCount - 1, current.rowIndex + 1),
            };
          case "left":
            return {
              ...current,
              colIndex: Math.max(0, current.colIndex - 1),
            };
          case "right":
            return {
              ...current,
              colIndex: Math.min(colCount - 1, current.colIndex + 1),
            };
        }
      });
    },
    [rowCount, colCount]
  );

  const isFocused = React.useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!focusedCell) return false;
      return (
        focusedCell.rowIndex === rowIndex && focusedCell.colIndex === colIndex
      );
    },
    [focusedCell]
  );

  const clearFocus = React.useCallback(() => {
    setFocusedCell(null);
  }, []);

  return { focusedCell, setFocusedCell, isFocused, moveFocus, clearFocus };
}

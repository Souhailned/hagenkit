"use client";

import { SortSelect } from "./sort-select";

interface ResultsHeaderProps {
  count: number;
  sort: string;
  onSortChange: (value: string) => void;
}

export function ResultsHeader({ count, sort, onSortChange }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{count}</span>{" "}
        {count === 1 ? "pand" : "panden"} gevonden
      </p>
      <SortSelect value={sort} onChange={onSortChange} />
    </div>
  );
}

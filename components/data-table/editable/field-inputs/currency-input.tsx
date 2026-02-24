"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import type { FieldInputProps } from "@/types/editable-data-table";

export function CurrencyFieldInput({
  value,
  onChange,
  onSave,
  onCancel,
  config,
  autoFocus = true,
}: FieldInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const symbol = config.currencySymbol ?? "\u20AC";

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  return (
    <div className="flex h-8 items-center gap-1">
      <span className="text-muted-foreground text-sm shrink-0">{symbol}</span>
      <Input
        ref={inputRef}
        type="number"
        value={value === null || value === undefined ? "" : String(value)}
        min={config.min ?? 0}
        max={config.max}
        step={config.step ?? 0.01}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSave();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
          e.stopPropagation();
        }}
        onBlur={onSave}
        className="h-8 w-full"
      />
    </div>
  );
}

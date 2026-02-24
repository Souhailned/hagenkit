"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import type { FieldInputProps } from "@/types/editable-data-table";

export function NumberFieldInput({
  value,
  onChange,
  onSave,
  onCancel,
  config,
  autoFocus = true,
}: FieldInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  return (
    <Input
      ref={inputRef}
      type="number"
      value={value === null || value === undefined ? "" : String(value)}
      min={config.min}
      max={config.max}
      step={config.step}
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
  );
}

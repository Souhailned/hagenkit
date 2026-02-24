"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import type { FieldInputProps } from "@/types/editable-data-table";

export function TextFieldInput({
  value,
  onChange,
  onSave,
  onCancel,
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
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onSave();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
        // Stop propagation to prevent table keyboard shortcuts
        e.stopPropagation();
      }}
      onBlur={onSave}
      className="h-8 w-full"
    />
  );
}

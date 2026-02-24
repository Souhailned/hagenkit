"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldInputProps } from "@/types/editable-data-table";

export function SelectFieldInput({
  value,
  onChange,
  onSave,
  onCancel,
  config,
}: FieldInputProps) {
  const options = config.options ?? [];
  const savedRef = React.useRef(false);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onChange(newValue);
      // Save immediately on selection
      savedRef.current = true;
      // Defer save to let state update
      setTimeout(onSave, 0);
    },
    [onChange, onSave]
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      // If dropdown closed without selecting, cancel
      if (!open && !savedRef.current) {
        onCancel();
      }
    },
    [onCancel]
  );

  return (
    <Select
      defaultOpen
      value={String(value ?? "")}
      onValueChange={handleValueChange}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className="h-8 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

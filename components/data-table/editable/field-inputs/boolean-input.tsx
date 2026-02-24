"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldInputProps } from "@/types/editable-data-table";

export function BooleanFieldInput({
  value,
  onChange,
  onSave,
}: FieldInputProps) {
  const handleCheckedChange = React.useCallback(
    (checked: boolean) => {
      onChange(checked);
      // Save immediately on toggle
      setTimeout(onSave, 0);
    },
    [onChange, onSave]
  );

  return (
    <div className="flex h-8 items-center justify-center">
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={handleCheckedChange}
        autoFocus
      />
    </div>
  );
}

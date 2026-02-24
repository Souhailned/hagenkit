"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { FieldInputProps } from "@/types/editable-data-table";

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "string" && value) return new Date(value);
  return undefined;
}

function formatDate(date: Date | undefined): string {
  if (!date) return "Pick a date";
  return date.toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DateFieldInput({
  value,
  onChange,
  onSave,
  onCancel,
}: FieldInputProps) {
  const [open, setOpen] = React.useState(true);
  const selectedDate = parseDate(value);
  const savedRef = React.useRef(false);

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      if (date) {
        onChange(date.toISOString());
        savedRef.current = true;
        // Defer save to let state update
        setTimeout(onSave, 0);
      }
    },
    [onChange, onSave]
  );

  const handleOpenChange = React.useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen && !savedRef.current) {
        onCancel();
      }
    },
    [onCancel]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarBlank className="mr-2 size-4" />
          {formatDate(selectedDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

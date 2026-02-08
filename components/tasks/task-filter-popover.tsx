"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import type { TaskAssignee, FilterChip } from "@/types/task";
import type { PMTaskStatus, PMTaskPriority, PMTaskTag } from "@/lib/validations/task";

interface TaskFilterPopoverProps {
  filters: {
    status: PMTaskStatus[];
    priority: PMTaskPriority[];
    tag: PMTaskTag[];
    assigneeId: string[];
  };
  members: TaskAssignee[];
  onFiltersChange: (filters: {
    status: PMTaskStatus[];
    priority: PMTaskPriority[];
    tag: PMTaskTag[];
    assigneeId: string[];
  }) => void;
}

const STATUS_OPTIONS: { value: PMTaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS: { value: PMTaskPriority; label: string }[] = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "NO_PRIORITY", label: "No Priority" },
];

const TAG_OPTIONS: { value: PMTaskTag; label: string }[] = [
  { value: "FEATURE", label: "Feature" },
  { value: "BUG", label: "Bug" },
  { value: "INTERNAL", label: "Internal" },
];

export function TaskFilterPopover({
  filters,
  members,
  onFiltersChange,
}: TaskFilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const activeFilterCount =
    filters.status.length +
    filters.priority.length +
    filters.tag.length +
    filters.assigneeId.length;

  const toggleStatus = (value: PMTaskStatus) => {
    const newStatus = filters.status.includes(value)
      ? filters.status.filter((s) => s !== value)
      : [...filters.status, value];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const togglePriority = (value: PMTaskPriority) => {
    const newPriority = filters.priority.includes(value)
      ? filters.priority.filter((p) => p !== value)
      : [...filters.priority, value];
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const toggleTag = (value: PMTaskTag) => {
    const newTag = filters.tag.includes(value)
      ? filters.tag.filter((t) => t !== value)
      : [...filters.tag, value];
    onFiltersChange({ ...filters, tag: newTag });
  };

  const toggleAssignee = (value: string) => {
    const newAssignee = filters.assigneeId.includes(value)
      ? filters.assigneeId.filter((a) => a !== value)
      : [...filters.assigneeId, value];
    onFiltersChange({ ...filters, assigneeId: newAssignee });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      tag: [],
      assigneeId: [],
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.status.includes(option.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleStatus(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Priority</p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.priority.includes(option.value)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => togglePriority(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.tag.includes(option.value) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTag(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {members.length > 0 && (
            <>
              <Separator />

              {/* Assignee */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Assignee
                </p>
                <div className="space-y-1 max-h-[120px] overflow-auto">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 py-1"
                    >
                      <Checkbox
                        id={`assignee-${member.id}`}
                        checked={filters.assigneeId.includes(member.id)}
                        onCheckedChange={() => toggleAssignee(member.id)}
                      />
                      <label
                        htmlFor={`assignee-${member.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {member.name || member.email}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TaskFilterChipsProps {
  filters: {
    status: PMTaskStatus[];
    priority: PMTaskPriority[];
    tag: PMTaskTag[];
    assigneeId: string[];
  };
  members: TaskAssignee[];
  onRemove: (type: "status" | "priority" | "tag" | "assignee", value: string) => void;
  maxVisible?: number;
}

export function TaskFilterChips({
  filters,
  members,
  onRemove,
  maxVisible = 3,
}: TaskFilterChipsProps) {
  const chips: FilterChip[] = [];

  // Build chips array
  filters.status.forEach((s) =>
    chips.push({
      type: "status",
      value: s,
      label: STATUS_OPTIONS.find((o) => o.value === s)?.label || s,
    })
  );
  filters.priority.forEach((p) =>
    chips.push({
      type: "priority",
      value: p,
      label: PRIORITY_OPTIONS.find((o) => o.value === p)?.label || p,
    })
  );
  filters.tag.forEach((t) =>
    chips.push({
      type: "tag",
      value: t,
      label: TAG_OPTIONS.find((o) => o.value === t)?.label || t,
    })
  );
  filters.assigneeId.forEach((a) =>
    chips.push({
      type: "assignee",
      value: a,
      label: members.find((m) => m.id === a)?.name || a,
    })
  );

  if (chips.length === 0) return null;

  const visibleChips = chips.slice(0, maxVisible);
  const hiddenCount = chips.length - maxVisible;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {visibleChips.map((chip, i) => (
        <Badge
          key={`${chip.type}-${chip.value}-${i}`}
          variant="secondary"
          className="gap-1"
        >
          {chip.label}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={() => onRemove(chip.type, chip.value)}
          />
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline">+{hiddenCount} more</Badge>
      )}
    </div>
  );
}

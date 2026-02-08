"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Settings2, LayoutList, LayoutGrid } from "lucide-react";
import type { LegacyViewOptions, ViewMode, SortOrder } from "@/types/task";
import type { GroupBy } from "@/lib/view-options";

interface TaskViewOptionsProps {
  options: LegacyViewOptions;
  onOptionsChange: (options: LegacyViewOptions) => void;
}

export function TaskViewOptions({
  options,
  onOptionsChange,
}: TaskViewOptionsProps) {
  const updateOption = <K extends keyof LegacyViewOptions>(
    key: K,
    value: LegacyViewOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">View Options</h4>

          <Separator />

          {/* View mode */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Layout</Label>
            <ToggleGroup
              type="single"
              value={options.mode}
              onValueChange={(v) => v && updateOption("mode", v as ViewMode)}
              className="justify-start"
            >
              <ToggleGroupItem value="list" aria-label="List view">
                <LayoutList className="h-4 w-4 mr-2" />
                List
              </ToggleGroupItem>
              <ToggleGroupItem value="board" aria-label="Board view">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Board
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Separator />

          {/* Group by (only for list view) */}
          {options.mode === "list" && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Group by</Label>
              <Select
                value={options.groupBy}
                onValueChange={(v) => updateOption("groupBy", v as GroupBy)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="assignee">Assignee</SelectItem>
                  <SelectItem value="tags">Tag</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort order */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Sort by</Label>
            <Select
              value={options.sortOrder}
              onValueChange={(v) => updateOption("sortOrder", v as SortOrder)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="date">Due Date</SelectItem>
                <SelectItem value="alpha">Alphabetical</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showCompleted" className="text-sm">
                Show completed
              </Label>
              <Switch
                id="showCompleted"
                checked={options.showCompleted}
                onCheckedChange={(c) => updateOption("showCompleted", c)}
              />
            </div>

            {options.mode === "board" && (
              <div className="flex items-center justify-between">
                <Label htmlFor="showWeekends" className="text-sm">
                  Show weekends
                </Label>
                <Switch
                  id="showWeekends"
                  checked={options.showWeekends}
                  onCheckedChange={(c) => updateOption("showWeekends", c)}
                />
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

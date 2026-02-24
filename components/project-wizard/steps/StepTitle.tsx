"use client"

import { useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProjectData } from "../types"

interface StepTitleProps {
  data: ProjectData
  updateData: (updates: Partial<ProjectData>) => void
}

export function StepTitle({ data, updateData }: StepTitleProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input when the step renders
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="project-title" className="text-sm font-medium">
          Project name <span className="text-destructive">*</span>
        </Label>
        <Input
          ref={inputRef}
          id="project-title"
          placeholder="e.g. New restaurant location Amsterdam"
          value={data.title ?? ""}
          onChange={(e) => updateData({ title: e.target.value })}
          className="h-11 text-base"
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground">
          Give your project a clear, descriptive name.
        </p>
      </div>
    </div>
  )
}

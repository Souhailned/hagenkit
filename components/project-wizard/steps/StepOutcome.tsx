"use client"

import { useState } from "react"
import { format } from "date-fns"
import type { ProjectData, SuccessType, DeadlineType, ProjectDeliverable, ProjectMetric } from "../types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Check, CalendarBlank, Plus, Info, Trash } from "@phosphor-icons/react/dist/ssr"

interface StepOutcomeProps {
  data: ProjectData
  updateData: (updates: Partial<ProjectData>) => void
}

export function StepOutcome({ data, updateData }: StepOutcomeProps) {
  const [deadlineCalendarOpen, setDeadlineCalendarOpen] = useState(false)

  const successOptions: { id: SuccessType; label: string }[] = [
    { id: "deliverable", label: "Deliverable-based" },
    { id: "metric", label: "Metric-based" },
    { id: "undefined", label: "Not defined yet" },
  ]

  const deliverables = data.deliverables ?? []
  const metrics = data.metrics ?? []

  const createDeliverable = (): ProjectDeliverable => ({
    id: `dlv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    dueDate: undefined,
  })

  const createMetric = (): ProjectMetric => ({
    id: `mt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    target: "",
  })

  const handleSuccessTypeChange = (val: SuccessType) => {
    const updates: Partial<ProjectData> = { successType: val }

    if (val === "deliverable" && deliverables.length === 0) {
      updates.deliverables = [createDeliverable()]
    }

    if (val === "metric" && metrics.length === 0) {
      updates.metrics = [createMetric()]
    }

    updateData(updates)
  }

  const updateDeliverable = (id: string, updates: Partial<ProjectDeliverable>) => {
    const next = deliverables.map((item) => (item.id === id ? { ...item, ...updates } : item))
    updateData({ deliverables: next })
  }

  const addDeliverable = () => {
    updateData({ deliverables: [...deliverables, createDeliverable()] })
  }

  const removeDeliverable = (id: string) => {
    const next = deliverables.filter((item) => item.id !== id)
    updateData({ deliverables: next })
  }

  const updateMetric = (id: string, updates: Partial<ProjectMetric>) => {
    const next = metrics.map((metric) => (metric.id === id ? { ...metric, ...updates } : metric))
    updateData({ metrics: next })
  }

  const addMetric = () => {
    updateData({ metrics: [...metrics, createMetric()] })
  }

  const removeMetric = (id: string) => {
    const next = metrics.filter((metric) => metric.id !== id)
    updateData({ metrics: next })
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="space-y-4 rounded-2xl bg-muted p-4">
        <p className="text-sm text-muted-foreground">Help your team understand what success looks like.</p>

        <RadioGroup
          value={data.successType}
          onValueChange={(val) => handleSuccessTypeChange(val as SuccessType)}
          className="flex flex-col sm:flex-row gap-2 w-full"
        >
          {successOptions.map((option) => {
            const isActive = data.successType === option.id

            return (
              <Label
                key={option.id}
                htmlFor={option.id}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-full p-3 text-sm font-medium cursor-pointer transition-colors flex-1",
                  isActive
                    ? "bg-background text-foreground"
                    : "bg-background text-foreground hover:bg-background"
                )}
              >
                <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                <span>{option.label}</span>
                <span
                  className={cn(
                    "ml-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background",
                    isActive && "border-teal-600 bg-teal-600 text-primary-foreground"
                  )}
                >
                  {isActive && <Check className="h-3 w-3" weight="regular" />}
                </span>
              </Label>
            )
          })}
        </RadioGroup>

        <div className="space-y-4 rounded-xl bg-background">
          {data.successType === "deliverable" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-2">
                <Label className="text-sm text-muted-foreground">What will be delivered?</Label>
                {deliverables.length > 0 && (
                  <Button type="button" onClick={addDeliverable} variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-0">
                {deliverables.map((item) => (
                  <Card key={item.id} className="flex items-center gap-3 px-4 py-2 border-none">
                    <Input
                      value={item.title}
                      onChange={(e) => updateDeliverable(item.id, { title: e.target.value })}
                      placeholder="Item name"
                      className="flex-1 border-0 bg-transparent px-0 py-0 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeliverable(item.id)}
                      className="text-muted-foreground/50 hover:text-destructive h-6 w-6"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {data.successType === "metric" && (
            <div className="space-y-0 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
                <div className="flex flex-1 items-center justify-between">
                  <span>Metric name</span>
                  <span className="w-[120px] text-right pr-3">Target</span>
                </div>
                {metrics.length > 0 && (
                  <Button type="button" onClick={addMetric} variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-0">
                {metrics.map((metric) => (
                  <Card key={metric.id} className="flex items-center gap-3 px-3 py-2 border-none">
                    <Input
                      value={metric.name}
                      onChange={(e) => updateMetric(metric.id, { name: e.target.value })}
                      placeholder="Metric item"
                      className="flex-1 border-0 bg-transparent px-0 py-0 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Input
                      value={metric.target || ""}
                      onChange={(e) => updateMetric(metric.id, { target: e.target.value })}
                      placeholder="%"
                      className="w-[120px] border-0 bg-transparent px-0 py-0 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMetric(metric.id)}
                      className="text-muted-foreground/50 hover:text-destructive h-6 w-6"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.successType === "deliverable" && (
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary" />
            <span>This will help generate Expected Timeline.</span>
          </div>
        )}
      </div>

      {/* Project Description */}
      <div className="space-y-3 rounded-2xl bg-muted p-4">
        <Label className="text-sm text-muted-foreground">Project description</Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Briefly describe the goal, scope, and key outcomes for this project..."
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-sm">Deadline</Label>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <Select
            value={data.deadlineType}
            onValueChange={(val) => updateData({ deadlineType: val as DeadlineType })}
          >
            <SelectTrigger className="w-[180px] border bg-background px-4 text-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No deadline</SelectItem>
              <SelectItem value="target">Target date</SelectItem>
              <SelectItem value="fixed">Fixed deadline</SelectItem>
            </SelectContent>
          </Select>

          {(data.deadlineType === "target" || data.deadlineType === "fixed") && (
            <Popover open={deadlineCalendarOpen} onOpenChange={setDeadlineCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="default" className="text-sm font-normal flex justify-start min-w-[200px] gap-1 h-full">
                  <CalendarBlank className="h-3 w-3 text-muted-foreground" />
                  <span>
                    {data.deadlineDate ? new Date(data.deadlineDate).toLocaleDateString() : "Select date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.deadlineDate ? new Date(data.deadlineDate) : undefined}
                  onSelect={(date) => {
                    updateData({
                      deadlineDate: date ? format(date, "yyyy-MM-dd") : undefined,
                    })
                    setDeadlineCalendarOpen(false)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  )
}

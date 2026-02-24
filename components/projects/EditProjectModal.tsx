"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateProject } from "@/app/actions/projects"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EditProjectModalProps {
  projectId: string
  initialValues: {
    name: string
    status: string
    priority: string
    estimate?: string
    endDate?: string
    sprints?: string
    label?: string
    groupLabel?: string
    clientName?: string
    description?: string
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "PLANNED", label: "Planned" },
  { value: "BACKLOG", label: "Backlog" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditProjectModal({
  projectId,
  initialValues,
  open,
  onOpenChange,
}: EditProjectModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(initialValues.name)
  const [status, setStatus] = useState(initialValues.status)
  const [priority, setPriority] = useState(initialValues.priority)
  const [estimate, setEstimate] = useState(initialValues.estimate ?? "")
  const [endDate, setEndDate] = useState(initialValues.endDate ?? "")
  const [sprints, setSprints] = useState(initialValues.sprints ?? "")
  const [label, setLabel] = useState(initialValues.label ?? "")
  const [groupLabel, setGroupLabel] = useState(initialValues.groupLabel ?? "")
  const [clientName, setClientName] = useState(initialValues.clientName ?? "")
  const [description, setDescription] = useState(initialValues.description ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      const result = await updateProject({
        id: projectId,
        name: name.trim(),
        status: status as "ACTIVE" | "PLANNED" | "BACKLOG" | "COMPLETED" | "CANCELLED",
        priority: priority as "URGENT" | "HIGH" | "MEDIUM" | "LOW",
        estimate: estimate || undefined,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        sprints: sprints || undefined,
        label: label || undefined,
        groupLabel: groupLabel || undefined,
        clientName: clientName || undefined,
        description: description || undefined,
      })

      if (result.success) {
        toast.success("Project updated")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update project")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="edit-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimate + End Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-estimate">Estimate</Label>
              <Input
                id="edit-estimate"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                placeholder="e.g. 2 weeks"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Sprints + Label row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sprints">Sprints</Label>
              <Input
                id="edit-sprints"
                value={sprints}
                onChange={(e) => setSprints(e.target.value)}
                placeholder="e.g. Sprint 1-3"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Design"
                maxLength={50}
              />
            </div>
          </div>

          {/* Group Label + Client Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-groupLabel">Group Label</Label>
              <Input
                id="edit-groupLabel"
                value={groupLabel}
                onChange={(e) => setGroupLabel(e.target.value)}
                placeholder="e.g. Q1 2026"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-clientName">Client Name</Label>
              <Input
                id="edit-clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
                maxLength={200}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={10000}
              placeholder="Project description..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

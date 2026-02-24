"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TaskDetail } from "@/types/task"
import type { CreateMyTaskInput, UpdateMyTaskInput, PMTaskStatus, PMTaskPriority, PMTaskTag } from "@/lib/validations/task"

interface TaskCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: TaskDetail | null
  projects: Array<{ id: string; name: string; status: string }>
  members: Array<{ id: string; name: string | null; email: string; image: string | null }>
  onCreate: (input: CreateMyTaskInput) => Promise<boolean>
  onUpdate: (input: UpdateMyTaskInput) => Promise<boolean>
}

export function TaskCreateDialog({ open, onOpenChange, task, projects, members, onCreate, onUpdate }: TaskCreateDialogProps) {
  const isEditing = !!task

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [status, setStatus] = useState<PMTaskStatus>("TODO")
  const [priority, setPriority] = useState<PMTaskPriority | "">("")
  const [tag, setTag] = useState<PMTaskTag | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (task) {
        setName(task.name)
        setDescription(task.description || "")
        setProjectId(task.projectId)
        setAssigneeId(task.assigneeId || "")
        setStatus(task.status)
        setPriority(task.priority || "")
        setTag(task.tag || "")
        setStartDate(task.startDate ? new Date(task.startDate).toISOString().slice(0, 10) : "")
        setEndDate(task.endDate ? new Date(task.endDate).toISOString().slice(0, 10) : "")
      } else {
        setName("")
        setDescription("")
        setProjectId(projects[0]?.id || "")
        setAssigneeId("")
        setStatus("TODO")
        setPriority("")
        setTag("")
        setStartDate("")
        setEndDate("")
      }
    }
  }, [open, task, projects])

  const handleSubmit = async () => {
    if (!name.trim() || !projectId) return
    setSaving(true)

    try {
      if (isEditing && task) {
        await onUpdate({
          id: task.id,
          name: name.trim(),
          description: description || null,
          projectId,
          assigneeId: assigneeId || null,
          status,
          priority: (priority as PMTaskPriority) || null,
          tag: (tag as PMTaskTag) || null,
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
        })
      } else {
        await onCreate({
          projectId,
          name: name.trim(),
          description: description || undefined,
          assigneeId: assigneeId || undefined,
          status,
          priority: (priority as PMTaskPriority) || undefined,
          tag: (tag as PMTaskTag) || undefined,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          order: 0,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Task Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PMTaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Select value={assigneeId || "unassigned"} onValueChange={(v) => setAssigneeId(v === "unassigned" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name || m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority || "none"} onValueChange={(v) => setPriority(v === "none" ? "" : v as PMTaskPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="No priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tag</Label>
              <Select value={tag || "none"} onValueChange={(v) => setTag(v === "none" ? "" : v as PMTaskTag)}>
                <SelectTrigger>
                  <SelectValue placeholder="No tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Tag</SelectItem>
                  <SelectItem value="FEATURE">Feature</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim() || !projectId}>
            {saving ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

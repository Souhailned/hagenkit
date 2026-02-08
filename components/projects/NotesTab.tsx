"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, FileText, AudioLines, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Server actions
import { createNote, updateNote, deleteNote } from "@/app/actions/notes"

// ============================================
// TYPES
// ============================================

interface NoteData {
  id: string
  title: string
  content: string | null
  noteType: "GENERAL" | "MEETING" | "AUDIO"
  status: "COMPLETED" | "PROCESSING"
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface NotesTabProps {
  projectId: string
  notes: NoteData[]
}

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function NoteIcon({ type }: { type: NoteData["noteType"] }) {
  if (type === "AUDIO") {
    return <AudioLines className="h-5 w-5 text-muted-foreground" />
  }
  return <FileText className="h-5 w-5 text-muted-foreground" />
}

function noteTypeLabel(type: NoteData["noteType"]) {
  switch (type) {
    case "GENERAL":
      return "General"
    case "MEETING":
      return "Meeting"
    case "AUDIO":
      return "Audio"
  }
}

// ============================================
// NOTE CARD
// ============================================

function NoteCard({
  note,
  onClick,
  onEdit,
  onDelete,
}: {
  note: NoteData
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="group rounded-xl border border-border bg-muted/30 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-lg bg-background p-2 border border-border">
          <NoteIcon type={note.noteType} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="text-sm font-medium text-foreground truncate">{note.title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{formatDate(note.createdAt)}</p>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function NotesTab({ projectId, notes }: NotesTabProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [previewNote, setPreviewNote] = useState<NoteData | null>(null)
  const [editNote, setEditNote] = useState<NoteData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create form state
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newType, setNewType] = useState<"GENERAL" | "MEETING" | "AUDIO">("GENERAL")

  // Edit form state
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  const recentNotes = notes.slice(0, 4)

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setIsSubmitting(true)
    const result = await createNote({
      projectId,
      title: newTitle.trim(),
      content: newContent.trim() || undefined,
      noteType: newType,
    })
    if (result.success) {
      setNewTitle("")
      setNewContent("")
      setNewType("GENERAL")
      setCreateOpen(false)
      router.refresh()
      toast.success("Note created")
    } else {
      toast.error(result.error || "Failed to create note")
    }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!editNote || !editTitle.trim()) return
    setIsSubmitting(true)
    const result = await updateNote({
      id: editNote.id,
      title: editTitle.trim(),
      content: editContent.trim() || null,
    })
    if (result.success) {
      setEditNote(null)
      router.refresh()
      toast.success("Note updated")
    } else {
      toast.error(result.error || "Failed to update note")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (noteId: string) => {
    const result = await deleteNote({ id: noteId })
    if (result.success) {
      router.refresh()
      toast.success("Note deleted")
    } else {
      toast.error(result.error || "Failed to delete note")
    }
  }

  const openEdit = (note: NoteData) => {
    setEditTitle(note.title)
    setEditContent(note.content || "")
    setEditNote(note)
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Recent Notes</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  placeholder="Note title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-type">Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as typeof newType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="AUDIO">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Write your note..."
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={!newTitle.trim() || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Notes Grid */}
      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No notes yet. Create one to get started.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setPreviewNote(note)}
                onEdit={() => openEdit(note)}
                onDelete={() => handleDelete(note.id)}
              />
            ))}
          </div>

          {/* All Notes Table */}
          {notes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">All Notes</h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Title</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Type</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Created</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Author</th>
                      <th className="text-right font-medium text-muted-foreground px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((note) => (
                      <tr
                        key={note.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setPreviewNote(note)}
                      >
                        <td className="px-4 py-2.5 font-medium text-foreground">{note.title}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-xs font-normal">
                            {noteTypeLabel(note.noteType)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{formatDate(note.createdAt)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{note.createdBy.name || note.createdBy.email}</td>
                        <td className="px-4 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEdit(note)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(note.id)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewNote} onOpenChange={() => setPreviewNote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewNote?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs font-normal">
                {previewNote ? noteTypeLabel(previewNote.noteType) : ""}
              </Badge>
              <span>{previewNote ? formatDate(previewNote.createdAt) : ""}</span>
              <span>by {previewNote?.createdBy.name || previewNote?.createdBy.email}</span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {previewNote?.content || (
                <span className="text-muted-foreground italic">No content</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewNote) {
                  openEdit(previewNote)
                  setPreviewNote(null)
                }
              }}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editNote} onOpenChange={() => setEditNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                rows={6}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditNote(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!editTitle.trim() || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

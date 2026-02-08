"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  FileText,
  FileArchive,
  Figma,
  FileImage,
  File,
} from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { createProjectFile, deleteProjectFile } from "@/app/actions/notes"

// ============================================
// TYPES
// ============================================

interface FileData {
  id: string
  name: string
  url: string
  size: number
  type: "PDF" | "ZIP" | "FIGMA" | "DOC" | "IMAGE" | "OTHER"
  uploadedAt: Date
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
}

interface AssetsFilesTabProps {
  projectId: string
  files: FileData[]
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ type, className }: { type: FileData["type"]; className?: string }) {
  const iconClass = cn("h-6 w-6", className)
  switch (type) {
    case "PDF":
      return <FileText className={cn(iconClass, "text-red-500")} />
    case "ZIP":
      return <FileArchive className={cn(iconClass, "text-amber-500")} />
    case "FIGMA":
      return <Figma className={cn(iconClass, "text-purple-500")} />
    case "IMAGE":
      return <FileImage className={cn(iconClass, "text-blue-500")} />
    case "DOC":
      return <FileText className={cn(iconClass, "text-blue-600")} />
    default:
      return <File className={cn(iconClass, "text-muted-foreground")} />
  }
}

function fileTypeLabel(type: FileData["type"]) {
  switch (type) {
    case "PDF":
      return "PDF"
    case "ZIP":
      return "ZIP"
    case "FIGMA":
      return "Figma"
    case "DOC":
      return "Document"
    case "IMAGE":
      return "Image"
    default:
      return "Other"
  }
}

// ============================================
// FILE CARD
// ============================================

function RecentFileCard({
  file,
  onDelete,
}: {
  file: FileData
  onDelete: () => void
}) {
  return (
    <div className="group rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-lg bg-background p-2 border border-border">
          <FileTypeIcon type={file.type} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={file.url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="text-sm font-medium text-foreground truncate">{file.name}</h4>
      <p className="text-xs text-muted-foreground mt-1">{formatSize(file.size)}</p>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AssetsFilesTab({ projectId, files }: AssetsFilesTabProps) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [newName, setNewName] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newSize, setNewSize] = useState("")
  const [newType, setNewType] = useState<FileData["type"]>("OTHER")

  const recentFiles = files.slice(0, 3)

  const handleCreate = async () => {
    if (!newName.trim() || !newUrl.trim()) return
    setIsSubmitting(true)
    const sizeInBytes = Math.round(parseFloat(newSize || "0") * 1024 * 1024)
    const result = await createProjectFile({
      projectId,
      name: newName.trim(),
      url: newUrl.trim(),
      size: sizeInBytes,
      type: newType,
    })
    if (result.success) {
      setNewName("")
      setNewUrl("")
      setNewSize("")
      setNewType("OTHER")
      setAddOpen(false)
      router.refresh()
      toast.success("File added")
    } else {
      toast.error(result.error || "Failed to add file")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (fileId: string) => {
    const result = await deleteProjectFile({ id: fileId })
    if (result.success) {
      router.refresh()
      toast.success("File deleted")
    } else {
      toast.error(result.error || "Failed to delete file")
    }
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Recent Files</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="file-name">Name</Label>
                <Input
                  id="file-name"
                  placeholder="File name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-url">URL</Label>
                <Input
                  id="file-url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file-size">Size (MB)</Label>
                  <Input
                    id="file-size"
                    placeholder="0.0"
                    type="number"
                    step="0.1"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-type">Type</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as FileData["type"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="ZIP">ZIP</SelectItem>
                      <SelectItem value="FIGMA">Figma</SelectItem>
                      <SelectItem value="DOC">Document</SelectItem>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || !newUrl.trim() || isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add File"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {files.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
          No files yet. Add one to get started.
        </div>
      ) : (
        <>
          {/* Recent Files Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentFiles.map((file) => (
              <RecentFileCard
                key={file.id}
                file={file}
                onDelete={() => handleDelete(file.id)}
              />
            ))}
          </div>

          {/* All Files Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">All Files</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Name</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Type</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Size</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Uploaded by</th>
                    <th className="text-left font-medium text-muted-foreground px-4 py-2.5">Date</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileTypeIcon type={file.type} className="h-4 w-4" />
                          <span className="font-medium text-foreground">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-xs font-normal">
                          {fileTypeLabel(file.type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatSize(file.size)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {file.uploadedBy.name || file.uploadedBy.email}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(file.uploadedAt)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={file.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(file.id)}
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
        </>
      )}
    </div>
  )
}

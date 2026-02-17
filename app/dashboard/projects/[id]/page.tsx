import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProject } from "@/app/actions/projects"
import {
  ProjectDetailContent,
  type WorkstreamData,
  type TaskData,
  type NoteData,
  type FileData,
  type MemberData,
} from "@/components/dashboard/project-detail-content"
import type { ProjectDetail as DBProject } from "@/types/project"
import type { Project } from "@/lib/data/projects"
import { ContentCard } from "@/components/dashboard/content-card"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

// ---------------------------------------------------------------------------
// Adapter: map DB ProjectDetail → legacy Project type for ProjectDetailContent
// ---------------------------------------------------------------------------

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`
  return `${bytes} B`
}

function adaptProjectToLegacy(db: DBProject): {
  project: Project
  workstreams: WorkstreamData[]
  notes: NoteData[]
  files: FileData[]
  allTasks: TaskData[]
  members: MemberData[]
} {
  const statusMap: Record<string, Project["status"]> = {
    ACTIVE: "active",
    PLANNED: "planned",
    BACKLOG: "backlog",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  }

  const priorityMap: Record<string, Project["priority"]> = {
    URGENT: "urgent",
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
  }

  const taskStatusMap: Record<string, "todo" | "in-progress" | "done"> = {
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    DONE: "done",
  }

  // Build legacy tasks for timeline/gantt
  const legacyTasks = db.tasks.map((t) => ({
    id: t.id,
    name: t.name,
    assignee: t.assignee?.name || "Unassigned",
    status: taskStatusMap[t.status] || ("todo" as const),
    startDate: t.startDate || new Date(),
    endDate: t.endDate || new Date(),
  }))

  // Build scope arrays from scopeItems
  const inScope = db.scopeItems
    .filter((s) => s.type === "IN_SCOPE")
    .map((s) => s.content)
  const outOfScope = db.scopeItems
    .filter((s) => s.type === "OUT_OF_SCOPE")
    .map((s) => s.content)
  const expectedOutcomes = db.scopeItems
    .filter((s) => s.type === "EXPECTED_OUTCOME")
    .map((s) => s.content)

  // Build key features from features
  const p0 = db.features
    .filter((f) => f.priority === "P0")
    .map((f) => f.content)
  const p1 = db.features
    .filter((f) => f.priority === "P1")
    .map((f) => f.content)
  const p2 = db.features
    .filter((f) => f.priority === "P2")
    .map((f) => f.content)

  // Build quickLinks from files
  const quickLinks = db.files.map((f) => ({
    id: f.id,
    name: f.name,
    size: formatFileSize(f.size),
    type: f.type.toLowerCase() as "pdf" | "zip" | "figma" | "doc" | "image",
  }))

  // Find PIC (owner) and support members
  const ownerMember = db.members.find((m) => m.role === "OWNER")
  const supportMembers = db.members.filter((m) => m.role !== "OWNER")

  // Days remaining
  const daysRemaining = db.endDate
    ? Math.max(0, Math.ceil((new Date(db.endDate).getTime() - Date.now()) / 86400000))
    : 0

  const project: Project = {
    id: db.id,
    name: db.name,
    taskCount: db.tasks.length,
    progress: db.progress,
    startDate: db.startDate || new Date(),
    endDate: db.endDate || new Date(),
    status: statusMap[db.status] || "active",
    priority: priorityMap[db.priority] || "medium",
    tags: db.tags.map((t) => t.name),
    members: db.members.map((m) => m.user.name || m.user.email),
    client: db.clientName || undefined,
    typeLabel: db.typeLabel || undefined,
    durationLabel: db.estimate || undefined,
    tasks: legacyTasks,
    detail: {
      description: db.description || `Project ${db.name}`,
      inScope,
      outOfScope,
      expectedOutcomes,
      keyFeatures: { p0, p1, p2 },
      estimate: db.estimate || "—",
      dueDate: db.endDate
        ? new Date(db.endDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
      daysRemaining,
      group: db.groupLabel || "None",
      label: db.label || db.typeLabel || "—",
      pic: ownerMember
        ? { name: ownerMember.user.name || "Owner", avatar: ownerMember.user.image || "" }
        : { name: "—", avatar: "" },
      support: supportMembers.map((m) => ({
        name: m.user.name || m.user.email,
        avatar: m.user.image || "",
      })),
      quickLinks,
      location: db.location || undefined,
      sprints: db.sprints || undefined,
      lastSync: db.lastSyncAt
        ? new Date(db.lastSyncAt).toLocaleDateString()
        : undefined,
    },
  }

  // Map workstreams for the tab
  const workstreams: WorkstreamData[] = db.workstreams.map((ws) => ({
    id: ws.id,
    name: ws.name,
    order: ws.order,
    tasks: ws.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status as TaskData["status"],
      assigneeId: t.assigneeId,
      workstreamId: t.workstreamId,
      assignee: t.assignee
        ? { id: t.assignee.id, name: t.assignee.name, image: t.assignee.image }
        : null,
      endDate: t.endDate,
      order: t.order,
    })),
  }))

  // Map notes
  const notes: NoteData[] = db.notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    noteType: n.noteType,
    status: n.status,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
    createdBy: n.createdBy,
  }))

  // Map files
  const files: FileData[] = db.files.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    size: f.size,
    type: f.type as FileData["type"],
    uploadedAt: f.uploadedAt,
    uploadedBy: f.uploadedBy,
  }))

  // Map all tasks (flat, for TasksTab)
  const allTasks: TaskData[] = db.tasks.map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status as TaskData["status"],
    assigneeId: t.assigneeId,
    workstreamId: t.workstreamId,
    assignee: t.assignee
      ? { id: t.assignee.id, name: t.assignee.name, image: t.assignee.image }
      : null,
    endDate: t.endDate,
    order: t.order,
  }))

  // Map members
  const members: MemberData[] = db.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    image: m.user.image,
  }))

  return { project, workstreams, notes, files, allTasks, members }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const result = await getProject(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const { project, workstreams, notes, files, allTasks, members } =
    adaptProjectToLegacy(result.data)

  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailContent
        project={project}
        projectId={id}
        workstreams={workstreams}
        notes={notes}
        files={files}
        allTasks={allTasks}
        members={members}
      />
    </Suspense>
  )
}

function ProjectDetailSkeleton() {
  return (
    <ContentCard>
      <div className="flex flex-col">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        {/* Content skeleton */}
        <div className="flex flex-1">
          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="w-72 border-l border-border p-4 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </ContentCard>
  )
}

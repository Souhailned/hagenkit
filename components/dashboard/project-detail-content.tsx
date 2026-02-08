"use client"

import { useCallback, useMemo, useState } from "react"
import { LinkSimple, SquareHalf } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"

import type { Project } from "@/lib/data/projects"
import { Breadcrumbs } from "@/components/projects/Breadcrumbs"
import { ProjectDetailHeader } from "@/components/projects/ProjectDetailHeader"
import { ScopeColumns } from "@/components/projects/ScopeColumns"
import { OutcomesList } from "@/components/projects/OutcomesList"
import { KeyFeaturesColumns } from "@/components/projects/KeyFeaturesColumns"
import { TimelineGantt, type TimelineTask } from "@/components/projects/TimelineGantt"
import { RightMetaPanel } from "@/components/projects/RightMetaPanel"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tab components
import { WorkstreamTab } from "@/components/projects/WorkstreamTab"
import { ProjectTasksTab } from "@/components/projects/ProjectTasksTab"
import { NotesTab } from "@/components/projects/NotesTab"
import { AssetsFilesTab } from "@/components/projects/AssetsFilesTab"

// ---------------------------------------------------------------------------
// Exported types for page-level data mapping
// ---------------------------------------------------------------------------

export type WorkstreamData = {
  id: string
  name: string
  order: number
  tasks: TaskData[]
}

export type TaskData = {
  id: string
  name: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  assigneeId: string | null
  workstreamId: string | null
  assignee: { id: string; name: string | null; image: string | null } | null
  endDate: Date | null
  order: number
}

export type NoteData = {
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

export type FileData = {
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

export type MemberData = {
  id: string
  name: string | null
  image: string | null
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type ProjectDetailContentProps = {
  project: Project
  projectId?: string
  workstreams?: WorkstreamData[]
  notes?: NoteData[]
  files?: FileData[]
  allTasks?: TaskData[]
  members?: MemberData[]
}

export function ProjectDetailContent({
  project,
  projectId,
  workstreams,
  notes,
  files,
  allTasks,
  members,
}: ProjectDetailContentProps) {
  const [showMeta, setShowMeta] = useState(true)
  const resolvedProjectId = projectId || project.id

  const copyLink = useCallback(async () => {
    if (!navigator.clipboard) {
      toast.error("Clipboard not available")
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied")
    } catch {
      toast.error("Failed to copy link")
    }
  }, [])

  const breadcrumbs = useMemo(
    () => [
      { label: "Projects", href: "/dashboard/projects" },
      { label: project.name },
    ],
    [project.name]
  )

  // Build detail data from project
  const detail = project.detail
  const meta = {
    priorityLabel: project.priority.charAt(0).toUpperCase() + project.priority.slice(1),
    locationLabel: detail?.location || "Australia",
    sprintLabel: detail?.sprints || `${project.typeLabel || "MVP"} ${project.durationLabel || "2 weeks"}`,
    lastSyncLabel: detail?.lastSync || "Just now",
  }

  const scope = detail ? {
    inScope: detail.inScope,
    outOfScope: detail.outOfScope,
  } : {
    inScope: ["Define scope", "Draft solution", "Validate with stakeholders"],
    outOfScope: ["Backend logic changes", "Marketing landing pages"],
  }

  const outcomes = detail?.expectedOutcomes || [
    "Reduce steps and improve usability",
    "Increase success rate",
    "Deliver production-ready UI",
  ]

  const keyFeatures = detail?.keyFeatures || {
    p0: ["Core user flow"],
    p1: ["Filters and empty states"],
    p2: ["Visual polish"],
  }

  const timelineTasks: TimelineTask[] = project.tasks.map(t => ({
    id: t.id,
    name: t.name,
    startDate: t.startDate,
    endDate: t.endDate,
    status: t.status === "done" ? "done" : t.status === "in-progress" ? "in-progress" : "planned",
  }))

  const time = {
    estimateLabel: detail?.estimate || "1 months",
    dueDate: project.endDate,
    daysRemainingLabel: detail ? `${detail.daysRemaining} Days to go` : "21 Days to go",
    progressPercent: project.progress > 0 ? Math.min(project.progress, 100) : 75,
  }

  const backlog = {
    statusLabel: project.status === "active" ? "Active" as const :
                 project.status === "completed" ? "Completed" as const :
                 project.status === "cancelled" ? "Cancelled" as const :
                 project.status === "planned" ? "Planned" as const : "Backlog" as const,
    groupLabel: detail?.group || "None",
    priorityLabel: meta.priorityLabel,
    labelBadge: detail?.label || "Design",
    picUsers: detail?.pic ? [{ id: "pic-1", name: detail.pic.name, avatarUrl: detail.pic.avatar }] :
              project.members.length > 0 ? [{ id: "pic-1", name: project.members[0] }] :
              [{ id: "pic-1", name: "Jason D" }],
    supportUsers: detail?.support?.map((s, i) => ({ id: `support-${i}`, name: s.name, avatarUrl: s.avatar })) || [],
  }

  const quickLinks = detail?.quickLinks?.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type === "pdf" ? "pdf" as const :
          f.type === "zip" ? "zip" as const :
          f.type === "figma" ? "fig" as const : "file" as const,
    sizeMB: parseFloat(f.size) || 13.0,
    url: "#",
  })) || []

  // Workstream info for TasksTab
  const workstreamInfos = (workstreams || []).map(ws => ({ id: ws.id, name: ws.name }))

  return (
    <div className="flex flex-1 flex-col min-w-0 m-2 border border-border rounded-lg">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
          <div className="hidden sm:block">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Copy link" onClick={copyLink}>
            <LinkSimple className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={!showMeta}
            aria-label={showMeta ? "Collapse meta panel" : "Expand meta panel"}
            className={showMeta ? "bg-muted" : ""}
            onClick={() => setShowMeta((v) => !v)}
          >
            <SquareHalf className="h-4 w-4" weight="duotone" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-background px-2 my-0 rounded-b-lg min-w-0 border-t">
        <div className="px-4">
          <div className="mx-auto w-full max-w-7xl">
            <div
              className={
                "mt-0 grid grid-cols-1 gap-15 " +
                (showMeta
                  ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,320px)]"
                  : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0px)]")
              }
            >
              <div className="space-y-6 pt-4">
                <ProjectDetailHeader
                  id={project.id}
                  name={project.name}
                  meta={meta}
                />

                <Tabs defaultValue="overview">
                  <TabsList className="w-full gap-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="workstream">Workstream</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="assets">Assets &amp; Files</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="space-y-10">
                      <p className="text-sm leading-6 text-muted-foreground">{detail?.description || `Project for ${project.client || "internal use"}.`}</p>
                      <ScopeColumns scope={scope} />
                      <OutcomesList outcomes={outcomes} />
                      <KeyFeaturesColumns features={keyFeatures} />
                      <TimelineGantt tasks={timelineTasks} />
                    </div>
                  </TabsContent>

                  <TabsContent value="workstream">
                    {workstreams ? (
                      <WorkstreamTab
                        projectId={resolvedProjectId}
                        workstreams={workstreams}
                        allTasks={allTasks || []}
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                        Workstream section is upcoming.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks">
                    {allTasks ? (
                      <ProjectTasksTab
                        projectId={resolvedProjectId}
                        tasks={allTasks}
                        workstreams={workstreamInfos}
                        members={members || []}
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                        Tasks section is upcoming.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes">
                    {notes ? (
                      <NotesTab
                        projectId={resolvedProjectId}
                        notes={notes}
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                        Notes section is upcoming.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="assets">
                    {files ? (
                      <AssetsFilesTab
                        projectId={resolvedProjectId}
                        files={files}
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
                        Assets &amp; Files section is upcoming.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <AnimatePresence initial={false}>
                {showMeta && (
                  <motion.div
                    key="meta-panel"
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 80, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    className="lg:border-l lg:border-border lg:pl-6"
                  >
                    <RightMetaPanel time={time} backlog={backlog} quickLinks={quickLinks} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Separator className="mt-auto" />
      </div>
    </div>
  )
}

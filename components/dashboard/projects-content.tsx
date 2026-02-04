"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { ProjectHeader } from "@/components/dashboard/project-header"
import { ProjectCardsView } from "@/components/dashboard/project-cards-view"
import { ProjectWizard } from "@/components/project-wizard/ProjectWizard"
import { listProjects, createProject } from "@/app/actions/projects"
import type { ProjectListItem } from "@/types/project"
import type { FilterCounts } from "@/lib/data/projects"
import { DEFAULT_VIEW_OPTIONS, type FilterChip, type ViewOptions } from "@/lib/view-options"
import { toast } from "sonner"

// Compute filter counts for the new ProjectListItem type
function computeFilterCountsFromList(list: ProjectListItem[]): FilterCounts {
  const res: FilterCounts = {
    status: {},
    priority: {},
    tags: {},
    members: {},
  }
  for (const p of list) {
    // Status (convert uppercase to lowercase for display)
    const statusKey = p.status.toLowerCase()
    res.status![statusKey] = (res.status![statusKey] || 0) + 1

    // Priority (convert uppercase to lowercase for display)
    const priorityKey = p.priority.toLowerCase()
    res.priority![priorityKey] = (res.priority![priorityKey] || 0) + 1

    // Tags
    for (const t of p.tags) {
      const tagKey = t.name.toLowerCase()
      res.tags![tagKey] = (res.tags![tagKey] || 0) + 1
    }

    // Members
    if (p.members.length === 0) {
      res.members!["no-member"] = (res.members!["no-member"] || 0) + 1
    }
    if (p.members.length > 0) {
      res.members!["current"] = (res.members!["current"] || 0) + 1
    }
  }
  return res
}

export function ProjectsContent() {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewOptions, setViewOptions] = useState<ViewOptions>(DEFAULT_VIEW_OPTIONS)
  const [filters, setFilters] = useState<FilterChip[]>([])
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      setError(null)

      const result = await listProjects({
        includeCompleted: viewOptions.showClosedProjects,
      })

      if (result.success && result.data) {
        setProjects(result.data.items)
      } else {
        setError(result.error || "Failed to load projects")
      }

      setLoading(false)
    }

    fetchProjects()
  }, [viewOptions.showClosedProjects])

  const openWizard = () => setIsWizardOpen(true)
  const closeWizard = () => setIsWizardOpen(false)

  const handleProjectCreated = async (projectData?: {
    name: string
    description?: string
    priority?: string
    status?: string
    startDate?: string
    endDate?: string
    clientName?: string
    typeLabel?: string
  }) => {
    if (!projectData) {
      closeWizard()
      return
    }

    startTransition(async () => {
      const result = await createProject({
        name: projectData.name,
        description: projectData.description,
        priority: (projectData.priority?.toUpperCase() || "MEDIUM") as "URGENT" | "HIGH" | "MEDIUM" | "LOW",
        status: (projectData.status?.toUpperCase() || "BACKLOG") as "ACTIVE" | "PLANNED" | "BACKLOG" | "COMPLETED" | "CANCELLED",
        startDate: projectData.startDate || "",
        endDate: projectData.endDate || "",
        clientName: projectData.clientName,
        typeLabel: projectData.typeLabel,
        // Required defaults
        deadlineType: "NONE",
        successType: "UNDEFINED",
      })

      if (result.success) {
        toast.success("Project created successfully")
        closeWizard()

        // Refresh projects list
        const refreshResult = await listProjects({
          includeCompleted: viewOptions.showClosedProjects,
        })
        if (refreshResult.success && refreshResult.data) {
          setProjects(refreshResult.data.items)
        }
      } else {
        toast.error(result.error || "Failed to create project")
      }
    })
  }

  const removeFilter = (key: string, value: string) => {
    const next = filters.filter((f) => !(f.key === key && f.value === value))
    setFilters(next)
  }

  const applyFilters = (chips: FilterChip[]) => {
    setFilters(chips)
  }

  const filteredProjects = useMemo(() => {
    let list = projects.slice()

    // Build filter buckets from chips
    const statusSet = new Set<string>()
    const prioritySet = new Set<string>()
    const tagSet = new Set<string>()
    const memberSet = new Set<string>()

    for (const { key, value } of filters) {
      const k = key.trim().toLowerCase()
      const v = value.trim().toLowerCase()
      if (k.startsWith("status")) statusSet.add(v)
      else if (k.startsWith("priority")) prioritySet.add(v)
      else if (k.startsWith("tag")) tagSet.add(v)
      else if (k === "pic" || k.startsWith("member")) memberSet.add(v)
    }

    // Filter by status (compare lowercase)
    if (statusSet.size) {
      list = list.filter((p) => statusSet.has(p.status.toLowerCase()))
    }

    // Filter by priority (compare lowercase)
    if (prioritySet.size) {
      list = list.filter((p) => prioritySet.has(p.priority.toLowerCase()))
    }

    // Filter by tags
    if (tagSet.size) {
      list = list.filter((p) => p.tags.some((t) => tagSet.has(t.name.toLowerCase())))
    }

    // Filter by members
    if (memberSet.size) {
      const members = Array.from(memberSet)
      list = list.filter((p) =>
        p.members.some((m) =>
          members.some((mv) => m.user.name?.toLowerCase().includes(mv))
        )
      )
    }

    // Ordering
    const sorted = list.slice()
    if (viewOptions.ordering === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    if (viewOptions.ordering === "date") {
      sorted.sort((a, b) => (a.endDate?.getTime() || 0) - (b.endDate?.getTime() || 0))
    }
    return sorted
  }, [filters, viewOptions, projects])

  // Show error state
  if (error && !loading) {
    return (
      <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden">
        <div className="flex h-60 flex-col items-center justify-center text-center p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Unable to load projects</h3>
          <p className="mb-6 text-sm text-muted-foreground">{error}</p>
          <button
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden">
        <ProjectHeader
          filters={filters}
          onRemoveFilter={removeFilter}
          onFiltersChange={applyFilters}
          counts={computeFilterCountsFromList(filteredProjects)}
          viewOptions={viewOptions}
          onViewOptionsChange={setViewOptions}
          onAddProject={openWizard}
        />
        <ProjectCardsView
          projects={filteredProjects}
          loading={loading || isPending}
          onCreateProject={openWizard}
        />
      </div>

      {isWizardOpen && (
        <ProjectWizard onClose={closeWizard} onCreate={handleProjectCreated} />
      )}
    </>
  )
}

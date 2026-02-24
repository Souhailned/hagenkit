"use client"

import { useMemo, useState, useTransition, useCallback, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Sparkle } from "@phosphor-icons/react/dist/ssr"
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core"
import {
  arrayMove,
} from "@dnd-kit/sortable"

import { DEFAULT_VIEW_OPTIONS, type FilterChip as FilterChipType, type ViewOptions } from "@/lib/view-options"
import type { TaskGroup, TaskDetail, FilterCounts } from "@/types/task"
import { TaskWeekBoardView } from "@/components/tasks/task-week-board-view"
import { TaskListView } from "@/components/tasks/task-list-view"
import { TaskQuickCreateModal } from "@/components/tasks/task-quick-create-modal"
import { Button } from "@/components/ui/button"
import { FilterPopover } from "@/components/dashboard/filter-popover"
import { ChipOverflow } from "@/components/dashboard/chip-overflow"
import { ViewOptionsPopover } from "@/components/dashboard/view-options-popover"
import { toast } from "sonner"
import {
  toggleTaskStatus,
  moveTaskDate,
  createTask,
  updateTask,
  deleteTask,
  getWorkspaceMembers,
  getWorkspaceProjects,
  getViewOptions,
  saveViewOptions,
  resetViewOptions,
} from "@/app/actions/tasks"
import type { TaskAssignee } from "@/types/task"

interface MyTasksPageProps {
  initialGroups: TaskGroup[]
}

export function MyTasksPage({ initialGroups }: MyTasksPageProps) {
  const [isPending, startTransition] = useTransition()
  const [groups, setGroups] = useState<TaskGroup[]>(initialGroups)
  const [members, setMembers] = useState<TaskAssignee[]>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string; status: string }>>([])

  const [filters, setFilters] = useState<FilterChipType[]>([])
  const [viewOptions, setViewOptions] = useState<ViewOptions>(DEFAULT_VIEW_OPTIONS)

  // Modal state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null)
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>()
  const [defaultDate, setDefaultDate] = useState<Date | undefined>()

  // Load members, projects, and view options on mount
  useEffect(() => {
    async function loadData() {
      const [membersResult, projectsResult, viewOptionsResult] = await Promise.all([
        getWorkspaceMembers(),
        getWorkspaceProjects(),
        getViewOptions(),
      ])

      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data)
      }
      if (projectsResult.success && projectsResult.data) {
        setProjects(projectsResult.data)
      }
      if (viewOptionsResult.success && viewOptionsResult.data) {
        setViewOptions(viewOptionsResult.data)
      }
    }
    loadData()
  }, [])

  // Save view options on change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveViewOptions(viewOptions)
    }, 500)
    return () => clearTimeout(timeout)
  }, [viewOptions])

  const counts = useMemo<FilterCounts>(() => {
    const allTasks = groups.flatMap((g) => g.tasks)
    const memberCounts: Record<string, number> = {}

    for (const task of allTasks) {
      if (!task.assignee) {
        memberCounts["no-member"] = (memberCounts["no-member"] || 0) + 1
      } else {
        memberCounts["current"] = (memberCounts["current"] || 0) + 1
        const name = task.assignee.name?.toLowerCase() || ""
        if (name.includes("jason")) {
          memberCounts["jason"] = (memberCounts["jason"] || 0) + 1
        }
      }
    }

    return {
      members: memberCounts,
    }
  }, [groups])

  // Step 1: Filter tasks based on viewOptions (showClosedProjects)
  const projectFilteredGroups = useMemo<TaskGroup[]>(() => {
    if (viewOptions.showClosedProjects) return groups

    return groups.filter((group) => {
      const status = group.project.status.toLowerCase()
      return status !== "completed" && status !== "cancelled"
    })
  }, [groups, viewOptions.showClosedProjects])

  // Step 2: Filter tasks based on chips
  const chipFilteredGroups = useMemo<TaskGroup[]>(() => {
    if (!filters.length) return projectFilteredGroups

    return projectFilteredGroups
      .map((group) => ({
        ...group,
        tasks: filterTasksByChips(group.tasks, filters),
      }))
      .filter((group) => group.tasks.length > 0)
  }, [projectFilteredGroups, filters])

  // Step 3: Sort tasks within each group based on viewOptions.ordering
  const sortedGroups = useMemo<TaskGroup[]>(() => {
    return chipFilteredGroups.map((group) => {
      const sortedTasks = [...group.tasks]

      switch (viewOptions.ordering) {
        case "alphabetical":
          sortedTasks.sort((a, b) => a.name.localeCompare(b.name))
          break
        case "date":
          sortedTasks.sort((a, b) => {
            const aTime = a.endDate?.getTime() ?? Infinity
            const bTime = b.endDate?.getTime() ?? Infinity
            return aTime - bTime
          })
          break
        case "manual":
        default:
          // Keep original order (by task.order)
          sortedTasks.sort((a, b) => a.order - b.order)
          break
      }

      return { ...group, tasks: sortedTasks }
    })
  }, [chipFilteredGroups, viewOptions.ordering])

  // Step 4: Re-group tasks based on viewOptions.groupBy
  const visibleGroups = useMemo<TaskGroup[]>(() => {
    // If groupBy is 'none' or not set, keep current project-based structure
    if (viewOptions.groupBy === "none" || !viewOptions.groupBy) {
      return sortedGroups
    }

    // Flatten all tasks and re-group them
    const allTasks = sortedGroups.flatMap((g) => g.tasks)
    const groupMap = new Map<string, TaskGroup>()

    for (const task of allTasks) {
      let groupKey: string
      let groupLabel: string

      switch (viewOptions.groupBy) {
        case "status":
          groupKey = task.status
          groupLabel = task.status === "DONE" ? "Done" : task.status === "IN_PROGRESS" ? "In Progress" : "To Do"
          break
        case "assignee":
          groupKey = task.assigneeId ?? "unassigned"
          groupLabel = task.assignee?.name ?? "Unassigned"
          break
        case "tags":
          groupKey = task.tag ?? "no-tag"
          groupLabel = task.tag ?? "No Tag"
          break
        default:
          groupKey = task.projectId
          groupLabel = task.project.name
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          project: {
            id: groupKey,
            name: groupLabel,
            status: "ACTIVE",
            priority: "MEDIUM",
          },
          tasks: [],
          stats: { total: 0, completed: 0 },
        })
      }

      const group = groupMap.get(groupKey)!
      group.tasks.push(task)
      group.stats.total++
      if (task.status === "DONE") {
        group.stats.completed++
      }
    }

    return Array.from(groupMap.values())
  }, [sortedGroups, viewOptions.groupBy])

  const allVisibleTasks = useMemo<TaskDetail[]>(() => {
    return visibleGroups.flatMap((group) => group.tasks)
  }, [visibleGroups])

  // Handlers
  const openCreateTask = useCallback((context?: { projectId?: string; date?: Date }) => {
    setEditingTask(null)
    setDefaultProjectId(context?.projectId)
    setDefaultDate(context?.date)
    setIsCreateTaskOpen(true)
  }, [])

  const openEditTask = useCallback((task: TaskDetail) => {
    setEditingTask(task)
    setDefaultProjectId(undefined)
    setDefaultDate(undefined)
    setIsCreateTaskOpen(true)
  }, [])

  const handleToggleStatus = useCallback(
    (taskId: string, newStatus: "TODO" | "DONE") => {
      startTransition(async () => {
        const result = await toggleTaskStatus({ id: taskId, status: newStatus })
        if (result.success) {
          setGroups((prev) =>
            prev.map((group) => ({
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
              ),
              stats: {
                ...group.stats,
                completed:
                  newStatus === "DONE"
                    ? group.stats.completed + 1
                    : group.stats.completed - 1,
              },
            }))
          )
        } else {
          toast.error(result.error || "Failed to update task")
        }
      })
    },
    []
  )

  const handleMoveTaskDate = useCallback((taskId: string, newDate: string | null) => {
    startTransition(async () => {
      const result = await moveTaskDate({ id: taskId, endDate: newDate })
      if (result.success && result.data) {
        setGroups((prev) =>
          prev.map((group) => ({
            ...group,
            tasks: group.tasks.map((task) =>
              task.id === taskId
                ? { ...task, endDate: newDate ? new Date(newDate) : null }
                : task
            ),
          }))
        )
        toast.success("Task moved")
      } else {
        toast.error(result.error || "Failed to move task")
      }
    })
  }, [])

  const handleDeleteTask = useCallback((taskId: string) => {
    startTransition(async () => {
      const result = await deleteTask({ id: taskId })
      if (result.success) {
        setGroups((prev) =>
          prev
            .map((group) => ({
              ...group,
              tasks: group.tasks.filter((t) => t.id !== taskId),
              stats: {
                ...group.stats,
                total: group.stats.total - 1,
              },
            }))
            .filter((group) => group.tasks.length > 0)
        )
        toast.success("Task deleted")
      } else {
        toast.error(result.error || "Failed to delete task")
      }
    })
  }, [])

  const handleSubmit = useCallback(
    async (data: any) => {
      if (data.id) {
        // Update
        const result = await updateTask(data)
        if (result.success && result.data) {
          setGroups((prev) =>
            prev.map((group) => ({
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === data.id ? result.data! : task
              ),
            }))
          )
          toast.success("Task updated")
        } else {
          toast.error(result.error || "Failed to update task")
          throw new Error(result.error)
        }
      } else {
        // Create
        const result = await createTask(data)
        if (result.success && result.data) {
          const newTask = result.data
          setGroups((prev) => {
            const existingGroupIndex = prev.findIndex(
              (g) => g.project.id === newTask.projectId
            )

            if (existingGroupIndex >= 0) {
              const newGroups = [...prev]
              newGroups[existingGroupIndex] = {
                ...newGroups[existingGroupIndex],
                tasks: [...newGroups[existingGroupIndex].tasks, newTask],
                stats: {
                  ...newGroups[existingGroupIndex].stats,
                  total: newGroups[existingGroupIndex].stats.total + 1,
                },
              }
              return newGroups
            } else {
              return [
                ...prev,
                {
                  project: newTask.project,
                  tasks: [newTask],
                  stats: { total: 1, completed: 0 },
                },
              ]
            }
          })
          toast.success("Task created")
        } else {
          toast.error(result.error || "Failed to create task")
          throw new Error(result.error)
        }
      }
    },
    []
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find the group containing the active task
    const activeGroupIndex = groups.findIndex((group) =>
      group.tasks.some((task) => task.id === active.id)
    )

    if (activeGroupIndex === -1) return

    const activeGroup = groups[activeGroupIndex]

    // Find the group containing the over task
    const overGroupIndex = groups.findIndex((group) =>
      group.tasks.some((task) => task.id === over.id)
    )

    if (overGroupIndex === -1) return

    // For now, only allow reordering within the same group
    if (activeGroupIndex !== overGroupIndex) return

    const activeIndex = activeGroup.tasks.findIndex((task) => task.id === active.id)
    const overIndex = activeGroup.tasks.findIndex((task) => task.id === over.id)

    if (activeIndex === -1 || overIndex === -1) return

    const reorderedTasks = arrayMove(activeGroup.tasks, activeIndex, overIndex)

    setGroups((prev) =>
      prev.map((group, index) =>
        index === activeGroupIndex ? { ...group, tasks: reorderedTasks } : group
      )
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0">
      {/* Toolbar - Always visible */}
      <div className="flex items-center justify-between px-4 pb-3 pt-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <FilterPopover
            initialChips={filters}
            onApply={setFilters}
            onClear={() => setFilters([])}
            counts={counts}
          />
          <ChipOverflow
            chips={filters}
            onRemove={(key, value) =>
              setFilters((prev) => prev.filter((chip) => !(chip.key === key && chip.value === value)))
            }
            maxVisible={6}
          />
        </div>
        <div className="flex items-center gap-2">
          <ViewOptionsPopover
            options={viewOptions}
            onChange={setViewOptions}
            allowedViewTypes={["list", "board"]}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openCreateTask()}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {/* Empty state */}
        {!visibleGroups.length && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-muted-foreground text-sm mb-4">
              {filters.length > 0 ? "No tasks match your filters." : "No tasks available yet."}
            </p>
            <Button size="sm" onClick={() => openCreateTask()}>
              <Plus className="mr-1.5 h-4 w-4" />
              Create Task
            </Button>
          </div>
        )}
        {visibleGroups.length > 0 && viewOptions.viewType === "list" && (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <TaskListView
              groups={visibleGroups}
              tasksMode={viewOptions.tasks}
              visibleProperties={viewOptions.properties}
              onToggleStatus={handleToggleStatus}
              onEdit={openEditTask}
              onDelete={handleDeleteTask}
              onAddTask={(projectId) => openCreateTask({ projectId })}
            />
          </DndContext>
        )}
        {visibleGroups.length > 0 && viewOptions.viewType === "board" && (
          <TaskWeekBoardView
            tasks={allVisibleTasks}
            viewOptions={{
              mode: "board",
              groupBy: "project",
              sortOrder: "date",
              showCompleted: viewOptions.showClosedProjects,
              showWeekends: true,
            }}
            visibleProperties={viewOptions.properties}
            onToggleStatus={handleToggleStatus}
            onMoveTask={handleMoveTaskDate}
            onEdit={openEditTask}
            onDelete={handleDeleteTask}
            onAddTask={(date) => openCreateTask({ date })}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <TaskQuickCreateModal
        open={isCreateTaskOpen}
        onClose={() => {
          setIsCreateTaskOpen(false)
          setEditingTask(null)
          setDefaultProjectId(undefined)
          setDefaultDate(undefined)
        }}
        onSubmit={handleSubmit}
        task={editingTask}
        projects={projects}
        members={members}
        defaultProjectId={defaultProjectId}
        defaultDate={defaultDate}
      />
    </div>
  )
}

// Helper function to filter tasks by chips
function filterTasksByChips(tasks: TaskDetail[], chips: FilterChipType[]): TaskDetail[] {
  if (!chips.length) return tasks

  // Group chips by category
  const statusFilters = chips
    .filter((c) => c.key.toLowerCase() === "status")
    .map((c) => c.value.toUpperCase().replace(/ /g, "_"))
  const priorityFilters = chips
    .filter((c) => c.key.toLowerCase() === "priority")
    .map((c) => c.value.toUpperCase().replace(/ /g, "_"))
  const tagFilters = chips
    .filter((c) => c.key.toLowerCase() === "tag")
    .map((c) => c.value.toUpperCase())
  const memberFilters = chips
    .filter((c) => c.key.toLowerCase() === "member" || c.key.toLowerCase() === "pic")
    .map((c) => c.value.toLowerCase())

  return tasks.filter((task) => {
    // Status filter (OR within category)
    if (statusFilters.length > 0) {
      if (!statusFilters.includes(task.status)) return false
    }
    // Priority filter (OR within category)
    if (priorityFilters.length > 0) {
      const taskPriority = task.priority || "NO_PRIORITY"
      if (!priorityFilters.includes(taskPriority)) return false
    }
    // Tag filter (OR within category)
    if (tagFilters.length > 0) {
      if (!task.tag || !tagFilters.includes(task.tag)) return false
    }
    // Member filter (OR within category)
    if (memberFilters.length > 0) {
      const name = task.assignee?.name?.toLowerCase() ?? ""
      let matches = false
      for (const value of memberFilters) {
        if (value === "no member" && !task.assignee) matches = true
        else if (value === "current member" && task.assignee) matches = true
        else if (name.includes(value)) matches = true
      }
      if (!matches) return false
    }
    return true
  })
}

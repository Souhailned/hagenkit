"use client"

import { useState, useRef, useEffect, useMemo, useTransition } from "react"
import type { ProjectListItem, ProjectTask } from "@/types/project"
import {
  differenceInCalendarDays,
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  format,
  isSameDay,
} from "date-fns"
import {
  CaretLeft,
  CaretRight,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  CaretDown,
} from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { DraggableBar } from "@/components/dashboard/project-timeline-draggable-bar"
import { PriorityGlyphIcon } from "@/components/dashboard/priority-badge"
import { getProject } from "@/app/actions/projects"

type TimelineProject = ProjectListItem & {
  _tasks?: ProjectTask[]
  _tasksLoaded?: boolean
}

type ProjectTimelineViewProps = {
  projects: ProjectListItem[]
  loading?: boolean
}

const TODAY = new Date()

export function ProjectTimelineView({ projects, loading = false }: ProjectTimelineViewProps) {
  const [items, setItems] = useState<TimelineProject[]>(projects.map((p) => ({ ...p, _tasks: [], _tasksLoaded: false })))
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month" | "Quarter">("Week")
  const [zoom, setZoom] = useState(1)
  const [viewStartDate, setViewStartDate] = useState(
    () => startOfWeek(addWeeks(TODAY, -1), { weekStartsOn: 1 }),
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const nameColRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollToTodayRef = useRef(true)
  const [nameColWidth, setNameColWidth] = useState(280)
  const [todayOffsetDays, setTodayOffsetDays] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  // Edit dialog state
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean
    type: "project" | "task"
    projectId: string
    taskId?: string
    startDate: string
    endDate: string
  } | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    message: string
    onConfirm: () => void
  } | null>(null)

  const viewModes = useMemo(() => ["Day", "Week", "Month", "Quarter"] as const, [])

  // Sync external projects
  useEffect(() => {
    setItems((prev) => {
      const prevMap = new Map(prev.map((p) => [p.id, p]))
      return projects.map((p) => {
        const existing = prevMap.get(p.id)
        return {
          ...p,
          _tasks: existing?._tasks || [],
          _tasksLoaded: existing?._tasksLoaded || false,
        }
      })
    })
  }, [projects])

  // Lazy-load tasks when expanding a project
  const loadTasksForProject = (projectId: string) => {
    startTransition(async () => {
      const result = await getProject(projectId)
      if (result.success && result.data) {
        setItems((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, _tasks: result.data!.tasks, _tasksLoaded: true }
              : p,
          ),
        )
      }
    })
  }

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const isExpanded = prev.includes(projectId)
      if (!isExpanded) {
        // Load tasks if not loaded yet
        const project = items.find((p) => p.id === projectId)
        if (project && !project._tasksLoaded) {
          loadTasksForProject(projectId)
        }
      }
      return isExpanded ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    })
  }

  const goToToday = () => {
    shouldAutoScrollToTodayRef.current = true
    setViewStartDate(startOfWeek(addWeeks(TODAY, -1), { weekStartsOn: 1 }))
  }

  const navigateTime = (direction: "prev" | "next") => {
    const step = direction === "next" ? 1 : -1
    const weeksStep = viewMode === "Quarter" ? 12 : viewMode === "Month" ? 4 : 1
    setViewStartDate((d) => (step === 1 ? addWeeks(d, weeksStep) : subWeeks(d, weeksStep)))
  }

  const dates = useMemo(() => {
    const daysToRender = viewMode === "Day" ? 21 : viewMode === "Week" ? 60 : viewMode === "Month" ? 90 : 120
    return Array.from({ length: daysToRender }).map((_, i) => addDays(viewStartDate, i))
  }, [viewMode, viewStartDate])

  const baseCellWidth = viewMode === "Day" ? 140 : viewMode === "Week" ? 60 : viewMode === "Month" ? 40 : 20
  const cellWidth = Math.max(20, Math.round(baseCellWidth * zoom))
  const timelineWidth = dates.length * cellWidth

  useEffect(() => {
    setZoom(1)
  }, [viewMode])

  useEffect(() => {
    const el = nameColRef.current
    if (!el) return
    const update = () => setNameColWidth(Math.round(el.getBoundingClientRect().width))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Today line position
  useEffect(() => {
    const offset = differenceInCalendarDays(TODAY, dates[0])
    if (offset < 0 || offset >= dates.length) {
      setTodayOffsetDays(null)
      return
    }
    setTodayOffsetDays(offset)
  }, [dates])

  useEffect(() => {
    if (!shouldAutoScrollToTodayRef.current) return
    if (todayOffsetDays == null) return

    const el = scrollContainerRef.current
    if (!el) return

    const sidebarWidth = isSidebarOpen ? nameColWidth : 0
    const timelineViewportWidth = Math.max(0, el.clientWidth - sidebarWidth)
    const dayX = todayOffsetDays * cellWidth
    const target = Math.max(0, dayX - timelineViewportWidth / 2 + cellWidth / 2)

    el.scrollTo({ left: target, behavior: "smooth" })
    shouldAutoScrollToTodayRef.current = false
  }, [todayOffsetDays, cellWidth, isSidebarOpen, nameColWidth])

  // Double-click handlers for edit dialog
  const handleDoubleClickProject = (projectId: string) => {
    const project = items.find((p) => p.id === projectId)
    if (!project?.startDate || !project?.endDate) return
    setEditDialog({
      isOpen: true,
      type: "project",
      projectId,
      startDate: format(project.startDate, "yyyy-MM-dd"),
      endDate: format(project.endDate, "yyyy-MM-dd"),
    })
  }

  const handleDoubleClickTask = (projectId: string, taskId: string) => {
    const project = items.find((p) => p.id === projectId)
    const task = project?._tasks?.find((t) => t.id === taskId)
    if (!task?.startDate || !task?.endDate) return
    setEditDialog({
      isOpen: true,
      type: "task",
      projectId,
      taskId,
      startDate: format(task.startDate, "yyyy-MM-dd"),
      endDate: format(task.endDate, "yyyy-MM-dd"),
    })
  }

  const handleSaveEdit = () => {
    if (!editDialog) return
    const newStart = new Date(editDialog.startDate)
    const newEnd = new Date(editDialog.endDate)
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime()) || newEnd < newStart) return

    if (editDialog.type === "project") {
      handleUpdateProjectDuration(editDialog.projectId, newStart, newEnd)
    } else if (editDialog.taskId) {
      handleUpdateTaskDuration(editDialog.projectId, editDialog.taskId, newStart, newEnd)
    }
    setEditDialog(null)
  }

  // Handlers for dragging projects
  const applyProjectMove = (projectId: string, newStart: Date) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        if (!p.startDate || !p.endDate) return p
        const durationDays = differenceInCalendarDays(p.endDate, p.startDate)
        const newEnd = addDays(newStart, durationDays)
        const diff = differenceInCalendarDays(newStart, p.startDate)
        return {
          ...p,
          startDate: newStart,
          endDate: newEnd,
          _tasks: p._tasks?.map((t) => ({
            ...t,
            startDate: t.startDate ? addDays(t.startDate, diff) : null,
            endDate: t.endDate ? addDays(t.endDate, diff) : null,
          })),
        }
      }),
    )
  }

  const handleUpdateProject = (projectId: string, newStart: Date) => {
    const project = items.find((p) => p.id === projectId)
    const taskCount = project?._tasks?.length ?? 0

    if (taskCount > 0 && project?._tasksLoaded) {
      setConfirmDialog({
        isOpen: true,
        message: `Move all ${taskCount} task${taskCount !== 1 ? "s" : ""} along with this project?`,
        onConfirm: () => applyProjectMove(projectId, newStart),
      })
    } else {
      applyProjectMove(projectId, newStart)
    }
  }

  const handleUpdateProjectDuration = (projectId: string, newStart: Date, newEnd: Date) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, startDate: newStart, endDate: newEnd } : p,
      ),
    )
  }

  const handleUpdateTask = (projectId: string, taskId: string, newStart: Date) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          _tasks: p._tasks?.map((t) => {
            if (t.id !== taskId || !t.startDate || !t.endDate) return t
            const dur = differenceInCalendarDays(t.endDate, t.startDate)
            return { ...t, startDate: newStart, endDate: addDays(newStart, dur) }
          }),
        }
      }),
    )
  }

  const handleUpdateTaskDuration = (projectId: string, taskId: string, newStart: Date, newEnd: Date) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          _tasks: p._tasks?.map((t) =>
            t.id === taskId ? { ...t, startDate: newStart, endDate: newEnd } : t,
          ),
        }
      }),
    )
  }

  const toggleTaskStatus = (projectId: string, taskId: string) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          _tasks: p._tasks?.map((t) => {
            if (t.id !== taskId) return t
            const newStatus = t.status === "DONE" ? "TODO" : "DONE"
            return { ...t, status: newStatus as typeof t.status }
          }),
        }
      }),
    )
  }

  // Grid background for each date column
  const gridCols = (
    <div className="absolute inset-0 flex pointer-events-none h-full">
      {dates.map((day, i) => {
        const isWeekend = day.getDay() === 0 || day.getDay() === 6
        return (
          <div
            key={i}
            style={{ width: cellWidth }}
            className={cn(
              "flex-none h-full border-r border-border/20",
              isWeekend && viewMode === "Day" ? "bg-muted/20" : "",
            )}
          />
        )
      })}
    </div>
  )

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-background min-w-0">
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-2">
          <Skeleton className="h-7 w-7" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[54px] rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No projects with date ranges found. Set start and end dates on your projects to view them on the timeline.
      </div>
    )
  }

  // Filter to only projects that have date ranges
  const timelineProjects = items.filter((p) => p.startDate && p.endDate)

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background min-w-0">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={() => setIsSidebarOpen((s) => !s)}
          >
            <CaretDown className={cn("h-4 w-4 transition-transform", isSidebarOpen ? "rotate-90" : "-rotate-90")} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
            {viewStartDate.toLocaleString("nl", { month: "long", year: "numeric" })}
          </span>
          <div className="hidden md:flex items-center gap-1 ml-4">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => navigateTime("prev")}>
              <CaretLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg px-3 text-xs bg-transparent"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => navigateTime("next")}>
              <CaretRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="ml-2 hidden md:flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-lg px-3 text-xs justify-between min-w-[80px]"
                >
                  {viewMode}
                  <CaretDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[120px] p-1" align="start">
                {viewModes.map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start h-8 px-2 text-xs"
                    onClick={() => setViewMode(mode)}
                  >
                    {mode}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <div className="ml-2 hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setZoom((z) => Math.max(0.5, Math.min(2.5, z * 1.2)))}
            >
              <MagnifyingGlassPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setZoom((z) => Math.max(0.5, Math.min(2.5, z / 1.2)))}
            >
              <MagnifyingGlassMinus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden md:block flex-1 overflow-hidden min-w-0">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto min-w-0"
        >
          <div className="relative min-w-max">
            {/* Timeline Header */}
            <div className="flex h-10 items-center border-b bg-muted/30 border-border sticky top-0 z-20">
              <div
                ref={nameColRef}
                className={cn(
                  "shrink-0 bg-background sticky left-0 z-30 border-r border-border/20 transition-all duration-300 flex items-center",
                  isSidebarOpen ? "w-[280px] lg:w-[320px]" : "w-0 overflow-hidden px-0 border-none",
                )}
              >
                <div className="px-4">
                  <span className="text-xs font-medium text-muted-foreground">Name</span>
                </div>
              </div>

              <div className="relative shrink-0 h-full" style={{ width: timelineWidth }}>
                <div className="flex h-full items-center" style={{ width: timelineWidth }}>
                  {dates.map((day, i) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6
                    const showLabel =
                      viewMode === "Day" ||
                      (viewMode === "Week" && i % 2 === 0) ||
                      (viewMode === "Month" && day.getDay() === 1) ||
                      (viewMode === "Quarter" && day.getDate() === 1)

                    const headerFormat = viewMode === "Day" ? "EEE d" : "d"
                    const label = viewMode === "Quarter" ? format(day, "MMM") : format(day, headerFormat)

                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex-none h-full flex items-center justify-center border-r border-border/20",
                          isWeekend && viewMode === "Day" ? "bg-muted/20" : "",
                        )}
                        style={{ width: cellWidth }}
                      >
                        {showLabel && (
                          <span
                            className={cn(
                              "block text-xs whitespace-nowrap leading-none",
                              isSameDay(day, TODAY) ? "text-primary font-semibold" : "text-muted-foreground",
                            )}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none z-10" />
              </div>
            </div>

            {/* Project Rows */}
            <div className="flex flex-col relative">
              {timelineProjects.map((project) => (
                <div key={project.id} className="w-full flex flex-col">
                  {/* Project Row */}
                  <div className="flex h-[54px] group hover:bg-accent/20 relative border-b border-border/20">
                    <div
                      className={cn(
                        "shrink-0 sticky left-0 z-30 bg-background border-r border-border/20 transition-all duration-300",
                        isSidebarOpen ? "w-[280px] lg:w-[320px]" : "w-0 overflow-hidden border-none",
                      )}
                    >
                      <div
                        className={cn(
                          "h-[54px] w-full flex items-center justify-between px-4 cursor-pointer",
                          isSidebarOpen ? "" : "px-0",
                        )}
                        onClick={() => toggleProject(project.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={cn("transition-transform", expandedProjects.includes(project.id) ? "rotate-0" : "-rotate-90")}>
                            <CaretDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-semibold text-md truncate">{project.name}</span>
                          <span className="ml-1 text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
                            {project._count.tasks}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative h-full shrink-0 overflow-hidden" style={{ width: timelineWidth }}>
                      {gridCols}
                      {project.startDate && project.endDate && (
                        <DraggableBar
                          item={{
                            id: project.id,
                            name: project.name,
                            startDate: project.startDate,
                            endDate: project.endDate,
                            progress: project.progress,
                          }}
                          variant="project"
                          viewStartDate={viewStartDate}
                          cellWidth={cellWidth}
                          onUpdateStart={(id, newStart) => handleUpdateProject(id, newStart)}
                          onUpdateDuration={(id, newStart, newEnd) => handleUpdateProjectDuration(id, newStart, newEnd)}
                          onDoubleClick={() => handleDoubleClickProject(project.id)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Expanded Task Rows */}
                  {expandedProjects.includes(project.id) &&
                    (project._tasksLoaded ? (
                      project._tasks && project._tasks.length > 0 ? (
                        project._tasks
                          .filter((t) => t.startDate && t.endDate)
                          .map((task) => (
                            <div key={task.id} className="flex h-[54px] group hover:bg-accent/10 relative border-b border-border/20">
                              <div
                                className={cn(
                                  "shrink-0 sticky left-0 z-30 bg-background border-r border-border/20 transition-all duration-300",
                                  isSidebarOpen ? "w-[280px] lg:w-[320px]" : "w-0 overflow-hidden border-none",
                                )}
                              >
                                <div className={cn("h-[54px] w-full flex items-center gap-2 pl-10 pr-4", isSidebarOpen ? "" : "px-0")}>
                                  <Checkbox
                                    checked={task.status === "DONE"}
                                    onCheckedChange={() => toggleTaskStatus(project.id, task.id)}
                                    className={cn(
                                      "h-4 w-4 rounded-sm",
                                      "data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:text-white",
                                    )}
                                  />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className={cn("text-md truncate", task.status === "DONE" && "line-through text-muted-foreground")}>
                                      {task.name}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span>{task.assignee?.name || "Unassigned"}</span>
                                      <span>·</span>
                                      <PriorityGlyphIcon level={project.priority} size="sm" />
                                      <span>·</span>
                                      <span>{task.status.toLowerCase()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="relative h-full shrink-0 overflow-hidden" style={{ width: timelineWidth }}>
                                {gridCols}
                                {task.startDate && task.endDate && (
                                  <DraggableBar
                                    item={{
                                      id: task.id,
                                      name: task.name,
                                      startDate: task.startDate,
                                      endDate: task.endDate,
                                      status: task.status,
                                    }}
                                    variant="task"
                                    viewStartDate={viewStartDate}
                                    cellWidth={cellWidth}
                                    onUpdateStart={(id, newStart) => handleUpdateTask(project.id, id, newStart)}
                                    onUpdateDuration={(id, newStart, newEnd) => handleUpdateTaskDuration(project.id, id, newStart, newEnd)}
                                    onDoubleClick={() => handleDoubleClickTask(project.id, task.id)}
                                  />
                                )}
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="flex h-[40px] items-center border-b border-border/20">
                          <div
                            className={cn(
                              "shrink-0 sticky left-0 z-30 bg-background border-r border-border/20 transition-all duration-300",
                              isSidebarOpen ? "w-[280px] lg:w-[320px]" : "w-0 overflow-hidden border-none",
                            )}
                          >
                            <div className="pl-10 pr-4 text-xs text-muted-foreground">No tasks with dates</div>
                          </div>
                          <div style={{ width: timelineWidth }} />
                        </div>
                      )
                    ) : (
                      // Loading skeleton for tasks
                      <div className="flex h-[54px] items-center border-b border-border/20">
                        <div
                          className={cn(
                            "shrink-0 sticky left-0 z-30 bg-background border-r border-border/20 transition-all duration-300",
                            isSidebarOpen ? "w-[280px] lg:w-[320px]" : "w-0 overflow-hidden border-none",
                          )}
                        >
                          <div className="pl-10 pr-4 flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-sm" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <div className="relative h-full shrink-0" style={{ width: timelineWidth }}>
                          <Skeleton className="absolute top-[12px] left-[60px] h-[30px] w-[200px] rounded-md" />
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Today line */}
            {todayOffsetDays != null && (
              <div
                className="absolute z-10 pointer-events-none overflow-hidden"
                style={{
                  left: nameColWidth,
                  top: 40,
                  bottom: 0,
                  width: timelineWidth,
                }}
              >
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary"
                  style={{ left: todayOffsetDays * cellWidth + cellWidth / 2 }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="md:hidden flex-1 overflow-auto">
        {timelineProjects.map((project) => (
          <div key={project.id} className="border-b border-border/30">
            <div
              className="p-4 flex items-center justify-between cursor-pointer active:bg-accent/50"
              onClick={() => toggleProject(project.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {expandedProjects.includes(project.id) ? (
                  <CaretDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <CaretRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base truncate">{project.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0">
                      {project._count.tasks}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {project.startDate ? format(project.startDate, "d MMM") : "?"} — {project.endDate ? format(project.endDate, "d MMM yyyy") : "?"}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-muted-foreground shrink-0 ml-2">{project.progress}%</div>
            </div>

            {expandedProjects.includes(project.id) && project._tasksLoaded && (
              <div className="bg-muted/20">
                {(project._tasks || []).map((task) => (
                  <div key={task.id} className="px-4 py-3 pl-12 border-t border-border/20">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={task.status === "DONE"}
                        onCheckedChange={() => toggleTaskStatus(project.id, task.id)}
                        className={cn(
                          "h-4 w-4 rounded-sm mt-0.5",
                          "data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 data-[state=checked]:text-white",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-md">{task.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{task.assignee?.name || "Unassigned"}</span>
                          <span>·</span>
                          <PriorityGlyphIcon level={project.priority} size="sm" />
                          <span>·</span>
                          <span>{task.status.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Date Dialog */}
      {editDialog && (
        <Dialog open={editDialog.isOpen} onOpenChange={(open) => { if (!open) setEditDialog(null) }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Dates</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-start-date">Start Date</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editDialog.startDate}
                  onChange={(e) => setEditDialog({ ...editDialog, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end-date">End Date</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editDialog.endDate}
                  onChange={(e) => setEditDialog({ ...editDialog, endDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => { if (!open) setConfirmDialog(null) }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirm Move</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{confirmDialog.message}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null) }}>Move All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

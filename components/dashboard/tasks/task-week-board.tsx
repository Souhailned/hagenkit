"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CaretLeft, CaretRight, Plus } from "@phosphor-icons/react/dist/ssr"
import { format } from "date-fns"
import type { TaskDetail, DayColumn } from "@/types/task"
import type { ViewOptions } from "@/lib/view-options"
import { TaskBoardCard } from "./task-board-card"
import {
  generateWeekData,
  getPreviousWeek,
  getNextWeek,
  formatDateForApi,
} from "@/components/tasks/task-helpers"

// ─── Props ───────────────────────────────────────────────

interface TaskWeekBoardProps {
  tasks: TaskDetail[]
  viewOptions: ViewOptions
  onToggleStatus: (taskId: string, currentStatus: string) => void
  onEditTask: (task: TaskDetail) => void
  onDeleteTask: (taskId: string) => void
  onAddTask: (date?: Date) => void
  onMoveTask?: (taskId: string, newDate: string | null) => void
}

// ─── Droppable Day Column ────────────────────────────────

interface DroppableDayColumnProps {
  day: DayColumn
  tasks: TaskDetail[]
  visibleProperties?: string[]
  onToggleStatus: (taskId: string, currentStatus: string) => void
  onEdit: (task: TaskDetail) => void
  onDelete: (taskId: string) => void
  onAddTask: (date: Date) => void
}

function DroppableDayColumn({
  day,
  tasks,
  visibleProperties,
  onToggleStatus,
  onEdit,
  onDelete,
  onAddTask,
}: DroppableDayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.date.toISOString(),
    data: { type: "day", date: day.date },
  })

  const completedTasks = tasks.filter((t) => t.status === "DONE").length
  const totalTasks = tasks.length

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col flex-shrink-0 w-80 rounded-2xl border border-muted bg-muted min-h-[400px] transition-colors",
        isOver && "border-primary/80 bg-primary/5",
        day.isToday && "border-primary",
      )}
    >
      {/* Day header */}
      <div className="p-3 flex items-center justify-between">
        <span
          className={cn(
            "text-sm font-medium",
            day.isToday && "text-primary",
          )}
        >
          {format(day.date, "d")} {format(day.date, "EEE").toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {completedTasks}/{totalTasks}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onAddTask(day.date)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks container */}
      <div className="flex-1 p-3 pt-0 space-y-3 overflow-auto">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskBoardCard
              key={task.id}
              task={task}
              visibleProperties={visibleProperties}
              onToggleStatus={onToggleStatus}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No tasks
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Board Component ────────────────────────────────

export function TaskWeekBoard({
  tasks,
  viewOptions,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onMoveTask,
}: TaskWeekBoardProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTask, setActiveTask] = useState<TaskDetail | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  // showWeekends defaults to true (ViewOptions doesn't have it, so we always show weekends)
  const weekData = useMemo(
    () => generateWeekData(currentDate, tasks, true),
    [currentDate, tasks],
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || !onMoveTask) return

    if (over.data.current?.type === "day") {
      const newDate = over.data.current.date as Date
      onMoveTask(active.id as string, formatDateForApi(newDate))
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentDate(getPreviousWeek(currentDate))}
          >
            <CaretLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentDate(getNextWeek(currentDate))}
          >
            <CaretRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm font-medium">
          {format(weekData.startDate, "MMM d")} –{" "}
          {format(weekData.endDate, "MMM d, yyyy")}
          <span className="text-muted-foreground ml-2">
            Week {weekData.weekNumber}
          </span>
        </div>

        <div className="w-[140px]" /> {/* Spacer for alignment */}
      </div>

      {/* Board columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 h-full min-w-max">
            {weekData.days.map((day) => (
              <DroppableDayColumn
                key={day.date.toISOString()}
                day={day}
                tasks={day.tasks}
                visibleProperties={viewOptions.properties}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onAddTask={(date) => onAddTask(date)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskBoardCard
                task={activeTask}
                onToggleStatus={() => {}}
                onEdit={() => {}}
                isDragging
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

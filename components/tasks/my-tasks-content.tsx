"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { TaskDetail, TaskGroup, LegacyViewOptions, TaskAssignee } from "@/types/task";
import type { PMTaskStatus, PMTaskPriority, PMTaskTag } from "@/lib/validations/task";
import { TaskListView } from "./task-list-view";
import { TaskWeekBoardView } from "./task-week-board-view";
import { TaskQuickCreateModal } from "./task-quick-create-modal";
import { TaskFilterPopover, TaskFilterChips } from "./task-filter-popover";
import { TaskViewOptions } from "./task-view-options";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  moveTaskDate,
  getWorkspaceMembers,
  getWorkspaceProjects,
} from "@/app/actions/tasks";

interface MyTasksContentProps {
  initialGroups: TaskGroup[];
}

export function MyTasksContent({ initialGroups }: MyTasksContentProps) {
  const [isPending, startTransition] = useTransition();
  const [groups, setGroups] = useState<TaskGroup[]>(initialGroups);
  const [members, setMembers] = useState<TaskAssignee[]>([]);
  const [projects, setProjects] = useState<
    Array<{ id: string; name: string; status: string }>
  >([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>();
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  // Filter state
  const [filters, setFilters] = useState<{
    status: PMTaskStatus[];
    priority: PMTaskPriority[];
    tag: PMTaskTag[];
    assigneeId: string[];
  }>({
    status: [],
    priority: [],
    tag: [],
    assigneeId: [],
  });

  // View options
  const [viewOptions, setViewOptions] = useState<LegacyViewOptions>({
    mode: "board",
    groupBy: "project",
    sortOrder: "date",
    showCompleted: false,
    showWeekends: true,
  });

  // Load members and projects on mount
  useEffect(() => {
    async function loadData() {
      const [membersResult, projectsResult] = await Promise.all([
        getWorkspaceMembers(),
        getWorkspaceProjects(),
      ]);

      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data);
      }
      if (projectsResult.success && projectsResult.data) {
        setProjects(projectsResult.data);
      }
    }
    loadData();
  }, []);

  // Flatten tasks for board view
  const allTasks = groups.flatMap((g) => g.tasks);

  // Handle toggle status
  const handleToggleStatus = useCallback(
    (taskId: string, newStatus: "TODO" | "DONE") => {
      startTransition(async () => {
        const result = await toggleTaskStatus({ id: taskId, status: newStatus });
        if (result.success) {
          // Optimistically update the UI
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
          );
        } else {
          toast.error(result.error || "Failed to update task");
        }
      });
    },
    []
  );

  // Handle move task date
  const handleMoveTask = useCallback((taskId: string, newDate: string | null) => {
    startTransition(async () => {
      const result = await moveTaskDate({ id: taskId, endDate: newDate });
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
        );
        toast.success("Task moved");
      } else {
        toast.error(result.error || "Failed to move task");
      }
    });
  }, []);

  // Handle edit task
  const handleEditTask = useCallback((task: TaskDetail) => {
    setEditingTask(task);
    setDefaultProjectId(undefined);
    setDefaultDate(undefined);
    setModalOpen(true);
  }, []);

  // Handle delete task
  const handleDeleteTask = useCallback((taskId: string) => {
    startTransition(async () => {
      const result = await deleteTask({ id: taskId });
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
        );
        toast.success("Task deleted");
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    });
  }, []);

  // Handle add task
  const handleAddTask = useCallback((dateOrProjectId?: Date | string) => {
    setEditingTask(null);
    if (dateOrProjectId instanceof Date) {
      setDefaultDate(dateOrProjectId);
      setDefaultProjectId(undefined);
    } else if (typeof dateOrProjectId === "string") {
      setDefaultProjectId(dateOrProjectId);
      setDefaultDate(undefined);
    } else {
      setDefaultProjectId(undefined);
      setDefaultDate(undefined);
    }
    setModalOpen(true);
  }, []);

  // Handle submit (create or update)
  const handleSubmit = useCallback(
    async (data: any) => {
      if (data.id) {
        // Update
        const result = await updateTask(data);
        if (result.success && result.data) {
          setGroups((prev) =>
            prev.map((group) => ({
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === data.id ? result.data! : task
              ),
            }))
          );
          toast.success("Task updated");
        } else {
          toast.error(result.error || "Failed to update task");
          throw new Error(result.error);
        }
      } else {
        // Create
        const result = await createTask(data);
        if (result.success && result.data) {
          const newTask = result.data;
          setGroups((prev) => {
            const existingGroupIndex = prev.findIndex(
              (g) => g.project.id === newTask.projectId
            );

            if (existingGroupIndex >= 0) {
              // Add to existing group
              const newGroups = [...prev];
              newGroups[existingGroupIndex] = {
                ...newGroups[existingGroupIndex],
                tasks: [...newGroups[existingGroupIndex].tasks, newTask],
                stats: {
                  ...newGroups[existingGroupIndex].stats,
                  total: newGroups[existingGroupIndex].stats.total + 1,
                },
              };
              return newGroups;
            } else {
              // Create new group
              return [
                ...prev,
                {
                  project: newTask.project,
                  tasks: [newTask],
                  stats: { total: 1, completed: 0 },
                },
              ];
            }
          });
          toast.success("Task created");
        } else {
          toast.error(result.error || "Failed to create task");
          throw new Error(result.error);
        }
      }
    },
    []
  );

  // Handle filter chip removal
  const handleRemoveFilter = useCallback(
    (type: "status" | "priority" | "tag" | "assignee", value: string) => {
      setFilters((prev) => {
        if (type === "status") {
          return { ...prev, status: prev.status.filter((s) => s !== value) };
        }
        if (type === "priority") {
          return {
            ...prev,
            priority: prev.priority.filter((p) => p !== value),
          };
        }
        if (type === "tag") {
          return { ...prev, tag: prev.tag.filter((t) => t !== value) };
        }
        if (type === "assignee") {
          return {
            ...prev,
            assigneeId: prev.assigneeId.filter((a) => a !== value),
          };
        }
        return prev;
      });
    },
    []
  );

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <TaskFilterPopover
            filters={filters}
            members={members}
            onFiltersChange={setFilters}
          />
          <TaskFilterChips
            filters={filters}
            members={members}
            onRemove={handleRemoveFilter}
          />
        </div>

        <div className="flex items-center gap-2">
          <TaskViewOptions
            options={viewOptions}
            onOptionsChange={setViewOptions}
          />
          <Button size="sm" onClick={() => handleAddTask()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewOptions.mode === "board" ? (
          <TaskWeekBoardView
            tasks={allTasks}
            viewOptions={viewOptions}
            onToggleStatus={handleToggleStatus}
            onMoveTask={handleMoveTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        ) : (
          <TaskListView
            groups={groups}
            onToggleStatus={handleToggleStatus}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAddTask={handleAddTask}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <TaskQuickCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        task={editingTask}
        projects={projects}
        members={members}
        defaultProjectId={defaultProjectId}
        defaultDate={defaultDate}
      />
    </>
  );
}

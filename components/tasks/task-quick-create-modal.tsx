"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, FolderPlus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { TaskDetail, TaskProject, TaskAssignee } from "@/types/task";
import {
  createMyTaskSchema,
  updateMyTaskSchema,
  type PMTaskPriority,
  type PMTaskTag,
  type PMTaskStatus,
} from "@/lib/validations/task";

const formSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  priority: z.enum(["NO_PRIORITY", "LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  tag: z.enum(["FEATURE", "BUG", "INTERNAL"]).optional(),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  task?: TaskDetail | null;
  projects: Array<{ id: string; name: string; status: string }>;
  members: TaskAssignee[];
  defaultProjectId?: string;
  defaultDate?: Date;
}

export function TaskQuickCreateModal({
  open,
  onClose,
  onSubmit,
  task,
  projects,
  members,
  defaultProjectId,
  defaultDate,
}: TaskQuickCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createMore, setCreateMore] = useState(false);

  const isEditing = !!task;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      name: "",
      description: "",
      assigneeId: "",
      status: "TODO",
      priority: "NO_PRIORITY",
      tag: undefined,
      endDate: undefined,
    },
  });

  // Reset form when task changes or modal opens
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          projectId: task.projectId,
          name: task.name,
          description: task.description || "",
          assigneeId: task.assigneeId || "",
          status: task.status,
          priority: task.priority || "NO_PRIORITY",
          tag: task.tag || undefined,
          endDate: task.endDate ? new Date(task.endDate) : undefined,
        });
      } else {
        form.reset({
          projectId: defaultProjectId || "",
          name: "",
          description: "",
          assigneeId: "",
          status: "TODO",
          priority: "NO_PRIORITY",
          tag: undefined,
          endDate: defaultDate,
        });
      }
    }
  }, [open, task, defaultProjectId, defaultDate, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const data = {
        ...(isEditing && { id: task.id }),
        projectId: values.projectId,
        name: values.name,
        description: values.description || undefined,
        assigneeId: values.assigneeId || undefined,
        status: values.status,
        priority: values.priority || undefined,
        tag: values.tag || undefined,
        endDate: values.endDate?.toISOString() || undefined,
        order: 0,
      };

      await onSubmit(data);

      if (createMore && !isEditing) {
        form.reset({
          ...form.getValues(),
          name: "",
          description: "",
        });
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            {projects.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                <FolderPlus className="h-4 w-4" />
                <span>
                  No projects yet.{" "}
                  <Link
                    href="/dashboard/projects"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={onClose}
                  >
                    Create a project
                  </Link>{" "}
                  first.
                </span>
              </div>
            ) : (
              <Select
                value={form.watch("projectId")}
                onValueChange={(v) => form.setValue("projectId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.projectId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.projectId.message}
              </p>
            )}
          </div>

          {/* Task name */}
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              placeholder="What needs to be done?"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* Row: Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select
                value={form.watch("assigneeId") || "unassigned"}
                onValueChange={(v) =>
                  form.setValue("assigneeId", v === "unassigned" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("endDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("endDate")
                      ? format(form.watch("endDate")!, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("endDate")}
                    onSelect={(d) => form.setValue("endDate", d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Row: Status + Priority + Tag */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v as any)}
              >
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

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch("priority") || "NO_PRIORITY"}
                onValueChange={(v) => form.setValue("priority", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_PRIORITY">No Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <Select
                value={form.watch("tag") || "none"}
                onValueChange={(v) =>
                  form.setValue("tag", v === "none" ? undefined : (v as any))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="FEATURE">Feature</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            {!isEditing && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="createMore"
                  checked={createMore}
                  onCheckedChange={(c) => setCreateMore(!!c)}
                />
                <Label htmlFor="createMore" className="text-sm font-normal">
                  Create more
                </Label>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || projects.length === 0}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Task"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

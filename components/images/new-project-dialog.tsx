"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CircleNotch } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner";
import { createImageProject } from "@/app/actions/image-projects";
import { getStyleTemplates, getRoomTypes } from "@/lib/prompts";

interface NewProjectDialogProps {
  trigger?: React.ReactNode;
}

export function NewProjectDialog({ trigger }: NewProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [styleTemplateId, setStyleTemplateId] = React.useState("modern");
  const [roomType, setRoomType] = React.useState("none");

  const styleTemplates = getStyleTemplates();
  const roomTypes = getRoomTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createImageProject({
        name: name.trim(),
        styleTemplateId,
        roomType: roomType === "none" ? undefined : roomType,
      });

      if (result.success && result.data) {
        toast.success("Project created successfully");
        setOpen(false);
        setName("");
        setStyleTemplateId("modern");
        setRoomType("none");
        router.push(`/dashboard/images/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Image Project</DialogTitle>
          <DialogDescription>
            Create a project to organize your AI-enhanced images
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g., Living Room Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style Template</Label>
            <Select
              value={styleTemplateId}
              onValueChange={setStyleTemplateId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {styleTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {styleTemplates.find((t) => t.id === styleTemplateId)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">Default Room Type (Optional)</Label>
            <Select
              value={roomType}
              onValueChange={setRoomType}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (set per image)</SelectItem>
                {roomTypes.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

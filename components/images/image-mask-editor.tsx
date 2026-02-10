"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import type { Image } from "@/generated/prisma/client";

type EditMode = "remove" | "add";

interface ImageMaskEditorProps {
  open: boolean;
  image: Image | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImageMaskEditor({
  open,
  image,
  onOpenChange,
  onSuccess,
}: ImageMaskEditorProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mode, setMode] = React.useState<EditMode>("add");
  const [prompt, setPrompt] = React.useState("");
  const [maskDataUrl, setMaskDataUrl] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!open) {
      setMode("add");
      setPrompt("");
      setMaskDataUrl(undefined);
    }
  }, [open]);

  const handleMaskFile = (file?: File) => {
    if (!file) {
      setMaskDataUrl(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMaskDataUrl(typeof reader.result === "string" ? reader.result : undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!image) {
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter an edit prompt");
      return;
    }

    if (mode === "remove" && !maskDataUrl) {
      toast.error("Mask image is required for remove mode");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId: image.id,
          prompt: prompt.trim(),
          mode,
          maskDataUrl,
        }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(json.error || "Failed to start image edit");
      }

      toast.success("Image edit started");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to edit image");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Create a new version from the selected image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-sm font-medium">Mode</span>
            <Select value={mode} onValueChange={(v) => setMode(v as EditMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add/Restyle</SelectItem>
                <SelectItem value="remove">Remove (with mask)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Prompt</span>
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the edit you want..."
            />
          </div>

          {mode === "remove" && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Mask Image (PNG)</span>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleMaskFile(e.target.files?.[0])}
              />
              <p className="text-xs text-muted-foreground">
                White area in the mask will be edited. Black area stays unchanged.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <CircleNotch className="mr-2 h-4 w-4 animate-spin" />}
              Create Version
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

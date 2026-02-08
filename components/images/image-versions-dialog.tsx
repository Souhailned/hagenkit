"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Image as DbImage } from "@/generated/prisma";
import { cn } from "@/lib/utils";

interface ImageVersionsDialogProps {
  open: boolean;
  versions: DbImage[];
  selectedId?: string | null;
  onOpenChange: (open: boolean) => void;
  onSelect?: (image: DbImage) => void;
}

export function ImageVersionsDialog({
  open,
  versions,
  selectedId,
  onOpenChange,
  onSelect,
}: ImageVersionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            Select a version to inspect or compare.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {versions.map((version) => {
            const url = version.resultImageUrl || version.originalImageUrl;
            const isSelected = selectedId === version.id;

            return (
              <button
                key={version.id}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-lg border text-left",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => onSelect?.(version)}
              >
                <Image
                  src={url}
                  alt={`Version ${version.version}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 220px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-xs text-white">
                  v{version.version} - {version.status.toLowerCase()}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, CircleNotch, WarningCircle, DotsThreeVertical, Download, Trash, ArrowsClockwise, Eye } from "@phosphor-icons/react/dist/ssr"
import { getRoomTypes } from "@/lib/prompts";
import type { Image as ImageType, ImageStatus } from "@prisma/client";

interface ImageCardProps {
  image: ImageType;
  onRoomTypeChange?: (roomType: string) => void;
  onRetry?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onCompare?: () => void;
  onEdit?: () => void;
  onVersions?: () => void;
  disabled?: boolean;
}

const statusConfig: Record<
  ImageStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-yellow-500/20 text-yellow-600",
  },
  PROCESSING: {
    label: "Processing",
    icon: <CircleNotch className="h-3 w-3 animate-spin" />,
    color: "bg-blue-500/20 text-blue-600",
  },
  COMPLETED: {
    label: "Completed",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-500/20 text-green-600",
  },
  FAILED: {
    label: "Failed",
    icon: <WarningCircle className="h-3 w-3" />,
    color: "bg-red-500/20 text-red-600",
  },
};

export function ImageCard({
  image,
  onRoomTypeChange,
  onRetry,
  onDelete,
  onView,
  onCompare,
  onEdit,
  onVersions,
  disabled,
}: ImageCardProps) {
  const roomTypes = getRoomTypes();
  const metadata = image.metadata as { roomType?: string } | null;
  const runMetadata = image.metadata as { runId?: string } | null;
  const currentRoomType = metadata?.roomType || "";
  const status = statusConfig[image.status];
  const displayUrl = image.resultImageUrl || image.originalImageUrl;
  const hasResult = !!image.resultImageUrl;

  const handleDownload = async () => {
    try {
      const response = await fetch(displayUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      {/* Image */}
      <div
        className="relative aspect-[4/3] cursor-pointer"
        onClick={onView}
      >
        <Image
          src={displayUrl}
          alt="Project image"
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status badge */}
        <div className="absolute left-2 top-2">
          <Badge className={cn("gap-1", status.color)}>
            {status.icon}
            {status.label}
          </Badge>
        </div>

        {/* Version badge */}
        {image.version > 1 && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2"
          >
            v{image.version}
          </Badge>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {hasResult && onCompare && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onCompare();
              }}
            >
              <Eye className="mr-1 h-3 w-3" />
              Compare
            </Button>
          )}
          {hasResult && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2">
        {/* Room type selector for pending images */}
        {image.status === "PENDING" && onRoomTypeChange ? (
          <Select
            value={currentRoomType}
            onValueChange={onRoomTypeChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Room type" />
            </SelectTrigger>
            <SelectContent>
              {roomTypes.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-muted-foreground text-xs">
            {roomTypes.find((r) => r.id === currentRoomType)?.name || "No room type"}
          </span>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <DotsThreeVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {hasResult && (
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
            )}
            {image.status === "FAILED" && onRetry && (
              <DropdownMenuItem onClick={onRetry}>
                <ArrowsClockwise className="mr-2 h-4 w-4" />
                Retry
              </DropdownMenuItem>
            )}
            {onVersions && (
              <DropdownMenuItem onClick={onVersions}>
                <Eye className="mr-2 h-4 w-4" />
                Versions
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error message */}
      {image.status === "FAILED" && image.errorMessage && (
        <div className="border-t bg-red-50 px-2 py-1 dark:bg-red-900/20">
          <p className="truncate text-xs text-red-600 dark:text-red-400">
            {image.errorMessage}
          </p>
        </div>
      )}

      {runMetadata?.runId && image.status === "PROCESSING" && (
        <div className="border-t bg-blue-50 px-2 py-1 dark:bg-blue-900/20">
          <p className="truncate text-xs text-blue-700 dark:text-blue-300">
            run: {runMetadata.runId}
          </p>
        </div>
      )}
    </div>
  );
}

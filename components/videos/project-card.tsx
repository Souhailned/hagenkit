"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, CircleNotch, WarningCircle, DotsThreeVertical, Trash, VideoCamera } from "@phosphor-icons/react/dist/ssr"
import { formatDistanceToNow } from "date-fns";
import type { VideoProject } from "@prisma/client";

interface ProjectCardProps {
  project: VideoProject;
  onDelete?: () => void;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    color: "bg-yellow-500/20 text-yellow-600",
  },
  processing: {
    label: "Processing",
    icon: <CircleNotch className="h-3 w-3 animate-spin" />,
    color: "bg-blue-500/20 text-blue-600",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-500/20 text-green-600",
  },
  failed: {
    label: "Failed",
    icon: <WarningCircle className="h-3 w-3" />,
    color: "bg-red-500/20 text-red-600",
  },
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.pending;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/dashboard/videos/${project.id}`}>
        <CardHeader className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-muted">
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={`Video project ${project.id}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <VideoCamera className="text-muted-foreground h-12 w-12" />
              </div>
            )}

            {/* Status badge */}
            <div className="absolute left-2 top-2">
              <Badge className={cn("gap-1", status.color)}>
                {status.icon}
                {status.label}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">Video Project {project.id.slice(0, 8)}</h3>
          <p className="text-muted-foreground text-sm">
            {project.clipCount} clips • {project.aspectRatio}
          </p>
          {project.duration && (
            <p className="text-muted-foreground text-xs">
              Duration: {project.duration.toFixed(1)}s
            </p>
          )}
        </CardContent>
      </Link>

      <CardFooter className="flex items-center justify-between border-t p-4">
        <span className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.preventDefault()}
            >
              <DotsThreeVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

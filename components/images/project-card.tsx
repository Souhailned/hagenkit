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
import { CheckCircle, Clock, CircleNotch, WarningCircle, DotsThreeVertical, Trash, Image as ImageIcon } from "@phosphor-icons/react/dist/ssr"
import { formatDistanceToNow } from "date-fns";
import type { ImageProject, ProjectStatus } from "@prisma/client";

interface ProjectCardProps {
  project: ImageProject;
  onDelete?: () => void;
}

const statusConfig: Record<
  ProjectStatus,
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

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/dashboard/images/${project.id}`}>
        <CardHeader className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-muted">
            {project.thumbnailUrl ? (
              <Image
                src={project.thumbnailUrl}
                alt={project.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="text-muted-foreground h-12 w-12" />
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
          <h3 className="font-semibold line-clamp-1">{project.name}</h3>
          <p className="text-muted-foreground text-sm">
            {project.completedCount}/{project.imageCount} images completed
          </p>
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

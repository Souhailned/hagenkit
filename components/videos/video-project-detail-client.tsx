"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ContentCard,
  ContentCardBody,
  ContentCardHeader,
} from "@/components/dashboard/content-card";
import type { VideoProject, VideoClip } from "@/generated/prisma";
import {
  ArrowLeft,
  CheckCircle,
  CircleNotch,
  Clock,
  WarningCircle,
  Play,
} from "@phosphor-icons/react/dist/ssr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

interface VideoProjectDetailClientProps {
  projectId: string;
  initialProject: VideoProject & {
    clips: Pick<VideoClip, "id" | "status" | "sequenceOrder">[];
  };
}

export function VideoProjectDetailClient({
  projectId,
  initialProject,
}: VideoProjectDetailClientProps) {
  const [project] = React.useState(initialProject);
  const status = statusConfig[project.status] || statusConfig.pending;

  const completedClips = project.clips.filter(
    (clip) => clip.status === "completed"
  ).length;

  return (
    <ContentCard>
      <ContentCardHeader
        title="Video Project"
        actions={
          <div className="flex items-center gap-2">
            <Badge className={cn("gap-1", status.color)}>
              {status.icon}
              {status.label}
            </Badge>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/videos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />
      <ContentCardBody className="p-4">
        <div className="space-y-6">
          {/* Project Info */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Clips</CardTitle>
                <CardDescription>
                  {completedClips} / {project.clipCount} completed
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Aspect Ratio
                </CardTitle>
                <CardDescription>{project.aspectRatio}</CardDescription>
              </CardHeader>
            </Card>

            {project.duration && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Duration
                  </CardTitle>
                  <CardDescription>
                    {project.duration.toFixed(1)}s
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Audio Generation
                </CardTitle>
                <CardDescription>
                  {project.generateNativeAudio ? "Enabled" : "Disabled"}
                </CardDescription>
              </CardHeader>
            </Card>

            {project.estimatedCost > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Estimated Cost
                  </CardTitle>
                  <CardDescription>
                    ${(project.estimatedCost / 100).toFixed(2)}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Final Video */}
          {project.finalVideoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Final Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <video
                    src={project.finalVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button asChild>
                    <a
                      href={project.finalVideoUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Download Video
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clips List */}
          {project.clips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Video Clips</CardTitle>
                <CardDescription>
                  {project.clips.length} clip{project.clips.length !== 1 ? "s" : ""} in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.clips.map((clip, index) => {
                    const clipStatus =
                      statusConfig[clip.status] || statusConfig.pending;
                    return (
                      <div
                        key={clip.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-sm">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium">
                            Clip {clip.id.slice(0, 8)}
                          </span>
                        </div>
                        <Badge className={cn("gap-1", clipStatus.color)}>
                          {clipStatus.icon}
                          {clipStatus.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {project.errorMessage && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.errorMessage}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";
import { ImageUploadDialog } from "@/components/images/image-upload-dialog";
import { ImageCard } from "@/components/images/image-card";
import { ImageComparison } from "@/components/images/image-comparison";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Sparkle, CircleNotch, CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react/dist/ssr"
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getImageProject } from "@/app/actions/image-projects";
import {
  getProjectImages,
  updateImageRoomType,
  startProjectProcessing,
  retryImageProcessing,
  deleteProjectImage,
} from "@/app/actions/images";
import type { Image, ImageProject, ProjectStatus } from "@/generated/prisma/client";

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

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = React.useState<ImageProject | null>(null);
  const [images, setImages] = React.useState<Image[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [deleteImage, setDeleteImage] = React.useState<Image | null>(null);
  const [compareImage, setCompareImage] = React.useState<Image | null>(null);

  // Unwrap params
  const [projectId, setProjectId] = React.useState<string>("");

  React.useEffect(() => {
    params.then((p) => setProjectId(p.projectId));
  }, [params]);

  // Load project and images
  const loadData = React.useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const [projectResult, imagesResult] = await Promise.all([
        getImageProject(projectId),
        getProjectImages(projectId),
      ]);

      if (projectResult.success && projectResult.data) {
        setProject(projectResult.data);
      }
      if (imagesResult.success && imagesResult.data) {
        setImages(imagesResult.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh when processing
  React.useEffect(() => {
    if (project?.status === "PROCESSING") {
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }
  }, [project?.status, loadData]);

  // Handle room type change
  const handleRoomTypeChange = async (imageId: string, roomType: string) => {
    const result = await updateImageRoomType(imageId, roomType);
    if (result.success) {
      loadData();
    } else {
      toast.error(result.error || "Failed to update room type");
    }
  };

  // Handle start processing
  const handleStartProcessing = async () => {
    setIsProcessing(true);
    try {
      const result = await startProjectProcessing(projectId);
      if (result.success) {
        toast.success(`Processing started for ${result.data?.processedCount} image(s)`);
        loadData();
      } else {
        toast.error(result.error || "Failed to start processing");
      }
    } catch {
      toast.error("Failed to start processing");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle retry
  const handleRetry = async (imageId: string) => {
    const result = await retryImageProcessing(imageId);
    if (result.success) {
      toast.success("Retrying image processing");
      loadData();
    } else {
      toast.error(result.error || "Failed to retry");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteImage) return;

    const result = await deleteProjectImage(deleteImage.id);
    if (result.success) {
      toast.success("Image deleted");
      setDeleteImage(null);
      loadData();
    } else {
      toast.error(result.error || "Failed to delete image");
    }
  };

  // Separate pending and completed images
  const pendingImages = images.filter((img) => img.status === "PENDING" && !img.parentId);
  const processingImages = images.filter((img) => img.status === "PROCESSING");
  const completedImages = images.filter((img) => img.status === "COMPLETED");
  const failedImages = images.filter((img) => img.status === "FAILED");

  // Check if all pending images have room types
  const allPendingHaveRoomTypes = pendingImages.every((img) => {
    const metadata = img.metadata as { roomType?: string } | null;
    return !!metadata?.roomType;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <CircleNotch className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild variant="link">
          <Link href="/dashboard/images">Back to projects</Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[project.status];

  return (
    <ContentCard>
      <ContentCardHeader
        title={project.name}
        actions={
          <div className="flex items-center gap-2">
            <Badge className={cn("gap-1", status.color)}>
              {status.icon}
              {status.label}
            </Badge>
            <ImageUploadDialog projectId={projectId} onSuccess={loadData} />
          </div>
        }
      />
      <ContentCardBody className="p-4">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/images">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>

      {/* Pending images section */}
      {pendingImages.length > 0 && (
        <div className="mb-6 rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Pending Images</h2>
              <p className="text-muted-foreground text-sm">
                Assign room types to start AI processing
              </p>
            </div>
            <Button
              onClick={handleStartProcessing}
              disabled={!allPendingHaveRoomTypes || isProcessing}
            >
              {isProcessing ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Sparkle className="mr-2 h-4 w-4" />
                  Start Processing
                </>
              )}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pendingImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRoomTypeChange={(roomType) => handleRoomTypeChange(image.id, roomType)}
                onDelete={() => setDeleteImage(image)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing images section */}
      {processingImages.length > 0 && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="mb-4 font-semibold">Processing ({processingImages.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processingImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </div>
      )}

      {/* Failed images section */}
      {failedImages.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <h2 className="mb-4 font-semibold">Failed ({failedImages.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {failedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRetry={() => handleRetry(image.id)}
                onDelete={() => setDeleteImage(image)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed images section */}
      {completedImages.length > 0 && (
        <div className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">Completed ({completedImages.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {completedImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onCompare={() => setCompareImage(image)}
                onDelete={() => setDeleteImage(image)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">No images yet</p>
          <ImageUploadDialog projectId={projectId} onSuccess={loadData} />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteImage} onOpenChange={() => setDeleteImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The image will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comparison modal */}
      {compareImage && compareImage.resultImageUrl && (
        <ImageComparison
          originalUrl={compareImage.originalImageUrl}
          resultUrl={compareImage.resultImageUrl}
          open={true}
          onOpenChange={() => setCompareImage(null)}
        />
      )}
      </ContentCardBody>
    </ContentCard>
  );
}

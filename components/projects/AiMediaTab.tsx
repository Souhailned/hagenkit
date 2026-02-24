"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  Images,
  VideoCamera,
  Plus,
  ArrowRight,
  SpinnerGap,
  CheckCircle,
  Clock,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getImageProjectsForProperty, createImageProject } from "@/app/actions/image-projects"
import { getVideoProjectsForProperty, createVideoProject } from "@/app/actions/video-projects"
import type { ImageProject, VideoProject } from "@/generated/prisma/client"

// ============================================
// TYPES
// ============================================

interface AiMediaTabProps {
  propertyId: string
  propertyName?: string
}

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function statusConfig(status: string): {
  label: string
  variant: "default" | "secondary" | "outline" | "destructive"
  icon: React.ReactNode
} {
  const normalized = status.toUpperCase()
  switch (normalized) {
    case "COMPLETED":
      return {
        label: "Voltooid",
        variant: "default",
        icon: <CheckCircle className="h-3 w-3" />,
      }
    case "PROCESSING":
    case "GENERATING":
    case "COMPILING":
      return {
        label: "Bezig",
        variant: "secondary",
        icon: <CircleNotch className="h-3 w-3 animate-spin" />,
      }
    case "FAILED":
    case "ERROR":
      return {
        label: "Mislukt",
        variant: "destructive",
        icon: <WarningCircle className="h-3 w-3" />,
      }
    default:
      return {
        label: "Wachtend",
        variant: "outline",
        icon: <Clock className="h-3 w-3" />,
      }
  }
}

// ============================================
// NEW IMAGE PROJECT INLINE FORM
// ============================================

function NewImageProjectForm({
  propertyId,
  onSuccess,
  onCancel,
}: {
  propertyId: string
  onSuccess: (project: ImageProject) => void
  onCancel: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [roomType, setRoomType] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      const result = await createImageProject({
        name: name.trim(),
        propertyId,
        roomType: roomType.trim() || undefined,
      })

      if (result.success && result.data) {
        toast.success("AI foto project aangemaakt")
        onSuccess(result.data)
        router.push(`/dashboard/images/${result.data.id}`)
      } else {
        toast.error(result.error || "Aanmaken mislukt")
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 mb-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="img-project-name" className="text-xs text-muted-foreground">
            Projectnaam
          </Label>
          <Input
            id="img-project-name"
            placeholder="bijv. Interieur styling"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="img-room-type" className="text-xs text-muted-foreground">
            Kamertype (optioneel)
          </Label>
          <Input
            id="img-room-type"
            placeholder="bijv. Restaurant, Bar, Keuken"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Annuleren
        </Button>
        <Button type="submit" size="sm" disabled={!name.trim() || isPending}>
          {isPending ? (
            <>
              <SpinnerGap className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Aanmaken...
            </>
          ) : (
            "Aanmaken"
          )}
        </Button>
      </div>
    </form>
  )
}

// ============================================
// IMAGE PROJECT CARD
// ============================================

function ImageProjectCard({ project }: { project: ImageProject }) {
  const config = statusConfig(project.status)

  return (
    <Link
      href={`/dashboard/images/${project.id}`}
      className="group rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors block"
    >
      {/* Thumbnail or placeholder */}
      <div className="mb-3 aspect-video rounded-lg bg-background border border-border overflow-hidden flex items-center justify-center">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={project.name}
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
        ) : (
          <Images className="h-8 w-8 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-foreground truncate">{project.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {project.roomType && <span>{project.roomType} &middot; </span>}
            {formatDate(project.createdAt)}
          </p>
        </div>
        <Badge variant={config.variant} className="shrink-0 gap-1 text-xs">
          {config.icon}
          {config.label}
        </Badge>
      </div>

      {/* Progress indicator */}
      {project.imageCount > 0 && (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${project.imageCount > 0 ? Math.round((project.completedCount / project.imageCount) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {project.completedCount}/{project.imageCount}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Openen</span>
        <ArrowRight className="ml-1 h-3 w-3" />
      </div>
    </Link>
  )
}

// ============================================
// VIDEO PROJECT CARD
// ============================================

function VideoProjectCard({ project }: { project: VideoProject }) {
  const config = statusConfig(project.status)

  return (
    <Link
      href={`/dashboard/videos/${project.id}`}
      className="group rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors block"
    >
      {/* Thumbnail or placeholder */}
      <div className="mb-3 aspect-video rounded-lg bg-background border border-border overflow-hidden flex items-center justify-center">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt="Video thumbnail"
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
        ) : (
          <VideoCamera className="h-8 w-8 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-foreground truncate">
            Video project
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {project.aspectRatio} &middot; {project.clipCount} clips &middot; {formatDate(project.createdAt)}
          </p>
        </div>
        <Badge variant={config.variant} className="shrink-0 gap-1 text-xs">
          {config.icon}
          {config.label}
        </Badge>
      </div>

      {project.duration && (
        <p className="mt-2 text-xs text-muted-foreground">
          Duur: {Math.round(project.duration)}s
        </p>
      )}

      <div className="mt-3 flex items-center text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Openen</span>
        <ArrowRight className="ml-1 h-3 w-3" />
      </div>
    </Link>
  )
}

// ============================================
// EMPTY STATE
// ============================================

function SectionEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AiMediaTab({ propertyId, propertyName }: AiMediaTabProps) {
  const router = useRouter()
  const [imageProjects, setImageProjects] = useState<ImageProject[]>([])
  const [videoProjects, setVideoProjects] = useState<VideoProject[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [isLoadingVideos, setIsLoadingVideos] = useState(true)
  const [showNewImageForm, setShowNewImageForm] = useState(false)
  const [isCreatingVideo, startVideoTransition] = useTransition()

  // Fetch image projects on mount
  const fetchImageProjects = useCallback(async () => {
    setIsLoadingImages(true)
    const result = await getImageProjectsForProperty(propertyId)
    if (result.success && result.data) {
      setImageProjects(result.data)
    }
    setIsLoadingImages(false)
  }, [propertyId])

  // Fetch video projects on mount
  const fetchVideoProjects = useCallback(async () => {
    setIsLoadingVideos(true)
    const result = await getVideoProjectsForProperty(propertyId)
    if (result.success && result.data) {
      setVideoProjects(result.data)
    }
    setIsLoadingVideos(false)
  }, [propertyId])

  useEffect(() => {
    fetchImageProjects()
    fetchVideoProjects()
  }, [fetchImageProjects, fetchVideoProjects])

  const handleImageProjectCreated = (project: ImageProject) => {
    setImageProjects((prev) => [project, ...prev])
    setShowNewImageForm(false)
  }

  const handleCreateVideoProject = () => {
    startVideoTransition(async () => {
      const result = await createVideoProject({ propertyId })
      if (result.success && result.data) {
        toast.success("Video project aangemaakt")
        setVideoProjects((prev) => [result.data!, ...prev])
        router.push(`/dashboard/videos/${result.data.id}`)
      } else {
        toast.error(result.error || "Aanmaken mislukt")
      }
    })
  }

  return (
    <div className="space-y-8 py-4">
      {/* ------------------------------------------------- */}
      {/* AI Foto's sectie */}
      {/* ------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Images className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">AI Foto&apos;s</h3>
            {imageProjects.length > 0 && (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {imageProjects.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewImageForm(true)}
            disabled={showNewImageForm}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Nieuw project
          </Button>
        </div>

        {showNewImageForm && (
          <NewImageProjectForm
            propertyId={propertyId}
            onSuccess={handleImageProjectCreated}
            onCancel={() => setShowNewImageForm(false)}
          />
        )}

        {isLoadingImages ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-muted/30 p-4 animate-pulse"
              >
                <div className="aspect-video rounded-lg bg-muted mb-3" />
                <div className="h-4 w-2/3 rounded bg-muted mb-2" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : imageProjects.length === 0 ? (
          <SectionEmptyState
            icon={Images}
            title="Nog geen AI foto projecten"
            description={`Maak een AI foto project aan voor ${propertyName || "dit pand"}`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {imageProjects.map((project) => (
              <ImageProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------- */}
      {/* AI Video's sectie */}
      {/* ------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <VideoCamera className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">AI Video&apos;s</h3>
            {videoProjects.length > 0 && (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {videoProjects.length}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateVideoProject}
            disabled={isCreatingVideo}
          >
            {isCreatingVideo ? (
              <>
                <SpinnerGap className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Aanmaken...
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Video project maken
              </>
            )}
          </Button>
        </div>

        {isLoadingVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-muted/30 p-4 animate-pulse"
              >
                <div className="aspect-video rounded-lg bg-muted mb-3" />
                <div className="h-4 w-2/3 rounded bg-muted mb-2" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : videoProjects.length === 0 ? (
          <SectionEmptyState
            icon={VideoCamera}
            title="Nog geen video projecten"
            description={`Maak een video project aan voor ${propertyName || "dit pand"}`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {videoProjects.map((project) => (
              <VideoProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

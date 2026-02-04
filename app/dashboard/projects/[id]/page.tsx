import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getProjectById } from "@/lib/data/projects"
import { ProjectDetailContent } from "@/components/dashboard/project-detail-content"
import { ContentCard } from "@/components/dashboard/content-card"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const project = getProjectById(id)

  if (!project) {
    notFound()
  }

  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailContent project={project} />
    </Suspense>
  )
}

function ProjectDetailSkeleton() {
  return (
    <ContentCard>
      <div className="flex flex-col">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>
        {/* Content skeleton */}
        <div className="flex flex-1">
          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="w-72 border-l border-border p-4 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </ContentCard>
  )
}

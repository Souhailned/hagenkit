import { ContentCard, ContentCardBody } from "@/components/dashboard/content-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function TasksLoading() {
  return (
    <ContentCard>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <ContentCardBody className="p-4 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-2 pl-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </ContentCardBody>
    </ContentCard>
  )
}

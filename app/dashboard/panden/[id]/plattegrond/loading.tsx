import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <ContentCard>
      <ContentCardHeader title="Plattegrond" />
      <ContentCardBody>
        {/* Floor selector skeleton */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-7 w-36 rounded-md" />
        </div>
        {/* Editor area skeleton */}
        <div className="flex-1 p-4">
          <Skeleton className="h-[calc(100vh-16rem)] w-full rounded-lg" />
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}

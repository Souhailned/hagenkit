import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PropertyCardSkeletonProps {
  className?: string;
}

export function PropertyCardSkeleton({ className }: PropertyCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card",
        className
      )}
    >
      {/* Image skeleton */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price */}
        <Skeleton className="mb-2 h-7 w-32" />

        {/* Title */}
        <Skeleton className="mb-1 h-5 w-full" />
        <Skeleton className="mb-3 h-5 w-3/4" />

        {/* Location */}
        <Skeleton className="mb-3 h-4 w-2/3" />

        {/* Description */}
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-5/6" />

        {/* Features */}
        <div className="mt-auto flex items-center gap-3 border-t pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface PropertyGridSkeletonProps {
  count?: number;
  className?: string;
}

export function PropertyGridSkeleton({
  count = 6,
  className,
}: PropertyGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

interface PropertyFilterSkeletonProps {
  className?: string;
}

export function PropertyFilterSkeleton({ className }: PropertyFilterSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Location section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-14" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Type section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-10" />
        <div className="grid gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Price section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-10" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Skeleton className="mb-1 h-3 w-14" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Surface section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      <Skeleton className="h-px w-full" />

      {/* Features section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PropertyListingsSkeletonProps {
  showFilters?: boolean;
}

export function PropertyListingsSkeleton({
  showFilters = true,
}: PropertyListingsSkeletonProps) {
  return (
    <div className="flex gap-8">
      {/* Filters sidebar skeleton (desktop only) */}
      {showFilters && (
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24">
            <PropertyFilterSkeleton />
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Results header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-44" />
        </div>

        {/* Active filters skeleton */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>

        {/* Grid skeleton */}
        <PropertyGridSkeleton count={6} />

        {/* Pagination skeleton */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="size-10 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PropertyGridSkeleton;

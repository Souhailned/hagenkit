import { Skeleton } from "@/components/ui/skeleton";
import { PropertyListingsSkeleton } from "@/components/property/property-skeleton";

export default function AanbodLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="border-b bg-muted/30 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Skeleton className="h-12 w-64 lg:h-14" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertyListingsSkeleton />
        </div>
      </section>
    </div>
  );
}

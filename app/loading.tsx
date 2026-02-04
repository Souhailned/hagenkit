import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <Skeleton className="h-2 w-2 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <Skeleton className="h-2 w-2 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

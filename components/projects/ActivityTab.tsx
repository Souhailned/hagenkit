import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckSquare,
  FolderOpen,
  Note,
  File,
  ListBullets,
  Star,
  PencilSimple,
  Trash,
  CheckCircle,
  ArrowSquareOut,
} from "@phosphor-icons/react/dist/ssr"
import type { ActivityEntry } from "@/app/actions/project-activity"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

type IconConfig = { icon: React.ReactNode; color: string }

function getIconConfig(entity: string, action: string): IconConfig {
  // Completed task
  if (entity === "task" && action === "completed") {
    return {
      icon: <CheckCircle className="size-4" weight="bold" />,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    }
  }
  // Any task
  if (entity === "task") {
    return {
      icon: <CheckSquare className="size-4" weight="bold" />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    }
  }
  // Workstream
  if (entity === "workstream") {
    return {
      icon: <FolderOpen className="size-4" weight="bold" />,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    }
  }
  // Note
  if (entity === "note") {
    return {
      icon: <Note className="size-4" weight="bold" />,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    }
  }
  // File
  if (entity === "file") {
    return {
      icon: <File className="size-4" weight="bold" />,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    }
  }
  // Scope item
  if (entity === "scope_item") {
    return {
      icon: <ListBullets className="size-4" weight="bold" />,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
    }
  }
  // Feature
  if (entity === "feature") {
    return {
      icon: <Star className="size-4" weight="bold" />,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
    }
  }
  // Deleted anything
  if (action === "deleted") {
    return {
      icon: <Trash className="size-4" weight="bold" />,
      color: "bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-400",
    }
  }
  // Project update
  if (entity === "project") {
    return {
      icon: <PencilSimple className="size-4" weight="bold" />,
      color: "bg-muted text-muted-foreground",
    }
  }
  // Fallback
  return {
    icon: <ArrowSquareOut className="size-4" weight="bold" />,
    color: "bg-muted text-muted-foreground",
  }
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ActivityTabProps {
  activities: ActivityEntry[]
}

export function ActivityTab({ activities }: ActivityTabProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity yet. Changes to tasks, workstreams, and scope will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((entry) => {
          const { icon, color } = getIconConfig(entry.entity, entry.action)
          return (
            <div key={entry.id} className="flex items-start gap-3">
              {/* Colored icon badge */}
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  color
                )}
              >
                {icon}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight">
                  <span className="font-medium">
                    {entry.actorName ?? "Someone"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {entry.description}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTimeAgo(new Date(entry.createdAt))}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

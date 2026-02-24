import { Star, User, PencilSimpleLine, Globe, Timer, ArrowsClockwise } from "@phosphor-icons/react/dist/ssr"

import { Separator } from "@/components/ui/separator"
import { MetaChipsRow } from "@/components/projects/MetaChipsRow"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge, type PriorityLevel } from "@/components/dashboard/priority-badge"
import { Button } from "@/components/ui/button"

export type ProjectMeta = {
  priorityLabel: string
  locationLabel: string
  sprintLabel: string
  lastSyncLabel: string
}

type ProjectDetailHeaderProps = {
  id: string
  name: string
  meta: ProjectMeta
  onEditProject?: () => void
}

export function ProjectDetailHeader({ id, name, meta, onEditProject }: ProjectDetailHeaderProps) {
  const metaItems = [
    { label: "ID", value: `#${id}`, icon: null },
    { label: "", value: <PriorityBadge level={meta.priorityLabel.toLowerCase() as PriorityLevel} appearance="inline" size="sm" />, icon: null },
    { label: "", value: meta.locationLabel, icon: <Globe className="h-4 w-4" /> },
    { label: "Sprints", value: meta.sprintLabel, icon: <Timer className="h-4 w-4" /> },
    { label: "Last sync", value: meta.lastSyncLabel, icon: <ArrowsClockwise className="h-4 w-4" /> },
  ]

  return (
    <section className="mt-4 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold text-foreground leading-tight">{name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-50 border-none flex items-center gap-1">
              <Star className="h-3 w-3" />
              Active
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-orange-800 bg-orange-100 dark:text-orange-100 dark:bg-orange-500/15 border-none">
              <User className="h-3 w-3" />
              Assigned to me
            </Badge>
          </div>
        </div>

        {onEditProject && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit project"
            className="rounded-lg text-muted-foreground hover:text-foreground"
            onClick={onEditProject}
          >
            <PencilSimpleLine className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mt-3">
        <MetaChipsRow items={metaItems} />
      </div>
    </section>
  )
}

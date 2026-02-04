"use client"

import type { ReactNode } from "react"
import { useRef } from "react"
import { format } from "date-fns"
import type { ProjectListItem } from "@/types/project"
import { getStatusConfig, getPriorityConfig } from "@/types/project"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Folder, CalendarBlank, Flag, User } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import { PriorityBadge } from "@/components/dashboard/priority-badge"
import { ProjectProgress } from "@/components/dashboard/project-progress"
import { useRouter } from "next/navigation"

type ProjectCardProps = {
  project: ProjectListItem
  actions?: ReactNode
  variant?: "list" | "board"
  href?: string
}

export function ProjectCard({ project, actions, variant = "list", href }: ProjectCardProps) {
  const s = getStatusConfig(project.status)
  const firstMember = project.members?.[0]
  const assigneeName = firstMember?.user?.name || null
  const assigneeImage = firstMember?.user?.image || null
  const dueDate = project.endDate
  const isBoard = variant === "board"
  const router = useRouter()
  const draggingRef = useRef(false)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)

  const initials = assigneeName
    ? assigneeName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : null

  const secondaryLine = (() => {
    const a = project.clientName
    const b = project.typeLabel
    if (a || b) {
      return [a, b].filter(Boolean).join(" • ")
    }
    if (project.tags && project.tags.length > 0) {
      return project.tags.map(t => t.name).join(" • ")
    }
    return ""
  })()

  const dueLabel = (() => {
    if (!dueDate) return "No due date"
    return format(dueDate, "MMM d")
  })()

  const goToDetails = () => {
    if (href) {
      router.push(href)
    } else {
      router.push(`/dashboard/projects/${project.id}`)
    }
  }

  const onKeyNavigate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      goToDetails()
    }
  }

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isBoard) return
    startPosRef.current = { x: e.clientX, y: e.clientY }
    draggingRef.current = false
  }

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isBoard || !startPosRef.current) return
    const dx = Math.abs(e.clientX - startPosRef.current.x)
    const dy = Math.abs(e.clientY - startPosRef.current.y)
    if (dx > 5 || dy > 5) draggingRef.current = true
  }

  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!isBoard) return
    startPosRef.current = null
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open project ${project.name}`}
      onClick={() => {
        if (isBoard && draggingRef.current) {
          draggingRef.current = false
          return
        }
        goToDetails()
      }}
      onKeyDown={onKeyNavigate}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      className="rounded-2xl border border-border bg-background hover:shadow-lg/5 transition-shadow cursor-pointer focus:outline-none"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {isBoard ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flag className="h-4 w-4" />
              <span>{dueLabel}</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              <Folder className="h-5 w-5" />
            </div>
          )}
          <div className="flex items-center gap-2">
            {!isBoard && (
              <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", s.pill)}>
                <span className={cn("inline-block size-1.5 rounded-full", s.dot)} />
                {s.label}
              </div>
            )}
            {isBoard && (
              <PriorityBadge level={project.priority} appearance="inline" />
            )}
            {actions ? (
              <div
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                {actions}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[15px] font-semibold text-foreground leading-6">
            {project.name}
          </p>
          {isBoard
            ? secondaryLine && (
                <div className="mt-1 text-sm text-muted-foreground truncate">{secondaryLine}</div>
              )
            : secondaryLine && (
                <p className="mt-1 text-sm text-muted-foreground truncate">{secondaryLine}</p>
              )}
        </div>

        {!isBoard && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarBlank className="h-4 w-4" />
              <span>{dueDate ? format(dueDate, "MMM d, yyyy") : "—"}</span>
            </div>
            <PriorityBadge level={project.priority} appearance="inline" />
          </div>
        )}

        <div className="mt-4 border-t border-border/60" />

        <div className="mt-3 flex items-center justify-between">
          <ProjectProgress project={project} size={isBoard ? 20 : 18} />
          <Avatar className="size-6 border border-border">
            <AvatarImage alt={assigneeName ?? ""} src={assigneeImage ?? undefined} />
            <AvatarFallback className="text-xs">
              {initials ? initials : <User className="h-4 w-4 text-muted-foreground" />}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

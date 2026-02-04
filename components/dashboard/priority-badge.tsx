"use client"

import { WarningOctagon } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import type { PMPriority } from "@/lib/validations/project"

// Support both lowercase (legacy) and uppercase (database) priority values
export type PriorityLevel = "urgent" | "high" | "medium" | "low" | PMPriority

// Normalize priority to lowercase for internal use
function normalizePriority(level: PriorityLevel): "urgent" | "high" | "medium" | "low" {
  return level.toLowerCase() as "urgent" | "high" | "medium" | "low"
}

function BarsGlyph({ level, className }: { level: "high" | "medium" | "low"; className?: string }) {
  const normalLevel = level.toLowerCase() as "high" | "medium" | "low"
  const bars = [
    { x: 4, y1: 13.333, y2: 13.333, color: "currentColor" },
    { x: 8, y1: 6.667, y2: 13.333, color: normalLevel === "low" ? "rgb(228, 228, 231)" : "currentColor" },
    { x: 12, y1: normalLevel === "high" ? 2.667 : 6.667, y2: 13.333, color: normalLevel === "high" ? "currentColor" : "rgb(228, 228, 231)" },
  ]

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      {bars.map((bar, i) => (
        <path
          key={i}
          d={`M${bar.x} ${bar.y2}V${bar.y1}`}
          stroke={bar.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}

export function PriorityGlyphIcon({
  level,
  size = "md",
  className,
}: {
  level: PriorityLevel
  size?: "sm" | "md"
  className?: string
}) {
  const normalLevel = normalizePriority(level)
  const isUrgent = normalLevel === "urgent"
  const baseIcon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"

  if (isUrgent) {
    return <WarningOctagon className={cn(baseIcon, "text-muted-foreground", className)} weight="fill" />
  }

  const safeLevel: "high" | "medium" | "low" = normalLevel === "high" || normalLevel === "medium" ? normalLevel : "low"
  return <BarsGlyph level={safeLevel} className={cn(baseIcon, "text-muted-foreground", className)} />
}

export type PriorityBadgeProps = {
  level: PriorityLevel
  appearance?: "badge" | "inline"
  size?: "sm" | "md"
  className?: string
  withIcon?: boolean
}

export function PriorityBadge({ level, appearance = "badge", size = "md", className, withIcon = true }: PriorityBadgeProps) {
  const normalLevel = normalizePriority(level)
  const isUrgent = normalLevel === "urgent"
  const label = normalLevel.charAt(0).toUpperCase() + normalLevel.slice(1)
  const safeLevel: "high" | "medium" | "low" = normalLevel === "high" || normalLevel === "medium" ? normalLevel : "low"

  const baseText = size === "md" ? "text-sm" : "text-xs"
  const baseIcon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"

  if (appearance === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-foreground", baseText, className)}>
        {withIcon && (isUrgent ? (
          <WarningOctagon className={cn(baseIcon, "text-muted-foreground")} weight="fill" />
        ) : (
          <BarsGlyph level={safeLevel} className={cn(baseIcon, "text-muted-foreground")} />
        ))}
        <span className="text-foreground/80">{label}</span>
      </span>
    )
  }

  const colorClass = "text-foreground/80 border-zinc-200 bg-zinc-50"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        baseText,
        colorClass,
        className,
      )}
    >
      {withIcon && (isUrgent ? (
        <WarningOctagon className={cn(baseIcon, "text-muted-foreground")} weight="fill" />
      ) : (
        <BarsGlyph level={safeLevel} className={cn(baseIcon, "text-muted-foreground")} />
      ))}
      <span>{label}</span>
    </span>
  )
}

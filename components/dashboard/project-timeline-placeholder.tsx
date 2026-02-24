"use client"

import { ChartBar } from "@phosphor-icons/react/dist/ssr"

export function ProjectTimelinePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <ChartBar className="h-10 w-10" />
      <p className="text-sm font-medium">Timeline view coming soon</p>
      <p className="text-xs">Switch to List or Board view to manage your projects.</p>
    </div>
  )
}

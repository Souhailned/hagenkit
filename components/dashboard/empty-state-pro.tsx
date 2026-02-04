"use client"

import { ArrowUpRight, Rocket } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { siteConfig } from "@/lib/config"

export function DashboardProEmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Rocket />
        </EmptyMedia>
        <EmptyTitle>DataRAG Pro Unlocks More</EmptyTitle>
        <EmptyDescription>
          Activate DataRAG Pro to access advanced analytics, automation, and
          collaboration workflows across your team.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <a
            href={siteConfig.upgrade.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {siteConfig.upgrade.label}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

import { TimeCard, type TimeSummary } from "@/components/projects/TimeCard"
import { BacklogCard, type BacklogSummary } from "@/components/projects/BacklogCard"
import { QuickLinksCard } from "@/components/projects/QuickLinksCard"
import { type QuickLink } from "@/components/projects/FileLinkRow"
import { Separator } from "@/components/ui/separator"

type RightMetaPanelProps = {
  time: TimeSummary
  backlog: BacklogSummary
  quickLinks: QuickLink[]
}

export function RightMetaPanel({ time, backlog, quickLinks }: RightMetaPanelProps) {
  return (
    <aside className="flex flex-col gap-10 p-4 pt-8 lg:sticky lg:self-start">
      <TimeCard time={time} />
      <Separator />
      <BacklogCard backlog={backlog} />
      <Separator />
      <QuickLinksCard links={quickLinks} />
    </aside>
  )
}

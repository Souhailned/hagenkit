import { User, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"

export type ClientInfo = {
  name: string
  status: string
  contactUrl?: string
}

type ClientCardProps = {
  client: ClientInfo
}

function clientStatusStyles(status: string) {
  const s = status.toLowerCase()
  if (s === "active") return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-50 border-none"
  if (s === "prospect") return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-50 border-none"
  if (s === "inactive") return "bg-muted text-muted-foreground border-border"
  return "bg-muted text-muted-foreground border-border"
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card/80 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Client</span>
        <Badge
          variant="outline"
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${clientStatusStyles(client.status)}`}
        >
          {client.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground shrink-0" />
        {client.contactUrl ? (
          <a
            href={client.contactUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-foreground hover:underline underline-offset-2"
          >
            {client.name}
          </a>
        ) : (
          <span className="text-sm font-medium text-foreground">{client.name}</span>
        )}
      </div>
    </div>
  )
}

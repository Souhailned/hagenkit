import type { ProjectData } from "../types"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Rocket,
  Flask,
  Briefcase,
  User,
  Users,
  Layout,
  Target,
  CheckCircle,
  Question,
  PencilSimpleLine,
  TextT,
} from "@phosphor-icons/react/dist/ssr"

interface StepReviewProps {
  data: ProjectData
  onEditStep?: (step: number) => void
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return (parts[0]?.[0] ?? "").toUpperCase()
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
}

export function StepReview({ data, onEditStep }: StepReviewProps) {
  const getIntentIcon = () => {
    switch (data.intent) {
      case "delivery":   return <Rocket className="h-5 w-5" />
      case "experiment": return <Flask className="h-5 w-5" />
      case "internal":   return <Briefcase className="h-5 w-5" />
      default:           return null
    }
  }

  const deliverableCount = (data.deliverables ?? []).length
  const metricCount = (data.metrics ?? []).length

  const metricSummary =
    metricCount > 0
      ? (data.metrics ?? []).map((m) => `${m.name || "Metric"}: ${m.target || "Target"}`).join(", ")
      : data.metricName || data.metricTarget
      ? `${data.metricName || "Metric"}: ${data.metricTarget || "Target"}`
      : "Not specified"

  const getSuccessIcon = () => {
    switch (data.successType) {
      case "deliverable": return <CheckCircle className="h-5 w-5" />
      case "metric":      return <Target className="h-5 w-5" />
      default:            return <Question className="h-5 w-5" />
    }
  }

  // Resolve owner name from real wizardAccounts
  const ownerAccount = data.wizardAccounts?.find((a) => a.id === data.ownerId)
  const ownerName = ownerAccount
    ? (ownerAccount.name ?? ownerAccount.email)
    : data.ownerId
    ? "Selected owner"
    : "Not assigned"
  const ownerInitials = getInitials(ownerAccount?.name)

  const structureLabel =
    data.structure === "milestones"
      ? "Milestones"
      : data.structure === "multistream"
      ? "Multi-stream"
      : "Linear"

  return (
    <div className="flex flex-col space-y-4 bg-muted p-4 rounded-2xl">
      <p className="text-sm text-muted-foreground">Everything look good? You&apos;re ready to go.</p>

      <div>
        <div className="space-y-0.5">
          {/* Title */}
          <div className="flex items-center gap-4 rounded-3xl bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground">
              <TextT className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground pb-1">Project name</p>
              <p className="text-sm font-semibold">{data.title || <span className="text-destructive">Not set</span>}</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" type="button" onClick={() => onEditStep?.(1)}>
              <PencilSimpleLine className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="opacity-0" />

          {/* Intent */}
          <div className="flex items-center gap-4 rounded-3xl bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground">
              {getIntentIcon()}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground pb-1">Project intent</p>
              <p className="text-sm font-semibold">
                {data.intent === "delivery" && "Delivery"}
                {data.intent === "experiment" && "Experiment"}
                {data.intent === "internal" && "Internal"}
                {!data.intent && "Not specified"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" type="button" onClick={() => onEditStep?.(2)}>
              <PencilSimpleLine className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="opacity-0" />

          {/* Success */}
          <div className="flex items-center gap-4 rounded-3xl bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground">
              {getSuccessIcon()}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground pb-1">Outcome &amp; success</p>
              <p className="text-sm font-semibold">
                {data.successType === "deliverable" && "Deliverable-based"}
                {data.successType === "metric" && "Metric-based"}
                {data.successType === "undefined" && "To be defined"}
              </p>
              {data.successType === "deliverable" && deliverableCount > 0 && (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{deliverableCount} key deliverable{deliverableCount > 1 ? "s" : ""} will be delivered</span>
                </div>
              )}
              {data.successType === "metric" && metricCount > 0 && (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{metricSummary}</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" type="button" onClick={() => onEditStep?.(3)}>
              <PencilSimpleLine className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="opacity-0" />

          {/* Ownership */}
          <div className="flex items-center gap-4 rounded-3xl bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground pb-1">Ownership</p>
              <div className="mt-1 flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border bg-background text-xs">
                  <AvatarImage src={ownerAccount?.image ?? undefined} />
                  <AvatarFallback>{ownerInitials}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold">{ownerName}</p>
              </div>
              {data.contributorIds.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>Contributors: {data.contributorIds.length}</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" type="button" onClick={() => onEditStep?.(4)}>
              <PencilSimpleLine className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="opacity-0" />

          {/* Structure */}
          <div className="flex items-center gap-4 rounded-3xl bg-background p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground">
              <Layout className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground pb-1">Work structure</p>
              <p className="text-sm font-semibold">{structureLabel}</p>
              {data.addStarterTasks && (
                <p className="text-xs text-muted-foreground mt-0.5">Starter tasks will be created</p>
              )}
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" type="button" onClick={() => onEditStep?.(5)}>
              <PencilSimpleLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

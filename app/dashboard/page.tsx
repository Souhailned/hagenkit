import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Buildings,
  ChatDots,
  FolderSimple,
  CheckSquare,
  Heart,
  ArrowRight,
  Sparkle,
  Users,
} from "@phosphor-icons/react/dist/ssr";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "zojuist";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d geleden`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const WORKSPACE_ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  // ── User + workspace ──────────────────────────────────────────────────────
  const [user, membership] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true },
    }),
    prisma.workspaceMember.findFirst({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, image: true, email: true },
                },
              },
              orderBy: { joinedAt: "asc" },
              take: 8,
            },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  if (!user) redirect("/sign-in");

  const isAgent = user.role === "agent" || user.role === "admin";
  const workspaceId = membership?.workspaceId;
  const workspaceRole = membership?.role;
  const firstName = user.name?.split(" ")[0] || "daar";
  const workspaceMembers = membership?.workspace.members ?? [];

  // ── Stats ─────────────────────────────────────────────────────────────────
  type StatCard = {
    label: string;
    value: number | string;
    sub: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>;
    color: string;
    href: string;
  };

  let stats: StatCard[] = [];

  if (isAgent) {
    const [properties, activeProps, inquiries, projects, tasks] =
      await Promise.all([
        prisma.property.count({ where: { createdById: userId } }),
        prisma.property.count({
          where: { createdById: userId, status: "ACTIVE" },
        }),
        prisma.propertyInquiry.count({ where: { assignedToId: userId } }),
        workspaceId
          ? prisma.project.count({
              where: {
                workspaceId,
                status: { notIn: ["COMPLETED", "CANCELLED"] },
              },
            })
          : 0,
        prisma.projectTask.count({
          where: { assigneeId: userId, status: { not: "DONE" } },
        }),
      ]);

    stats = [
      {
        label: "Panden",
        value: properties,
        sub: `${activeProps} actief`,
        icon: Buildings,
        color: "text-primary",
        href: "/dashboard/panden",
      },
      {
        label: "Leads",
        value: inquiries,
        sub: "aanvragen",
        icon: ChatDots,
        color: "text-orange-500",
        href: "/dashboard/leads",
      },
      {
        label: "Projects",
        value: projects,
        sub: "lopend",
        icon: FolderSimple,
        color: "text-violet-500",
        href: "/dashboard/projects",
      },
      {
        label: "Taken",
        value: tasks,
        sub: "openstaand",
        icon: CheckSquare,
        color: "text-emerald-500",
        href: "/dashboard/tasks",
      },
    ];
  } else {
    const [favorites, available] = await Promise.all([
      prisma.favoriteProperty.count({ where: { userId } }),
      prisma.property.count({ where: { status: "ACTIVE" } }),
    ]);
    stats = [
      {
        label: "Favorieten",
        value: favorites,
        sub: "opgeslagen",
        icon: Heart,
        color: "text-red-500",
        href: "/dashboard/favorieten",
      },
      {
        label: "Beschikbaar",
        value: available,
        sub: "actieve panden",
        icon: Buildings,
        color: "text-primary",
        href: "/aanbod",
      },
    ];
  }

  // ── Recent activity ───────────────────────────────────────────────────────
  const recentActivities = workspaceId
    ? await prisma.projectActivity.findMany({
        where: { project: { workspaceId } },
        include: { actor: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    : [];

  // ── Quick links ───────────────────────────────────────────────────────────
  const quickLinks = isAgent
    ? [
        {
          href: "/dashboard/panden",
          label: "Mijn panden",
          sub: "Bekijk en bewerk je listings",
        },
        {
          href: "/dashboard/leads",
          label: "Leads",
          sub: "Open aanvragen van zoekers",
        },
        {
          href: "/dashboard/projects",
          label: "Projects",
          sub: "Projecten en werkstromen",
        },
        {
          href: "/dashboard/tasks",
          label: "My Tasks",
          sub: "Jouw openstaande taken",
        },
        {
          href: "/dashboard/analytics",
          label: "Analytics",
          sub: "Platform statistieken",
        },
      ]
    : [
        {
          href: "/aanbod",
          label: "Panden zoeken",
          sub: "Ontdek horecapanden in heel Nederland",
        },
        {
          href: "/dashboard/favorieten",
          label: "Mijn favorieten",
          sub: "Bekijk je opgeslagen panden",
        },
      ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ContentCard>
      <ContentCardHeader
        title={`Hallo, ${firstName}`}
        actions={
          workspaceRole && (
            <Badge
              variant="secondary"
              className="text-[11px] font-medium rounded-full"
            >
              {WORKSPACE_ROLE_LABELS[workspaceRole] ?? workspaceRole}
            </Badge>
          )
        }
      />

      <ContentCardBody className="p-4 space-y-6">

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div
          className={`grid gap-3 ${isAgent ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                  <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
                <p className="text-xl font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.sub}
                </p>
              </Link>
            );
          })}
        </div>

        {/* ── Main grid: activity + sidebar ─────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">

          {/* Recent activity */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Recente activiteit
            </h3>
            {recentActivities.length === 0 ? (
              <div className="rounded-xl border border-border px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Nog geen activiteit
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Wijzigingen in projects en taken verschijnen hier.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                {recentActivities.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <Avatar className="size-7 shrink-0 mt-0.5">
                      {entry.actor.image && (
                        <AvatarImage src={entry.actor.image} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {initials(entry.actor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">
                          {entry.actor.name ?? "Iemand"}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {entry.description}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: workspace + AI */}
          <div className="space-y-4">

            {/* Workspace */}
            {membership && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Workspace
                </h3>
                <div className="rounded-xl border border-border px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {membership.workspace.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 shrink-0"
                    >
                      {WORKSPACE_ROLE_LABELS[workspaceRole ?? ""] ??
                        workspaceRole}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {workspaceMembers.slice(0, 6).map((m) => (
                      <Avatar
                        key={m.id}
                        className="size-6"
                        title={m.user.name ?? m.user.email}
                      >
                        {m.user.image && <AvatarImage src={m.user.image} />}
                        <AvatarFallback className="text-[10px]">
                          {initials(m.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <span className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {workspaceMembers.length}{" "}
                      {workspaceMembers.length === 1 ? "lid" : "leden"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* AI features (agents only) */}
            {isAgent && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  AI functies
                </h3>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                  <Link
                    href="/dashboard/panden"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    <Sparkle
                      className="h-4 w-4 text-primary mt-0.5 shrink-0"
                      weight="duotone"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Listing Generator
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Genereer pand-beschrijvingen met AI
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                  </Link>
                  <Link
                    href="/dashboard/images"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    <Sparkle
                      className="h-4 w-4 text-violet-500 mt-0.5 shrink-0"
                      weight="duotone"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        AI Staging
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Virtuele inrichting via fal.ai
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Quick links ───────────────────────────────────────────────── */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Snel naar
          </h3>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

      </ContentCardBody>
    </ContentCard>
  );
}

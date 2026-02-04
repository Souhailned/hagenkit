import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { KpiCard } from "@/components/admin/kpi-card";
import { RecentActivity } from "@/components/admin/recent-activity";
import {
  getDashboardStats,
  getRecentActivity,
} from "@/app/actions/admin/dashboard";
import {
  Users,
  UserCheck,
  Buildings,
  EnvelopeSimple,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  // Fetch data in parallel
  const [statsResult, activityResult] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const activities = activityResult.success ? activityResult.data : [];

  return (
    <ContentCard>
      <ContentCardHeader title="Admin Dashboard" />
      <ContentCardBody className="p-6">
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Users"
              value={stats?.users.total ?? 0}
              trend={stats?.users.trend}
              trendLabel="vs last month"
              icon={Users}
              iconColor="default"
            />
            <KpiCard
              title="Active Now"
              value={stats?.activeNow ?? 0}
              subtitle="Last 24 hours"
              icon={UserCheck}
              iconColor="success"
            />
            <KpiCard
              title="Workspaces"
              value={stats?.workspaces.total ?? 0}
              subtitle={`+${stats?.workspaces.new ?? 0} this month`}
              icon={Buildings}
              iconColor="default"
            />
            <KpiCard
              title="Pending Invites"
              value={stats?.invitations.pending ?? 0}
              subtitle="Awaiting response"
              icon={EnvelopeSimple}
              iconColor={
                (stats?.invitations.pending ?? 0) > 0 ? "warning" : "default"
              }
            />
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentActivity activities={activities ?? []} />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="rounded-xl border bg-card p-6 shadow ring-1 ring-foreground/5">
                <h3 className="mb-4 font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/admin/users">
                      <Users className="mr-2 size-4" />
                      Manage Users
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/admin/workspaces">
                      <Buildings className="mr-2 size-4" />
                      Manage Workspaces
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/admin/impersonate">
                      <UserCheck className="mr-2 size-4" />
                      Impersonate User
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="rounded-xl border bg-card p-6 shadow ring-1 ring-foreground/5">
                <h3 className="mb-4 font-semibold">This Month</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Users</span>
                    <span className="font-medium">{stats?.users.new ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-medium">{stats?.users.active ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Workspaces</span>
                    <span className="font-medium">{stats?.workspaces.new ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}

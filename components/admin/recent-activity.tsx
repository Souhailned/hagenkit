import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Buildings,
  UserCheck,
  UserMinus,
  Gear,
} from "@phosphor-icons/react/dist/ssr";
import type { ActivityItem } from "@/app/actions/admin/dashboard";

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "user_registered":
      return <UserPlus className="size-4" weight="bold" />;
    case "workspace_created":
      return <Buildings className="size-4" weight="bold" />;
    case "user_status_changed":
      return <UserMinus className="size-4" weight="bold" />;
    default:
      return <Gear className="size-4" weight="bold" />;
  }
}

function getActivityColor(type: ActivityItem["type"]) {
  switch (type) {
    case "user_registered":
      return "bg-emerald-100 text-emerald-600";
    case "workspace_created":
      return "bg-blue-100 text-blue-600";
    case "user_status_changed":
      return "bg-amber-100 text-amber-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                getActivityColor(activity.type)
              )}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-tight">{activity.description}</p>
              <p className="text-muted-foreground text-xs">
                {formatTimeAgo(new Date(activity.timestamp))}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

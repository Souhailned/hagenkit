import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendUp,
  TrendDown,
  Minus,
} from "@phosphor-icons/react/dist/ssr";
import type { IconProps } from "@phosphor-icons/react";

type PhosphorIcon = React.ComponentType<IconProps>;

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: PhosphorIcon;
  iconColor?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = "default",
  className,
}: KpiCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) {
      return <Minus className="size-3" />;
    }
    return trend > 0 ? (
      <TrendUp className="size-3" weight="bold" />
    ) : (
      <TrendDown className="size-3" weight="bold" />
    );
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) {
      return "text-muted-foreground";
    }
    return trend > 0 ? "text-emerald-600" : "text-red-600";
  };

  const getIconColorClass = () => {
    switch (iconColor) {
      case "success":
        return "bg-emerald-100 text-emerald-600";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "danger":
        return "bg-red-100 text-red-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(subtitle || trend !== undefined) && (
              <div className="flex items-center gap-2">
                {trend !== undefined && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      getTrendColor()
                    )}
                  >
                    {getTrendIcon()}
                    {trend > 0 ? "+" : ""}
                    {trend}%
                  </span>
                )}
                {trendLabel && (
                  <span className="text-muted-foreground text-xs">
                    {trendLabel}
                  </span>
                )}
                {subtitle && !trend && (
                  <span className="text-muted-foreground text-xs">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                getIconColorClass()
              )}
            >
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

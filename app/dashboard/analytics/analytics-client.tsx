"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewsChart, DeviceChart } from "@/components/analytics/views-chart";
import { Eye, MessageSquare, Heart, TrendingUp, Building2, Clock } from "lucide-react";
import type { AnalyticsOverview } from "@/app/actions/analytics";
import Link from "next/link";

interface AnalyticsClientProps {
  analytics: AnalyticsOverview;
}

export function AnalyticsClient({ analytics }: AnalyticsClientProps) {
  const {
    totalViews, totalInquiries, totalFavorites, conversionRate,
    weeklyViews, weeklyInquiries, dailyData, topProperties,
    deviceBreakdown, sourceBreakdown,
  } = analytics;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Analytics</h1>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <StatCard
          icon={<Eye className="h-5 w-5 text-blue-500" />}
          value={totalViews}
          label="Totaal views"
          change={`+${weeklyViews} deze week`}
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5 text-orange-500" />}
          value={totalInquiries}
          label="Aanvragen"
          change={`+${weeklyInquiries} deze week`}
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-red-500" />}
          value={totalFavorites}
          label="Opgeslagen"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          value={`${conversionRate.toFixed(1)}%`}
          label="Conversie"
          sublabel="Views → aanvragen"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <ViewsChart data={dailyData} />
        </div>
        <DeviceChart data={deviceBreakdown} />
      </div>

      {/* Source breakdown */}
      {sourceBreakdown.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Verkeersbronnen (30 dagen)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sourceBreakdown
                .sort((a, b) => b.count - a.count)
                .map((s) => {
                  const total = sourceBreakdown.reduce((sum, x) => sum + x.count, 0);
                  const pct = total > 0 ? ((s.count / total) * 100).toFixed(0) : "0";
                  return (
                    <div key={s.source} className="flex items-center gap-3">
                      <span className="text-sm w-20 truncate">{sourceLabel(s.source)}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {s.count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top properties table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5" />
            Pand prestaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nog geen panden. Voeg je eerste pand toe om statistieken te zien.
            </p>
          ) : (
            <div className="space-y-2">
              {topProperties.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/dashboard/panden/${p.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.city}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {p.daysOnline}d online
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={p.status === "ACTIVE" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {statusLabel(p.status)}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1" title="Views">
                      <Eye className="h-3.5 w-3.5" /> {p.viewCount}
                    </span>
                    <span className="flex items-center gap-1" title="Aanvragen">
                      <MessageSquare className="h-3.5 w-3.5" /> {p.inquiryCount}
                    </span>
                    <span className="flex items-center gap-1" title="Favorieten">
                      <Heart className="h-3.5 w-3.5" /> {p.favoriteCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  change,
  sublabel,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  change?: string;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
        {change && <p className="mt-2 text-xs text-green-600">{change}</p>}
        {sublabel && <p className="mt-2 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: "Actief", DRAFT: "Concept", UNDER_OFFER: "Onder bod",
    RENTED: "Verhuurd", SOLD: "Verkocht", ARCHIVED: "Gearchiveerd",
  };
  return labels[status] || status;
}

function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    search: "Zoeken", direct: "Direct", email: "Email",
    social: "Social", referral: "Verwijzing", Direct: "Direct",
  };
  return labels[source] || source;
}

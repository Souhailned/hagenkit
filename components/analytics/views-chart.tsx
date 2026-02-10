"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyViewData } from "@/app/actions/analytics";

interface ViewsChartProps {
  data: DailyViewData[];
}

export function ViewsChart({ data }: ViewsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Views & aanvragen (afgelopen 7 dagen)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="inquiriesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                value,
                name === "views" ? "Views" : "Aanvragen",
              ]}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--primary))"
              fill="url(#viewsGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="inquiries"
              stroke="hsl(var(--chart-2))"
              fill="url(#inquiriesGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DeviceChartProps {
  data: { device: string; count: number }[];
}

export function DeviceChart({ data }: DeviceChartProps) {
  if (data.length === 0) return null;

  const deviceLabels: Record<string, string> = {
    mobile: "Mobiel",
    desktop: "Desktop",
    tablet: "Tablet",
    Onbekend: "Onbekend",
  };

  const chartData = data.map((d) => ({
    name: deviceLabels[d.device] || d.device,
    bezoekers: d.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Apparaten (30 dagen)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="bezoekers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

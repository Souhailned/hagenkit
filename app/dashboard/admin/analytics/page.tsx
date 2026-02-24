import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Eye, MessageCircle, Heart, TrendingUp, Sparkles } from "lucide-react";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";

export default async function AdminAnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin") redirect("/dashboard");

  const [
    totalUsers,
    totalProperties,
    activeProperties,
    totalViews,
    totalInquiries,
    totalFavorites,
    newUsersThisWeek,
    newPropertiesThisWeek,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: "ACTIVE" } }),
    prisma.property.aggregate({ _sum: { viewCount: true } }),
    prisma.propertyInquiry.count(),
    prisma.favoriteProperty.count(),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.property.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const stats = [
    { label: "Gebruikers", value: totalUsers, icon: Users, color: "text-blue-500", sub: `+${newUsersThisWeek} deze week` },
    { label: "Panden", value: totalProperties, icon: Building2, color: "text-green-500", sub: `${activeProperties} actief` },
    { label: "Totaal views", value: totalViews._sum.viewCount || 0, icon: Eye, color: "text-purple-500", sub: `+${newPropertiesThisWeek} nieuwe panden` },
    { label: "Aanvragen", value: totalInquiries, icon: MessageCircle, color: "text-orange-500", sub: "totaal" },
    { label: "Favorieten", value: totalFavorites, icon: Heart, color: "text-red-500", sub: "totaal" },
    { label: "Conversie", value: totalViews._sum.viewCount ? `${((totalInquiries / (totalViews._sum.viewCount || 1)) * 100).toFixed(1)}%` : "0%", icon: TrendingUp, color: "text-emerald-500", sub: "views \u2192 aanvragen" },
  ];

  return (
    <ContentCard>
      <ContentCardHeader title="Platform Analytics" />
      <ContentCardBody className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Costs link */}
        <div className="mt-6">
          <a
            href="/dashboard/admin/ai-costs"
            className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">AI Kosten Dashboard</p>
              <p className="text-xs text-muted-foreground">
                Bekijk API kosten per service en feature
              </p>
            </div>
            <div className="ml-auto text-muted-foreground">&rarr;</div>
          </a>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}

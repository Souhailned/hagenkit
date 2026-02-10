import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, Heart, TrendingUp, Building2, Clock } from "lucide-react";

export const metadata = { title: "Analytics - Horecagrond" };

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  // Get properties with stats
  const properties = await prisma.property.findMany({
    where: { createdById: session.user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      status: true,
      viewCount: true,
      inquiryCount: true,
      savedCount: true,
      createdAt: true,
      _count: { select: { favorites: true } },
    },
    orderBy: { viewCount: "desc" },
  });

  // Recent views (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentViews = await prisma.propertyView.count({
    where: {
      property: { createdById: session.user.id },
      viewedAt: { gte: weekAgo },
    },
  });

  // Recent inquiries
  const recentInquiries = await prisma.propertyInquiry.count({
    where: {
      property: { createdById: session.user.id },
      createdAt: { gte: weekAgo },
    },
  });

  const totalViews = properties.reduce((s, p) => s + p.viewCount, 0);
  const totalInquiries = properties.reduce((s, p) => s + p.inquiryCount, 0);
  const totalFavorites = properties.reduce((s, p) => s + p._count.favorites, 0);
  const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : "0";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Analytics</h1>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalViews}</p>
                <p className="text-xs text-muted-foreground">Totaal views</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-green-600">+{recentViews} deze week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{totalInquiries}</p>
                <p className="text-xs text-muted-foreground">Aanvragen</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-green-600">+{recentInquiries} deze week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{totalFavorites}</p>
                <p className="text-xs text-muted-foreground">Opgeslagen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Conversie</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Views → aanvragen</p>
          </CardContent>
        </Card>
      </div>

      {/* Top properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Pand prestaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nog geen panden. Voeg je eerste pand toe om statistieken te zien.
            </p>
          ) : (
            <div className="space-y-3">
              {properties.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.city}</p>
                  </div>
                  <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                    {p.status === "ACTIVE" ? "Actief" : p.status === "DRAFT" ? "Concept" : p.status}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {p.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {p.inquiryCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" /> {p._count.favorites}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

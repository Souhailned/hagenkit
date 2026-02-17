import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import {
  Building2,
  Eye,
  MessageSquare,
  Heart,
  TrendingUp,
  Plus,
  ArrowRight,
  Search,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  const isAgent = user?.role === "agent";

  // Stats for agents
  let agentStats = { properties: 0, views: 0, inquiries: 0, activeListings: 0 };
  if (isAgent) {
    const properties = await prisma.property.findMany({
      where: { createdById: session.user.id },
      select: { status: true, viewCount: true, inquiryCount: true },
    });
    agentStats = {
      properties: properties.length,
      views: properties.reduce((sum, p) => sum + p.viewCount, 0),
      inquiries: properties.reduce((sum, p) => sum + p.inquiryCount, 0),
      activeListings: properties.filter((p) => p.status === "ACTIVE").length,
    };
  }

  // Stats for seekers
  let seekerStats = { favorites: 0, recentProperties: 0 };
  if (!isAgent) {
    seekerStats.favorites = await prisma.favoriteProperty.count({
      where: { userId: session.user.id },
    });
    seekerStats.recentProperties = await prisma.property.count({
      where: { status: "ACTIVE" },
    });
  }

  const firstName = user?.name?.split(" ")[0] || "daar";

  return (
    <ContentCard>
      <ContentCardHeader title="Dashboard" />
      <ContentCardBody className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Hallo, {firstName}!
          </h2>
          <p className="mt-1 text-muted-foreground">
            {isAgent
              ? "Hier is een overzicht van je panden en leads."
              : "Ontdek de beste horecapanden voor jouw concept."}
          </p>
        </div>

        {/* Stats cards */}
        {isAgent ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agentStats.properties}</p>
                  <p className="text-xs text-muted-foreground">Panden</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agentStats.activeListings}</p>
                  <p className="text-xs text-muted-foreground">Actief</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Eye className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agentStats.views}</p>
                  <p className="text-xs text-muted-foreground">Bekeken</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agentStats.inquiries}</p>
                  <p className="text-xs text-muted-foreground">Aanvragen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{seekerStats.favorites}</p>
                  <p className="text-xs text-muted-foreground">Favorieten</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{seekerStats.recentProperties}</p>
                  <p className="text-xs text-muted-foreground">Beschikbaar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {isAgent ? (
          <>
            <Link href="/dashboard/panden/nieuw">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Nieuw pand toevoegen</h3>
                      <p className="text-sm text-muted-foreground">
                        Voeg een horecapand toe aan het platform
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/panden">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                      <Building2 className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Mijn panden beheren</h3>
                      <p className="text-sm text-muted-foreground">
                        Bekijk en bewerk je listings
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </>
        ) : (
          <>
            <Link href="/aanbod">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Panden zoeken</h3>
                      <p className="text-sm text-muted-foreground">
                        Ontdek horecapanden in heel Nederland
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/favorieten">
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Mijn favorieten</h3>
                      <p className="text-sm text-muted-foreground">
                        Bekijk je opgeslagen panden
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>
      </ContentCardBody>
    </ContentCard>
  );
}

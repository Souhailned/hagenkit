"use client";

import * as React from "react";
import { Buildings, Users, Eye, TrendUp, ChartBar, Storefront, ArrowRight } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMarketOverview } from "@/app/actions/market-intelligence";
import { formatPrice } from "@/lib/format";

export function AdminDashboard() {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getMarketOverview>>["data"]>();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getMarketOverview().then((result) => {
      if (result.success) setData(result.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground text-center py-10">Kon data niet laden.</p>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Buildings className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.totalActiveListings}</p>
                <p className="text-xs text-muted-foreground">Actieve panden</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <TrendUp className="h-5 w-5 text-green-600" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(data.avgRentPrice)}</p>
                <p className="text-xs text-muted-foreground">Gem. huurprijs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <ChartBar className="h-5 w-5 text-blue-600" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.newListingsLast7Days}</p>
                <p className="text-xs text-muted-foreground">Nieuw (7 dagen)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Eye className="h-5 w-5 text-amber-600" weight="duotone" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.avgSurface} m²</p>
                <p className="text-xs text-muted-foreground">Gem. oppervlakte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/dashboard/admin/users" className="group">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" weight="duotone" />
                <span className="font-medium">Gebruikers beheren</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/properties" className="group">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Buildings className="h-5 w-5 text-primary" weight="duotone" />
                <span className="font-medium">Alle panden</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/admin/agencies" className="group">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Storefront className="h-5 w-5 text-primary" weight="duotone" />
                <span className="font-medium">Makelaarskantoren</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Steden</CardTitle>
            <CardDescription>Steden met de meeste panden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCities.map((city, i) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                    <span className="font-medium text-sm">{city.city}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{city.count} panden</span>
                    <span className="font-medium">{formatPrice(city.avgPrice)}/mnd</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Types</CardTitle>
            <CardDescription>Meest voorkomende pandtypen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topTypes.map((type, i) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-5">{i + 1}.</span>
                    <span className="font-medium text-sm">{type.type.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{type.count} panden</span>
                    <span className="font-medium">{formatPrice(type.avgPrice)}/mnd</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Prijsverdeling</CardTitle>
            <CardDescription>Huurprijzen van actieve panden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.priceDistribution.map((range) => {
                const maxCount = Math.max(...data.priceDistribution.map((r) => r.count));
                const width = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
                return (
                  <div key={range.range} className="flex items-center gap-3">
                    <span className="text-sm w-32 shrink-0">{range.range}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{range.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

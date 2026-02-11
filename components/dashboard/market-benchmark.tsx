"use client";

import * as React from "react";
import { TrendUp, TrendDown, Minus, CurrencyEur, Info } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMarketBenchmark } from "@/app/actions/market-benchmark";
import { formatPrice } from "@/lib/format";

interface MarketBenchmarkProps {
  propertyId: string;
}

export function MarketBenchmark({ propertyId }: MarketBenchmarkProps) {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof getMarketBenchmark>>["data"]>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>();

  const loadBenchmark = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await getMarketBenchmark(propertyId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || "Kon marktdata niet laden");
      }
    } catch {
      setError("Er ging iets mis");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CurrencyEur className="h-5 w-5 text-primary" weight="duotone" />
          Marktprijzen Benchmark
        </CardTitle>
        <CardDescription>
          Vergelijk je huurprijs met vergelijkbare panden in de buurt
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data && !isLoading && !error && (
          <Button onClick={loadBenchmark} variant="outline" className="w-full gap-2">
            <TrendUp className="h-4 w-4" weight="bold" />
            Vergelijk met de markt
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadBenchmark} variant="ghost" size="sm" className="mt-2">
              Opnieuw proberen
            </Button>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Price comparison */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Laagste</p>
                <p className="text-sm font-semibold">{formatPrice(data.minPrice)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
                <p className="text-xs text-muted-foreground">Jouw prijs</p>
                <p className="text-sm font-bold text-primary">{formatPrice(data.yourPrice)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Hoogste</p>
                <p className="text-sm font-semibold">{formatPrice(data.maxPrice)}</p>
              </div>
            </div>

            {/* Percentile bar */}
            <div className="relative">
              <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" />
              <div
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${data.percentile}%` }}
              >
                <div className="h-4 w-0.5 bg-foreground -mt-1" />
                <div className="text-[10px] font-medium mt-0.5 -translate-x-1/2">{data.percentile}%</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Gemiddeld:</span>
                <span className="font-medium">{formatPrice(data.avgPrice)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Mediaan:</span>
                <span className="font-medium">{formatPrice(data.medianPrice)}</span>
              </div>
            </div>

            {/* Trend indicator */}
            <div className={cn(
              "flex items-start gap-2 rounded-lg p-3 text-sm",
              data.percentile > 60 ? "bg-yellow-50 dark:bg-yellow-900/20" :
                data.percentile < 40 ? "bg-green-50 dark:bg-green-900/20" :
                  "bg-blue-50 dark:bg-blue-900/20"
            )}>
              {data.percentile > 60 ? (
                <TrendUp className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" weight="bold" />
              ) : data.percentile < 40 ? (
                <TrendDown className="h-4 w-4 text-green-600 shrink-0 mt-0.5" weight="bold" />
              ) : (
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" weight="bold" />
              )}
              <span>{data.recommendation}</span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Gebaseerd op {data.totalListings} vergelijkbare listings in {data.city}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

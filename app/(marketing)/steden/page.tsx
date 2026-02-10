import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Horecapanden per stad - Horecagrond",
  description: "Bekijk het aanbod horecapanden per stad in Nederland. Van Amsterdam tot Maastricht.",
};

export default async function StedenPage() {
  let cities: { city: string; count: number }[] = [];

  try {
    const grouped = await prisma.property.groupBy({
      by: ["city"],
      where: { status: "ACTIVE" },
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
    });
    cities = grouped.map((g) => ({ city: g.city, count: g._count.city }));
  } catch {
    // Fallback
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Horecapanden per stad</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Ontdek het aanbod in jouw stad. Van bruisend Amsterdam tot gezellig Maastricht.
        </p>
      </div>

      {cities.length === 0 ? (
        <p className="text-center text-muted-foreground">Geen steden gevonden.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link key={c.city} href={`/aanbod?city=${encodeURIComponent(c.city)}`}>
              <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{c.city}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {c.count} {c.count === 1 ? "pand" : "panden"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

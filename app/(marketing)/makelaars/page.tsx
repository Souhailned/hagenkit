import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Makelaars - Horecagrond",
  description: "Vind horeca makelaars in Nederland. Bekijk hun aanbod en neem direct contact op.",
};

export default async function MakelaarsPage() {
  let agencies: { id: string; name: string; city: string | null; _count: { properties: number } }[] = [];

  try {
    agencies = await prisma.agency.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        _count: { select: { properties: true } },
      },
      orderBy: { properties: { _count: "desc" } },
    });
  } catch {
    // fallback
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Horeca Makelaars</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Vind een gespecialiseerde makelaar bij jou in de buurt
        </p>
      </div>

      {agencies.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">Nog geen makelaars geregistreerd.</p>
          <Link href="/voor-makelaars" className="mt-2 inline-block text-primary hover:underline text-sm">
            Word de eerste →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agencies.map((agency) => (
            <Card key={agency.id} className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">{agency.name}</h2>
                  {agency.city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {agency.city}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {agency._count.properties} {agency._count.properties === 1 ? "pand" : "panden"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

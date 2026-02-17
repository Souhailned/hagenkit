import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { Plus, Building2, Eye, MessageSquare, MapPin } from "lucide-react";
import { redirect } from "next/navigation";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Concept", variant: "secondary" },
  PENDING_REVIEW: { label: "In review", variant: "outline" },
  ACTIVE: { label: "Actief", variant: "default" },
  UNDER_OFFER: { label: "Onder bod", variant: "outline" },
  RENTED: { label: "Verhuurd", variant: "secondary" },
  SOLD: { label: "Verkocht", variant: "secondary" },
  ARCHIVED: { label: "Gearchiveerd", variant: "secondary" },
};

export const metadata = { title: "Mijn Panden - Horecagrond" };

export default async function PandenPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const properties = await prisma.property.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      propertyType: true,
      status: true,
      rentPrice: true,
      salePrice: true,
      priceType: true,
      viewCount: true,
      inquiryCount: true,
      createdAt: true,
    },
  });

  return (
    <ContentCard>
      <ContentCardHeader
        title="Mijn Panden"
        actions={
          <Link href="/dashboard/panden/nieuw">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nieuw pand
            </Button>
          </Link>
        }
      />
      <ContentCardBody className="p-4">
        <p className="mb-4 text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? "pand" : "panden"}
        </p>

        {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Nog geen panden</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Voeg je eerste horecapand toe en bereik duizenden ondernemers.
          </p>
          <Link href="/dashboard/panden/nieuw">
            <Button className="mt-6">
              <Plus className="mr-2 h-4 w-4" />
              Eerste pand toevoegen
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => {
            const price = property.priceType === "SALE"
              ? property.salePrice
              : property.rentPrice;
            const formattedPrice = price
              ? new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price / 100)
              : "Prijs n.t.b.";
            const priceLabel = property.priceType === "RENT" || property.priceType === "RENT_OR_SALE" ? "/maand" : "";
            const status = statusLabels[property.status] || { label: property.status, variant: "secondary" as const };

            return (
              <Link key={property.id} href={`/aanbod/${property.slug}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center gap-6 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{property.title}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.city}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {property.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {property.inquiryCount}
                      </div>
                      <div className="font-semibold text-foreground">
                        {formattedPrice}{priceLabel}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        )}
      </ContentCardBody>
    </ContentCard>
  );
}

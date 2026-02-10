import Link from "next/link";
import Image from "next/image";
import { getSimilarProperties } from "@/app/actions/similar-properties";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Maximize2 } from "lucide-react";

const typeLabels: Record<string, string> = {
  RESTAURANT: "Restaurant", CAFE: "Café", BAR: "Bar", HOTEL: "Hotel",
  EETCAFE: "Eetcafé", LUNCHROOM: "Lunchroom", KOFFIEBAR: "Koffiebar",
  PIZZERIA: "Pizzeria", SNACKBAR: "Snackbar", BAKERY: "Bakkerij",
};

export async function SimilarProperties({ propertyId }: { propertyId: string }) {
  const similar = await getSimilarProperties(propertyId);

  if (similar.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Vergelijkbare panden</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((p) => {
          const price = p.rentPrice || p.salePrice;
          const formatted = price
            ? new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price / 100)
            : "Prijs n.t.b.";
          const suffix = p.priceType === "RENT" || p.priceType === "RENT_OR_SALE" ? "/mnd" : "";
          const imgUrl = p.images[0]?.thumbnailUrl || p.images[0]?.originalUrl;

          return (
            <Link key={p.id} href={`/aanbod/${p.slug}`}>
              <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative aspect-[4/3] bg-muted">
                  {imgUrl ? (
                    <Image src={imgUrl} alt={p.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      Geen foto
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white border-0">
                    {typeLabels[p.propertyType] || p.propertyType}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{p.title}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {p.city}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold">{formatted}{suffix}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Maximize2 className="h-3 w-3" /> {p.surfaceTotal} m²
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

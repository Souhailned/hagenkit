"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CompareProperty {
  id: string;
  title: string;
  slug: string;
  city: string;
  propertyType: string;
  priceType: string;
  rentPrice: number | null;
  salePrice: number | null;
  surfaceTotal: number;
  surfaceKitchen: number | null;
  surfaceTerrace: number | null;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  floors: number;
  address: string;
}

const typeLabels: Record<string, string> = {
  RESTAURANT: "Restaurant", CAFE: "Café", BAR: "Bar", HOTEL: "Hotel",
  EETCAFE: "Eetcafé", LUNCHROOM: "Lunchroom", KOFFIEBAR: "Koffiebar",
  PIZZERIA: "Pizzeria", SNACKBAR: "Snackbar", OTHER: "Anders",
};

function formatPrice(cents: number | null) {
  if (!cents) return "-";
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);
}

export default function VergelijkPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<CompareProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get("ids")?.split(",") || [];
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/properties/compare?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setProperties(data.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  const rows = [
    { label: "Type", render: (p: CompareProperty) => typeLabels[p.propertyType] || p.propertyType },
    { label: "Stad", render: (p: CompareProperty) => p.city },
    { label: "Adres", render: (p: CompareProperty) => p.address },
    { label: "Huurprijs", render: (p: CompareProperty) => p.rentPrice ? `${formatPrice(p.rentPrice)}/mnd` : "-" },
    { label: "Koopprijs", render: (p: CompareProperty) => formatPrice(p.salePrice) },
    { label: "Oppervlakte", render: (p: CompareProperty) => `${p.surfaceTotal} m²` },
    { label: "Keuken", render: (p: CompareProperty) => p.surfaceKitchen ? `${p.surfaceKitchen} m²` : "-" },
    { label: "Terras", render: (p: CompareProperty) => p.surfaceTerrace ? `${p.surfaceTerrace} m²` : "-" },
    { label: "Verdiepingen", render: (p: CompareProperty) => p.floors.toString() },
    { label: "Zitplaatsen binnen", render: (p: CompareProperty) => p.seatingCapacityInside?.toString() || "-" },
    { label: "Zitplaatsen buiten", render: (p: CompareProperty) => p.seatingCapacityOutside?.toString() || "-" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/aanbod">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vergelijk panden</h1>
          <p className="text-muted-foreground">
            {properties.length} panden naast elkaar
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-24">
          <h2 className="text-xl font-semibold">Geen panden om te vergelijken</h2>
          <p className="mt-2 text-muted-foreground">
            Selecteer panden op de aanbod pagina om te vergelijken.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 bg-muted/50 rounded-tl-lg w-40 text-sm font-medium text-muted-foreground">
                  Kenmerk
                </th>
                {properties.map((p) => (
                  <th key={p.id} className="p-3 bg-muted/50 text-left min-w-[200px]">
                    <Link href={`/aanbod/${p.slug}`} className="font-semibold text-primary hover:underline">
                      {p.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="p-3 text-sm font-medium text-muted-foreground">{row.label}</td>
                  {properties.map((p) => (
                    <td key={p.id} className="p-3 text-sm">{row.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

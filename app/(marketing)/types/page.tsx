import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Horeca Types - Horecagrond",
  description: "Ontdek alle types horecapanden: restaurants, cafés, bars, hotels, lunchrooms en meer.",
};

const typeConfig: Record<string, { emoji: string; label: string; description: string }> = {
  RESTAURANT: { emoji: "🍽️", label: "Restaurant", description: "Van fine dining tot casual eetgelegenheid" },
  CAFE: { emoji: "☕", label: "Café", description: "Gezellige cafés en koffiezaken" },
  BAR: { emoji: "🍸", label: "Bar", description: "Cocktailbars, lounges en kroegen" },
  HOTEL: { emoji: "🏨", label: "Hotel", description: "Hotels en accommodaties" },
  EETCAFE: { emoji: "🍺", label: "Eetcafé", description: "Combinatie van eten en drinken" },
  GRAND_CAFE: { emoji: "🪑", label: "Grand Café", description: "Ruime cafés met uitgebreid menu" },
  LUNCHROOM: { emoji: "🥪", label: "Lunchroom", description: "Broodjes, salades en koffie" },
  KOFFIEBAR: { emoji: "☕", label: "Koffiebar", description: "Specialty coffee en gebak" },
  PIZZERIA: { emoji: "🍕", label: "Pizzeria", description: "Italiaanse pizza restaurants" },
  BAKERY: { emoji: "🥐", label: "Bakkerij", description: "Bakkerijen met eet/zitgelegenheid" },
  DARK_KITCHEN: { emoji: "🔥", label: "Dark Kitchen", description: "Bezorg-only keukens" },
  SNACKBAR: { emoji: "🍟", label: "Snackbar", description: "Snelle hap en afhaal" },
  COCKTAILBAR: { emoji: "🍹", label: "Cocktailbar", description: "Specialistische cocktailbars" },
  NIGHTCLUB: { emoji: "🎶", label: "Nachtclub", description: "Clubs en dansgelegenheden" },
  BED_AND_BREAKFAST: { emoji: "🛏️", label: "B&B", description: "Bed & Breakfast accommodaties" },
  SUSHI: { emoji: "🍣", label: "Sushi", description: "Sushi restaurants en bars" },
  IJSSALON: { emoji: "🍦", label: "IJssalon", description: "IJssalons en gelateria's" },
  WIJNBAR: { emoji: "🍷", label: "Wijnbar", description: "Wijnbars en proeflokalen" },
  BROUWERIJ_CAFE: { emoji: "🍺", label: "Brouwerij Café", description: "Brouwerijen met proeflokaal" },
  STRANDPAVILJOEN: { emoji: "🏖️", label: "Strandpaviljoen", description: "Strandtenten en paviljoens" },
};

export default async function TypesPage() {
  let typeCounts: Record<string, number> = {};
  try {
    const grouped = await prisma.property.groupBy({
      by: ["propertyType"],
      where: { status: "ACTIVE" },
      _count: { propertyType: true },
    });
    typeCounts = Object.fromEntries(grouped.map((g) => [g.propertyType, g._count.propertyType]));
  } catch {
    // fallback
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Horeca Types</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Van restaurant tot dark kitchen — ontdek alle soorten horecapanden.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(typeConfig).map(([key, config]) => {
          const count = typeCounts[key] || 0;
          return (
            <Link key={key} href={`/aanbod?types=${key}`}>
              <Card className="transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 p-6">
                  <span className="text-4xl">{config.emoji}</span>
                  <div className="flex-1">
                    <h2 className="font-semibold">{config.label}</h2>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    {count > 0 && (
                      <p className="mt-1 text-xs text-primary font-medium">{count} beschikbaar</p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

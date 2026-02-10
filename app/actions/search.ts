"use server";

import prisma from "@/lib/prisma";

export type SearchSuggestion = {
  type: "city" | "property_type" | "property";
  label: string;
  value: string;
  extra?: string; // city for properties, count for cities
};

export async function getSearchSuggestions(
  query: string
): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const results: SearchSuggestion[] = [];

  // 1. Search cities (with count)
  const cities = await prisma.property.groupBy({
    by: ["city"],
    where: {
      status: "ACTIVE",
      city: { contains: q, mode: "insensitive" },
    },
    _count: true,
    orderBy: { _count: { city: "desc" } },
    take: 5,
  });

  for (const c of cities) {
    results.push({
      type: "city",
      label: c.city,
      value: c.city,
      extra: `${c._count} panden`,
    });
  }

  // 2. Search property types (match against Dutch labels)
  const typeLabels: Record<string, string> = {
    RESTAURANT: "Restaurant",
    CAFE: "Café",
    BAR: "Bar",
    HOTEL: "Hotel",
    EETCAFE: "Eetcafé",
    GRAND_CAFE: "Grand Café",
    COCKTAILBAR: "Cocktailbar",
    LUNCHROOM: "Lunchroom",
    KOFFIEBAR: "Koffiebar",
    BRASSERIE: "Brasserie",
    PIZZERIA: "Pizzeria",
    SNACKBAR: "Snackbar",
    NIGHTCLUB: "Nachtclub",
    BAKERY: "Bakkerij",
    DARK_KITCHEN: "Dark Kitchen",
    BED_AND_BREAKFAST: "Bed & Breakfast",
    SUSHI: "Sushi",
    IJSSALON: "IJssalon",
    BROUWERIJ_CAFE: "Brouwerij Café",
    WIJNBAR: "Wijnbar",
    STRANDPAVILJOEN: "Strandpaviljoen",
    PANNENKOEKHUIS: "Pannenkoekhuis",
    TEAROOM: "Tearoom",
    PARTYCENTRUM: "Partycentrum",
  };

  const matchingTypes = Object.entries(typeLabels)
    .filter(([, label]) => label.toLowerCase().includes(q))
    .slice(0, 3);

  for (const [key, label] of matchingTypes) {
    results.push({
      type: "property_type",
      label,
      value: key,
    });
  }

  // 3. Search properties by title
  const properties = await prisma.property.findMany({
    where: {
      status: "ACTIVE",
      title: { contains: q, mode: "insensitive" },
    },
    select: { id: true, title: true, city: true, slug: true },
    take: 5,
    orderBy: { viewCount: "desc" },
  });

  for (const p of properties) {
    results.push({
      type: "property",
      label: p.title,
      value: p.slug,
      extra: p.city,
    });
  }

  return results.slice(0, 10);
}

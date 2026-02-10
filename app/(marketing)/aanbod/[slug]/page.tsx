import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/app/actions/properties";
import { trackPropertyView } from "@/app/actions/track-view";
import { PropertyDetail } from "./property-detail";

const typeLabels: Record<string, string> = {
  RESTAURANT: "Restaurant", CAFE: "Café", BAR: "Bar", HOTEL: "Hotel",
  EETCAFE: "Eetcafé", LUNCHROOM: "Lunchroom", KOFFIEBAR: "Koffiebar",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPropertyBySlug(slug);

  if (!result.success || !result.data) {
    return { title: "Pand niet gevonden - Horecagrond" };
  }

  const p = result.data;
  const type = typeLabels[p.propertyType] || "Horecapand";
  const price = p.rentPrice
    ? `€${(p.rentPrice / 100).toLocaleString("nl-NL")}/mnd`
    : p.salePrice
    ? `€${(p.salePrice / 100).toLocaleString("nl-NL")}`
    : "";

  return {
    title: `${p.title} | ${type} in ${p.city} - Horecagrond`,
    description:
      p.shortDescription ||
      `${type} te ${p.priceType === "SALE" ? "koop" : "huur"} in ${p.city}. ${p.surfaceTotal} m². ${price}. Bekijk details op Horecagrond.`,
    openGraph: {
      title: p.title,
      description: `${type} in ${p.city} | ${p.surfaceTotal} m² | ${price}`,
      type: "website",
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPropertyBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  // Track view (fire and forget)
  trackPropertyView(result.data.id).catch(() => {});

  return <PropertyDetail property={result.data} />;
}

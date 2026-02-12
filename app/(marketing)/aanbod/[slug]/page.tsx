import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/app/actions/properties";
import { trackPropertyView } from "@/app/actions/track-view";
import { PropertyDetail } from "./property-detail";
import { SimilarProperties } from "@/components/property/similar-properties";
import { PropertyJsonLd } from "@/components/seo/property-jsonld";

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
      ...(p.images?.[0] && {
        images: [{ url: (p.images[0] as any).originalUrl || p.images[0], width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: `${type} in ${p.city} | ${p.surfaceTotal} m² | ${price}`,
      ...(p.images?.[0] && {
        images: [(p.images[0] as any).originalUrl || p.images[0]],
      }),
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

  const p = result.data;
  const imgUrl = p.images?.[0]?.originalUrl || p.images?.[0]?.thumbnailUrl;

  return (
    <>
      <PropertyJsonLd
        title={p.title}
        description={p.shortDescription || p.description || undefined}
        address={p.address}
        city={p.city}
        postalCode={p.postalCode}
        price={p.rentPrice || p.salePrice || undefined}
        priceType={p.priceType}
        surfaceTotal={p.surfaceTotal}
        propertyType={p.propertyType}
        imageUrl={imgUrl || undefined}
        slug={p.slug}
      />
      <PropertyDetail property={p} />
      <div className="mx-auto max-w-6xl px-6 pb-16 lg:px-12">
        <SimilarProperties propertyId={result.data.id} />
      </div>
    </>
  );
}

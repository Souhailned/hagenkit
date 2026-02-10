interface PropertyJsonLdProps {
  title: string;
  description?: string;
  address: string;
  city: string;
  postalCode: string;
  price?: number;
  priceType: string;
  surfaceTotal: number;
  propertyType: string;
  imageUrl?: string;
  slug: string;
}

export function PropertyJsonLd({
  title, description, address, city, postalCode,
  price, priceType, surfaceTotal, propertyType,
  imageUrl, slug,
}: PropertyJsonLdProps) {
  const isRent = priceType === "RENT" || priceType === "RENT_OR_SALE";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description: description || `${propertyType} in ${city}`,
    url: `${baseUrl}/aanbod/${slug}`,
    ...(imageUrl && { image: imageUrl }),
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      postalCode,
      addressCountry: "NL",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: surfaceTotal,
      unitCode: "MTK", // square meters
    },
    ...(price && {
      offers: {
        "@type": "Offer",
        price: price / 100,
        priceCurrency: "EUR",
        ...(isRent && { priceSpecification: { "@type": "UnitPriceSpecification", unitText: "MONTH" } }),
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

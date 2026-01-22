/**
 * Structured data generators for property pages
 * Following Schema.org specifications for RealEstateListing
 */

import React from "react";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";

// Organization name for structured data - can be used for publisher information
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _organizationName = "Horecagrond";

interface PropertyForStructuredData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  address: string;
  city: string;
  postalCode: string;
  province: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  priceType: string;
  rentPrice: number | null;
  salePrice: number | null;
  surfaceTotal: number;
  propertyType: string;
  images: Array<{
    originalUrl: string;
    largeUrl: string | null;
    altText: string | null;
  }>;
  agency: {
    name: string;
    phone: string | null;
    email: string | null;
    logoUrl: string | null;
  };
  publishedAt: Date | null;
  updatedAt: Date;
}

/**
 * Generate RealEstateListing structured data for a property
 */
export function generatePropertyStructuredData(property: PropertyForStructuredData) {
  const priceInEuros = property.priceType === "SALE"
    ? (property.salePrice ? property.salePrice / 100 : null)
    : (property.rentPrice ? property.rentPrice / 100 : null);

  const priceCurrency = "EUR";
  const priceUnitText = property.priceType === "RENT" ? "MONTH" : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || property.shortDescription,
    url: `${baseUrl}/aanbod/${property.slug}`,
    datePosted: property.publishedAt?.toISOString(),
    dateModified: property.updatedAt.toISOString(),
    image: property.images.map((img) => img.largeUrl || img.originalUrl),
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      postalCode: property.postalCode,
      addressRegion: property.province,
      addressCountry: property.country,
    },
    ...(property.latitude && property.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: property.latitude,
        longitude: property.longitude,
      },
    }),
    ...(priceInEuros && {
      offers: {
        "@type": "Offer",
        price: priceInEuros,
        priceCurrency,
        ...(priceUnitText && { priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: priceInEuros,
          priceCurrency,
          unitText: priceUnitText,
        }}),
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "RealEstateAgent",
          name: property.agency.name,
          telephone: property.agency.phone,
          email: property.agency.email,
          ...(property.agency.logoUrl && { logo: property.agency.logoUrl }),
        },
      },
    }),
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.surfaceTotal,
      unitCode: "MTK", // square meters
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "propertyType",
        value: property.propertyType,
      },
      {
        "@type": "PropertyValue",
        name: "listingType",
        value: property.priceType === "SALE" ? "For Sale" : property.priceType === "RENT" ? "For Rent" : "For Sale or Rent",
      },
    ],
  };

  return structuredData;
}

/**
 * Generate breadcrumb structured data for property pages
 */
export function generatePropertyBreadcrumbStructuredData(
  propertyTitle: string,
  propertySlug: string,
  city?: string
) {
  const items = [
    { name: "Home", url: "/" },
    { name: "Aanbod", url: "/aanbod" },
  ];

  if (city) {
    items.push({ name: city, url: `/aanbod?city=${encodeURIComponent(city)}` });
  }

  items.push({ name: propertyTitle, url: `/aanbod/${propertySlug}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate LocalBusiness structured data for the agency
 */
export function generateAgencyStructuredData(agency: {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  city: string | null;
  province: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agency.name,
    description: agency.description,
    telephone: agency.phone,
    email: agency.email,
    url: agency.website,
    ...(agency.logoUrl && { logo: agency.logoUrl }),
    ...(agency.city && {
      address: {
        "@type": "PostalAddress",
        addressLocality: agency.city,
        addressRegion: agency.province,
        addressCountry: "NL",
      },
    }),
  };
}

/**
 * Helper component to inject structured data
 * Note: This is a React component that renders a script tag
 */
export function PropertyStructuredData({ data }: { data: object }): React.JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

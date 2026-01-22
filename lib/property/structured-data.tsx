import type { Property } from "@/lib/types/property";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";

/**
 * Generate Schema.org RealEstateListing structured data for a property
 */
export function generatePropertyStructuredData(property: Property) {
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0];
  const price = property.priceType === "SALE" ? property.salePrice : property.rentPrice;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.shortDescription || property.description?.slice(0, 200),
    url: `${baseUrl}/aanbod/${property.slug}`,
    datePosted: property.publishedAt?.toISOString(),
    image: primaryImage ? primaryImage.largeUrl || primaryImage.originalUrl : undefined,

    // Location
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      postalCode: property.postalCode,
      addressRegion: property.province,
      addressCountry: property.country,
    },

    // Geo coordinates
    ...(property.latitude && property.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: property.latitude,
        longitude: property.longitude,
      },
    }),

    // Price
    ...(price && {
      offers: {
        "@type": "Offer",
        price: price / 100, // Convert from cents
        priceCurrency: "EUR",
        priceValidUntil: property.availableFrom?.toISOString(),
        availability: "https://schema.org/InStock",
        ...(property.priceType === "RENT" && {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: price / 100,
            priceCurrency: "EUR",
            unitText: "MONTH",
          },
        }),
      },
    }),

    // Property details
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.surfaceTotal,
      unitCode: "MTK", // Square meters
    },

    // Additional property info
    numberOfRooms: property.floors,
    ...(property.buildYear && { yearBuilt: property.buildYear }),

    // Agent/Agency
    ...(property.agency && {
      broker: {
        "@type": "RealEstateAgent",
        name: property.agency.name,
        url: property.agency.website || `${baseUrl}/makelaars/${property.agency.slug}`,
        telephone: property.agency.phone,
        email: property.agency.email,
        ...(property.agency.logo && { image: property.agency.logo }),
        address: {
          "@type": "PostalAddress",
          streetAddress: property.agency.address,
          addressLocality: property.agency.city,
          postalCode: property.agency.postalCode,
        },
      },
    }),

    // Aggregate rating (if we have reviews)
    // aggregateRating: {
    //   "@type": "AggregateRating",
    //   ratingValue: property.locationScore ? property.locationScore / 20 : undefined,
    //   reviewCount: property.inquiryCount,
    // },
  };
}

/**
 * Generate breadcrumb structured data for a property page
 */
export function generatePropertyBreadcrumbStructuredData(property: Property) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Aanbod",
        item: `${baseUrl}/aanbod`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.city,
        item: `${baseUrl}/aanbod?city=${encodeURIComponent(property.city)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: property.title,
        item: `${baseUrl}/aanbod/${property.slug}`,
      },
    ],
  };
}

/**
 * Generate LocalBusiness structured data for the property location
 */
export function generateLocalBusinessStructuredData(property: Property) {
  const primaryImage = property.images?.find((img) => img.isPrimary) || property.images?.[0];

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/aanbod/${property.slug}#business`,
    name: property.title,
    description: property.shortDescription,
    image: primaryImage?.largeUrl || primaryImage?.originalUrl,
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
  };
}

/**
 * Helper component to inject structured data into the page
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

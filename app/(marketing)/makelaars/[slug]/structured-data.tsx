import type { AgencyWithDetails, AgentProfile } from "@/types/agency";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";

/**
 * Generate structured data for a RealEstateAgent (Agency)
 * @see https://schema.org/RealEstateAgent
 */
export function generateAgencyStructuredData(agency: AgencyWithDetails) {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${baseUrl}/makelaars/${agency.slug}#organization`,
    name: agency.name,
    description: agency.description,
    url: `${baseUrl}/makelaars/${agency.slug}`,
    logo: agency.logo ? `${baseUrl}${agency.logo}` : undefined,
    image: agency.logo ? `${baseUrl}${agency.logo}` : undefined,
    telephone: agency.phone,
    email: agency.email,
    address: agency.address
      ? {
          "@type": "PostalAddress",
          streetAddress: agency.address,
          addressLocality: agency.city,
          postalCode: agency.postalCode,
          addressRegion: agency.province,
          addressCountry: agency.country || "NL",
        }
      : undefined,
    foundingDate: agency.createdAt
      ? new Date(agency.createdAt).toISOString().split("T")[0]
      : undefined,
    // Legal identifiers
    taxID: agency.vatNumber,
    leiCode: agency.kvkNumber,
    // Aggregate rating placeholder - can be populated from reviews
    // aggregateRating: { ... },
    // Number of employees
    numberOfEmployees: agency.agents.length,
    // Employees listing
    employee: agency.agents.map((agent) => generateAgentStructuredData(agent)),
    // Same as links
    sameAs: agency.website ? [agency.website] : undefined,
    // Area served
    areaServed: agency.city
      ? {
          "@type": "City",
          name: agency.city,
        }
      : undefined,
    // Knowledge graph hints
    knowsAbout: [
      "Real Estate",
      "Horeca Properties",
      "Restaurant Leasing",
      "Commercial Real Estate",
      "Hotel Property Sales",
    ],
    // Service catalog
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Horecapanden",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Horeca Verhuur",
            description: "Verhuur van horecapanden",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Horeca Verkoop",
            description: "Verkoop van horecapanden",
          },
        },
      ],
    },
  };

  // Clean undefined values
  return JSON.parse(JSON.stringify(structuredData));
}

/**
 * Generate structured data for an individual agent
 * @see https://schema.org/Person
 */
export function generateAgentStructuredData(agent: AgentProfile) {
  const structuredData: Record<string, unknown> = {
    "@type": "Person",
    name: agent.user.name ?? "Onbekend",
    email: agent.user.email,
    telephone: agent.phonePublic ? agent.phone : undefined,
    image: agent.avatar ? `${baseUrl}${agent.avatar}` : undefined,
    jobTitle: agent.title ?? "Horeca Makelaar",
    description: agent.bio,
    knowsLanguage: agent.languages,
  };

  // Clean undefined values
  return JSON.parse(JSON.stringify(structuredData));
}

/**
 * Generate breadcrumb structured data
 * @see https://schema.org/BreadcrumbList
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
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
 * Generate LocalBusiness structured data
 * Enhanced version for local SEO
 * @see https://schema.org/LocalBusiness
 */
export function generateLocalBusinessStructuredData(agency: AgencyWithDetails) {
  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    "@id": `${baseUrl}/makelaars/${agency.slug}#localbusiness`,
    name: agency.name,
    description: agency.description,
    url: `${baseUrl}/makelaars/${agency.slug}`,
    logo: agency.logo ? `${baseUrl}${agency.logo}` : undefined,
    telephone: agency.phone,
    email: agency.email,
    address: agency.address
      ? {
          "@type": "PostalAddress",
          streetAddress: agency.address,
          addressLocality: agency.city,
          postalCode: agency.postalCode,
          addressRegion: agency.province,
          addressCountry: agency.country || "NL",
        }
      : undefined,
    geo: {
      "@type": "GeoCoordinates",
      // These would come from geocoding the address
      // latitude: 52.3676,
      // longitude: 4.9041,
    },
    // Opening hours - example
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:30",
      },
    ],
    priceRange: "$$-$$$",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
  };

  return JSON.parse(JSON.stringify(structuredData));
}

/**
 * Helper to inject structured data into page
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

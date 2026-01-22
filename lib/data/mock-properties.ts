import { Property, PropertyType, PropertyFeature } from "@/types/property";

/**
 * Mock property data for development
 * These represent typical horeca establishments in the Netherlands
 */

export const DUTCH_CITIES = [
  "Amsterdam",
  "Rotterdam",
  "Den Haag",
  "Utrecht",
  "Eindhoven",
  "Groningen",
  "Tilburg",
  "Almere",
  "Breda",
  "Nijmegen",
  "Apeldoorn",
  "Haarlem",
  "Arnhem",
  "Enschede",
  "Amersfoort",
  "Maastricht",
  "Leiden",
  "Dordrecht",
  "Zoetermeer",
  "Zwolle",
] as const;

export const PROVINCES: Record<string, string> = {
  Amsterdam: "Noord-Holland",
  Rotterdam: "Zuid-Holland",
  "Den Haag": "Zuid-Holland",
  Utrecht: "Utrecht",
  Eindhoven: "Noord-Brabant",
  Groningen: "Groningen",
  Tilburg: "Noord-Brabant",
  Almere: "Flevoland",
  Breda: "Noord-Brabant",
  Nijmegen: "Gelderland",
  Apeldoorn: "Gelderland",
  Haarlem: "Noord-Holland",
  Arnhem: "Gelderland",
  Enschede: "Overijssel",
  Amersfoort: "Utrecht",
  Maastricht: "Limburg",
  Leiden: "Zuid-Holland",
  Dordrecht: "Zuid-Holland",
  Zoetermeer: "Zuid-Holland",
  Zwolle: "Overijssel",
};

// Sample images (placeholder URLs)
const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate mock properties
export const mockProperties: Property[] = [
  {
    id: "prop-001",
    title: "Restaurant De Gouden Leeuw",
    slug: "restaurant-de-gouden-leeuw-amsterdam",
    description:
      "Prachtig gelegen restaurant in het hart van Amsterdam met een volledig ingerichte keuken en groot terras. Ideaal voor een ambitieuze ondernemer die wil starten in de horeca.",
    type: PropertyType.RESTAURANT,
    city: "Amsterdam",
    province: "Noord-Holland",
    address: "Prinsengracht 123",
    price: 175000,
    priceType: "koop",
    area: 180,
    features: [
      PropertyFeature.TERRACE,
      PropertyFeature.KITCHEN,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.VENTILATION,
    ],
    images: [SAMPLE_IMAGES[0], SAMPLE_IMAGES[1], SAMPLE_IMAGES[2]],
    isFeatured: true,
    isNew: true,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-20"),
  },
  {
    id: "prop-002",
    title: "Grand Café Het Station",
    slug: "grand-cafe-het-station-utrecht",
    description:
      "Sfeervolle grand café met authentieke details, gelegen nabij het centraal station. Groot terras aan de gracht met uitzicht op de Dom.",
    type: PropertyType.GRANDCAFE,
    city: "Utrecht",
    province: "Utrecht",
    address: "Oudegracht 45",
    price: 3500,
    priceType: "huur",
    area: 250,
    features: [
      PropertyFeature.TERRACE,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.LIVING_QUARTERS,
      PropertyFeature.WHEELCHAIR_ACCESSIBLE,
    ],
    images: [SAMPLE_IMAGES[3], SAMPLE_IMAGES[4]],
    isFeatured: true,
    isNew: false,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-18"),
  },
  {
    id: "prop-003",
    title: "Pizzeria Napoli",
    slug: "pizzeria-napoli-rotterdam",
    description:
      "Authentieke Italiaanse pizzeria met echte steenoven. Lopende zaak met vaste klantenkring in populaire wijk.",
    type: PropertyType.PIZZERIA,
    city: "Rotterdam",
    province: "Zuid-Holland",
    address: "Witte de Withstraat 78",
    price: 95000,
    priceType: "koop",
    area: 120,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.DELIVERY_OPTION,
      PropertyFeature.VENTILATION,
    ],
    images: [SAMPLE_IMAGES[5], SAMPLE_IMAGES[6]],
    isFeatured: false,
    isNew: true,
    createdAt: new Date("2025-01-18"),
    updatedAt: new Date("2025-01-19"),
  },
  {
    id: "prop-004",
    title: "Eetcafé De Buren",
    slug: "eetcafe-de-buren-groningen",
    description:
      "Gezellig eetcafé in het bruisende centrum van Groningen. Inclusief bovenwoning voor de exploitant.",
    type: PropertyType.CAFE,
    city: "Groningen",
    province: "Groningen",
    address: "Grote Markt 12",
    price: 2200,
    priceType: "huur",
    area: 140,
    features: [
      PropertyFeature.LIVING_QUARTERS,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.TERRACE,
      PropertyFeature.CELLAR,
    ],
    images: [SAMPLE_IMAGES[7], SAMPLE_IMAGES[0]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-12"),
  },
  {
    id: "prop-005",
    title: "Snackbar De Hoek",
    slug: "snackbar-de-hoek-eindhoven",
    description:
      "Drukbezochte snackbar op toplocatie nabij winkelcentrum. Volledig gerenoveerd in 2024.",
    type: PropertyType.SNACKBAR,
    city: "Eindhoven",
    province: "Noord-Brabant",
    address: "Woenselse Markt 3",
    price: 65000,
    priceType: "koop",
    area: 75,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.DELIVERY_OPTION,
      PropertyFeature.PARKING,
    ],
    images: [SAMPLE_IMAGES[1], SAMPLE_IMAGES[2]],
    isFeatured: false,
    isNew: true,
    createdAt: new Date("2025-01-17"),
    updatedAt: new Date("2025-01-17"),
  },
  {
    id: "prop-006",
    title: "Boutique Hotel De Oranje Nassau",
    slug: "boutique-hotel-de-oranje-nassau-den-haag",
    description:
      "Charmant boutique hotel met 12 kamers in monumentaal pand. Inclusief restaurant en bar.",
    type: PropertyType.HOTEL,
    city: "Den Haag",
    province: "Zuid-Holland",
    address: "Noordeinde 88",
    price: 890000,
    priceType: "koop",
    area: 650,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.WHEELCHAIR_ACCESSIBLE,
      PropertyFeature.PARKING,
    ],
    images: [SAMPLE_IMAGES[3], SAMPLE_IMAGES[4], SAMPLE_IMAGES[5]],
    isFeatured: true,
    isNew: false,
    createdAt: new Date("2024-12-20"),
    updatedAt: new Date("2025-01-08"),
  },
  {
    id: "prop-007",
    title: "Bar & Lounge Velvet",
    slug: "bar-lounge-velvet-amsterdam",
    description:
      "Stijlvolle cocktailbar in De Pijp. Modern interieur, uitstekende geluidsisolatie. Ideaal voor nachthoreca.",
    type: PropertyType.BAR,
    city: "Amsterdam",
    province: "Noord-Holland",
    address: "Albert Cuypstraat 200",
    price: 4200,
    priceType: "huur",
    area: 160,
    features: [
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.VENTILATION,
      PropertyFeature.CELLAR,
    ],
    images: [SAMPLE_IMAGES[6], SAMPLE_IMAGES[7]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "prop-008",
    title: "Lunchroom 't Zonnetje",
    slug: "lunchroom-t-zonnetje-haarlem",
    description:
      "Lichte en vrolijke lunchroom in het centrum van Haarlem. Inclusief achtertuin met terras.",
    type: PropertyType.LUNCHROOM,
    city: "Haarlem",
    province: "Noord-Holland",
    address: "Kruisstraat 15",
    price: 1800,
    priceType: "huur",
    area: 90,
    features: [
      PropertyFeature.TERRACE,
      PropertyFeature.KITCHEN,
      PropertyFeature.OUTDOOR_SEATING,
    ],
    images: [SAMPLE_IMAGES[0], SAMPLE_IMAGES[1]],
    isFeatured: false,
    isNew: true,
    createdAt: new Date("2025-01-16"),
    updatedAt: new Date("2025-01-16"),
  },
  {
    id: "prop-009",
    title: "Partycentrum De Feestzaal",
    slug: "partycentrum-de-feestzaal-tilburg",
    description:
      "Groot partycentrum met meerdere zalen, geschikt voor bruiloften en feesten tot 500 personen.",
    type: PropertyType.PARTYCENTRUM,
    city: "Tilburg",
    province: "Noord-Brabant",
    address: "Spoorlaan 434",
    price: 450000,
    priceType: "koop",
    area: 1200,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.PARKING,
      PropertyFeature.WHEELCHAIR_ACCESSIBLE,
      PropertyFeature.VENTILATION,
    ],
    images: [SAMPLE_IMAGES[2], SAMPLE_IMAGES[3], SAMPLE_IMAGES[4]],
    isFeatured: true,
    isNew: false,
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "prop-010",
    title: "Brasserie Le Coin",
    slug: "brasserie-le-coin-maastricht",
    description:
      "Sfeervolle Franse brasserie in het hart van Maastricht. Compleet ingericht met authentieke details.",
    type: PropertyType.BRASSERIE,
    city: "Maastricht",
    province: "Limburg",
    address: "Vrijthof 22",
    price: 225000,
    priceType: "koop",
    area: 200,
    features: [
      PropertyFeature.TERRACE,
      PropertyFeature.KITCHEN,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.OUTDOOR_SEATING,
    ],
    images: [SAMPLE_IMAGES[5], SAMPLE_IMAGES[6]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: "prop-011",
    title: "Restaurant Asia Garden",
    slug: "restaurant-asia-garden-arnhem",
    description:
      "Aziatisch restaurant met moderne uitstraling. Wok-keuken en sushi-bar aanwezig.",
    type: PropertyType.RESTAURANT,
    city: "Arnhem",
    province: "Gelderland",
    address: "Korenmarkt 8",
    price: 145000,
    priceType: "koop",
    area: 220,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.VENTILATION,
      PropertyFeature.DELIVERY_OPTION,
    ],
    images: [SAMPLE_IMAGES[7], SAMPLE_IMAGES[0]],
    isFeatured: false,
    isNew: true,
    createdAt: new Date("2025-01-19"),
    updatedAt: new Date("2025-01-19"),
  },
  {
    id: "prop-012",
    title: "Café 't Bruin Paard",
    slug: "cafe-t-bruin-paard-leiden",
    description:
      "Traditioneel bruin café met rijke historie. Vaste klantenkring en gezellige sfeer.",
    type: PropertyType.CAFE,
    city: "Leiden",
    province: "Zuid-Holland",
    address: "Breestraat 120",
    price: 85000,
    priceType: "koop",
    area: 100,
    features: [
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.CELLAR,
      PropertyFeature.TERRACE,
    ],
    images: [SAMPLE_IMAGES[1], SAMPLE_IMAGES[2]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2025-01-03"),
  },
  {
    id: "prop-013",
    title: "Hotel Restaurant De Zwaan",
    slug: "hotel-restaurant-de-zwaan-zwolle",
    description:
      "Karakteristiek hotel-restaurant aan de IJssel. 20 hotelkamers en restaurant met 80 zitplaatsen.",
    type: PropertyType.HOTEL,
    city: "Zwolle",
    province: "Overijssel",
    address: "IJsselkade 5",
    price: 12000,
    priceType: "huur",
    area: 800,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.TERRACE,
      PropertyFeature.PARKING,
      PropertyFeature.WHEELCHAIR_ACCESSIBLE,
    ],
    images: [SAMPLE_IMAGES[3], SAMPLE_IMAGES[4], SAMPLE_IMAGES[5]],
    isFeatured: true,
    isNew: false,
    createdAt: new Date("2024-10-20"),
    updatedAt: new Date("2025-01-12"),
  },
  {
    id: "prop-014",
    title: "Snackbar 't Hoekje",
    slug: "snackbar-t-hoekje-nijmegen",
    description:
      "Gevestigde snackbar met sterke naamsbekendheid. Populair bij studenten en bewoners.",
    type: PropertyType.SNACKBAR,
    city: "Nijmegen",
    province: "Gelderland",
    address: "Marikenstraat 50",
    price: 55000,
    priceType: "koop",
    area: 60,
    features: [PropertyFeature.KITCHEN, PropertyFeature.DELIVERY_OPTION],
    images: [SAMPLE_IMAGES[6], SAMPLE_IMAGES[7]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2024-11-25"),
    updatedAt: new Date("2025-01-08"),
  },
  {
    id: "prop-015",
    title: "Grand Café Central",
    slug: "grand-cafe-central-breda",
    description:
      "Monumentaal grand café op de Grote Markt. Hoge plafonds, originele details en groot terras.",
    type: PropertyType.GRANDCAFE,
    city: "Breda",
    province: "Noord-Brabant",
    address: "Grote Markt 31",
    price: 285000,
    priceType: "koop",
    area: 320,
    features: [
      PropertyFeature.TERRACE,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.KITCHEN,
      PropertyFeature.CELLAR,
      PropertyFeature.OUTDOOR_SEATING,
    ],
    images: [SAMPLE_IMAGES[0], SAMPLE_IMAGES[1], SAMPLE_IMAGES[2]],
    isFeatured: false,
    isNew: true,
    createdAt: new Date("2025-01-14"),
    updatedAt: new Date("2025-01-14"),
  },
  {
    id: "prop-016",
    title: "Pizzeria Roma",
    slug: "pizzeria-roma-enschede",
    description:
      "Traditionele pizzeria met afhaal en bezorging. Goed draaiende zaak met loyale klanten.",
    type: PropertyType.PIZZERIA,
    city: "Enschede",
    province: "Overijssel",
    address: "Marktstraat 25",
    price: 1400,
    priceType: "huur",
    area: 85,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.DELIVERY_OPTION,
      PropertyFeature.VENTILATION,
    ],
    images: [SAMPLE_IMAGES[3], SAMPLE_IMAGES[4]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2024-12-05"),
    updatedAt: new Date("2025-01-02"),
  },
  {
    id: "prop-017",
    title: "Lunchroom De Bakkerij",
    slug: "lunchroom-de-bakkerij-amersfoort",
    description:
      "Charmante lunchroom in voormalige bakkerij. Originele oven nog aanwezig als decoratie.",
    type: PropertyType.LUNCHROOM,
    city: "Amersfoort",
    province: "Utrecht",
    address: "Langestraat 88",
    price: 125000,
    priceType: "koop",
    area: 110,
    features: [
      PropertyFeature.KITCHEN,
      PropertyFeature.TERRACE,
      PropertyFeature.WHEELCHAIR_ACCESSIBLE,
    ],
    images: [SAMPLE_IMAGES[5], SAMPLE_IMAGES[6]],
    isFeatured: false,
    isNew: false,
    createdAt: new Date("2024-11-10"),
    updatedAt: new Date("2024-12-20"),
  },
  {
    id: "prop-018",
    title: "Bar & Grill The Ranch",
    slug: "bar-grill-the-ranch-almere",
    description:
      "Amerikaanse bar & grill met live muziek mogelijkheid. Groot terras aan het water.",
    type: PropertyType.BAR,
    city: "Almere",
    province: "Flevoland",
    address: "Strandweg 15",
    price: 165000,
    priceType: "koop",
    area: 280,
    features: [
      PropertyFeature.TERRACE,
      PropertyFeature.KITCHEN,
      PropertyFeature.ALCOHOL_LICENSE,
      PropertyFeature.PARKING,
      PropertyFeature.OUTDOOR_SEATING,
    ],
    images: [SAMPLE_IMAGES[7], SAMPLE_IMAGES[0], SAMPLE_IMAGES[1]],
    isFeatured: false,
    isNew: true,
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
  },
];

// Get unique cities from mock data
export const getAvailableCities = (): string[] => {
  const cities = new Set(mockProperties.map((p) => p.city));
  return Array.from(cities).sort();
};

// Get popular features (ordered by frequency)
export const getPopularFeatures = (): PropertyFeature[] => {
  const featureCount = new Map<PropertyFeature, number>();

  mockProperties.forEach((property) => {
    property.features.forEach((feature) => {
      featureCount.set(feature, (featureCount.get(feature) || 0) + 1);
    });
  });

  return Array.from(featureCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([feature]) => feature)
    .slice(0, 6);
};

/**
 * Property types for the aanbod (listings) page
 */

export const PropertyType = {
  RESTAURANT: "RESTAURANT",
  CAFE: "CAFE",
  HOTEL: "HOTEL",
  BAR: "BAR",
  SNACKBAR: "SNACKBAR",
  PARTYCENTRUM: "PARTYCENTRUM",
  GRANDCAFE: "GRANDCAFE",
  LUNCHROOM: "LUNCHROOM",
  PIZZERIA: "PIZZERIA",
  BRASSERIE: "BRASSERIE",
} as const;

export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const PropertyTypeLabels: Record<PropertyType, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  HOTEL: "Hotel",
  BAR: "Bar",
  SNACKBAR: "Snackbar",
  PARTYCENTRUM: "Partycentrum",
  GRANDCAFE: "Grand Café",
  LUNCHROOM: "Lunchroom",
  PIZZERIA: "Pizzeria",
  BRASSERIE: "Brasserie",
};

export const PropertyFeature = {
  TERRACE: "TERRACE",
  PARKING: "PARKING",
  KITCHEN: "KITCHEN",
  LIVING_QUARTERS: "LIVING_QUARTERS",
  ALCOHOL_LICENSE: "ALCOHOL_LICENSE",
  VENTILATION: "VENTILATION",
  CELLAR: "CELLAR",
  DELIVERY_OPTION: "DELIVERY_OPTION",
  OUTDOOR_SEATING: "OUTDOOR_SEATING",
  WHEELCHAIR_ACCESSIBLE: "WHEELCHAIR_ACCESSIBLE",
} as const;

export type PropertyFeature =
  (typeof PropertyFeature)[keyof typeof PropertyFeature];

export const PropertyFeatureLabels: Record<PropertyFeature, string> = {
  TERRACE: "Terras",
  PARKING: "Parkeren",
  KITCHEN: "Keuken",
  LIVING_QUARTERS: "Woonruimte",
  ALCOHOL_LICENSE: "Drank- & Horecavergunning",
  VENTILATION: "Ventilatie",
  CELLAR: "Kelder",
  DELIVERY_OPTION: "Bezorgmogelijkheid",
  OUTDOOR_SEATING: "Buitenzitplaatsen",
  WHEELCHAIR_ACCESSIBLE: "Rolstoeltoegankelijk",
};

export const SortOption = {
  NEWEST: "newest",
  PRICE_LOW_HIGH: "price_asc",
  PRICE_HIGH_LOW: "price_desc",
  AREA: "area_desc",
} as const;

export type SortOption = (typeof SortOption)[keyof typeof SortOption];

export const SortOptionLabels: Record<SortOption, string> = {
  newest: "Nieuwste",
  price_asc: "Prijs laag-hoog",
  price_desc: "Prijs hoog-laag",
  area_desc: "Oppervlakte",
};

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: PropertyType;
  city: string;
  province: string;
  address: string;
  price: number;
  priceType: "koop" | "huur";
  area: number; // in m²
  features: PropertyFeature[];
  images: string[];
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyFilters {
  cities?: string[];
  types?: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  features?: PropertyFeature[];
}

export interface SearchPropertiesParams extends PropertyFilters {
  page?: number;
  pageSize?: number;
  sortBy?: SortOption;
  search?: string;
}

export interface SearchPropertiesResult {
  properties: Property[];
  total: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

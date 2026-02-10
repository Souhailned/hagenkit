/**
 * Property-related types for the Horecagrond platform
 *
 * Re-exports Prisma-generated enums as single source of truth.
 * Only add UI-specific types/labels here, never duplicate Prisma enums.
 */

// Import Prisma enums for local use
import {
  PropertyType,
  PropertyStatus,
  PriceType,
  FeatureCategory,
  PropertyImageType,
  LocationClassification,
  OvernameType,
  OmzetTrend,
  SalePriceType,
  PropertyStaat,
  StaffTransfer,
  LicenseType,
  LicenseStatus,
  HorecaCategorie,
  InstallationCategory,
  InstallationCondition,
  InstallationOwnership,
  ObligationType,
  AlertFrequency,
} from "@prisma/client";

// Re-export for consumers
export {
  PropertyType,
  PropertyStatus,
  PriceType,
  FeatureCategory,
  PropertyImageType,
  LocationClassification,
  OvernameType,
  OmzetTrend,
  SalePriceType,
  PropertyStaat,
  StaffTransfer,
  LicenseType,
  LicenseStatus,
  HorecaCategorie,
  InstallationCategory,
  InstallationCondition,
  InstallationOwnership,
  ObligationType,
  AlertFrequency,
};

// Property types array for iteration (all Prisma PropertyType enum values)
export const PROPERTY_TYPES: PropertyType[] = [
  "RESTAURANT",
  "CAFE",
  "BAR",
  "HOTEL",
  "DARK_KITCHEN",
  "NIGHTCLUB",
  "FOOD_COURT",
  "FOOD_TRUCK_SPOT",
  "CATERING",
  "BAKERY",
  "EETCAFE",
  "GRAND_CAFE",
  "COCKTAILBAR",
  "HOTEL_RESTAURANT",
  "BED_AND_BREAKFAST",
  "LUNCHROOM",
  "KOFFIEBAR",
  "BRASSERIE",
  "PIZZERIA",
  "SNACKBAR",
  "IJSSALON",
  "WOK_RESTAURANT",
  "SUSHI",
  "BEZORG_AFHAAL",
  "PARTYCENTRUM",
  "STRANDPAVILJOEN",
  "PANNENKOEKHUIS",
  "TEAROOM",
  "WIJNBAR",
  "BROUWERIJ_CAFE",
  "LEISURE",
  "OTHER",
];

// Property type labels for display (Dutch)
export const PropertyTypeLabels: Record<PropertyType, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
  NIGHTCLUB: "Nachtclub",
  FOOD_COURT: "Food Court",
  FOOD_TRUCK_SPOT: "Food Truck Spot",
  CATERING: "Catering",
  BAKERY: "Bakkerij",
  EETCAFE: "Eetcafé",
  GRAND_CAFE: "Grand Café",
  COCKTAILBAR: "Cocktailbar",
  HOTEL_RESTAURANT: "Hotel-Restaurant",
  BED_AND_BREAKFAST: "Bed & Breakfast",
  LUNCHROOM: "Lunchroom",
  KOFFIEBAR: "Koffiebar",
  BRASSERIE: "Brasserie",
  PIZZERIA: "Pizzeria",
  SNACKBAR: "Snackbar",
  IJSSALON: "IJssalon",
  WOK_RESTAURANT: "Wok Restaurant",
  SUSHI: "Sushi",
  BEZORG_AFHAAL: "Bezorg & Afhaal",
  PARTYCENTRUM: "Partycentrum",
  STRANDPAVILJOEN: "Strandpaviljoen",
  PANNENKOEKHUIS: "Pannenkoekhuis",
  TEAROOM: "Tearoom",
  WIJNBAR: "Wijnbar",
  BROUWERIJ_CAFE: "Brouwerij Café",
  LEISURE: "Leisure",
  OTHER: "Overig",
};

// Alias for backward compatibility
export const PROPERTY_TYPE_LABELS = PropertyTypeLabels;

// Dutch regions/provinces for property location filtering
export const REGIONS = [
  "Noord-Holland",
  "Zuid-Holland",
  "Utrecht",
  "Noord-Brabant",
  "Gelderland",
  "Limburg",
  "Overijssel",
  "Flevoland",
  "Groningen",
  "Friesland",
  "Drenthe",
  "Zeeland",
] as const;

export type Region = (typeof REGIONS)[number];

// PropertyStatus already imported above

export const PropertyStatusLabels: Record<PropertyStatus, string> = {
  DRAFT: "Concept",
  PENDING_REVIEW: "In Review",
  ACTIVE: "Actief",
  UNDER_OFFER: "Onder Bod",
  RENTED: "Verhuurd",
  SOLD: "Verkocht",
  ARCHIVED: "Gearchiveerd",
  REJECTED: "Afgewezen",
};

export const PriceTypeLabels: Record<PriceType, string> = {
  RENT: "Te Huur",
  SALE: "Te Koop",
  RENT_OR_SALE: "Te Huur of Koop",
};

// Alert frequency — re-export from Prisma

// Property feature enum for filtering (UI-only, not a Prisma enum)
export type PropertyFeature =
  | "TERRACE"
  | "PARKING"
  | "KITCHEN"
  | "LIVING_QUARTERS"
  | "ALCOHOL_LICENSE"
  | "VENTILATION"
  | "CELLAR"
  | "DELIVERY_OPTION"
  | "OUTDOOR_SEATING"
  | "WHEELCHAIR_ACCESSIBLE";

// Property feature labels for display (Dutch)
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

export const FeatureCategoryLabels: Record<FeatureCategory, string> = {
  LICENSE: "Vergunningen",
  FACILITY: "Faciliteiten",
  UTILITY: "Voorzieningen",
  ACCESSIBILITY: "Bereikbaarheid",
};

// Sort options for property listings
export type SortOption = "newest" | "price_low_high" | "price_high_low" | "area";

// Sort option labels for display (Dutch)
export const SortOptionLabels: Record<SortOption, string> = {
  newest: "Nieuwste",
  price_low_high: "Prijs (laag-hoog)",
  price_high_low: "Prijs (hoog-laag)",
  area: "Oppervlakte",
};

/**
 * Property image for display
 */
export interface PropertyImage {
  id: string;
  propertyId?: string;
  originalUrl: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  largeUrl?: string | null;
  type: PropertyImageType;
  caption?: string | null;
  altText?: string | null;
  order: number;
  isPrimary: boolean;
  width?: number | null;
  height?: number | null;
}

/**
 * Detailed feature record (full DB model)
 */
export interface PropertyFeatureRecord {
  id: string;
  propertyId: string;
  category: FeatureCategory;
  key: string;
  value?: string | null;
  numericValue?: number | null;
  booleanValue?: boolean | null;
  verified: boolean;
  highlighted: boolean;
  displayOrder: number;
}

/**
 * Agency model
 */
export interface Agency {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  verified: boolean;
}

/**
 * Agent profile model
 */
export interface AgentProfile {
  id: string;
  userId: string;
  agencyId: string;
  title?: string | null;
  phone?: string | null;
  phonePublic: boolean;
  bio?: string | null;
  avatar?: string | null;
  specializations: PropertyType[];
  regions: string[];
  languages: string[];
  verified: boolean;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

/**
 * Property listing - main model
 */
export interface Property {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  shortDescription?: string | null;

  // Location
  address: string;
  addressLine2?: string | null;
  city: string;
  postalCode: string;
  province?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  neighborhood?: string | null;

  // Pricing (in cents)
  priceType: PriceType;
  rentPrice?: number | null;
  rentPriceMin?: number | null;
  salePrice?: number | null;
  salePriceMin?: number | null;
  priceNegotiable: boolean;
  servicesCosts?: number | null;
  depositMonths?: number | null;

  // Dimensions (in m²)
  surfaceTotal: number;
  surfaceCommercial?: number | null;
  surfaceKitchen?: number | null;
  surfaceStorage?: number | null;
  surfaceTerrace?: number | null;
  surfaceBasement?: number | null;
  floors: number;
  ceilingHeight?: number | null;

  // Classification
  propertyType: PropertyType;
  status: PropertyStatus;

  // Horeca specifics
  seatingCapacityInside?: number | null;
  seatingCapacityOutside?: number | null;
  standingCapacity?: number | null;
  kitchenType?: string | null;
  hasBasement: boolean;
  hasStorage: boolean;
  hasTerrace: boolean;
  hasParking: boolean;
  parkingSpaces?: number | null;

  // Building info
  buildYear?: number | null;
  lastRenovation?: number | null;
  monumentStatus?: boolean;
  energyLabel?: string | null;

  // Scores
  horecaScore?: string | null;
  horecaScoreDetails?: Record<string, unknown> | null;
  locationScore?: number | null;
  footfallEstimate?: number | null;

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  featured: boolean;

  // Availability
  availableFrom?: Date | null;
  minimumLeaseTerm?: number | null;

  // Images & Features
  images: PropertyImage[];
  features?: PropertyFeature[];
  featureRecords?: PropertyFeatureRecord[];

  // Timestamps
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Counts
  viewCount: number;
  inquiryCount: number;
  savedCount: number;

  // Flags
  isFeatured?: boolean;
  isNew?: boolean;

  // Relations
  agencyId?: string;
  createdById?: string;
  agency?: Agency | { id: string; name: string; slug: string; logo?: string };
  creator?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    agentProfile?: AgentProfile | null;
  };
}

/**
 * Property card - minimal data for list display
 */
export interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  city: string;
  province?: string;
  priceType: PriceType;
  rentPrice?: number;
  salePrice?: number;
  surfaceTotal: number;
  propertyType: PropertyType;
  status: PropertyStatus;
  hasTerrace: boolean;
  hasParking: boolean;
  primaryImage?: PropertyImage;
  horecaScore?: string;
  publishedAt?: Date;
  viewCount: number;
  isSaved?: boolean;
}

/**
 * Property list item for cards and grids (alternative format)
 */
export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  propertyType: PropertyType;
  status: PropertyStatus;
  priceType: PriceType;
  rentPrice: number | null; // in cents
  salePrice: number | null; // in cents
  city: string;
  province: string | null;
  neighborhood: string | null;
  surfaceTotal: number; // in m²
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  hasTerrace: boolean;
  hasKitchen: boolean;
  horecaScore: string | null; // A+ to F
  featured: boolean;
  publishedAt: Date | null;
  viewCount: number;
  savedCount: number;
  primaryImage: {
    thumbnailUrl: string;
    altText: string | null;
  } | null;
  agency: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Seeker profile preferences (simplified)
 */
export interface SeekerPreferences {
  budgetMin: number | null;
  budgetMax: number | null;
  preferredCities: string[];
  preferredProvinces: string[];
  preferredTypes: PropertyType[];
  minSurface: number | null;
  maxSurface: number | null;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
}

/**
 * Full seeker profile with all fields
 */
export interface SeekerProfile {
  id: string;
  userId: string;
  businessType?: string;
  conceptDescription?: string;
  experienceYears?: number;
  hasBusinessPlan: boolean;
  budgetMin?: number;
  budgetMax?: number;
  preferredCities: string[];
  preferredProvinces: string[];
  preferredTypes: PropertyType[];
  minSurface?: number;
  maxSurface?: number;
  mustHaveFeatures: string[];
  niceToHaveFeatures: string[];
  emailAlerts: boolean;
  pushAlerts: boolean;
  alertFrequency: AlertFrequency;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Search alert model
 */
export interface SearchAlert {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  cities: string[];
  provinces: string[];
  propertyTypes: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  priceType?: PriceType;
  mustHaveFeatures: string[];
  frequency: AlertFrequency;
  emailEnabled: boolean;
  pushEnabled: boolean;
  lastSentAt?: Date;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property view for recent history
 */
export interface PropertyView {
  id: string;
  propertyId: string;
  property?: PropertyCard;
  viewedAt: Date;
}

/**
 * Seeker recommendations response
 */
export interface SeekerRecommendations {
  recommended: PropertyListItem[] | PropertyCard[];
  recentlyViewed: PropertyListItem[] | PropertyCard[];
  newMatches: PropertyListItem[] | PropertyCard[];
  hasPreferences: boolean;
}

/**
 * Property filters for search
 */
export interface PropertyFilters {
  cities?: string[];
  types?: PropertyType[];
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  features?: PropertyFeature[];
}

/**
 * Search properties params
 */
export interface SearchPropertiesParams extends PropertyFilters {
  page?: number;
  pageSize?: number;
  sortBy?: SortOption;
  search?: string;
}

/**
 * Search properties result
 */
export interface SearchPropertiesResult {
  properties: Property[];
  total: number;
  pageCount: number;
  page: number;
  pageSize: number;
}

// --- Feature definitions for property detail pages ---

export interface FeatureDefinition {
  key: string;
  label: string;
  category: FeatureCategory;
  valueType: "boolean" | "string" | "number";
  icon?: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Licenses
  { key: "alcohol_license", label: "Alcoholvergunning", category: "LICENSE", valueType: "boolean", icon: "Wine" },
  { key: "terrace_license", label: "Terrasvergunning", category: "LICENSE", valueType: "boolean", icon: "Sun" },
  { key: "night_license", label: "Nachtvergunning", category: "LICENSE", valueType: "boolean", icon: "Moon" },
  { key: "music_license", label: "Muziekvergunning", category: "LICENSE", valueType: "boolean", icon: "Music" },
  { key: "exploitation_license", label: "Exploitatievergunning", category: "LICENSE", valueType: "boolean", icon: "FileCheck" },

  // Facilities
  { key: "professional_kitchen", label: "Professionele Keuken", category: "FACILITY", valueType: "boolean", icon: "ChefHat" },
  { key: "extraction_system", label: "Afzuiginstallatie", category: "FACILITY", valueType: "boolean", icon: "Wind" },
  { key: "cold_storage", label: "Koeling", category: "FACILITY", valueType: "boolean", icon: "Snowflake" },
  { key: "storage_room", label: "Opslagruimte", category: "FACILITY", valueType: "boolean", icon: "Package" },
  { key: "basement", label: "Kelder", category: "FACILITY", valueType: "boolean", icon: "ArrowDown" },
  { key: "terrace", label: "Terras", category: "FACILITY", valueType: "boolean", icon: "Umbrella" },
  { key: "bar", label: "Bar", category: "FACILITY", valueType: "boolean", icon: "Beer" },
  { key: "toilets", label: "Toiletten", category: "FACILITY", valueType: "number", icon: "Bath" },

  // Utilities
  { key: "air_conditioning", label: "Airconditioning", category: "UTILITY", valueType: "boolean", icon: "Thermometer" },
  { key: "heating", label: "Verwarming", category: "UTILITY", valueType: "boolean", icon: "Flame" },
  { key: "wifi", label: "WiFi", category: "UTILITY", valueType: "boolean", icon: "Wifi" },
  { key: "alarm_system", label: "Alarmsysteem", category: "UTILITY", valueType: "boolean", icon: "Bell" },
  { key: "camera_system", label: "Camerasysteem", category: "UTILITY", valueType: "boolean", icon: "Camera" },
  { key: "pos_system", label: "Kassasysteem", category: "UTILITY", valueType: "boolean", icon: "CreditCard" },

  // Accessibility
  { key: "wheelchair_accessible", label: "Rolstoeltoegankelijk", category: "ACCESSIBILITY", valueType: "boolean", icon: "Accessibility" },
  { key: "parking", label: "Parkeerplaatsen", category: "ACCESSIBILITY", valueType: "number", icon: "Car" },
  { key: "public_transport", label: "OV Nabij", category: "ACCESSIBILITY", valueType: "boolean", icon: "Train" },
  { key: "loading_dock", label: "Laaddok", category: "ACCESSIBILITY", valueType: "boolean", icon: "Truck" },
];

// --- Helper functions ---

export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return "Op aanvraag";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatSurface(sqm: number | null | undefined): string {
  if (sqm == null) return "-";
  return `${sqm} m²`;
}

export function getPropertyTypeLabel(type: PropertyType): string {
  return PropertyTypeLabels[type] || type;
}

export function getPriceTypeLabel(type: PriceType): string {
  return PriceTypeLabels[type] || type;
}

export function getFeatureDefinition(key: string): FeatureDefinition | undefined {
  return FEATURE_DEFINITIONS.find((f) => f.key === key);
}

// --- Label maps for new Prisma enums ---

export const LocationClassificationLabels: Record<LocationClassification, string> = {
  A1: "A1 - Toplocatie",
  A2: "A2 - Goede locatie",
  B: "B - Gemiddelde locatie",
  C: "C - Mindere locatie",
};

export const OvernameTypeLabels: Record<OvernameType, string> = {
  ACTIVA_PASSIVA: "Activa / Passiva",
  AANDELEN: "Aandelen",
  BEIDE: "Beide",
};

export const OmzetTrendLabels: Record<OmzetTrend, string> = {
  STIJGEND: "Stijgend",
  STABIEL: "Stabiel",
  DALEND: "Dalend",
};

export const SalePriceTypeLabels: Record<SalePriceType, string> = {
  KOSTEN_KOPER: "Kosten Koper (k.k.)",
  VRIJ_OP_NAAM: "Vrij op Naam (v.o.n.)",
};

export const PropertyStaatLabels: Record<PropertyStaat, string> = {
  UITSTEKEND: "Uitstekend",
  GOED: "Goed",
  REDELIJK: "Redelijk",
  MATIG: "Matig",
  SLECHT: "Slecht",
};

export const StaffTransferLabels: Record<StaffTransfer, string> = {
  VERPLICHT: "Verplicht",
  OPTIONEEL: "Optioneel",
  GEEN: "Geen",
};

export const LicenseTypeLabels: Record<LicenseType, string> = {
  DRANK_HORECA_A: "Drank & Horeca A",
  DRANK_HORECA_B: "Drank & Horeca B",
  DRANK_HORECA_C: "Drank & Horeca C",
  EXPLOITATIE: "Exploitatievergunning",
  TERRAS: "Terrasvergunning",
  NACHT: "Nachtvergunning",
  GEBRUIKSMELDING: "Gebruiksmelding",
  OMGEVINGS: "Omgevingsvergunning",
  MUZIEK: "Muziekvergunning",
  SPEELAUTOMATEN: "Speelautomatenvergunning",
  EVENEMENTEN: "Evenementenvergunning",
};

export const LicenseStatusLabels: Record<LicenseStatus, string> = {
  AANWEZIG: "Aanwezig",
  NIET_AANWEZIG: "Niet aanwezig",
  AANGEVRAAGD: "Aangevraagd",
  VERLOPEN: "Verlopen",
};

export const HorecaCategorieLabels: Record<HorecaCategorie, string> = {
  HORECA_1: "Horeca 1 (licht)",
  HORECA_2: "Horeca 2 (middelzwaar)",
  HORECA_3: "Horeca 3 (zwaar)",
  HORECA_4: "Horeca 4 (nacht)",
};

export const InstallationCategoryLabels: Record<InstallationCategory, string> = {
  KEUKEN: "Keuken",
  DRANK: "Drank",
  KLIMAAT: "Klimaat",
  SANITAIR: "Sanitair",
  VEILIGHEID: "Veiligheid",
  OVERIG: "Overig",
};

export const InstallationConditionLabels: Record<InstallationCondition, string> = {
  NIEUW: "Nieuw",
  GOED: "Goed",
  REDELIJK: "Redelijk",
  VERVANGEN: "Moet vervangen worden",
};

export const InstallationOwnershipLabels: Record<InstallationOwnership, string> = {
  EIGENDOM: "Eigendom",
  HUUR: "Huur",
  LEASE: "Lease",
  BRUIKLEEN: "Bruikleen",
};

export const ObligationTypeLabels: Record<ObligationType, string> = {
  BROUWERIJ: "Brouwerijcontract",
  LEVERANCIER: "Leverancierscontract",
  LEASE: "Leasecontract",
  MUZIEK: "Muziekcontract",
  AFVAL: "Afvalcontract",
  ENERGIE: "Energiecontract",
  OVERIG: "Overig",
};

// --- Types for new Prisma detail models (UI views) ---

export interface PropertyFinancialsView {
  id: string;
  propertyId: string;
  goodwill: number | null;
  inventarisWaarde: number | null;
  overnameSom: number | null;
  overnameType: OvernameType | null;
  huurcontractType: string | null;
  huurcontractIngangsdatum: Date | null;
  huurcontractEinddatum: Date | null;
  huurprijsIndexatie: string | null;
  opzegtermijnMaanden: number | null;
  borgMaanden: number | null;
  jaaromzet: number | null;
  omzetJaar: number | null;
  omzetTrend: OmzetTrend | null;
  winst: number | null;
  discreteVerkoop: boolean;
  priceOnRequest: boolean;
  rentPriceExBtw: boolean;
  btwBelast: boolean;
  salePriceType: SalePriceType | null;
}

export interface PropertyBuildingView {
  id: string;
  propertyId: string;
  buildYear: number | null;
  lastRenovation: number | null;
  renovationDetails: string | null;
  monumentStatus: boolean;
  monumentType: string | null;
  energyLabel: string | null;
  energyLabelExpiry: Date | null;
  staat: PropertyStaat | null;
  bedrijfswoning: boolean;
  bedrijfswoningDetails: string | null;
  bedrijfswoningKamers: number | null;
}

export interface PropertyStaffingView {
  id: string;
  propertyId: string;
  hasStaff: boolean;
  staffCount: number | null;
  staffFulltime: number | null;
  staffParttime: number | null;
  staffFlex: number | null;
  staffTransfer: StaffTransfer | null;
  staffDetails: string | null;
  caoApplicable: boolean;
  personnelCostsMonthly: number | null;
}

export interface PropertyLicenseView {
  id: string;
  propertyId: string;
  type: LicenseType;
  status: LicenseStatus;
  issuedDate: Date | null;
  expiryDate: Date | null;
  issuedBy: string | null;
  licenseNumber: string | null;
  documentUrl: string | null;
  details: string | null;
  bestemmingsplan: string | null;
  horecaCategorie: HorecaCategorie | null;
  precario: boolean;
  precarioBedrag: number | null;
  openingstijden: string | null;
  maxOpeningstijd: string | null;
  geluidsnormenDb: number | null;
}

export interface PropertyInstallationView {
  id: string;
  propertyId: string;
  category: InstallationCategory;
  name: string;
  description: string | null;
  brand: string | null;
  condition: InstallationCondition | null;
  yearInstalled: number | null;
  ownership: InstallationOwnership;
  leaseCompany: string | null;
  included: boolean;
}

export interface PropertyObligationView {
  id: string;
  propertyId: string;
  type: ObligationType;
  name: string;
  company: string | null;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  monthlyCost: number | null;
  transferable: boolean;
  mandatory: boolean;
}

export interface PropertyHistoryView {
  id: string;
  propertyId: string;
  previousType: PropertyType | null;
  previousName: string | null;
  yearsActive: number | null;
  reasonClosed: string | null;
  wasSuccessful: boolean | null;
}

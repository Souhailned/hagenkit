/**
 * Property Wizard Types
 * Based on the PRD database design for the Horecagrond platform
 */

// Property Types as defined in PRD FASE 1.1
export const PROPERTY_TYPES = [
  "RESTAURANT",
  "CAFE",
  "BAR",
  "HOTEL",
  "DARK_KITCHEN",
  "NIGHTCLUB",
  "FOOD_COURT",
  "CATERING",
  "BAKERY",
  "OTHER",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

// Price Types
export const PRICE_TYPES = ["RENT", "SALE", "RENT_OR_SALE"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

// Feature Categories
export const FEATURE_CATEGORIES = [
  "LICENSE",
  "FACILITY",
  "UTILITY",
] as const;
export type FeatureCategory = (typeof FEATURE_CATEGORIES)[number];

// Property Image Types
export const PROPERTY_IMAGE_TYPES = [
  "EXTERIOR",
  "INTERIOR",
  "KITCHEN",
  "TERRACE",
  "BATHROOM",
  "STORAGE",
  "FLOORPLAN",
  "LOCATION",
  "RENDER",
  "OTHER",
] as const;
export type PropertyImageType = (typeof PROPERTY_IMAGE_TYPES)[number];

// Labels for UI
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
  NIGHTCLUB: "Nachtclub",
  FOOD_COURT: "Food Court",
  CATERING: "Catering",
  BAKERY: "Bakkerij",
  OTHER: "Anders",
};

export const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  RENT: "Te huur",
  SALE: "Te koop",
  RENT_OR_SALE: "Te huur of te koop",
};

// Feature definitions grouped by category
export interface FeatureDefinition {
  key: string;
  label: string;
  category: FeatureCategory;
  type: "boolean" | "string" | "number";
  description?: string;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Vergunningen (Licenses)
  { key: "alcohol_license", label: "Alcoholvergunning", category: "LICENSE", type: "boolean", description: "Vergunning voor verkoop alcohol" },
  { key: "terrace_permit", label: "Terrasvergunning", category: "LICENSE", type: "boolean", description: "Vergunning voor buitenterras" },
  { key: "night_permit", label: "Nachtvergunning", category: "LICENSE", type: "boolean", description: "Vergunning voor nachtelijke opening" },
  { key: "music_permit", label: "Muziekvergunning", category: "LICENSE", type: "boolean", description: "Vergunning voor live muziek" },
  { key: "cooking_permit", label: "Kookvergunning", category: "LICENSE", type: "boolean", description: "Vergunning voor professionele keuken" },
  { key: "food_permit", label: "Exploitatievergunning", category: "LICENSE", type: "boolean", description: "Basis horecavergunning" },

  // Faciliteiten (Facilities)
  { key: "professional_kitchen", label: "Professionele keuken", category: "FACILITY", type: "boolean" },
  { key: "extraction_system", label: "Afzuiginstallatie", category: "FACILITY", type: "boolean" },
  { key: "walk_in_cooler", label: "Koelcel", category: "FACILITY", type: "boolean" },
  { key: "storage_room", label: "Opslagruimte", category: "FACILITY", type: "boolean" },
  { key: "basement", label: "Kelder", category: "FACILITY", type: "boolean" },
  { key: "terrace", label: "Terras", category: "FACILITY", type: "boolean" },
  { key: "parking", label: "Parkeerplaatsen", category: "FACILITY", type: "boolean" },
  { key: "loading_dock", label: "Laadplatform", category: "FACILITY", type: "boolean" },

  // Voorzieningen (Utilities)
  { key: "gas_connection", label: "Gasaansluiting", category: "UTILITY", type: "boolean" },
  { key: "three_phase_power", label: "3-fase stroom", category: "UTILITY", type: "boolean" },
  { key: "water_connection", label: "Wateraansluiting", category: "UTILITY", type: "boolean" },
  { key: "grease_trap", label: "Vetafscheider", category: "UTILITY", type: "boolean" },
  { key: "air_conditioning", label: "Airconditioning", category: "UTILITY", type: "boolean" },
  { key: "heating", label: "Verwarming", category: "UTILITY", type: "boolean" },
  { key: "alarm_system", label: "Alarmsysteem", category: "UTILITY", type: "boolean" },
  { key: "wheelchair_accessible", label: "Rolstoeltoegankelijk", category: "UTILITY", type: "boolean" },
];

// Grouped features for UI
export const FEATURES_BY_CATEGORY = {
  LICENSE: FEATURE_DEFINITIONS.filter((f) => f.category === "LICENSE"),
  FACILITY: FEATURE_DEFINITIONS.filter((f) => f.category === "FACILITY"),
  UTILITY: FEATURE_DEFINITIONS.filter((f) => f.category === "UTILITY"),
};

export const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  LICENSE: "Vergunningen",
  FACILITY: "Faciliteiten",
  UTILITY: "Voorzieningen",
};

// Photo type for wizard
export interface WizardPhoto {
  id: string;
  file?: File;
  previewUrl: string;
  type: PropertyImageType;
  isPrimary: boolean;
  aiEnhance: boolean;
  caption?: string;
}

// Main wizard data structure
export interface PropertyWizardData {
  // Step 1: Basic Info
  title: string;
  propertyType: PropertyType | null;
  description: string;

  // Step 2: Location
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;

  // Step 3: Pricing
  priceType: PriceType | null;
  rentPrice?: number;
  salePrice?: number;
  servicesCosts?: number;
  depositMonths?: number;

  // Step 4: Dimensions
  surfaceTotal: number | null;
  surfaceCommercial?: number;
  surfaceKitchen?: number;
  surfaceStorage?: number;
  surfaceTerrace?: number;
  floors: number;
  ceilingHeight?: number;

  // Step 5: Features
  features: Record<string, boolean>;

  // Step 6: Photos
  photos: WizardPhoto[];

  // Meta
  isDraft: boolean;
}

// Initial empty state
export const INITIAL_WIZARD_DATA: PropertyWizardData = {
  title: "",
  propertyType: null,
  description: "",
  address: "",
  city: "",
  postalCode: "",
  priceType: null,
  surfaceTotal: null,
  floors: 1,
  features: {},
  photos: [],
  isDraft: true,
};

// Step definitions
export const WIZARD_STEPS = [
  { id: 1, key: "basic", title: "Basis", description: "Naam, type & beschrijving", icon: "FileText" },
  { id: 2, key: "location", title: "Locatie", description: "Adres & coördinaten", icon: "MapPin" },
  { id: 3, key: "pricing", title: "Prijs", description: "Huur- of koopprijs", icon: "DollarSign" },
  { id: 4, key: "dimensions", title: "Afmetingen", description: "Oppervlakte & indeling", icon: "Ruler" },
  { id: 5, key: "features", title: "Kenmerken", description: "Vergunningen & faciliteiten", icon: "Settings" },
  { id: 6, key: "photos", title: "Foto's", description: "Afbeeldingen uploaden", icon: "Camera" },
  { id: 7, key: "review", title: "Overzicht", description: "Controleer & publiceer", icon: "CheckCircle" },
] as const;

export type WizardStepKey = (typeof WIZARD_STEPS)[number]["key"];
export type WizardStep = (typeof WIZARD_STEPS)[number];

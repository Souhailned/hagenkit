// Property Wizard Types
// Based on PRD.md specifications for horecavastgoed platform

export const PropertyTypes = [
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "CAFE", label: "Cafe" },
  { value: "BAR", label: "Bar" },
  { value: "HOTEL", label: "Hotel" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen" },
  { value: "NIGHTCLUB", label: "Nachtclub" },
  { value: "FOOD_COURT", label: "Food Court" },
  { value: "CATERING", label: "Catering" },
  { value: "BAKERY", label: "Bakkerij" },
  { value: "OTHER", label: "Anders" },
] as const;

export type PropertyType = (typeof PropertyTypes)[number]["value"];

export const PriceTypes = [
  { value: "RENT", label: "Te Huur" },
  { value: "SALE", label: "Te Koop" },
  { value: "RENT_OR_SALE", label: "Te Huur of Te Koop" },
] as const;

export type PriceType = (typeof PriceTypes)[number]["value"];

export const FeatureCategories = {
  LICENSE: {
    label: "Vergunningen",
    icon: "FileCheck",
    features: [
      { key: "alcohol_license", label: "Alcoholvergunning", type: "boolean" },
      { key: "terrace_license", label: "Terrasvergunning", type: "boolean" },
      { key: "music_license", label: "Muziekvergunning", type: "boolean" },
      { key: "night_license", label: "Nachtvergunning", type: "boolean" },
      { key: "hotel_license", label: "Hotelvergunning", type: "boolean" },
      { key: "catering_license", label: "Cateringvergunning", type: "boolean" },
    ],
  },
  FACILITY: {
    label: "Faciliteiten",
    icon: "Building",
    features: [
      { key: "professional_kitchen", label: "Professionele Keuken", type: "boolean" },
      { key: "extraction_system", label: "Afzuigsysteem", type: "boolean" },
      { key: "cold_storage", label: "Koelcel", type: "boolean" },
      { key: "storage_room", label: "Opslagruimte", type: "boolean" },
      { key: "basement", label: "Kelder", type: "boolean" },
      { key: "office_space", label: "Kantoorruimte", type: "boolean" },
    ],
  },
  UTILITY: {
    label: "Voorzieningen",
    icon: "Plug",
    features: [
      { key: "terrace", label: "Terras", type: "boolean" },
      { key: "parking", label: "Parkeerplaatsen", type: "boolean" },
      { key: "disabled_access", label: "Rolstoeltoegankelijk", type: "boolean" },
      { key: "air_conditioning", label: "Airconditioning", type: "boolean" },
      { key: "heating", label: "Verwarming", type: "boolean" },
      { key: "wifi", label: "WiFi Aanwezig", type: "boolean" },
    ],
  },
} as const;

export type FeatureCategory = keyof typeof FeatureCategories;

export interface PropertyPhoto {
  id: string;
  file?: File;
  previewUrl: string;
  isPrimary: boolean;
  aiEnhance: boolean;
  caption?: string;
}

export interface PropertyWizardData {
  // Step 1: Basic Info
  title: string;
  propertyType: PropertyType | "";
  description: string;
  shortDescription: string;

  // Step 2: Location
  address: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  province: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3: Pricing
  priceType: PriceType | "";
  rentPrice: number | null;
  rentPriceMin: number | null;
  salePrice: number | null;
  salePriceMin: number | null;
  priceNegotiable: boolean;
  servicesCosts: number | null;
  depositMonths: number | null;

  // Step 4: Dimensions
  surfaceTotal: number | null;
  surfaceCommercial: number | null;
  surfaceKitchen: number | null;
  surfaceStorage: number | null;
  surfaceTerrace: number | null;
  surfaceBasement: number | null;
  floors: number;
  ceilingHeight: number | null;

  // Step 5: Features
  features: Record<string, boolean>;

  // Step 6: Photos
  photos: PropertyPhoto[];
}

export interface PropertyWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: PropertyWizardData, isDraft: boolean) => Promise<void>;
  initialData?: Partial<PropertyWizardData>;
}

export const WizardSteps = [
  { id: 1, title: "Basis Info", shortTitle: "Basis", icon: "FileText" },
  { id: 2, title: "Locatie", shortTitle: "Locatie", icon: "MapPin" },
  { id: 3, title: "Prijzen", shortTitle: "Prijzen", icon: "Euro" },
  { id: 4, title: "Afmetingen", shortTitle: "Afmetingen", icon: "Ruler" },
  { id: 5, title: "Kenmerken", shortTitle: "Kenmerken", icon: "ListCheck" },
  { id: 6, title: "Foto's", shortTitle: "Foto's", icon: "Image" },
  { id: 7, title: "Overzicht", shortTitle: "Overzicht", icon: "Check" },
] as const;

export type WizardStep = (typeof WizardSteps)[number]["id"];

export const getDefaultWizardData = (): PropertyWizardData => ({
  // Basic Info
  title: "",
  propertyType: "",
  description: "",
  shortDescription: "",

  // Location
  address: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  province: "",
  latitude: null,
  longitude: null,

  // Pricing
  priceType: "",
  rentPrice: null,
  rentPriceMin: null,
  salePrice: null,
  salePriceMin: null,
  priceNegotiable: true,
  servicesCosts: null,
  depositMonths: null,

  // Dimensions
  surfaceTotal: null,
  surfaceCommercial: null,
  surfaceKitchen: null,
  surfaceStorage: null,
  surfaceTerrace: null,
  surfaceBasement: null,
  floors: 1,
  ceilingHeight: null,

  // Features
  features: {},

  // Photos
  photos: [],
});

/**
 * Property utility functions for formatting and display
 */

/**
 * Format price from cents to euros with Dutch locale
 */
export function formatPrice(priceInCents: number | null | undefined): string {
  if (!priceInCents) return "Op aanvraag";
  const euros = priceInCents / 100;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(euros);
}

/**
 * Format surface area
 */
export function formatSurface(squareMeters: number | null | undefined): string {
  if (!squareMeters) return "-";
  return `${squareMeters} m²`;
}

/**
 * Property type labels in Dutch
 */
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
  NIGHTCLUB: "Nachtclub",
  CATERING: "Catering",
  FOOD_RETAIL: "Food Retail",
  MIXED_USE: "Gemengd",
  OTHER: "Overig",
};

/**
 * Property status labels in Dutch
 */
export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Concept",
  PENDING_REVIEW: "In behandeling",
  ACTIVE: "Beschikbaar",
  UNDER_OFFER: "Onder optie",
  RENTED: "Verhuurd",
  SOLD: "Verkocht",
  ARCHIVED: "Gearchiveerd",
  REJECTED: "Afgekeurd",
};

/**
 * Property status colors for badges
 */
export const PROPERTY_STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "secondary",
  ACTIVE: "default",
  UNDER_OFFER: "outline",
  RENTED: "secondary",
  SOLD: "secondary",
  ARCHIVED: "secondary",
  REJECTED: "destructive",
};

/**
 * Price type labels in Dutch
 */
export const PRICE_TYPE_LABELS: Record<string, string> = {
  RENT: "Te huur",
  SALE: "Te koop",
  RENT_OR_SALE: "Te huur / Te koop",
};

/**
 * Feature category labels in Dutch
 */
export const FEATURE_CATEGORY_LABELS: Record<string, string> = {
  LICENSE: "Vergunningen",
  FACILITY: "Faciliteiten",
  UTILITY: "Voorzieningen",
  ACCESSIBILITY: "Toegankelijkheid",
};

/**
 * Feature key labels in Dutch
 */
export const FEATURE_KEY_LABELS: Record<string, string> = {
  // Licenses
  alcohol_license: "Alcoholvergunning",
  terrace_permit: "Terrasvergunning",
  extraction_permit: "Afzuigvergunning",
  music_permit: "Muziekvergunning",
  late_night_permit: "Nachtontheffing",

  // Facilities
  professional_kitchen: "Professionele keuken",
  cold_storage: "Koelruimte",
  freezer_storage: "Vriesruimte",
  storage_space: "Opslagruimte",
  terrace: "Terras",
  parking: "Parkeerplaats",
  delivery_access: "Leverancierentoegang",
  loading_dock: "Laadperron",

  // Utilities
  three_phase_power: "3-fase stroom",
  gas_connection: "Gasaansluiting",
  water_connection: "Wateraansluiting",
  grease_trap: "Vetafscheider",
  air_conditioning: "Airconditioning",
  ventilation: "Ventilatie",
  heating: "Verwarming",

  // Accessibility
  wheelchair_accessible: "Rolstoeltoegankelijk",
  disabled_toilet: "Invalidentoilet",
  elevator: "Lift",
  ground_floor: "Begane grond",
};

/**
 * Kitchen type labels in Dutch
 */
export const KITCHEN_TYPE_LABELS: Record<string, string> = {
  none: "Geen keuken",
  basic: "Basis keuken",
  professional: "Professionele keuken",
  industrial: "Industriële keuken",
};

/**
 * Energy label colors
 */
export const ENERGY_LABEL_COLORS: Record<string, string> = {
  "A+++": "bg-green-600",
  "A++": "bg-green-500",
  "A+": "bg-green-400",
  "A": "bg-lime-500",
  "B": "bg-lime-400",
  "C": "bg-yellow-400",
  "D": "bg-amber-400",
  "E": "bg-orange-400",
  "F": "bg-orange-500",
  "G": "bg-red-500",
};

/**
 * Get Horeca Score color
 */
export function getHorecaScoreColor(score: string | null | undefined): string {
  if (!score) return "bg-muted";

  const scoreMap: Record<string, string> = {
    "A+": "bg-green-600",
    "A": "bg-green-500",
    "B": "bg-lime-500",
    "C": "bg-yellow-500",
    "D": "bg-orange-500",
    "E": "bg-red-400",
    "F": "bg-red-600",
  };

  return scoreMap[score] || "bg-muted";
}

/**
 * Format availability date
 */
export function formatAvailability(date: Date | null | undefined): string {
  if (!date) return "Direct beschikbaar";

  const now = new Date();
  if (date <= now) return "Direct beschikbaar";

  return `Beschikbaar per ${new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)}`;
}

/**
 * Format lease term
 */
export function formatLeaseTerm(months: number | null | undefined): string {
  if (!months) return "-";
  if (months === 1) return "1 maand";
  if (months < 12) return `${months} maanden`;
  const years = months / 12;
  if (years === 1) return "1 jaar";
  if (Number.isInteger(years)) return `${years} jaar`;
  return `${months} maanden`;
}

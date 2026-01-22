/**
 * Seeker Onboarding Step Types
 *
 * Shared types for the horeca business seeker onboarding flow.
 * Each step component receives data and onUpdate props for controlled state.
 */

export const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "cafe", label: "Café", icon: "☕" },
  { value: "bar", label: "Bar", icon: "🍺" },
  { value: "hotel", label: "Hotel", icon: "🏨" },
  { value: "dark-kitchen", label: "Dark Kitchen", icon: "🍳" },
  { value: "other", label: "Anders", icon: "✨" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export const DUTCH_CITIES = [
  { value: "amsterdam", label: "Amsterdam", popular: true },
  { value: "rotterdam", label: "Rotterdam", popular: true },
  { value: "den-haag", label: "Den Haag", popular: true },
  { value: "utrecht", label: "Utrecht", popular: true },
  { value: "eindhoven", label: "Eindhoven", popular: true },
  { value: "groningen", label: "Groningen", popular: false },
  { value: "tilburg", label: "Tilburg", popular: false },
  { value: "almere", label: "Almere", popular: false },
  { value: "breda", label: "Breda", popular: false },
  { value: "nijmegen", label: "Nijmegen", popular: false },
  { value: "arnhem", label: "Arnhem", popular: false },
  { value: "haarlem", label: "Haarlem", popular: false },
  { value: "maastricht", label: "Maastricht", popular: false },
  { value: "leiden", label: "Leiden", popular: false },
  { value: "dordrecht", label: "Dordrecht", popular: false },
] as const;

export type City = (typeof DUTCH_CITIES)[number]["value"];

export const MUST_HAVE_FEATURES = [
  {
    value: "terras",
    label: "Terras",
    description: "Buitenruimte voor gasten",
    icon: "☀️",
  },
  {
    value: "keuken",
    label: "Professionele keuken",
    description: "Volledig uitgeruste keuken",
    icon: "👨‍🍳",
  },
  {
    value: "alcohol",
    label: "Alcoholvergunning",
    description: "Vergunning voor alcoholverkoop",
    icon: "🍷",
  },
  {
    value: "parking",
    label: "Parkeerplaatsen",
    description: "Eigen parkeergelegenheid",
    icon: "🅿️",
  },
  {
    value: "accessible",
    label: "Rolstoeltoegankelijk",
    description: "Toegankelijk voor mindervaliden",
    icon: "♿",
  },
  {
    value: "storage",
    label: "Opslagruimte",
    description: "Extra opslagmogelijkheden",
    icon: "📦",
  },
] as const;

export type Feature = (typeof MUST_HAVE_FEATURES)[number]["value"];

/**
 * Data structure for the business type step
 */
export interface BusinessTypeData {
  businessType: BusinessType | null;
  conceptDescription: string;
}

/**
 * Data structure for the budget step
 */
export interface BudgetData {
  minBudget: number | null;
  maxBudget: number | null;
}

/**
 * Data structure for the preferences step
 */
export interface PreferencesData {
  cities: City[];
  features: Feature[];
}

/**
 * Complete seeker onboarding data
 */
export interface SeekerOnboardingData {
  businessType: BusinessTypeData;
  budget: BudgetData;
  preferences: PreferencesData;
}

/**
 * Props interface for step components with data and update callback
 */
export interface StepProps<T> {
  data: T;
  onUpdate: (data: T) => void;
}

/**
 * Budget range constants (in euros)
 */
export const BUDGET_CONFIG = {
  MIN: 0,
  MAX: 500000,
  STEP: 5000,
  DEFAULT_MIN: 50000,
  DEFAULT_MAX: 150000,
} as const;

/**
 * Format euro amount with Dutch locale
 */
export function formatEuro(amount: number | null): string {
  if (amount === null) return "";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse euro string back to number
 */
export function parseEuro(value: string): number | null {
  const cleaned = value.replace(/[^\d]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

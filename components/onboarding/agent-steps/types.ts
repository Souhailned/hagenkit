/**
 * Types for agent onboarding steps
 * Defines data structures for agency info and agent profile forms
 */

// PropertyType enum - horeca property categories
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

// Human-readable labels for PropertyType
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
  OTHER: "Overig",
};

// Dutch regions/provinces
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

// Agency information for step 1
export interface AgencyInfoData {
  name: string;
  kvkNumber: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
}

// Agent profile information for step 2
export interface AgentProfileData {
  fullName: string;
  title: string;
  phone: string;
  bio: string;
  specializations: PropertyType[];
  regions: Region[];
}

// Combined agent onboarding data
export interface AgentOnboardingData {
  agency: AgencyInfoData;
  profile: AgentProfileData;
  skipFirstProperty: boolean;
}

// Props interface for step components
export interface StepProps<T> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
}

// Validation helpers
export function isValidKvkNumber(kvk: string): boolean {
  // KvK number is 8 digits
  return /^\d{8}$/.test(kvk.replace(/\s/g, ""));
}

export function isValidPostalCode(postalCode: string): boolean {
  // Dutch postal code: 4 digits + 2 letters
  return /^\d{4}\s?[A-Za-z]{2}$/.test(postalCode);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Dutch phone: starts with 0 or +31, followed by 9 digits
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^(\+31|0)[1-9]\d{8}$/.test(cleaned);
}

export function isValidUrl(url: string): boolean {
  if (!url) return true; // Optional field
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

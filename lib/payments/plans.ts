/**
 * Subscription plans configuration
 * Ready for Mollie integration
 */

export interface Plan {
  id: string;
  name: string;
  price: number; // cents per month
  interval: "monthly" | "yearly";
  features: string[];
  limits: {
    maxListings: number;
    maxPromotedPerMonth: number;
    videoToursPerMonth: number;
    aiPhotoEnhancement: boolean;
    marketAnalysis: boolean;
    prioritySupport: boolean;
  };
}

export const PLANS: Record<string, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 0,
    interval: "monthly",
    features: [
      "1 actieve listing",
      "Basis pandpagina",
      "Contact formulier",
      "Basis statistieken",
      "Automatische beschrijving",
    ],
    limits: {
      maxListings: 1,
      maxPromotedPerMonth: 0,
      videoToursPerMonth: 0,
      aiPhotoEnhancement: false,
      marketAnalysis: false,
      prioritySupport: false,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: 7900, // €79
    interval: "monthly",
    features: [
      "10 actieve listings",
      "Professionele pandpagina",
      "Contact + telefoon",
      "Uitgebreide statistieken",
      "Automatische beschrijving",
      "3x uitgelicht/maand",
      "AI Foto verbetering",
      "Listing optimizer",
    ],
    limits: {
      maxListings: 10,
      maxPromotedPerMonth: 3,
      videoToursPerMonth: 0,
      aiPhotoEnhancement: true,
      marketAnalysis: false,
      prioritySupport: false,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 19900, // €199
    interval: "monthly",
    features: [
      "Onbeperkte listings",
      "Premium pandpagina",
      "Contact + telefoon + chat",
      "Volledige analytics",
      "Automatische beschrijving",
      "Onbeperkt uitgelicht",
      "AI Foto verbetering",
      "Listing optimizer + suggesties",
      "AI Video tour (3/maand)",
      "Volledige marktanalyse",
      "Prioriteit support",
    ],
    limits: {
      maxListings: Infinity,
      maxPromotedPerMonth: Infinity,
      videoToursPerMonth: 3,
      aiPhotoEnhancement: true,
      marketAnalysis: true,
      prioritySupport: true,
    },
  },
};

export function getPlan(planId: string): Plan | undefined {
  return PLANS[planId];
}

export function canCreateListing(planId: string, currentCount: number): boolean {
  const plan = getPlan(planId);
  if (!plan) return false;
  return currentCount < plan.limits.maxListings;
}

export function canPromote(planId: string, currentMonthPromotions: number): boolean {
  const plan = getPlan(planId);
  if (!plan) return false;
  return currentMonthPromotions < plan.limits.maxPromotedPerMonth;
}

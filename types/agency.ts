/**
 * Types for real estate agencies and agents
 * These types will be used by actions and components
 */

import type { PropertyType, PropertyStatus, PriceType } from "@/generated/prisma/browser";

export type AgencyPlan = "FREE" | "PRO" | "ENTERPRISE";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  country: string;
  kvkNumber: string | null;
  vatNumber: string | null;
  verified: boolean;
  verifiedAt: Date | null;
  plan: AgencyPlan;
  activeListings: number;
  totalDeals: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * AgentProfile aligned with Prisma AgentProfile model.
 * Name/email come from the nested `user` relation.
 */
export interface AgentProfile {
  id: string;
  userId: string;
  agencyId: string;
  title: string | null;
  phone: string | null;
  phonePublic: boolean;
  bio: string | null;
  avatar: string | null;
  specializations: PropertyType[];
  regions: string[];
  languages: string[];
  verified: boolean;
  dealsClosedCount: number;
  activeListings: number;
  rating: number | null;
  createdAt: Date;
  // Nested user data for display
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

// Re-export from central source (Prisma-derived)
export type { PropertyType, PropertyStatus, PriceType } from "@/types/property";

export interface PropertyImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  propertyType: PropertyType;
  status: PropertyStatus;
  priceType: PriceType;
  rentPrice: number | null;
  salePrice: number | null;
  servicesCosts: number | null;
  address: string;
  city: string;
  postalCode: string;
  province: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  surfaceTotal: number | null;
  surfaceCommercial: number | null;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  hasKitchen: boolean;
  hasTerrace: boolean;
  hasParking: boolean;
  hasBasement: boolean;
  images: PropertyImage[];
  agencyId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface AgencyWithDetails extends Agency {
  agents: AgentProfile[];
}

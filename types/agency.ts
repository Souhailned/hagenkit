/**
 * Types for real estate agencies and agents
 * These types will be used by actions and components
 */

import type { PropertyType, PropertyStatus, PriceType } from "@/generated/prisma";

export type AgencyPlan = "FREE" | "PRO" | "ENTERPRISE";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  email: string;
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

export interface AgentProfile {
  id: string;
  userId: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  specializations: string[];
  languages: string[];
  yearsExperience: number | null;
  linkedIn: string | null;
  twitter: string | null;
  verified: boolean;
  isActive: boolean;
  dealsCompleted: number;
  rating: number | null;
  reviewCount: number;
  createdAt: Date;
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
  seatingCapacity: number | null;
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

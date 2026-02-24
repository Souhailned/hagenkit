/**
 * Buurtanalyse 2.0 — Multi-Source Location Intelligence Types
 */

import type {
  BuurtAnalysis,
  BuurtStats,
  NearbyPlace,
  PlaceCategory,
} from "@/lib/buurt-intelligence";

// Re-export legacy types for backward compatibility
export type { BuurtAnalysis, BuurtStats, NearbyPlace, PlaceCategory };

// ---------------------------------------------------------------------------
// CBS Demographics
// ---------------------------------------------------------------------------
export interface CBSDemographics {
  buurtCode: string;
  buurtNaam: string;
  gemeenteNaam: string;
  inwoners: number;
  gemiddeldInkomen: number | null; // x1000 EUR
  leeftijdsverdeling: {
    jong: number; // 0-24 %
    werkleeftijd: number; // 25-64 %
    ouder: number; // 65+ %
  };
  dichtheid: number | null; // inwoners per km²
  huishoudens: number | null;
  percentageEenpersoonshuishoudens: number | null;
}

// ---------------------------------------------------------------------------
// BAG Building Info
// ---------------------------------------------------------------------------
export interface BAGBuildingInfo {
  bouwjaar: number | null;
  gebruiksdoel: string[];
  oppervlakte: number | null;
  status: string;
  isHorecaGeschikt: boolean;
}

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------
export interface TransportStop {
  naam: string;
  type: "trein" | "bus" | "tram" | "metro";
  afstand: number; // meters
  lijnen?: string[];
}

export interface TransportAnalysis {
  stops: TransportStop[];
  score: number; // 0-10
  bereikbaarheidOV:
    | "uitstekend"
    | "goed"
    | "redelijk"
    | "matig"
    | "slecht";
}

// ---------------------------------------------------------------------------
// Passanten
// ---------------------------------------------------------------------------
export interface PassantenEstimate {
  dagschatting: number;
  confidence: "hoog" | "gemiddeld" | "laag";
  bronnen: string[];
}

// ---------------------------------------------------------------------------
// Competitors
// ---------------------------------------------------------------------------
export interface CompetitorInfo {
  naam: string;
  type: string;
  afstand: number;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number; // 0=free, 1=€, 2=€€, 3=€€€, 4=€€€€
  businessStatus?: "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";
  openingHours?: { weekdayDescriptions: string[] };
  bron: "osm" | "google";
  placeId?: string; // Google Places resource name (e.g. "places/ChIJxyz") for fetchPlaceDetails()
}

// ---------------------------------------------------------------------------
// Enhanced Buurt Analysis (superset of BuurtAnalysis)
// ---------------------------------------------------------------------------
export interface EnhancedBuurtAnalysis extends BuurtAnalysis {
  // CBS data
  demographics: CBSDemographics | null;

  // BAG data
  building: BAGBuildingInfo | null;

  // Transport
  transportAnalysis: TransportAnalysis | null;

  // Passanten
  passanten: PassantenEstimate | null;

  // Competitors with richer data
  competitors: CompetitorInfo[];

  // Meta
  dataSources: string[];
  dataQuality: "volledig" | "gedeeltelijk" | "basis";
  fetchedAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// Concept Checker
// ---------------------------------------------------------------------------
export interface ConceptCheckInput {
  concept: string;
  lat: number;
  lng: number;
  radius?: number;
}

export interface ConceptCheckResult {
  concept: string;
  viabilityScore: number; // 0-100
  competitionScan: {
    directeCount: number;
    indirecteCount: number;
    dichtstbij: CompetitorInfo | null;
    aiClassified?: boolean;
    irrelevantFiltered?: number;
    /** Names of competitors investigated via Google Reviews by the AI agent */
    investigatedCompetitors?: string[];
  };
  gapAnalyse: string;
  doelgroepMatch: {
    score: number; // 0-100
    uitleg: string;
  };
  pricePositioning: {
    gemiddeld: number | null; // avg price level 0-4
    label: string; // e.g. "€€"
    match: boolean; // concept fits market
    conceptLevel: number; // expected price level 1-4
  };
  topConcurrenten: Array<{
    naam: string;
    rating?: number;
    reviewCount?: number;
    priceLevel?: number;
    afstand: number;
  }>;
  kansen: string[];
  risicos: string[];
  aiInsight: string | null;
  qualityScore?: number;
  qualityNotes?: string[];
}

// ---------------------------------------------------------------------------
// Cache source keys
// ---------------------------------------------------------------------------
export type CacheSource =
  | "cbs"
  | "bag"
  | "transport"
  | "osm"
  | "google"
  | "ai"
  | "ai-classify"
  | "full-analysis";

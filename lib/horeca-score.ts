/**
 * Horeca Score Calculator
 *
 * Calculates a comprehensive score for horeca (hotel/restaurant/café) properties
 * based on location, licenses, facilities, condition, and price/quality ratio.
 */

// ============================================================================
// Types
// ============================================================================

export type ScoreGrade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export type ScoreFactorKey =
  | "location"
  | "licenses"
  | "facilities"
  | "condition"
  | "priceQuality";

export interface LocationData {
  /** Estimated daily foot traffic (people per day) */
  footfallEstimate?: number;
  /** Neighborhood rating 1-10 */
  neighborhoodRating?: number;
  /** Distance to public transport in meters */
  publicTransportDistance?: number;
  /** Distance to parking in meters */
  parkingDistance?: number;
  /** Is it in a tourist area */
  touristArea?: boolean;
  /** Is it on a main street / high visibility */
  highVisibility?: boolean;
}

export interface LicenseData {
  /** Has alcohol license (drank vergunning) */
  alcoholLicense?: boolean;
  /** Has terrace permit (terras vergunning) */
  terraceLicense?: boolean;
  /** Has late night permit (nachtvergunning) */
  lateNightLicense?: boolean;
  /** Has food service permit (exploitatievergunning) */
  foodServiceLicense?: boolean;
  /** Has gaming permit (speelautomaten vergunning) */
  gamingLicense?: boolean;
  /** Has catering permit (cateringvergunning) */
  cateringLicense?: boolean;
  /** Has music/event permit */
  eventLicense?: boolean;
}

export type KitchenType =
  | "none"
  | "basic"
  | "standard"
  | "professional"
  | "industrial";

export type ExtractionType = "none" | "basic" | "standard" | "professional";

export interface FacilitiesData {
  /** Kitchen type */
  kitchenType?: KitchenType;
  /** Extraction/ventilation system type */
  extractionType?: ExtractionType;
  /** Has cold storage (koeling) */
  coldStorage?: boolean;
  /** Has cellar/basement */
  cellar?: boolean;
  /** Total seating capacity inside */
  seatingCapacityInside?: number;
  /** Terrace seating capacity */
  seatingCapacityTerrace?: number;
  /** Has accessible toilets */
  accessibleToilets?: boolean;
  /** Has staff area/changing room */
  staffArea?: boolean;
  /** Has storage space */
  storageSpace?: boolean;
  /** Square meters of the property */
  squareMeters?: number;
}

export interface ConditionData {
  /** Year the building was built */
  buildYear?: number;
  /** Year of last renovation */
  lastRenovationYear?: number;
  /** Overall condition rating 1-10 */
  overallConditionRating?: number;
  /** Electrical system rating 1-10 */
  electricalRating?: number;
  /** Plumbing rating 1-10 */
  plumbingRating?: number;
  /** HVAC rating 1-10 */
  hvacRating?: number;
  /** Recently renovated (within 5 years) */
  recentlyRenovated?: boolean;
  /** Has energy label (A-G) */
  energyLabel?: "A" | "B" | "C" | "D" | "E" | "F" | "G";
}

export interface PriceQualityData {
  /** Monthly rent in euros */
  monthlyRent?: number;
  /** Key money / goodwill (overname) in euros */
  keyMoney?: number;
  /** Expected monthly revenue potential */
  revenuePotential?: number;
  /** Price per square meter */
  pricePerSqm?: number;
  /** Market average price per sqm for the area */
  marketAveragePricePerSqm?: number;
  /** Lease duration in years */
  leaseDurationYears?: number;
  /** Is the rent below market average */
  belowMarketRent?: boolean;
}

export interface HorecaProperty {
  id?: string;
  name?: string;
  address?: string;
}

export interface HorecaFeatures {
  location?: LocationData;
  licenses?: LicenseData;
  facilities?: FacilitiesData;
  condition?: ConditionData;
  priceQuality?: PriceQualityData;
}

export interface ScoreFactorResult {
  /** Score from 0-100 */
  score: number;
  /** Weight of this factor (0-1, all weights sum to 1) */
  weight: number;
  /** Weighted contribution to overall score */
  weightedScore: number;
  /** Grade for this factor */
  grade: ScoreGrade;
  /** Details about what contributed to this score */
  details: string[];
}

export interface ScoreSuggestion {
  factor: ScoreFactorKey;
  priority: "high" | "medium" | "low";
  suggestion: string;
  potentialImpact: number;
}

export interface HorecaScoreResult {
  /** Overall grade from A+ to F */
  overallScore: ScoreGrade;
  /** Numeric score 0-100 */
  numericScore: number;
  /** Breakdown per factor */
  breakdown: Record<ScoreFactorKey, ScoreFactorResult>;
  /** Suggestions for improvement */
  suggestions: ScoreSuggestion[];
  /** Timestamp of calculation */
  calculatedAt: Date;
}

// ============================================================================
// Constants
// ============================================================================

const FACTOR_WEIGHTS: Record<ScoreFactorKey, number> = {
  location: 0.3,
  licenses: 0.2,
  facilities: 0.2,
  condition: 0.15,
  priceQuality: 0.15,
};

const GRADE_THRESHOLDS: { min: number; grade: ScoreGrade }[] = [
  { min: 95, grade: "A+" },
  { min: 85, grade: "A" },
  { min: 75, grade: "B+" },
  { min: 65, grade: "B" },
  { min: 55, grade: "C+" },
  { min: 45, grade: "C" },
  { min: 30, grade: "D" },
  { min: 0, grade: "F" },
];

// ============================================================================
// Helper Functions
// ============================================================================

function scoreToGrade(score: number): ScoreGrade {
  const threshold = GRADE_THRESHOLDS.find((t) => score >= t.min);
  return threshold?.grade ?? "F";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeRating(rating: number | undefined, max: number = 10): number {
  if (rating === undefined) return 50;
  return clamp((rating / max) * 100, 0, 100);
}

// ============================================================================
// Factor Scoring Functions
// ============================================================================

function calculateLocationScore(data?: LocationData): ScoreFactorResult {
  const details: string[] = [];
  let totalScore = 0;
  let factorCount = 0;

  if (data?.footfallEstimate !== undefined) {
    // Score based on foot traffic (0-5000+ people/day)
    const footfallScore = clamp((data.footfallEstimate / 5000) * 100, 0, 100);
    totalScore += footfallScore;
    factorCount++;
    if (footfallScore >= 80) {
      details.push(`Excellent foot traffic: ${data.footfallEstimate}/day`);
    } else if (footfallScore >= 50) {
      details.push(`Moderate foot traffic: ${data.footfallEstimate}/day`);
    } else {
      details.push(`Low foot traffic: ${data.footfallEstimate}/day`);
    }
  }

  if (data?.neighborhoodRating !== undefined) {
    const neighborhoodScore = normalizeRating(data.neighborhoodRating);
    totalScore += neighborhoodScore;
    factorCount++;
    details.push(`Neighborhood rating: ${data.neighborhoodRating}/10`);
  }

  if (data?.publicTransportDistance !== undefined) {
    // Score: closer is better (0-1000m range, <200m is excellent)
    const transportScore = clamp(
      100 - (data.publicTransportDistance / 1000) * 100,
      0,
      100
    );
    totalScore += transportScore;
    factorCount++;
    if (transportScore >= 80) {
      details.push(
        `Excellent public transport access: ${data.publicTransportDistance}m`
      );
    }
  }

  if (data?.parkingDistance !== undefined) {
    // Score: closer is better (0-500m range)
    const parkingScore = clamp(
      100 - (data.parkingDistance / 500) * 100,
      0,
      100
    );
    totalScore += parkingScore;
    factorCount++;
    if (parkingScore >= 80) {
      details.push(`Good parking nearby: ${data.parkingDistance}m`);
    }
  }

  if (data?.touristArea) {
    totalScore += 90;
    factorCount++;
    details.push("Located in tourist area");
  } else if (data?.touristArea === false) {
    totalScore += 40;
    factorCount++;
  }

  if (data?.highVisibility) {
    totalScore += 85;
    factorCount++;
    details.push("High visibility location");
  } else if (data?.highVisibility === false) {
    totalScore += 35;
    factorCount++;
  }

  const score = factorCount > 0 ? totalScore / factorCount : 50;
  const weight = FACTOR_WEIGHTS.location;

  return {
    score: Math.round(score),
    weight,
    weightedScore: Math.round(score * weight),
    grade: scoreToGrade(score),
    details: details.length > 0 ? details : ["No location data provided"],
  };
}

function calculateLicenseScore(data?: LicenseData): ScoreFactorResult {
  const details: string[] = [];
  const licenses: { name: string; weight: number; present: boolean }[] = [
    { name: "Alcohol license", weight: 25, present: !!data?.alcoholLicense },
    { name: "Food service license", weight: 25, present: !!data?.foodServiceLicense },
    { name: "Terrace permit", weight: 15, present: !!data?.terraceLicense },
    { name: "Late night permit", weight: 15, present: !!data?.lateNightLicense },
    { name: "Event/music permit", weight: 10, present: !!data?.eventLicense },
    { name: "Gaming permit", weight: 5, present: !!data?.gamingLicense },
    { name: "Catering permit", weight: 5, present: !!data?.cateringLicense },
  ];

  let score = 0;
  const presentLicenses: string[] = [];
  const missingLicenses: string[] = [];

  for (const license of licenses) {
    if (license.present) {
      score += license.weight;
      presentLicenses.push(license.name);
    } else {
      missingLicenses.push(license.name);
    }
  }

  if (presentLicenses.length > 0) {
    details.push(`Present: ${presentLicenses.join(", ")}`);
  }
  if (missingLicenses.length > 0 && missingLicenses.length <= 3) {
    details.push(`Missing: ${missingLicenses.join(", ")}`);
  }

  const weight = FACTOR_WEIGHTS.licenses;

  return {
    score: Math.round(score),
    weight,
    weightedScore: Math.round(score * weight),
    grade: scoreToGrade(score),
    details: details.length > 0 ? details : ["No license data provided"],
  };
}

function calculateFacilitiesScore(data?: FacilitiesData): ScoreFactorResult {
  const details: string[] = [];
  let totalScore = 0;
  let factorCount = 0;

  // Kitchen type scoring
  if (data?.kitchenType !== undefined) {
    const kitchenScores: Record<KitchenType, number> = {
      none: 0,
      basic: 40,
      standard: 65,
      professional: 85,
      industrial: 100,
    };
    const kitchenScore = kitchenScores[data.kitchenType];
    totalScore += kitchenScore;
    factorCount++;
    if (kitchenScore >= 65) {
      details.push(`${data.kitchenType} kitchen`);
    }
  }

  // Extraction type scoring
  if (data?.extractionType !== undefined) {
    const extractionScores: Record<ExtractionType, number> = {
      none: 0,
      basic: 40,
      standard: 70,
      professional: 100,
    };
    const extractionScore = extractionScores[data.extractionType];
    totalScore += extractionScore;
    factorCount++;
    if (extractionScore >= 70) {
      details.push(`${data.extractionType} extraction system`);
    }
  }

  // Boolean facilities
  const booleanFacilities = [
    { name: "Cold storage", value: data?.coldStorage, score: 80 },
    { name: "Cellar", value: data?.cellar, score: 75 },
    { name: "Accessible toilets", value: data?.accessibleToilets, score: 85 },
    { name: "Staff area", value: data?.staffArea, score: 70 },
    { name: "Storage space", value: data?.storageSpace, score: 75 },
  ];

  for (const facility of booleanFacilities) {
    if (facility.value === true) {
      totalScore += facility.score;
      factorCount++;
      details.push(facility.name);
    } else if (facility.value === false) {
      totalScore += 20;
      factorCount++;
    }
  }

  // Seating capacity scoring
  const totalSeating =
    (data?.seatingCapacityInside ?? 0) + (data?.seatingCapacityTerrace ?? 0);
  if (totalSeating > 0) {
    // Score based on seating (0-200+ seats)
    const seatingScore = clamp((totalSeating / 200) * 100, 0, 100);
    totalScore += seatingScore;
    factorCount++;
    details.push(
      `Total seating: ${totalSeating} (inside: ${data?.seatingCapacityInside ?? 0}, terrace: ${data?.seatingCapacityTerrace ?? 0})`
    );
  }

  // Square meters scoring
  if (data?.squareMeters !== undefined && data.squareMeters > 0) {
    // Score based on size (0-500+ sqm for excellent)
    const sizeScore = clamp((data.squareMeters / 500) * 100, 0, 100);
    totalScore += sizeScore;
    factorCount++;
    if (sizeScore >= 50) {
      details.push(`Floor space: ${data.squareMeters} m²`);
    }
  }

  const score = factorCount > 0 ? totalScore / factorCount : 50;
  const weight = FACTOR_WEIGHTS.facilities;

  return {
    score: Math.round(score),
    weight,
    weightedScore: Math.round(score * weight),
    grade: scoreToGrade(score),
    details: details.length > 0 ? details : ["No facilities data provided"],
  };
}

function calculateConditionScore(data?: ConditionData): ScoreFactorResult {
  const details: string[] = [];
  let totalScore = 0;
  let factorCount = 0;

  const currentYear = new Date().getFullYear();

  // Building age scoring
  if (data?.buildYear !== undefined) {
    const age = currentYear - data.buildYear;
    // Newer buildings score higher, but very old renovated buildings can still be good
    let ageScore = 100;
    if (age > 100) ageScore = 30;
    else if (age > 50) ageScore = 50;
    else if (age > 25) ageScore = 70;
    else if (age > 10) ageScore = 85;

    totalScore += ageScore;
    factorCount++;
    details.push(`Built in ${data.buildYear} (${age} years old)`);
  }

  // Renovation scoring
  if (data?.lastRenovationYear !== undefined) {
    const yearsSinceRenovation = currentYear - data.lastRenovationYear;
    let renovationScore = 100;
    if (yearsSinceRenovation > 20) renovationScore = 30;
    else if (yearsSinceRenovation > 10) renovationScore = 55;
    else if (yearsSinceRenovation > 5) renovationScore = 75;
    else if (yearsSinceRenovation > 2) renovationScore = 90;

    totalScore += renovationScore;
    factorCount++;
    details.push(
      `Last renovated: ${data.lastRenovationYear} (${yearsSinceRenovation} years ago)`
    );
  } else if (data?.recentlyRenovated === true) {
    totalScore += 90;
    factorCount++;
    details.push("Recently renovated");
  }

  // Rating scores
  const ratings = [
    { name: "Overall condition", value: data?.overallConditionRating },
    { name: "Electrical", value: data?.electricalRating },
    { name: "Plumbing", value: data?.plumbingRating },
    { name: "HVAC", value: data?.hvacRating },
  ];

  for (const rating of ratings) {
    if (rating.value !== undefined) {
      const ratingScore = normalizeRating(rating.value);
      totalScore += ratingScore;
      factorCount++;
      if (ratingScore >= 70) {
        details.push(`${rating.name}: ${rating.value}/10`);
      }
    }
  }

  // Energy label scoring
  if (data?.energyLabel !== undefined) {
    const energyScores: Record<string, number> = {
      A: 100,
      B: 85,
      C: 70,
      D: 55,
      E: 40,
      F: 25,
      G: 10,
    };
    const energyScore = energyScores[data.energyLabel] ?? 50;
    totalScore += energyScore;
    factorCount++;
    details.push(`Energy label: ${data.energyLabel}`);
  }

  const score = factorCount > 0 ? totalScore / factorCount : 50;
  const weight = FACTOR_WEIGHTS.condition;

  return {
    score: Math.round(score),
    weight,
    weightedScore: Math.round(score * weight),
    grade: scoreToGrade(score),
    details: details.length > 0 ? details : ["No condition data provided"],
  };
}

function calculatePriceQualityScore(data?: PriceQualityData): ScoreFactorResult {
  const details: string[] = [];
  let totalScore = 0;
  let factorCount = 0;

  // Price per sqm comparison to market
  if (
    data?.pricePerSqm !== undefined &&
    data?.marketAveragePricePerSqm !== undefined
  ) {
    const priceRatio = data.pricePerSqm / data.marketAveragePricePerSqm;
    // Lower than market = better score
    let priceScore = 50;
    if (priceRatio <= 0.7) priceScore = 100;
    else if (priceRatio <= 0.85) priceScore = 85;
    else if (priceRatio <= 1.0) priceScore = 70;
    else if (priceRatio <= 1.15) priceScore = 55;
    else if (priceRatio <= 1.3) priceScore = 40;
    else priceScore = 25;

    totalScore += priceScore;
    factorCount++;
    if (priceRatio < 1.0) {
      details.push(
        `${Math.round((1 - priceRatio) * 100)}% below market rate (€${data.pricePerSqm}/m²)`
      );
    } else if (priceRatio > 1.0) {
      details.push(
        `${Math.round((priceRatio - 1) * 100)}% above market rate (€${data.pricePerSqm}/m²)`
      );
    } else {
      details.push(`At market rate (€${data.pricePerSqm}/m²)`);
    }
  }

  // Revenue potential vs rent ratio
  if (
    data?.monthlyRent !== undefined &&
    data?.revenuePotential !== undefined &&
    data.monthlyRent > 0
  ) {
    const revenueRentRatio = data.revenuePotential / data.monthlyRent;
    // Higher ratio = better (revenue potential should be ~10x rent for excellent)
    let ratioScore = 50;
    if (revenueRentRatio >= 15) ratioScore = 100;
    else if (revenueRentRatio >= 10) ratioScore = 85;
    else if (revenueRentRatio >= 7) ratioScore = 70;
    else if (revenueRentRatio >= 5) ratioScore = 55;
    else if (revenueRentRatio >= 3) ratioScore = 40;
    else ratioScore = 25;

    totalScore += ratioScore;
    factorCount++;
    details.push(
      `Revenue/rent ratio: ${revenueRentRatio.toFixed(1)}x (€${data.revenuePotential} potential vs €${data.monthlyRent} rent)`
    );
  }

  // Key money assessment
  if (data?.keyMoney !== undefined && data?.monthlyRent !== undefined) {
    const keyMoneyMonths = data.keyMoney / data.monthlyRent;
    // Lower key money = better (ideally < 12 months rent)
    let keyMoneyScore = 50;
    if (keyMoneyMonths <= 6) keyMoneyScore = 100;
    else if (keyMoneyMonths <= 12) keyMoneyScore = 80;
    else if (keyMoneyMonths <= 24) keyMoneyScore = 60;
    else if (keyMoneyMonths <= 36) keyMoneyScore = 40;
    else keyMoneyScore = 20;

    totalScore += keyMoneyScore;
    factorCount++;
    details.push(
      `Key money: €${data.keyMoney} (${keyMoneyMonths.toFixed(1)} months rent)`
    );
  }

  // Lease duration scoring
  if (data?.leaseDurationYears !== undefined) {
    // Longer lease = better (5+ years is good)
    let leaseScore = 50;
    if (data.leaseDurationYears >= 10) leaseScore = 100;
    else if (data.leaseDurationYears >= 7) leaseScore = 85;
    else if (data.leaseDurationYears >= 5) leaseScore = 70;
    else if (data.leaseDurationYears >= 3) leaseScore = 55;
    else leaseScore = 35;

    totalScore += leaseScore;
    factorCount++;
    details.push(`Lease duration: ${data.leaseDurationYears} years`);
  }

  // Below market rent flag
  if (data?.belowMarketRent === true) {
    totalScore += 90;
    factorCount++;
    details.push("Below market rent");
  } else if (data?.belowMarketRent === false) {
    totalScore += 40;
    factorCount++;
  }

  const score = factorCount > 0 ? totalScore / factorCount : 50;
  const weight = FACTOR_WEIGHTS.priceQuality;

  return {
    score: Math.round(score),
    weight,
    weightedScore: Math.round(score * weight),
    grade: scoreToGrade(score),
    details:
      details.length > 0 ? details : ["No price/quality data provided"],
  };
}

// ============================================================================
// Suggestion Generation
// ============================================================================

function generateSuggestions(
  breakdown: Record<ScoreFactorKey, ScoreFactorResult>,
  features: HorecaFeatures
): ScoreSuggestion[] {
  const suggestions: ScoreSuggestion[] = [];

  // Location suggestions
  if (breakdown.location.score < 60) {
    if (!features.location?.highVisibility) {
      suggestions.push({
        factor: "location",
        priority: "medium",
        suggestion:
          "Consider properties with higher street visibility to increase foot traffic",
        potentialImpact: 10,
      });
    }
  }

  // License suggestions
  if (breakdown.licenses.score < 70) {
    if (!features.licenses?.alcoholLicense) {
      suggestions.push({
        factor: "licenses",
        priority: "high",
        suggestion:
          "Obtain alcohol license (drank vergunning) - essential for most horeca businesses",
        potentialImpact: 25,
      });
    }
    if (!features.licenses?.terraceLicense) {
      suggestions.push({
        factor: "licenses",
        priority: "medium",
        suggestion:
          "Apply for terrace permit to increase seating capacity and revenue",
        potentialImpact: 15,
      });
    }
    if (!features.licenses?.lateNightLicense) {
      suggestions.push({
        factor: "licenses",
        priority: "low",
        suggestion:
          "Consider late night permit for extended operating hours",
        potentialImpact: 10,
      });
    }
  }

  // Facilities suggestions
  if (breakdown.facilities.score < 70) {
    if (
      features.facilities?.kitchenType === "none" ||
      features.facilities?.kitchenType === "basic"
    ) {
      suggestions.push({
        factor: "facilities",
        priority: "high",
        suggestion:
          "Upgrade kitchen to professional standard for expanded menu options",
        potentialImpact: 20,
      });
    }
    if (
      features.facilities?.extractionType === "none" ||
      features.facilities?.extractionType === "basic"
    ) {
      suggestions.push({
        factor: "facilities",
        priority: "high",
        suggestion:
          "Install professional extraction system - required for most cooking operations",
        potentialImpact: 15,
      });
    }
    if (!features.facilities?.coldStorage) {
      suggestions.push({
        factor: "facilities",
        priority: "medium",
        suggestion: "Add cold storage facilities for food safety compliance",
        potentialImpact: 10,
      });
    }
  }

  // Condition suggestions
  if (breakdown.condition.score < 60) {
    const currentYear = new Date().getFullYear();
    const yearsSinceRenovation = features.condition?.lastRenovationYear
      ? currentYear - features.condition.lastRenovationYear
      : undefined;

    if (yearsSinceRenovation === undefined || yearsSinceRenovation > 10) {
      suggestions.push({
        factor: "condition",
        priority: "medium",
        suggestion:
          "Consider renovation to improve property condition and energy efficiency",
        potentialImpact: 15,
      });
    }
    if (
      features.condition?.energyLabel &&
      ["E", "F", "G"].includes(features.condition.energyLabel)
    ) {
      suggestions.push({
        factor: "condition",
        priority: "medium",
        suggestion:
          "Improve energy efficiency to reduce operating costs and improve energy label",
        potentialImpact: 10,
      });
    }
  }

  // Price/quality suggestions
  if (breakdown.priceQuality.score < 60) {
    if (
      features.priceQuality?.pricePerSqm &&
      features.priceQuality?.marketAveragePricePerSqm &&
      features.priceQuality.pricePerSqm >
        features.priceQuality.marketAveragePricePerSqm
    ) {
      suggestions.push({
        factor: "priceQuality",
        priority: "high",
        suggestion: "Negotiate rent - current price is above market average",
        potentialImpact: 15,
      });
    }
    if (
      features.priceQuality?.leaseDurationYears &&
      features.priceQuality.leaseDurationYears < 5
    ) {
      suggestions.push({
        factor: "priceQuality",
        priority: "medium",
        suggestion:
          "Negotiate longer lease term for business stability (minimum 5 years recommended)",
        potentialImpact: 10,
      });
    }
  }

  // Sort by priority and impact
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.potentialImpact - a.potentialImpact;
  });

  return suggestions;
}

// ============================================================================
// Main Calculator Function
// ============================================================================

/**
 * Calculate a comprehensive horeca score for a property based on its features.
 *
 * @param property - Basic property information (optional metadata)
 * @param features - Detailed features to score (location, licenses, facilities, condition, price/quality)
 * @returns Complete score result with overall grade, breakdown per factor, and improvement suggestions
 *
 * @example
 * ```ts
 * const result = calculateHorecaScore(
 *   { name: "Café Central" },
 *   {
 *     location: { neighborhoodRating: 8, highVisibility: true },
 *     licenses: { alcoholLicense: true, foodServiceLicense: true },
 *     facilities: { kitchenType: "professional", extractionType: "professional" },
 *     condition: { overallConditionRating: 7, energyLabel: "B" },
 *     priceQuality: { monthlyRent: 3000, revenuePotential: 30000 },
 *   }
 * );
 * console.log(result.overallScore); // "B+"
 * ```
 */
export function calculateHorecaScore(
  property: HorecaProperty,
  features: HorecaFeatures
): HorecaScoreResult {
  // Calculate individual factor scores
  const breakdown: Record<ScoreFactorKey, ScoreFactorResult> = {
    location: calculateLocationScore(features.location),
    licenses: calculateLicenseScore(features.licenses),
    facilities: calculateFacilitiesScore(features.facilities),
    condition: calculateConditionScore(features.condition),
    priceQuality: calculatePriceQualityScore(features.priceQuality),
  };

  // Calculate overall numeric score (weighted average)
  const numericScore = Math.round(
    Object.values(breakdown).reduce((sum, factor) => sum + factor.weightedScore, 0)
  );

  // Generate suggestions for improvement
  const suggestions = generateSuggestions(breakdown, features);

  return {
    overallScore: scoreToGrade(numericScore),
    numericScore,
    breakdown,
    suggestions,
    calculatedAt: new Date(),
  };
}

// ============================================================================
// UI Helper Functions
// ============================================================================

export type ScoreColorScheme = {
  bg: string;
  text: string;
  border: string;
};

/**
 * Get color scheme for a score grade (for UI display).
 * Uses CSS variable tokens for theme compatibility.
 *
 * @param grade - The score grade (A+ to F)
 * @returns Color scheme object with bg, text, and border classes
 *
 * @example
 * ```tsx
 * const colors = getScoreColor("A+");
 * <Badge className={cn(colors.bg, colors.text, colors.border)}>
 *   {grade}
 * </Badge>
 * ```
 */
export function getScoreColor(grade: ScoreGrade): ScoreColorScheme {
  switch (grade) {
    case "A+":
      return {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
      };
    case "A":
      return {
        bg: "bg-green-500/10",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-500/20",
      };
    case "B+":
      return {
        bg: "bg-lime-500/10",
        text: "text-lime-600 dark:text-lime-400",
        border: "border-lime-500/20",
      };
    case "B":
      return {
        bg: "bg-yellow-500/10",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-500/20",
      };
    case "C+":
      return {
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
      };
    case "C":
      return {
        bg: "bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/20",
      };
    case "D":
      return {
        bg: "bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-500/20",
      };
    case "F":
      return {
        bg: "bg-rose-500/10",
        text: "text-rose-600 dark:text-rose-400",
        border: "border-rose-500/20",
      };
    default:
      return {
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-border",
      };
  }
}

/**
 * Get a numeric score color (for progress bars, etc.)
 *
 * @param score - Numeric score 0-100
 * @returns Tailwind color class
 */
export function getNumericScoreColor(score: number): string {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-green-500";
  if (score >= 55) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

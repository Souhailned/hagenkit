/**
 * Lead Thermometer — Rule-based lead scoring voor Horecagrond
 * 
 * Scores zoekers op basis van hun gedrag op het platform.
 * Output: temperatuur (cold/warm/hot) + score (0-100) + actie-suggestie.
 * 
 * Scoring factoren:
 * - Profielcompleteness
 * - Zoekactiviteit (views, favorieten, vergelijkingen)  
 * - Engagement diepte (images bekeken, kaart, contact)
 * - Herhalingsbezoek (meerdere views op zelfde pand)
 * - Tijdsdruk signalen (timeline, recente activiteit)
 * - Aanvraag details (budget, concept, bedrijfsnaam)
 */

export type LeadTemperature = "cold" | "warm" | "hot";

export type LeadScore = {
  score: number; // 0-100
  temperature: LeadTemperature;
  emoji: string;
  label: string; // NL label
  factors: LeadFactor[];
  suggestedAction: string; // NL actie-suggestie voor makelaar
};

export type LeadFactor = {
  name: string;
  points: number;
  maxPoints: number;
  description: string;
};

export type LeadSignals = {
  // From PropertyInquiry
  hasPhone: boolean;
  hasCompany: boolean;
  hasConcept: boolean;
  hasBudget: boolean;
  hasTimeline: boolean;
  timelineUrgency: "asap" | "1-3months" | "3-6months" | "6months+" | "unknown";
  inquiryLength: number; // chars in message

  // From PropertyView (aggregated per seeker)
  totalPropertyViews: number;
  uniquePropertiesViewed: number;
  viewsOnThisProperty: number;
  viewedImages: boolean;
  viewedMap: boolean;
  viewedContact: boolean;
  avgViewDuration: number; // seconds

  // From favorites/compare
  totalFavorites: number;
  favoritedThisProperty: boolean;
  comparedProperties: number;

  // Profile
  hasCompletedOnboarding: boolean;
  accountAgeDays: number;
  lastActiveHoursAgo: number;
};

/**
 * Calculate lead score from signals
 */
export function calculateLeadScore(signals: LeadSignals): LeadScore {
  const factors: LeadFactor[] = [];

  // 1. Contact completeness (max 20 points)
  let contactScore = 0;
  if (signals.hasPhone) contactScore += 8;
  if (signals.hasCompany) contactScore += 6;
  if (signals.inquiryLength > 200) contactScore += 6;
  else if (signals.inquiryLength > 50) contactScore += 3;
  factors.push({
    name: "Contactgegevens",
    points: contactScore,
    maxPoints: 20,
    description: signals.hasPhone
      ? "Telefoonnummer achtergelaten — serieus contact"
      : "Alleen email — laagdrempelig contact",
  });

  // 2. Intent signals (max 25 points)
  let intentScore = 0;
  if (signals.hasBudget) intentScore += 8;
  if (signals.hasConcept) intentScore += 8;
  if (signals.timelineUrgency === "asap") intentScore += 9;
  else if (signals.timelineUrgency === "1-3months") intentScore += 6;
  else if (signals.timelineUrgency === "3-6months") intentScore += 3;
  factors.push({
    name: "Koopintentie",
    points: intentScore,
    maxPoints: 25,
    description: signals.hasBudget && signals.hasConcept
      ? "Budget én concept bekend — concrete plannen"
      : "Nog in verkenningsfase",
  });

  // 3. Engagement depth (max 25 points)
  let engagementScore = 0;
  if (signals.viewsOnThisProperty >= 3) engagementScore += 10;
  else if (signals.viewsOnThisProperty >= 2) engagementScore += 6;
  else engagementScore += 2;
  if (signals.viewedImages) engagementScore += 5;
  if (signals.viewedMap) engagementScore += 3;
  if (signals.viewedContact) engagementScore += 3;
  if (signals.avgViewDuration > 120) engagementScore += 4;
  else if (signals.avgViewDuration > 60) engagementScore += 2;
  factors.push({
    name: "Betrokkenheid",
    points: Math.min(engagementScore, 25),
    maxPoints: 25,
    description: signals.viewsOnThisProperty >= 3
      ? `${signals.viewsOnThisProperty}x bekeken — hoge interesse`
      : "Eerste bezoek",
  });

  // 4. Platform activity (max 15 points)
  let activityScore = 0;
  if (signals.totalFavorites >= 3) activityScore += 5;
  else if (signals.totalFavorites >= 1) activityScore += 3;
  if (signals.favoritedThisProperty) activityScore += 4;
  if (signals.comparedProperties >= 2) activityScore += 4;
  if (signals.uniquePropertiesViewed >= 5) activityScore += 2;
  factors.push({
    name: "Platformactiviteit",
    points: Math.min(activityScore, 15),
    maxPoints: 15,
    description: signals.favoritedThisProperty
      ? "Pand als favoriet opgeslagen"
      : `${signals.totalFavorites} favorieten totaal`,
  });

  // 5. Recency & urgency (max 15 points)
  let recencyScore = 0;
  if (signals.lastActiveHoursAgo < 1) recencyScore += 8;
  else if (signals.lastActiveHoursAgo < 24) recencyScore += 5;
  else if (signals.lastActiveHoursAgo < 72) recencyScore += 2;
  if (signals.hasCompletedOnboarding) recencyScore += 4;
  if (signals.accountAgeDays < 7) recencyScore += 3; // New user = exploring actively
  factors.push({
    name: "Actualiteit",
    points: Math.min(recencyScore, 15),
    maxPoints: 15,
    description: signals.lastActiveHoursAgo < 24
      ? "Recent actief op het platform"
      : `Laatst actief ${Math.round(signals.lastActiveHoursAgo / 24)} dagen geleden`,
  });

  // Total score
  const totalScore = Math.min(
    factors.reduce((sum, f) => sum + f.points, 0),
    100
  );

  // Temperature thresholds
  let temperature: LeadTemperature;
  let emoji: string;
  let label: string;
  let suggestedAction: string;

  if (totalScore >= 65) {
    temperature = "hot";
    emoji = "🔥";
    label = "Heet";
    suggestedAction = signals.hasPhone
      ? `Bel deze lead vandaag nog! Telefoonnummer beschikbaar.${signals.timelineUrgency === "asap" ? " Zoekt actief — snel handelen." : ""}`
      : "Stuur direct een persoonlijke email met bezichtigingsvoorstel.";
  } else if (totalScore >= 35) {
    temperature = "warm";
    emoji = "🌡️";
    label = "Warm";
    suggestedAction = signals.favoritedThisProperty
      ? "Lead heeft pand als favoriet — stuur extra informatie of uitnodiging voor bezichtiging."
      : "Reageer binnen 24 uur met aanvullende informatie over het pand.";
  } else {
    temperature = "cold";
    emoji = "🧊";
    label = "Koud";
    suggestedAction = "Standaard opvolging — stuur automatische bevestiging en wacht op verdere signalen.";
  }

  return {
    score: totalScore,
    temperature,
    emoji,
    label,
    factors,
    suggestedAction,
  };
}

/**
 * Get temperature color for UI
 */
export function getTemperatureColor(temp: LeadTemperature): string {
  switch (temp) {
    case "hot": return "text-red-500";
    case "warm": return "text-amber-500";
    case "cold": return "text-blue-400";
  }
}

export function getTemperatureBg(temp: LeadTemperature): string {
  switch (temp) {
    case "hot": return "bg-red-500/10";
    case "warm": return "bg-amber-500/10";
    case "cold": return "bg-blue-400/10";
  }
}

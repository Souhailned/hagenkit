/**
 * Concept Suggestie — "Wat Past Hier?"
 * 
 * Analyseert een locatie en stelt de best passende horecaconcepten voor.
 * Combineert buurtdata met pand-eigenschappen.
 */

import type { BuurtAnalysis } from "./buurt-intelligence";

export type ConceptSuggestion = {
  concept: string;
  emoji: string;
  score: number; // 0-100
  reasoning: string; // NL uitleg
  opportunities: string[];
  risks: string[];
};

export type ConceptAnalysis = {
  suggestions: ConceptSuggestion[];
  locationProfile: string; // NL samenvatting van de locatie
};

type PropertyContext = {
  surface: number;
  buurtAnalysis: BuurtAnalysis;
  hasKitchen?: boolean;
  hasTerrace?: boolean;
  seatingCapacity?: number;
};

// Concept definitions with scoring rules
const conceptDefinitions = [
  {
    concept: "Specialty Koffiebar",
    emoji: "☕",
    // Ideal: near offices, low café competition, small space OK
    score: (ctx: PropertyContext) => {
      let s = 50;
      const { buurtAnalysis: b, surface } = ctx;
      if (b.stats.kantorenNabij > 3) s += 20;
      if (b.stats.kantorenNabij > 6) s += 10;
      const cafes = b.complementair.filter((p) => p.type === "cafe").length;
      if (cafes < 3) s += 15;
      if (cafes > 6) s -= 15;
      if (surface >= 40 && surface <= 120) s += 10;
      if (b.stats.transportScore >= 6) s += 10;
      if (surface < 30) s -= 10;
      return Math.min(100, Math.max(0, s));
    },
    opportunities: (ctx: PropertyContext) => {
      const opps: string[] = [];
      if (ctx.buurtAnalysis.stats.kantorenNabij > 3) opps.push("Veel kantoren nabij voor ochtend- en lunchverkeer");
      if (ctx.buurtAnalysis.stats.transportScore >= 6) opps.push("Goede OV-bereikbaarheid trekt passanten");
      if (ctx.surface <= 80) opps.push("Compact formaat houdt overheadkosten laag");
      if (ctx.hasTerrace) opps.push("Terras voor extra capaciteit in de zomer");
      return opps.length > 0 ? opps : ["Groeiende vraag naar specialty koffie in Nederland"];
    },
    risks: (ctx: PropertyContext) => {
      const risks: string[] = [];
      const cafes = ctx.buurtAnalysis.complementair.filter((p) => p.type === "cafe").length;
      if (cafes > 4) risks.push(`${cafes} bestaande cafés in de buurt`);
      if (ctx.buurtAnalysis.stats.kantorenNabij < 2) risks.push("Weinig kantoren nabij — minder lunchverkeer");
      if (ctx.surface > 150) risks.push("Groot oppervlak voor een koffiebar — hoge vaste kosten");
      return risks;
    },
  },
  {
    concept: "Restaurant",
    emoji: "🍽️",
    score: (ctx: PropertyContext) => {
      let s = 40;
      const { buurtAnalysis: b, surface } = ctx;
      if (surface >= 80 && surface <= 300) s += 15;
      if (ctx.hasKitchen) s += 15;
      if (b.bruisIndex >= 6) s += 15;
      if (b.stats.horecaCount > 5 && b.stats.horecaCount < 15) s += 10; // Some competition = foot traffic
      if (ctx.seatingCapacity && ctx.seatingCapacity >= 40) s += 10;
      if (ctx.hasTerrace) s += 5;
      if (surface < 60) s -= 15;
      return Math.min(100, Math.max(0, s));
    },
    opportunities: (ctx: PropertyContext) => {
      const opps: string[] = [];
      if (ctx.hasKitchen) opps.push("Bestaande keuken bespaart verbouwingskosten");
      if (ctx.buurtAnalysis.bruisIndex >= 6) opps.push("Levendige buurt met veel passanten");
      if (ctx.hasTerrace) opps.push("Terras verhoogt capaciteit en omzet in zomermaanden");
      if (ctx.surface >= 100) opps.push("Ruim pand voor flexibele inrichting");
      return opps.length > 0 ? opps : ["Horeca blijft groeien in Nederland"];
    },
    risks: (ctx: PropertyContext) => {
      const risks: string[] = [];
      const restaurants = ctx.buurtAnalysis.concurrenten.filter((p) => p.type === "restaurant").length;
      if (restaurants > 8) risks.push(`${restaurants} restaurants in directe omgeving — hoge concurrentie`);
      if (!ctx.hasKitchen) risks.push("Geen bestaande keuken — verbouwingskosten");
      if (ctx.surface < 80) risks.push("Beperkt oppervlak voor een volwaardig restaurant");
      return risks;
    },
  },
  {
    concept: "Lunchroom / Broodjeszaak",
    emoji: "🥪",
    score: (ctx: PropertyContext) => {
      let s = 45;
      const { buurtAnalysis: b, surface } = ctx;
      if (b.stats.kantorenNabij > 2) s += 20;
      if (surface >= 30 && surface <= 100) s += 10;
      if (b.stats.transportScore >= 5) s += 10;
      const lunchSpots = b.concurrenten.filter((p) => p.type === "fast_food").length;
      if (lunchSpots < 3) s += 10;
      if (lunchSpots > 6) s -= 10;
      return Math.min(100, Math.max(0, s));
    },
    opportunities: (ctx: PropertyContext) => {
      const opps: string[] = [];
      if (ctx.buurtAnalysis.stats.kantorenNabij > 2) opps.push("Kantoormedewerkers als vaste klanten");
      if (ctx.surface <= 80) opps.push("Lage overhead door compact formaat");
      opps.push("Lagere startkosten dan een restaurant");
      return opps;
    },
    risks: (ctx: PropertyContext) => {
      const risks: string[] = [];
      if (ctx.buurtAnalysis.stats.kantorenNabij < 2) risks.push("Weinig kantoren — beperkt lunchverkeer");
      if (ctx.surface > 120) risks.push("Groot pand voor een lunchroom — overweeg dubbel concept");
      return risks;
    },
  },
  {
    concept: "Cocktailbar / Café-Bar",
    emoji: "🍸",
    score: (ctx: PropertyContext) => {
      let s = 40;
      const { buurtAnalysis: b, surface } = ctx;
      if (b.bruisIndex >= 7) s += 20;
      if (surface >= 50 && surface <= 200) s += 10;
      const bars = b.concurrenten.filter((p) => ["bar", "pub"].includes(p.type)).length;
      if (bars > 2 && bars < 8) s += 10; // Cluster effect
      if (b.stats.transportScore >= 5) s += 10;
      if (ctx.hasTerrace) s += 5;
      if (b.bruisIndex < 4) s -= 15;
      return Math.min(100, Math.max(0, s));
    },
    opportunities: (ctx: PropertyContext) => {
      const opps: string[] = [];
      if (ctx.buurtAnalysis.bruisIndex >= 7) opps.push("Uitgaansbuurt met veel nachtelijk verkeer");
      const bars = ctx.buurtAnalysis.concurrenten.filter((p) => ["bar", "pub"].includes(p.type)).length;
      if (bars > 2) opps.push("Cluster-effect: meerdere bars trekken gezamenlijk publiek");
      if (ctx.hasTerrace) opps.push("Terras voor zomermaanden");
      return opps.length > 0 ? opps : ["Cocktailcultuur groeit in Nederlandse steden"];
    },
    risks: (ctx: PropertyContext) => {
      const risks: string[] = [];
      if (ctx.buurtAnalysis.bruisIndex < 5) risks.push("Rustige buurt — minder geschikt voor avondhoreca");
      if (ctx.surface > 200) risks.push("Groot oppervlak — hoge vaste kosten voor een bar");
      return risks;
    },
  },
  {
    concept: "Dark Kitchen / Bezorgkeuken",
    emoji: "🔥",
    score: (ctx: PropertyContext) => {
      let s = 35;
      const { buurtAnalysis: b, surface } = ctx;
      if (surface >= 30 && surface <= 80) s += 15;
      if (ctx.hasKitchen) s += 20;
      // Dark kitchens don't need foot traffic
      if (b.bruisIndex < 4) s += 10; // Actually better in cheaper areas
      if (b.stats.transportScore >= 3) s += 5; // Basic accessibility for riders
      return Math.min(100, Math.max(0, s));
    },
    opportunities: (ctx: PropertyContext) => {
      const opps: string[] = [];
      if (ctx.hasKitchen) opps.push("Bestaande keuken — minimale verbouwing nodig");
      if (ctx.buurtAnalysis.bruisIndex < 5) opps.push("Lagere huurprijs in rustiger gebied — ideaal voor bezorgmodel");
      opps.push("Geen terras/zaal nodig — focus op keukenefficiëntie");
      opps.push("Bezorgmarkt groeit jaarlijks met 15-20%");
      return opps;
    },
    risks: (ctx: PropertyContext) => {
      const risks: string[] = [];
      if (!ctx.hasKitchen) risks.push("Keukeninstallatie nodig — extra investering");
      risks.push("Hoge commissies bezorgplatforms (25-30%)");
      return risks;
    },
  },
];

/**
 * Generate concept suggestions for a property
 */
export function generateConceptSuggestions(ctx: PropertyContext): ConceptAnalysis {
  const suggestions: ConceptSuggestion[] = conceptDefinitions
    .map((def) => ({
      concept: def.concept,
      emoji: def.emoji,
      score: def.score(ctx),
      reasoning: "", // Will be filled below
      opportunities: def.opportunities(ctx),
      risks: def.risks(ctx),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Generate reasoning for top suggestions
  for (const s of suggestions) {
    if (s.score >= 70) {
      s.reasoning = `Dit pand is uitstekend geschikt voor een ${s.concept}. De locatie en kenmerken sluiten goed aan bij dit concept.`;
    } else if (s.score >= 50) {
      s.reasoning = `Een ${s.concept} is een solide optie voor dit pand, met enkele aandachtspunten.`;
    } else {
      s.reasoning = `Een ${s.concept} is mogelijk, maar er zijn uitdagingen om rekening mee te houden.`;
    }
  }

  // Location profile
  const b = ctx.buurtAnalysis;
  let locationProfile = "";
  if (b.bruisIndex >= 7) {
    locationProfile = `Dit pand ligt in een levendige buurt met veel horeca-activiteit (bruisindex ${b.bruisIndex}/10). `;
  } else if (b.bruisIndex >= 4) {
    locationProfile = `De buurt heeft een gemiddelde drukte met groeipotentieel (bruisindex ${b.bruisIndex}/10). `;
  } else {
    locationProfile = `Dit is een rustige locatie, geschikt voor bestemmingshoreca (bruisindex ${b.bruisIndex}/10). `;
  }
  locationProfile += `${b.stats.horecaCount} horecazaken, ${b.stats.kantorenNabij} kantoren en bereikbaarheid ${b.stats.transportScore}/10.`;

  return { suggestions, locationProfile };
}

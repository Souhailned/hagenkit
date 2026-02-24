/**
 * Build a rich system prompt from property + buurt data
 * for the AI Pand Adviseur chat agent.
 */

import type { EnhancedBuurtAnalysis } from "@/lib/buurt/types";

// Minimal property shape needed for context building
export interface PropertyContextData {
  title: string;
  slug: string;
  propertyType: string;
  address: string;
  city: string;
  postalCode: string;
  province: string | null;
  neighborhood: string | null;
  description: string | null;
  surfaceTotal: number;
  surfaceKitchen: number | null;
  surfaceTerrace: number | null;
  surfaceBasement: number | null;
  surfaceStorage: number | null;
  surfaceCommercial: number | null;
  floors: number;
  ceilingHeight: number | null;
  rentPrice: number | null;
  salePrice: number | null;
  priceType: string;
  priceNegotiable: boolean;
  servicesCosts: number | null;
  depositMonths: number | null;
  seatingCapacityInside: number | null;
  seatingCapacityOutside: number | null;
  standingCapacity: number | null;
  kitchenType: string | null;
  buildYear: number | null;
  lastRenovation: number | null;
  energyLabel: string | null;
  monumentStatus: boolean;
  horecaScore: string | null;
  locationScore: number | null;
  footfallEstimate: number | null;
  hasTerrace: boolean;
  hasParking: boolean;
  hasBasement: boolean;
  hasStorage: boolean;
  previousUse: string | null;
  wasHoreca: boolean;
  previousHorecaType: string | null;
  yearsHoreca: number | null;
  availableFrom: Date | null;
  minimumLeaseTerm: number | null;
  features: Array<{ key: string; value: string | null; category: string }>;
  agency: { name: string } | null;
}

function formatPrice(cents: number | null): string {
  if (!cents) return "—";
  return `€${(cents / 100).toLocaleString("nl-NL")}`;
}

function formatArea(m2: number | null | undefined, label: string): string {
  if (!m2) return "";
  return `${label}: ${m2} m²`;
}

export function buildPropertyContext(
  property: PropertyContextData,
  buurt?: EnhancedBuurtAnalysis | null,
): string {
  const lines: string[] = [];

  // ── Core property info ──────────────────────────────────────────────
  lines.push("=== PAND INFORMATIE ===");
  lines.push(`Naam: ${property.title}`);
  lines.push(`Type: ${property.propertyType}`);
  lines.push(`Adres: ${property.address}, ${property.postalCode} ${property.city}`);
  if (property.province) lines.push(`Provincie: ${property.province}`);
  if (property.neighborhood) lines.push(`Buurt: ${property.neighborhood}`);
  if (property.description) {
    lines.push(`Beschrijving: ${property.description.slice(0, 500)}`);
  }

  // ── Oppervlaktes ────────────────────────────────────────────────────
  lines.push("");
  lines.push("=== OPPERVLAKTES ===");
  lines.push(`Totaal: ${property.surfaceTotal} m²`);
  const areas = [
    formatArea(property.surfaceCommercial, "Commercieel"),
    formatArea(property.surfaceKitchen, "Keuken"),
    formatArea(property.surfaceTerrace, "Terras"),
    formatArea(property.surfaceBasement, "Kelder"),
    formatArea(property.surfaceStorage, "Opslag"),
  ].filter(Boolean);
  if (areas.length) lines.push(areas.join(", "));
  lines.push(`Verdiepingen: ${property.floors}`);
  if (property.ceilingHeight) lines.push(`Plafondhoogte: ${property.ceilingHeight}m`);

  // ── Prijs ───────────────────────────────────────────────────────────
  lines.push("");
  lines.push("=== PRIJSINFORMATIE ===");
  lines.push(`Prijstype: ${property.priceType}`);
  if (property.rentPrice) lines.push(`Huurprijs: ${formatPrice(property.rentPrice)}/maand`);
  if (property.salePrice) lines.push(`Koopprijs: ${formatPrice(property.salePrice)}`);
  if (property.priceNegotiable) lines.push("Prijs is onderhandelbaar");
  if (property.servicesCosts) lines.push(`Servicekosten: ${formatPrice(property.servicesCosts)}/maand`);
  if (property.depositMonths) lines.push(`Borg: ${property.depositMonths} maanden`);

  // ── Capaciteit ──────────────────────────────────────────────────────
  lines.push("");
  lines.push("=== CAPACITEIT ===");
  if (property.seatingCapacityInside) lines.push(`Zitplaatsen binnen: ${property.seatingCapacityInside}`);
  if (property.seatingCapacityOutside) lines.push(`Zitplaatsen buiten: ${property.seatingCapacityOutside}`);
  if (property.standingCapacity) lines.push(`Staanplaatsen: ${property.standingCapacity}`);
  if (property.kitchenType) lines.push(`Keuken: ${property.kitchenType}`);

  // ── Gebouw ──────────────────────────────────────────────────────────
  lines.push("");
  lines.push("=== GEBOUWINFORMATIE ===");
  if (property.buildYear) lines.push(`Bouwjaar: ${property.buildYear}`);
  if (property.lastRenovation) lines.push(`Laatste renovatie: ${property.lastRenovation}`);
  if (property.energyLabel) lines.push(`Energielabel: ${property.energyLabel}`);
  if (property.monumentStatus) lines.push("Status: Monument");
  if (property.horecaScore) lines.push(`Horecascore: ${property.horecaScore}`);
  if (property.locationScore) lines.push(`Locatiescore: ${property.locationScore}/10`);
  if (property.footfallEstimate) lines.push(`Geschatte passanten: ~${property.footfallEstimate}/dag`);

  // ── Faciliteiten ────────────────────────────────────────────────────
  const facilities = [
    property.hasTerrace && "Terras",
    property.hasParking && "Parkeren",
    property.hasBasement && "Kelder",
    property.hasStorage && "Opslag",
  ].filter(Boolean);
  if (facilities.length) {
    lines.push("");
    lines.push(`Faciliteiten: ${facilities.join(", ")}`);
  }

  // ── Geschiedenis ────────────────────────────────────────────────────
  if (property.wasHoreca || property.previousUse) {
    lines.push("");
    lines.push("=== VORIG GEBRUIK ===");
    if (property.previousUse) lines.push(`Vorig gebruik: ${property.previousUse}`);
    if (property.previousHorecaType) lines.push(`Vorig horecatype: ${property.previousHorecaType}`);
    if (property.yearsHoreca) lines.push(`Jaren horeca: ${property.yearsHoreca}`);
  }

  // ── Kenmerken ───────────────────────────────────────────────────────
  if (property.features.length > 0) {
    lines.push("");
    lines.push("=== KENMERKEN ===");
    for (const f of property.features) {
      lines.push(`- ${f.key}${f.value ? `: ${f.value}` : ""} (${f.category})`);
    }
  }

  // ── Beschikbaarheid ─────────────────────────────────────────────────
  lines.push("");
  lines.push("=== BESCHIKBAARHEID ===");
  lines.push(
    `Beschikbaar vanaf: ${property.availableFrom ? new Date(property.availableFrom).toLocaleDateString("nl-NL") : "Direct"}`
  );
  if (property.minimumLeaseTerm) lines.push(`Minimale huurtermijn: ${property.minimumLeaseTerm} maanden`);
  if (property.agency?.name) lines.push(`Makelaar: ${property.agency.name}`);

  // ── Buurt data ──────────────────────────────────────────────────────
  if (buurt) {
    lines.push("");
    lines.push("=== BUURTANALYSE ===");
    if (buurt.bruisIndex != null) lines.push(`BruisIndex: ${buurt.bruisIndex}/10`);
    if (buurt.passanten) lines.push(`Passanten: ~${buurt.passanten.dagschatting}/dag (confidence: ${buurt.passanten.confidence})`);
    if (buurt.stats?.horecaDensity) lines.push(`Horecadichtheid: ${buurt.stats.horecaDensity}`);
    if (buurt.stats?.transportScore != null) lines.push(`OV-score: ${buurt.stats.transportScore}/10`);
    if (buurt.stats?.horecaCount) lines.push(`Horecazaken in de buurt: ${buurt.stats.horecaCount}`);
    if (buurt.summary) lines.push(`Samenvatting: ${buurt.summary}`);

    if (buurt.demographics) {
      const d = buurt.demographics;
      lines.push(`Inwoners (buurt): ${d.inwoners}`);
      if (d.gemiddeldInkomen) lines.push(`Gem. inkomen: €${(d.gemiddeldInkomen * 1000).toLocaleString("nl-NL")}`);
      if (d.leeftijdsverdeling) {
        lines.push(`Leeftijd: ${d.leeftijdsverdeling.jong}% jong, ${d.leeftijdsverdeling.werkleeftijd}% werkleeftijd, ${d.leeftijdsverdeling.ouder}% 65+`);
      }
      if (d.dichtheid) lines.push(`Bevolkingsdichtheid: ${d.dichtheid}/km²`);
    }

    if (buurt.competitors && buurt.competitors.length > 0) {
      lines.push("");
      lines.push("Top concurrenten in de buurt:");
      for (const c of buurt.competitors.slice(0, 8)) {
        const parts = [c.naam, c.type];
        if (c.afstand) parts.push(`${c.afstand}m`);
        if (c.rating) parts.push(`${c.rating}★`);
        lines.push(`- ${parts.join(" | ")}`);
      }
    }

    if (buurt.transportAnalysis?.stops && buurt.transportAnalysis.stops.length > 0) {
      lines.push("");
      lines.push(`OV bereikbaarheid: ${buurt.transportAnalysis.bereikbaarheidOV}`);
      for (const s of buurt.transportAnalysis.stops.slice(0, 4)) {
        lines.push(`- ${s.naam} (${s.afstand}m, ${s.type})`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Build the full system prompt for the property advisor agent
 */
export function buildPropertySystemPrompt(
  property: PropertyContextData,
  buurt?: EnhancedBuurtAnalysis | null,
): string {
  const context = buildPropertyContext(property, buurt);

  return `Je bent de AI Pand Adviseur van Horecagrond, een expert in horeca-vastgoed in Nederland.
Je helpt bezoekers met vragen over een specifiek horecapand dat ze bekijken.

BELANGRIJKE REGELS:
- Antwoord ALTIJD in het Nederlands
- Wees beknopt maar informatief (max 3-4 alinea's per antwoord)
- Baseer je antwoorden op de panddata hieronder — verzin geen informatie
- Als je iets niet weet, zeg dat eerlijk
- Gebruik concrete cijfers uit de data waar mogelijk
- Je mag tools gebruiken om extra analyse te doen (concept check, vergelijkbare panden)
- Wees professioneel maar toegankelijk

PANDDATA:
${context}

Je kunt de volgende analyses uitvoeren als de gebruiker ernaar vraagt:
1. Concept check — controleer of een specifiek horecaconcept past op deze locatie
2. Vergelijkbare panden — zoek naar soortgelijke panden

Geef altijd eerlijk advies, inclusief mogelijke risico's en aandachtspunten.`;
}

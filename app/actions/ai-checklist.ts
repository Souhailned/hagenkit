"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { checklistInputSchema, type ChecklistInput } from "@/lib/validations/ai-actions";

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  description: string;
  priority: "must" | "should" | "nice";
  estimatedDays: number;
  estimatedCost?: string;
  done: boolean;
}

export async function generateChecklist(rawInput: ChecklistInput): Promise<ChecklistItem[]> {
  // Validate input
  const input = checklistInputSchema.parse(rawInput);

  // Auth + rate limit
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.id) {
    const rateLimitResult = await checkRateLimit(session.user.id, "ai");
    if (!rateLimitResult.success) {
      throw new Error("Rate limit exceeded. Try again later.");
    }
  }

  const items: ChecklistItem[] = [];
  let id = 0;

  const add = (
    category: string, task: string, description: string,
    priority: "must" | "should" | "nice", days: number, cost?: string
  ) => {
    items.push({ id: `task-${++id}`, category, task, description, priority, estimatedDays: days, estimatedCost: cost, done: false });
  };

  // 1. Onderzoek & Planning
  add("📋 Planning", "Ondernemingsplan schrijven", "Concept, doelgroep, financiering, marketing — het fundament", "must", 14);
  add("📋 Planning", "Marktonderzoek doen", `Concurrentieanalyse in ${input.city}, doelgroep, locatie`, "must", 7);
  if (!input.hasFunding) {
    add("💰 Financiering", "Financieringsplan opstellen", "Investering, lening, eigen middelen — bereken je behoefte", "must", 7, "€0 (tijd)");
    add("💰 Financiering", "Bank of investeerder benaderen", "Minimaal 3 gesprekken plannen, ondernemingsplan meenemen", "must", 21, "Afhankelijk");
  }

  // 2. Juridisch
  add("⚖️ Juridisch", "KvK inschrijving", "Registreer je bedrijf bij de Kamer van Koophandel", "must", 3, "€75");
  add("⚖️ Juridisch", "Horecavergunning aanvragen", `Via gemeente ${input.city} — kan 8-12 weken duren`, "must", 60, "€200-500");
  add("⚖️ Juridisch", "Drank- en horecawetvergunning", "Verplicht voor alcohol schenken, Sociale Hygiëne diploma vereist", "must", 30, "€100-300");
  if (!input.hasExperience) {
    add("⚖️ Juridisch", "Diploma Sociale Hygiëne behalen", "Verplicht voor horecavergunning — examen via SVH", "must", 30, "€300-500");
  }
  add("⚖️ Juridisch", "Exploitatievergunning", `Aanvragen bij gemeente ${input.city}`, "must", 42, "€100-400");
  add("⚖️ Juridisch", "BTW registratie", "Registreer bij de Belastingdienst", "must", 7, "€0");

  // 3. Locatie
  if (!input.hasLocation) {
    add("📍 Locatie", "Locatie zoeken", "Gebruik Horecagrond.nl om het perfecte pand te vinden!", "must", 30);
    add("📍 Locatie", "Huurcontract onderhandelen", "Let op: looptijd, opzegtermijn, verbouwclausules", "must", 14);
  }
  add("📍 Locatie", "Brandveiligheid keuring", "Verplichte keuring door brandweer", "must", 14, "€200-500");
  add("📍 Locatie", "Verbouwing plannen", "Architect, aannemer, vergunning indien nodig", "should", 30, "€10.000-100.000");

  // 4. Inrichting
  add("🪑 Inrichting", "Interieur ontwerp", "Concept passend bij je merk en doelgroep", "should", 14, "€2.000-10.000");
  add("🪑 Inrichting", "Keukenequipment bestellen", "Oven, koeling, werkbanken, afzuiging", "must", 21, "€5.000-50.000");
  add("🪑 Inrichting", "Meubilair bestellen", "Tafels, stoelen, bar — levertijd 4-8 weken", "must", 42);
  add("🪑 Inrichting", "Kassasysteem kiezen", "Lightspeed, Untill, of vergelijkbaar", "must", 3, "€50-150/mnd");

  // 5. Personeel
  add("👥 Personeel", "Personeel werven", "Chef-kok, bediening, afwas — begin vroeg!", "must", 21);
  add("👥 Personeel", "Arbeidscontracten opstellen", "Via jurist of template — naleving cao Horeca", "must", 7, "€500-1.000");
  if (!input.hasExperience) {
    add("👥 Personeel", "HACCP training", "Voedselveiligheid certificering voor het hele team", "must", 7, "€200-400");
  }

  // 6. Marketing
  add("📣 Marketing", "Naam & logo ontwerpen", "Gebruik onze Naam Generator voor inspiratie!", "should", 14, "€500-3.000");
  add("📣 Marketing", "Website + socials opzetten", "Instagram is essentieel voor horeca", "should", 7, "€500-2.000");
  add("📣 Marketing", "Google Mijn Bedrijf claimen", "Gratis en essentieel voor lokale vindbaarheid", "must", 1, "€0");
  add("📣 Marketing", "Openingsfeest plannen", "Nodig pers, buurt, en foodbloggers uit", "nice", 7, "€500-2.000");

  // 7. Verzekeringen
  add("🛡️ Verzekeringen", "Bedrijfsverzekering afsluiten", "Inventaris, aansprakelijkheid, brand", "must", 7, "€100-300/mnd");
  add("🛡️ Verzekeringen", "Personeelsverzekeringen", "Ziekteverzuim, arbeidsongeschiktheid", "must", 7, "€50-150/mnd");

  // Type-specific
  if (["RESTAURANT", "PIZZERIA", "SUSHI"].includes(input.type)) {
    add("🍽️ Specifiek", "Menu ontwikkelen", "Foodcost berekening, proefavonden organiseren", "must", 14);
    add("🍽️ Specifiek", "Leveranciers selecteren", "Groente, vlees, vis, dranken — minimaal 3 offertes", "must", 7);
  }
  if (["BAR", "COCKTAILBAR", "NIGHTCLUB"].includes(input.type)) {
    add("🍸 Specifiek", "Drankkaart samenstellen", "Bieren, wijnen, cocktails, prijsstelling", "must", 7);
    add("🍸 Specifiek", "Geluidsinstallatie", "Muziek, eventueel DJ booth", "should", 7, "€2.000-15.000");
  }
  if (input.type === "HOTEL") {
    add("🏨 Specifiek", "Boekingssysteem implementeren", "Booking.com, eigen site, channel manager", "must", 14, "€50-200/mnd");
  }

  return items;
}

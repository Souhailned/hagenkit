"use server";

import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import type { ActionResult } from "@/types/actions";

export interface ListingPackage {
  descriptions: {
    starter: string;
    investeerder: string;
    keten: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  linkedin: string;
  instagram: string;
}

export async function generateListingPackage(
  propertyId: string
): Promise<ActionResult<ListingPackage>> {
  try {
    const authCheck = await requirePermission("ai:listing-package");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }
    const { userId } = authCheck.data!;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        financials: true,
        agency: { select: { id: true, name: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (!property) {
      return { success: false, error: "Pand niet gevonden" };
    }

    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY! });
    const model = groq("llama-3.1-8b-instant");

    const ctx = `
Pand: ${property.title}
Type: ${property.propertyType}
Stad: ${property.city}
Oppervlakte: ${property.surfaceTotal} m²
Prijs: ${property.rentPrice ? `\u20AC${(property.rentPrice / 100).toLocaleString("nl-NL")}/mnd` : property.salePrice ? `\u20AC${(property.salePrice / 100).toLocaleString("nl-NL")}` : "Op aanvraag"}
Beschrijving: ${property.description || "Geen beschrijving beschikbaar"}
${property.financials?.jaaromzet ? `Jaaromzet: \u20AC${(property.financials.jaaromzet / 100).toLocaleString("nl-NL")}` : ""}
${property.financials?.goodwill ? `Goodwill: \u20AC${(property.financials.goodwill / 100).toLocaleString("nl-NL")}` : ""}
Makelaar: ${property.agency.name}
    `.trim();

    const [starterRes, investeerderRes, ketenRes, swotRes, linkedinRes, instagramRes] =
      await Promise.all([
        generateText({
          model,
          prompt: `Schrijf een aantrekkelijke Nederlandse listing beschrijving van max 200 woorden voor een STARTER horeca ondernemer die voor het eerst een eigen zaak wil openen. Wees enthousiast en toegankelijk. Pand info:\n${ctx}`,
        }),
        generateText({
          model,
          prompt: `Schrijf een professionele Nederlandse listing beschrijving van max 200 woorden voor een INVESTEERDER die op zoek is naar rendement. Focus op ROI, omzetpotentieel en risico's. Pand info:\n${ctx}`,
        }),
        generateText({
          model,
          prompt: `Schrijf een zakelijke Nederlandse listing beschrijving van max 200 woorden voor een HORECAKETEN die uitbreiding zoekt. Focus op schaalbaarheid, locatie en operationele voordelen. Pand info:\n${ctx}`,
        }),
        generateText({
          model,
          prompt: `Analyseer dit horecapand en geef een SWOT analyse in JSON formaat. Return ALLEEN valid JSON in dit formaat: {"strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]}. Elk array heeft 3-4 punten in het Nederlands. Pand info:\n${ctx}`,
        }),
        generateText({
          model,
          prompt: `Schrijf een professionele LinkedIn post (max 150 woorden) in het Nederlands om dit horecapand te promoten. Begin met een pakkende openingszin. Gebruik emoji's spaarzaam. Pand info:\n${ctx}`,
        }),
        generateText({
          model,
          prompt: `Schrijf een Instagram caption (max 100 woorden) in het Nederlands voor dit horecapand. Casual en visueel. Voeg relevante hashtags toe (5-8 stuks). Pand info:\n${ctx}`,
        }),
      ]);

    // Parse SWOT JSON (may have markdown code fences)
    let swot: ListingPackage["swot"] = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };
    try {
      const swotText = swotRes.text
        .replace(/```json?\n?/g, "")
        .replace(/```/g, "")
        .trim();
      swot = JSON.parse(swotText);
    } catch {
      swot = {
        strengths: ["Goede locatie", "Bewezen concept"],
        weaknesses: ["Onbekend"],
        opportunities: ["Groeiende markt"],
        threats: ["Concurrentie"],
      };
    }

    // Log AI usage (fire and forget)
    prisma.aiUsageLog
      .create({
        data: {
          userId,
          agencyId: property.agency.id,
          service: "groq",
          model: "llama-3.1-8b-instant",
          feature: "listing-package",
          costCents: 0, // Groq is essentially free
          status: "success",
        },
      })
      .catch(() => {});

    return {
      success: true,
      data: {
        descriptions: {
          starter: starterRes.text,
          investeerder: investeerderRes.text,
          keten: ketenRes.text,
        },
        swot,
        linkedin: linkedinRes.text,
        instagram: instagramRes.text,
      },
    };
  } catch (error) {
    console.error("[generateListingPackage] Error:", error);
    return {
      success: false,
      error: "Kon het listing pakket niet genereren",
    };
  }
}

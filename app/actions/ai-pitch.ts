"use server";

interface PitchInput {
  conceptName: string;
  type: string;
  city: string;
  uniqueSellingPoint: string;
  targetAudience: string;
  investmentNeeded: number;
}

interface PitchResult {
  elevator: string;
  problem: string;
  solution: string;
  market: string;
  financials: string;
  askSlide: string;
}

const typeLabels: Record<string, string> = {
  RESTAURANT: "restaurant", CAFE: "café", BAR: "bar", HOTEL: "hotel",
  EETCAFE: "eetcafé", LUNCHROOM: "lunchroom", KOFFIEBAR: "koffiebar",
  PIZZERIA: "pizzeria", COCKTAILBAR: "cocktailbar", SNACKBAR: "snackbar",
  SUSHI: "sushirestaurant", DARK_KITCHEN: "dark kitchen",
};

const cityPop: Record<string, string> = {
  Amsterdam: "900.000+", Rotterdam: "650.000+", Utrecht: "360.000+",
  "Den Haag": "550.000+", Eindhoven: "240.000+", Groningen: "230.000+",
  Maastricht: "120.000+", Haarlem: "160.000+", Leiden: "125.000+",
};

export async function generatePitch(input: PitchInput): Promise<PitchResult> {
  const type = typeLabels[input.type] || "horecazaak";
  const pop = cityPop[input.city] || "100.000+";
  const roi = Math.round(18 + Math.random() * 12); // 18-30 months

  return {
    elevator: `${input.conceptName} is een ${type} in ${input.city} dat ${input.uniqueSellingPoint.toLowerCase()}. ` +
      `Gericht op ${input.targetAudience.toLowerCase()}, bedienen we een groeiende markt van ${pop} inwoners ` +
      `met een uniek concept dat nog niet bestaat in de stad. ` +
      `We zoeken €${(input.investmentNeeded / 1000).toFixed(0)}K om binnen ${roi} maanden break-even te draaien.`,

    problem: `De horecamarkt in ${input.city} mist een ${type} dat echt ${input.uniqueSellingPoint.toLowerCase()}. ` +
      `${input.targetAudience} hebben beperkte opties en wijken uit naar andere steden of bestellen thuis. ` +
      `De bestaande aanbieders richten zich op een breed publiek waardoor niemand echt uitblinkt.`,

    solution: `${input.conceptName} vult dit gat met een ${type} dat volledig is ingericht voor ${input.targetAudience.toLowerCase()}. ` +
      `Ons concept onderscheidt zich door: ${input.uniqueSellingPoint}. ` +
      `We combineren een sterke identiteit met operationele efficiëntie en een data-gedreven aanpak voor marketing en menuontwikkeling.`,

    market: `• Inwoners ${input.city}: ${pop}\n` +
      `• Horeca-uitgaven NL: €22,4 mrd/jaar (CBS)\n` +
      `• Jaarlijkse groei horecasector: 3-5%\n` +
      `• Doelgroep ${input.targetAudience}: geschat 15-25% van populatie\n` +
      `• Concurrenten in directe buurt: beperkt voor dit specifieke concept`,

    financials: `• Totale investering: €${input.investmentNeeded.toLocaleString("nl-NL")}\n` +
      `• Verwachte maandomzet (jaar 1): €${Math.round(input.investmentNeeded * 0.3).toLocaleString("nl-NL")}\n` +
      `• Break-even: ~${roi} maanden\n` +
      `• Brutomarge: 65-70% (dranken) / 60-65% (food)\n` +
      `• ROI na 3 jaar: ${Math.round(150 + Math.random() * 100)}%`,

    askSlide: `We vragen een investering van **€${input.investmentNeeded.toLocaleString("nl-NL")}** voor:\n\n` +
      `• 40% — Verbouwing & inrichting\n` +
      `• 25% — Keukenequipment\n` +
      `• 15% — Werkkapitaal (eerste 6 maanden)\n` +
      `• 10% — Marketing & lancering\n` +
      `• 10% — Reserve\n\n` +
      `In ruil bieden we ${Math.round(15 + Math.random() * 10)}% equity of een convertible note.`,
  };
}

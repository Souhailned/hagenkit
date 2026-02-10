/**
 * Haalbaarheidscheck — Feasibility analysis for horeca concepts
 * 
 * Generates a feasibility report based on concept, budget, location.
 * Rule-based scoring with industry benchmarks.
 */

export type FeasibilityInput = {
  concept: string; // e.g. "RESTAURANT", "CAFE", "BAR"
  budget: number; // Total available budget in euros
  city: string;
  surface?: number; // m²
  experienceYears?: number;
  hasBusinessPlan?: boolean;
  monthlyRent?: number; // euros
};

export type FeasibilityReport = {
  score: number; // 1-10
  verdict: "haalbaar" | "haalbaar_met_risico" | "risicovol" | "niet_haalbaar";
  verdictEmoji: string;
  verdictLabel: string;
  estimatedStartCosts: { item: string; amount: number }[];
  estimatedMonthlyCosts: { item: string; amount: number }[];
  totalStartCost: number;
  totalMonthlyCost: number;
  breakEvenMonths: number;
  riskFactors: { risk: string; severity: "laag" | "medium" | "hoog" }[];
  strengths: string[];
  recommendations: string[];
};

// Industry benchmarks (simplified, Dutch market)
const conceptBenchmarks: Record<string, {
  avgStartCost: number; // euros
  avgMonthlyOverhead: number; // euros (excl. rent)
  avgMonthlyRevenue: number; // euros for a decent location
  staffNeeded: number;
  avgRentPerM2: number; // euros/m²/month
}> = {
  RESTAURANT: {
    avgStartCost: 120000,
    avgMonthlyOverhead: 18000,
    avgMonthlyRevenue: 35000,
    staffNeeded: 6,
    avgRentPerM2: 25,
  },
  CAFE: {
    avgStartCost: 60000,
    avgMonthlyOverhead: 8000,
    avgMonthlyRevenue: 18000,
    staffNeeded: 3,
    avgRentPerM2: 20,
  },
  KOFFIEBAR: {
    avgStartCost: 45000,
    avgMonthlyOverhead: 6000,
    avgMonthlyRevenue: 14000,
    staffNeeded: 2,
    avgRentPerM2: 22,
  },
  BAR: {
    avgStartCost: 80000,
    avgMonthlyOverhead: 10000,
    avgMonthlyRevenue: 22000,
    staffNeeded: 4,
    avgRentPerM2: 22,
  },
  EETCAFE: {
    avgStartCost: 70000,
    avgMonthlyOverhead: 10000,
    avgMonthlyRevenue: 20000,
    staffNeeded: 4,
    avgRentPerM2: 20,
  },
  LUNCHROOM: {
    avgStartCost: 40000,
    avgMonthlyOverhead: 5500,
    avgMonthlyRevenue: 12000,
    staffNeeded: 2,
    avgRentPerM2: 18,
  },
  DARK_KITCHEN: {
    avgStartCost: 30000,
    avgMonthlyOverhead: 4000,
    avgMonthlyRevenue: 10000,
    staffNeeded: 2,
    avgRentPerM2: 12,
  },
  SNACKBAR: {
    avgStartCost: 35000,
    avgMonthlyOverhead: 5000,
    avgMonthlyRevenue: 12000,
    staffNeeded: 2,
    avgRentPerM2: 15,
  },
  PIZZERIA: {
    avgStartCost: 65000,
    avgMonthlyOverhead: 9000,
    avgMonthlyRevenue: 18000,
    staffNeeded: 3,
    avgRentPerM2: 18,
  },
  HOTEL: {
    avgStartCost: 500000,
    avgMonthlyOverhead: 40000,
    avgMonthlyRevenue: 80000,
    staffNeeded: 10,
    avgRentPerM2: 15,
  },
};

// City cost multipliers (Amsterdam = expensive, smaller cities = cheaper)
const cityMultipliers: Record<string, number> = {
  amsterdam: 1.4, rotterdam: 1.15, "den haag": 1.15, utrecht: 1.2,
  eindhoven: 1.05, groningen: 0.95, maastricht: 1.0, leiden: 1.1,
  haarlem: 1.15, arnhem: 0.95, nijmegen: 0.95, tilburg: 0.9,
  breda: 0.95, almere: 0.9, apeldoorn: 0.85, enschede: 0.85,
};

function getCityMultiplier(city: string): number {
  return cityMultipliers[city.toLowerCase()] || 1.0;
}

export function generateFeasibilityReport(input: FeasibilityInput): FeasibilityReport {
  const benchmark = conceptBenchmarks[input.concept] || conceptBenchmarks.RESTAURANT;
  const cityMult = getCityMultiplier(input.city);

  // Estimated start costs
  const startCosts = [
    { item: "Verbouwing & inrichting", amount: Math.round(benchmark.avgStartCost * 0.5 * cityMult) },
    { item: "Keukenapparatuur", amount: Math.round(benchmark.avgStartCost * 0.2) },
    { item: "Vergunningen & advies", amount: Math.round(5000 * cityMult) },
    { item: "Eerste voorraad", amount: Math.round(benchmark.avgStartCost * 0.08) },
    { item: "Marketing & lancering", amount: Math.round(3000) },
    { item: "Werkkapitaal (3 maanden)", amount: Math.round(benchmark.avgMonthlyOverhead * 3 * cityMult) },
    { item: "Onvoorzien (10%)", amount: Math.round(benchmark.avgStartCost * 0.1) },
  ];
  const totalStartCost = startCosts.reduce((s, c) => s + c.amount, 0);

  // Monthly costs
  const monthlyRent = input.monthlyRent || (input.surface ? input.surface * benchmark.avgRentPerM2 * cityMult : benchmark.avgRentPerM2 * 80 * cityMult);
  const monthlyCosts = [
    { item: "Huur", amount: Math.round(monthlyRent) },
    { item: "Personeel", amount: Math.round(benchmark.staffNeeded * 2800 * cityMult) },
    { item: "Inkoop/voorraad", amount: Math.round(benchmark.avgMonthlyOverhead * 0.35) },
    { item: "Energie & water", amount: Math.round(800 * cityMult) },
    { item: "Verzekeringen", amount: Math.round(350) },
    { item: "Marketing", amount: Math.round(500) },
    { item: "Overig", amount: Math.round(benchmark.avgMonthlyOverhead * 0.1) },
  ];
  const totalMonthlyCost = monthlyCosts.reduce((s, c) => s + c.amount, 0);

  // Revenue and break-even
  const estimatedRevenue = benchmark.avgMonthlyRevenue * cityMult;
  const monthlyProfit = estimatedRevenue - totalMonthlyCost;
  const breakEvenMonths = monthlyProfit > 0
    ? Math.ceil(totalStartCost / monthlyProfit)
    : 999;

  // Risk factors
  const risks: FeasibilityReport["riskFactors"] = [];

  if (input.budget < totalStartCost * 0.7) {
    risks.push({ risk: "Budget dekt minder dan 70% van geschatte startkosten", severity: "hoog" });
  } else if (input.budget < totalStartCost) {
    risks.push({ risk: "Budget dekt niet alle startkosten — aanvullende financiering nodig", severity: "medium" });
  }

  if (!input.experienceYears || input.experienceYears < 2) {
    risks.push({ risk: "Beperkte horeca-ervaring verhoogt het faalrisico", severity: "medium" });
  }

  if (!input.hasBusinessPlan) {
    risks.push({ risk: "Geen businessplan — moeilijker om financiering te krijgen", severity: "medium" });
  }

  if (monthlyProfit <= 0) {
    risks.push({ risk: "Verwachte maandelijkse kosten hoger dan omzet", severity: "hoog" });
  }

  if (breakEvenMonths > 24) {
    risks.push({ risk: `Terugverdientijd ${breakEvenMonths > 100 ? "onrealistisch lang" : breakEvenMonths + " maanden"} — hoog risico`, severity: "hoog" });
  } else if (breakEvenMonths > 12) {
    risks.push({ risk: `Terugverdientijd ${breakEvenMonths} maanden — gemiddeld`, severity: "medium" });
  }

  if (cityMult >= 1.3) {
    risks.push({ risk: `${input.city} is een dure markt — hoge vaste kosten`, severity: "medium" });
  }

  // Strengths
  const strengths: string[] = [];
  if (input.budget >= totalStartCost * 1.2) strengths.push("Ruim budget — buffer voor onvoorziene kosten");
  if (input.experienceYears && input.experienceYears >= 5) strengths.push("Ruime horeca-ervaring");
  if (input.hasBusinessPlan) strengths.push("Businessplan aanwezig — sterke basis");
  if (monthlyProfit > 0 && breakEvenMonths <= 12) strengths.push(`Snelle terugverdientijd (${breakEvenMonths} maanden)`);
  if (input.concept === "DARK_KITCHEN" || input.concept === "LUNCHROOM") strengths.push("Relatief lage startkosten voor dit concept");

  // Recommendations
  const recommendations: string[] = [];
  if (input.budget < totalStartCost) {
    recommendations.push("Overweeg een kleiner startconcept of gedeelde keukenruimte om kosten te beperken");
  }
  if (!input.hasBusinessPlan) {
    recommendations.push("Maak een gedetailleerd businessplan — essentieel voor financiering en eigen inzicht");
  }
  if (!input.experienceYears || input.experienceYears < 2) {
    recommendations.push("Overweeg eerst ervaring op te doen bij een bestaande horecazaak");
  }
  if (breakEvenMonths > 18) {
    recommendations.push("Focus op concepten met lagere vaste kosten (lunchroom, koffiebar, dark kitchen)");
  }
  recommendations.push("Plan minimaal 6 maanden werkkapitaal in — de eerste maanden zijn altijd rustig");
  recommendations.push("Laat je vergunningen uitzoeken vóór het tekenen van een huurcontract");

  // Overall score
  let score = 5;
  if (input.budget >= totalStartCost * 1.2) score += 2;
  else if (input.budget >= totalStartCost) score += 1;
  else if (input.budget < totalStartCost * 0.5) score -= 2;
  else score -= 1;

  if (input.experienceYears && input.experienceYears >= 3) score += 1;
  if (input.hasBusinessPlan) score += 1;
  if (monthlyProfit > 0) score += 1;
  if (breakEvenMonths <= 12) score += 1;
  if (breakEvenMonths > 24) score -= 1;
  if (risks.filter((r) => r.severity === "hoog").length >= 2) score -= 2;

  score = Math.min(10, Math.max(1, score));

  // Verdict
  let verdict: FeasibilityReport["verdict"];
  let verdictEmoji: string;
  let verdictLabel: string;

  if (score >= 8) {
    verdict = "haalbaar";
    verdictEmoji = "🟢";
    verdictLabel = "Haalbaar";
  } else if (score >= 6) {
    verdict = "haalbaar_met_risico";
    verdictEmoji = "🟡";
    verdictLabel = "Haalbaar met risico's";
  } else if (score >= 4) {
    verdict = "risicovol";
    verdictEmoji = "🟠";
    verdictLabel = "Risicovol";
  } else {
    verdict = "niet_haalbaar";
    verdictEmoji = "🔴";
    verdictLabel = "Niet haalbaar";
  }

  return {
    score,
    verdict,
    verdictEmoji,
    verdictLabel,
    estimatedStartCosts: startCosts,
    estimatedMonthlyCosts: monthlyCosts,
    totalStartCost,
    totalMonthlyCost,
    breakEvenMonths: Math.min(breakEvenMonths, 999),
    riskFactors: risks,
    strengths,
    recommendations,
  };
}

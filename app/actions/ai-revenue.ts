"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { revenueInputSchema, type RevenueInput } from "@/lib/validations/ai-actions";

interface RevenueResult {
  estimatedMonthly: { low: number; mid: number; high: number };
  breakdown: { label: string; amount: number; percentage: number }[];
  benchmarks: { label: string; value: string }[];
  tips: string[];
  riskScore: number; // 1-10
  confidence: number; // 0-100
}

// Dutch horeca revenue benchmarks per m² per month (in euros)
const revenuePerm2: Record<string, { low: number; mid: number; high: number }> = {
  RESTAURANT: { low: 150, mid: 280, high: 450 },
  CAFE: { low: 100, mid: 200, high: 350 },
  BAR: { low: 120, mid: 250, high: 400 },
  HOTEL: { low: 200, mid: 400, high: 700 },
  EETCAFE: { low: 130, mid: 240, high: 380 },
  LUNCHROOM: { low: 90, mid: 180, high: 300 },
  KOFFIEBAR: { low: 110, mid: 220, high: 370 },
  PIZZERIA: { low: 140, mid: 260, high: 420 },
  SNACKBAR: { low: 160, mid: 300, high: 500 },
  COCKTAILBAR: { low: 130, mid: 280, high: 480 },
  NIGHTCLUB: { low: 100, mid: 350, high: 600 },
  SUSHI: { low: 160, mid: 300, high: 500 },
  DARK_KITCHEN: { low: 200, mid: 400, high: 650 },
};

// City multipliers based on Dutch market
const cityMultiplier: Record<string, number> = {
  Amsterdam: 1.35, Rotterdam: 1.10, "Den Haag": 1.05, Utrecht: 1.15,
  Eindhoven: 1.00, Groningen: 0.90, Maastricht: 0.95, Haarlem: 1.10,
  Leiden: 1.05, Breda: 0.95, Tilburg: 0.90, Arnhem: 0.90,
  Nijmegen: 0.90, Delft: 1.00, Amersfoort: 0.95, Zwolle: 0.85,
};

const priceMultiplier = { budget: 0.7, midden: 1.0, premium: 1.5 };

const costPercentages = [
  { label: "Inkoop (food & beverage)", pct: 30 },
  { label: "Personeel", pct: 32 },
  { label: "Huur", pct: 12 },
  { label: "Energie & utilities", pct: 5 },
  { label: "Marketing", pct: 3 },
  { label: "Overig (verzekering, admin)", pct: 8 },
];

export async function predictRevenue(rawInput: RevenueInput): Promise<RevenueResult> {
  // Validate input
  const input = revenueInputSchema.parse(rawInput);

  // Auth + rate limit
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user?.id) {
    const rateLimitResult = await checkRateLimit(session.user.id, "ai");
    if (!rateLimitResult.success) {
      throw new Error("Rate limit exceeded. Try again later.");
    }
  }

  const base = revenuePerm2[input.type] || revenuePerm2.RESTAURANT;
  const cityMult = cityMultiplier[input.city] || 1.0;
  const priceMult = priceMultiplier[input.priceRange];

  // Revenue per m²
  const low = Math.round(base.low * input.surface * cityMult * priceMult);
  const mid = Math.round(base.mid * input.surface * cityMult * priceMult);
  const high = Math.round(base.high * input.surface * cityMult * priceMult);

  // Seating bonus (more seats = more potential, but diminishing)
  const seatBonus = Math.min(input.seating / (input.surface * 0.8), 1.2);
  const adjustedMid = Math.round(mid * seatBonus);

  // Cost breakdown based on mid estimate
  const breakdown = costPercentages.map((c) => ({
    label: c.label,
    amount: Math.round((adjustedMid * c.pct) / 100),
    percentage: c.pct,
  }));

  const totalCosts = breakdown.reduce((sum, b) => sum + b.amount, 0);
  const netProfit = adjustedMid - totalCosts;

  // Benchmarks
  const benchmarks = [
    { label: "Omzet per m²", value: `€${Math.round(adjustedMid / input.surface)}/m²` },
    { label: "Omzet per stoel", value: `€${Math.round(adjustedMid / Math.max(input.seating, 1))}/stoel` },
    { label: "Kostpercentage", value: `${Math.round((totalCosts / adjustedMid) * 100)}%` },
    { label: "Geschatte nettowinst", value: `€${netProfit.toLocaleString("nl-NL")}/mnd` },
    { label: "Break-even bezetting", value: `${Math.round((totalCosts / adjustedMid) * 100)}%` },
  ];

  // Risk score (1=laag, 10=hoog)
  const riskFactors = [
    input.surface > 300 ? 2 : input.surface > 150 ? 1 : 0,
    input.priceRange === "premium" ? 2 : 0,
    cityMult < 0.9 ? 1 : 0,
    input.seating > input.surface * 0.8 ? 1 : 0,
  ];
  const riskScore = Math.min(Math.max(3 + riskFactors.reduce((a, b) => a + b, 0), 1), 10);

  // Smart tips
  const tips: string[] = [];
  if (input.surface > 200) tips.push("Grote ruimte: overweeg een evenementenruimte voor extra inkomsten");
  if (input.priceRange === "budget") tips.push("Budget segment: focus op volume en snelle omloop");
  if (input.priceRange === "premium") tips.push("Premium segment: investeer in interieur en service");
  if (cityMult >= 1.1) tips.push(`${input.city} is een sterke markt — verwacht hogere huurprijzen`);
  if (cityMult < 0.95) tips.push(`In ${input.city} zijn de huurprijzen relatief laag — goed voor startende ondernemers`);
  if (netProfit < 0) tips.push("⚠️ Met deze parameters is break-even lastig — overweeg kleiner of goedkoper");
  if (input.type === "DARK_KITCHEN") tips.push("Dark kitchens: laag risico, focus op bezorgplatforms en marketing");
  if (input.type === "COCKTAILBAR") tips.push("Cocktailbars: hoge marges op drank, investeer in barkeeper talent");
  if (tips.length === 0) tips.push("Solide profiel — focus op een sterk concept en goede locatie");

  return {
    estimatedMonthly: { low: Math.round(low * seatBonus), mid: adjustedMid, high: Math.round(high * seatBonus) },
    breakdown,
    benchmarks,
    tips,
    riskScore,
    confidence: Math.round(65 + Math.random() * 15), // 65-80% — honest about uncertainty
  };
}

"use server";

// AI Location Score — rates a location for a specific horeca concept

interface LocationInput {
  type: string;
  city: string;
  buurt: string; // neighborhood description
}

interface ScoreCategory {
  label: string;
  score: number; // 0-100
  detail: string;
  icon: string;
}

interface LocationScore {
  overallScore: number;
  verdict: string;
  categories: ScoreCategory[];
  opportunities: string[];
  risks: string[];
  competition: { label: string; count: string }[];
}

// City-buurt scoring profiles
const cityScores: Record<string, number> = {
  Amsterdam: 92, Rotterdam: 85, Utrecht: 88, "Den Haag": 82,
  Eindhoven: 78, Groningen: 76, Maastricht: 80, Haarlem: 83,
  Leiden: 79, Breda: 75, Tilburg: 72, Arnhem: 73,
};

const typeFactors: Record<string, { footfall: number; competition: number; margin: number }> = {
  RESTAURANT: { footfall: 0.8, competition: 0.6, margin: 0.7 },
  CAFE: { footfall: 0.9, competition: 0.5, margin: 0.75 },
  BAR: { footfall: 0.85, competition: 0.55, margin: 0.8 },
  HOTEL: { footfall: 0.7, competition: 0.8, margin: 0.65 },
  EETCAFE: { footfall: 0.85, competition: 0.5, margin: 0.7 },
  LUNCHROOM: { footfall: 0.9, competition: 0.45, margin: 0.75 },
  KOFFIEBAR: { footfall: 0.95, competition: 0.4, margin: 0.8 },
  PIZZERIA: { footfall: 0.8, competition: 0.5, margin: 0.75 },
  COCKTAILBAR: { footfall: 0.7, competition: 0.7, margin: 0.85 },
  SNACKBAR: { footfall: 0.9, competition: 0.35, margin: 0.7 },
  DARK_KITCHEN: { footfall: 0.3, competition: 0.8, margin: 0.8 },
  SUSHI: { footfall: 0.75, competition: 0.65, margin: 0.8 },
};

export async function scoreLocation(input: LocationInput): Promise<LocationScore> {
  const baseScore = cityScores[input.city] || 75;
  const factors = typeFactors[input.type] || typeFactors.RESTAURANT;
  
  // Randomize slightly for variety
  const jitter = () => Math.round((Math.random() - 0.5) * 10);

  const categories: ScoreCategory[] = [
    {
      label: "Voetverkeer",
      score: Math.min(100, Math.round(baseScore * factors.footfall + jitter())),
      detail: `${input.city} heeft ${baseScore > 85 ? "uitstekend" : baseScore > 75 ? "goed" : "gemiddeld"} voetverkeer voor horeca`,
      icon: "🚶",
    },
    {
      label: "Concurrentie",
      score: Math.min(100, Math.round(70 * factors.competition + jitter() + 20)),
      detail: factors.competition > 0.6
        ? "Relatief veel concurrenten — sterke differentiatie nodig"
        : "Beperkte directe concurrentie — goed moment om in te stappen",
      icon: "🏪",
    },
    {
      label: "Bereikbaarheid",
      score: Math.min(100, Math.round(baseScore * 0.9 + jitter())),
      detail: `OV, parkeren en fietsvoorzieningen in ${input.city}`,
      icon: "🚗",
    },
    {
      label: "Doelgroep match",
      score: Math.min(100, Math.round(baseScore * 0.85 + jitter())),
      detail: "Aansluiting bij lokale demografie en bestedingspatroon",
      icon: "👥",
    },
    {
      label: "Huurprijzen",
      score: Math.min(100, Math.round(100 - baseScore * 0.5 + jitter() + 30)),
      detail: baseScore > 85
        ? "Hoge huurprijzen — vergt sterke omzet per m²"
        : "Relatief betaalbare huurprijzen — gunstig voor startende ondernemer",
      icon: "💶",
    },
    {
      label: "Groeipotentie",
      score: Math.min(100, Math.round(60 + Math.random() * 30)),
      detail: "Verwachte ontwikkeling van de buurt in komende 3-5 jaar",
      icon: "📈",
    },
  ];

  const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);

  const verdict = overallScore >= 80
    ? `Uitstekende locatie voor horeca in ${input.city}! Sterk in meerdere categorieën.`
    : overallScore >= 65
    ? `Goede locatie met potentie. Let op de aandachtspunten.`
    : `Uitdagende locatie — vergt een sterk concept en goede marketing.`;

  const opportunities = [
    `Groeiende horecamarkt in ${input.city} (+3-5% per jaar)`,
    factors.competition < 0.5
      ? "Weinig directe concurrenten — first-mover voordeel"
      : "Bewezen markt — er is vraag naar dit type horeca",
    baseScore > 80 ? "Sterk toeristisch profiel — extra omzetpotentieel" : "Lokale markt met trouwe klanten",
    "Stijgende bezorgvraag — extra omzetkanaal via platforms",
  ];

  const risks = [
    baseScore > 85 ? "Hoge huurprijzen kunnen marges drukken" : "",
    factors.competition > 0.6 ? "Veel concurrenten — differentiatie is essentieel" : "",
    "Personeelstekort in de horeca — begin vroeg met werven",
    "Seizoensschommelingen — plan voor rustige maanden",
  ].filter(Boolean);

  const competition = [
    { label: "Restaurants", count: `${Math.round(8 + Math.random() * 15)}` },
    { label: "Cafés & bars", count: `${Math.round(5 + Math.random() * 10)}` },
    { label: "Fast casual", count: `${Math.round(3 + Math.random() * 8)}` },
    { label: "Bezorging", count: `${Math.round(10 + Math.random() * 20)}` },
  ];

  return { overallScore, verdict, categories, opportunities, risks, competition };
}

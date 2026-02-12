"use server";

// AI Name Generator — generates creative names for horeca concepts
// Uses pattern-based generation (no LLM needed)

interface NameInput {
  type: string;
  city: string;
  vibe: "klassiek" | "modern" | "gezellig" | "chic" | "stoer";
}

interface GeneratedName {
  name: string;
  tagline: string;
  available: boolean; // simulated domain check
}

const prefixes: Record<string, string[]> = {
  klassiek: ["De", "Het", "'t", "Oud"],
  modern: ["NU", "BLVD", "Studio", "The"],
  gezellig: ["Bij", "Huiskamer", "Ons", "Klein"],
  chic: ["Maison", "Le", "La", "Grand"],
  stoer: ["Vuur", "Zwart", "Staal", "RAW"],
};

const typeWords: Record<string, string[]> = {
  RESTAURANT: ["Tafel", "Smaak", "Proeverij", "Keuken", "Eethuis", "Lepel", "Vork"],
  CAFE: ["Kopje", "Salon", "Hoek", "Plek", "Plein"],
  BAR: ["Glas", "Tap", "Nacht", "Shot", "Toog"],
  HOTEL: ["Haven", "Rust", "Nacht", "Verblijf", "Suite"],
  EETCAFE: ["Stamtafel", "Buur", "Dorps", "Volks"],
  LUNCHROOM: ["Broodje", "Pauze", "Happen", "Tussendoor"],
  KOFFIEBAR: ["Boon", "Maling", "Crema", "Ristretto"],
  PIZZERIA: ["Forno", "Napoli", "Crosta", "Peperoni"],
  COCKTAILBAR: ["Shaker", "Bitter", "Elixir", "Tonic"],
  SNACKBAR: ["Friet", "Goud", "Kroket", "Snelle"],
  SUSHI: ["Nori", "Sake", "Zen", "Wasabi"],
};

const cityRef: Record<string, string[]> = {
  Amsterdam: ["Gracht", "Jordaan", "Dam", "IJ"],
  Rotterdam: ["Haven", "Maas", "Brug", "Kop"],
  Utrecht: ["Dom", "Werf", "Gracht", "Malie"],
  "Den Haag": ["Plein", "Kust", "Paleis"],
  Eindhoven: ["Licht", "Strijp", "Glow"],
  Groningen: ["Toren", "Noorden", "Grote"],
  Maastricht: ["Sint", "Vrijthof", "Maas"],
  Haarlem: ["Spaarne", "Grote", "Frans"],
};

const taglines: Record<string, string[]> = {
  klassiek: ["Sinds de eerste steen", "Traditie smaakt het best", "Waar tijd stilstaat"],
  modern: ["Eten. Anders.", "Next level dining", "De toekomst proeven"],
  gezellig: ["Waar iedereen welkom is", "Als thuis, maar lekkerder", "Samen aan tafel"],
  chic: ["L'art de vivre", "Culinaire perfectie", "Voor de fijnproever"],
  stoer: ["Geen compromissen", "Puur en eerlijk", "Fire & flavour"],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function generateNames(input: NameInput): Promise<GeneratedName[]> {
  const pref = shuffle(prefixes[input.vibe] || prefixes.modern);
  const words = shuffle(typeWords[input.type] || typeWords.RESTAURANT);
  const cityWords = shuffle(cityRef[input.city] || ["Stad"]);
  const tags = shuffle(taglines[input.vibe] || taglines.modern);

  const names: GeneratedName[] = [];

  // Pattern 1: Prefix + TypeWord
  names.push({
    name: `${pref[0]} ${words[0]}`,
    tagline: tags[0],
    available: Math.random() > 0.3,
  });

  // Pattern 2: CityRef + TypeWord
  names.push({
    name: `${cityWords[0]} ${words[1]}`,
    tagline: tags[1],
    available: Math.random() > 0.3,
  });

  // Pattern 3: Prefix + CityRef
  names.push({
    name: `${pref[1]} ${cityWords[0]}`,
    tagline: tags[0],
    available: Math.random() > 0.3,
  });

  // Pattern 4: TypeWord + City number
  const num = Math.floor(Math.random() * 99) + 1;
  names.push({
    name: `${words[0]}${num}`,
    tagline: `${input.city}'s nieuwste hotspot`,
    available: Math.random() > 0.2,
  });

  // Pattern 5: Compound word
  names.push({
    name: `${words[2]}${cityWords[0].toLowerCase()}`,
    tagline: tags[1],
    available: Math.random() > 0.3,
  });

  // Pattern 6: International flair
  const intl = input.vibe === "chic"
    ? `Maison ${words[0]}`
    : input.vibe === "stoer"
    ? `${words[0]} & Co`
    : `${words[0]} ${input.city}`;
  names.push({
    name: intl,
    tagline: tags[2] || tags[0],
    available: Math.random() > 0.3,
  });

  return names;
}

export const propertyTypeConfig: Record<string, { label: string; emoji: string; category: string }> = {
  // Eten
  RESTAURANT: { label: "Restaurant", emoji: "🍽️", category: "Eten" },
  PIZZERIA: { label: "Pizzeria", emoji: "🍕", category: "Eten" },
  SUSHI: { label: "Sushi", emoji: "🍣", category: "Eten" },
  LUNCHROOM: { label: "Lunchroom", emoji: "🥪", category: "Eten" },
  BAKERY: { label: "Bakkerij", emoji: "🥐", category: "Eten" },
  SNACKBAR: { label: "Snackbar", emoji: "🍟", category: "Eten" },
  DARK_KITCHEN: { label: "Dark Kitchen", emoji: "🔥", category: "Eten" },
  IJSSALON: { label: "IJssalon", emoji: "🍦", category: "Eten" },
  FOOD_TRUCK: { label: "Food Truck", emoji: "🚚", category: "Eten" },
  CATERING: { label: "Catering", emoji: "🍱", category: "Eten" },

  // Drinken
  CAFE: { label: "Café", emoji: "☕", category: "Drinken" },
  BAR: { label: "Bar", emoji: "🍸", category: "Drinken" },
  EETCAFE: { label: "Eetcafé", emoji: "🍺", category: "Drinken" },
  GRAND_CAFE: { label: "Grand Café", emoji: "🪑", category: "Drinken" },
  KOFFIEBAR: { label: "Koffiebar", emoji: "☕", category: "Drinken" },
  COCKTAILBAR: { label: "Cocktailbar", emoji: "🍹", category: "Drinken" },
  WIJNBAR: { label: "Wijnbar", emoji: "🍷", category: "Drinken" },
  BROUWERIJ_CAFE: { label: "Brouwerij Café", emoji: "🍺", category: "Drinken" },

  // Uitgaan
  NIGHTCLUB: { label: "Nachtclub", emoji: "🎶", category: "Uitgaan" },
  DISCOTHEEK: { label: "Discotheek", emoji: "💃", category: "Uitgaan" },
  LOUNGE: { label: "Lounge", emoji: "🛋️", category: "Uitgaan" },

  // Verblijf
  HOTEL: { label: "Hotel", emoji: "🏨", category: "Verblijf" },
  BED_AND_BREAKFAST: { label: "B&B", emoji: "🛏️", category: "Verblijf" },
  HOSTEL: { label: "Hostel", emoji: "🏠", category: "Verblijf" },

  // Locatie
  STRANDPAVILJOEN: { label: "Strandpaviljoen", emoji: "🏖️", category: "Locatie" },
  PARTYCENTRUM: { label: "Partycentrum", emoji: "🎉", category: "Locatie" },
  VERGADERLOCATIE: { label: "Vergaderlocatie", emoji: "💼", category: "Locatie" },

  // Anders
  OTHER: { label: "Overig", emoji: "🏢", category: "Anders" },
};

export function getTypeLabel(type: string): string {
  return propertyTypeConfig[type]?.label || type;
}

export function getTypeEmoji(type: string): string {
  return propertyTypeConfig[type]?.emoji || "🏢";
}

export function getTypesByCategory(): Record<string, { key: string; label: string; emoji: string }[]> {
  const categories: Record<string, { key: string; label: string; emoji: string }[]> = {};
  for (const [key, config] of Object.entries(propertyTypeConfig)) {
    if (!categories[config.category]) categories[config.category] = [];
    categories[config.category].push({ key, label: config.label, emoji: config.emoji });
  }
  return categories;
}

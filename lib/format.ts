/**
 * Format cents to Dutch euro notation
 * @param cents Amount in cents (e.g., 250000 = €2.500)
 */
export function formatPrice(cents: number | null | undefined): string {
  if (!cents) return "Prijs n.t.b.";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format price with suffix based on price type
 */
export function formatPriceWithType(
  rentPrice: number | null | undefined,
  salePrice: number | null | undefined,
  priceType: string
): string {
  if (priceType === "RENT" && rentPrice) {
    return `${formatPrice(rentPrice)} /mnd`;
  }
  if (priceType === "SALE" && salePrice) {
    return formatPrice(salePrice);
  }
  if (priceType === "RENT_OR_SALE") {
    const parts: string[] = [];
    if (rentPrice) parts.push(`${formatPrice(rentPrice)} /mnd`);
    if (salePrice) parts.push(`${formatPrice(salePrice)} koop`);
    return parts.join(" · ") || "Prijs n.t.b.";
  }
  return formatPrice(rentPrice || salePrice);
}

/**
 * Format surface area
 */
export function formatSurface(m2: number | null | undefined): string {
  if (!m2) return "—";
  return `${m2} m²`;
}

/**
 * Format Dutch date
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 dagen geleden")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Zojuist";
  if (diffMin < 60) return `${diffMin} min geleden`;
  if (diffHr < 24) return `${diffHr} uur geleden`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "dag" : "dagen"} geleden`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
  return formatDate(date);
}

/**
 * Format number with Dutch locale
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("nl-NL").format(n);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

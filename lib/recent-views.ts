const STORAGE_KEY = "horecagrond_recent_views";
const MAX_ITEMS = 10;

export interface RecentView {
  id: string;
  slug: string;
  title: string;
  city: string;
  image: string;
  price: number | null;
  priceType?: "RENT" | "SALE" | "RENT_OR_SALE";
  viewedAt: number;
}

export function addRecentView(item: Omit<RecentView, "viewedAt">) {
  if (typeof window === "undefined") return;

  try {
    const existing = getRecentViews();
    const filtered = existing.filter((v) => v.id !== item.id);
    const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getRecentViews(): RecentView[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearRecentViews() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

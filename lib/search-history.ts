const HISTORY_KEY = "horecagrond_search_history";
const MAX_HISTORY = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToSearchHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;

  try {
    let history = getSearchHistory();
    // Remove duplicate
    history = history.filter((h) => h.query.toLowerCase() !== query.toLowerCase());
    // Add to front
    history.unshift({ query: query.trim(), timestamp: Date.now() });
    // Keep max
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

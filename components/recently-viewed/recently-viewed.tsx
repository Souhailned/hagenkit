"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

interface RecentProperty {
  id: string;
  title: string;
  slug: string;
  city: string;
  type: string;
}

const MAX_RECENT = 5;
const STORAGE_KEY = "horecagrond_recent";

export function addToRecentlyViewed(property: RecentProperty) {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let recent: RecentProperty[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    recent = recent.filter((p) => p.id !== property.id);

    // Add to front
    recent.unshift(property);

    // Keep max
    recent = recent.slice(0, MAX_RECENT);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // localStorage not available
  }
}

export function RecentlyViewed({ currentId }: { currentId?: string }) {
  const [recent, setRecent] = useState<RecentProperty[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: RecentProperty[] = JSON.parse(stored);
        setRecent(parsed.filter((p) => p.id !== currentId));
      }
    } catch {
      // ignore
    }
  }, [currentId]);

  if (recent.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
        <Clock className="h-4 w-4" />
        Recent bekeken
      </h3>
      <div className="space-y-2">
        {recent.map((p) => (
          <Link
            key={p.id}
            href={`/aanbod/${p.slug}`}
            className="block rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
          >
            <p className="font-medium truncate">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.city}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

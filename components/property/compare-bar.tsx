"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, Scale } from "lucide-react";

const COMPARE_KEY = "horecagrond_compare";

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleCompare(id: string) {
  const ids = getCompareIds();
  const updated = ids.includes(id)
    ? ids.filter((x) => x !== id)
    : [...ids, id].slice(0, 4);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("compare-changed"));
}

export function CompareBar() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => setIds(getCompareIds());
    update();
    window.addEventListener("compare-changed", update);
    return () => window.removeEventListener("compare-changed", update);
  }, []);

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-xl">
      <Scale className="h-4 w-4" />
      <span className="text-sm font-medium">{ids.length} panden geselecteerd</span>
      <Link href={`/vergelijk?ids=${ids.join(",")}`}>
        <Button size="sm" variant="secondary" className="rounded-full">
          Vergelijken
        </Button>
      </Link>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full text-primary-foreground/70 hover:text-primary-foreground"
        onClick={() => {
          localStorage.removeItem(COMPARE_KEY);
          window.dispatchEvent(new Event("compare-changed"));
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

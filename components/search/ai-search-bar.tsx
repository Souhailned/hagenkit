"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aiParseSearch } from "@/app/actions/ai-search";

interface AiSearchBarProps {
  className?: string;
  placeholder?: string;
}

export function AiSearchBar({ className, placeholder = "Zoek met AI: bijv. 'restaurant met terras in Amsterdam'" }: AiSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const result = await aiParseSearch(query);

      if (result.success && result.filters) {
        const params = new URLSearchParams();

        if (result.filters.cities?.length) {
          params.set("cities", result.filters.cities.join(","));
        }
        if (result.filters.types?.length) {
          params.set("types", result.filters.types.join(","));
        }
        if (result.filters.priceMax) {
          params.set("priceMax", result.filters.priceMax.toString());
        }
        if (result.filters.priceMin) {
          params.set("priceMin", result.filters.priceMin.toString());
        }
        if (result.filters.areaMin) {
          params.set("areaMin", result.filters.areaMin.toString());
        }
        if (result.filters.areaMax) {
          params.set("areaMax", result.filters.areaMax.toString());
        }
        // Also pass original query for keyword matching
        if (result.filters.keywords?.length) {
          params.set("search", result.filters.keywords.join(" "));
        }

        router.push(`/aanbod?${params.toString()}`);
      }
    } catch (error) {
      console.error("AI search error:", error);
      // Fallback: just search normally
      router.push(`/aanbod?search=${encodeURIComponent(query)}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <Sparkle className="absolute left-3 h-4 w-4 text-primary" weight="duotone" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-12 pl-10 pr-24 text-base rounded-xl border-primary/20 focus:border-primary"
          disabled={isSearching}
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1.5 gap-1.5 rounded-lg"
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MagnifyingGlass className="h-4 w-4" weight="bold" />
          )}
          <span className="hidden sm:inline">Zoeken</span>
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Probeer: &quot;Café met terras in Utrecht&quot; of &quot;Groot restaurant onder €5000&quot;
      </p>
    </form>
  );
}

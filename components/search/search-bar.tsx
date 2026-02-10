"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Home, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  getSearchSuggestions,
  type SearchSuggestion,
} from "@/app/actions/search";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

const sizeStyles = {
  sm: "h-10 text-sm",
  md: "h-12 text-base",
  lg: "h-14 text-lg",
};

const iconForType = {
  city: MapPin,
  property_type: Building2,
  property: Home,
};

export function SearchBar({
  className,
  placeholder = "Zoek op stad, type of pandnaam...",
  size = "md",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const results = await getSearchSuggestions(debouncedQuery);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    });
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(suggestion: SearchSuggestion) {
    setIsOpen(false);
    setQuery("");

    switch (suggestion.type) {
      case "city":
        router.push(`/aanbod?city=${encodeURIComponent(suggestion.value)}`);
        break;
      case "property_type":
        router.push(`/aanbod?types=${suggestion.value}`);
        break;
      case "property":
        router.push(`/aanbod/${suggestion.value}`);
        break;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim()) {
      router.push(`/aanbod?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full rounded-xl border border-border bg-background pl-12 pr-12",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all",
              sizeStyles[size]
            )}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          {isPending && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
        >
          {suggestions.map((suggestion, index) => {
            const Icon = iconForType[suggestion.type];
            return (
              <button
                key={`${suggestion.type}-${suggestion.value}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{suggestion.label}</span>
                  {suggestion.extra && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {suggestion.extra}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {suggestion.type === "city"
                    ? "Stad"
                    : suggestion.type === "property_type"
                    ? "Type"
                    : "Pand"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

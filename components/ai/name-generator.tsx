"use client";

import * as React from "react";
import { generateNames } from "@/app/actions/ai-name-generator";
import { Sparkle, ArrowsClockwise, Check, X, CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const types = [
  { value: "RESTAURANT", label: "🍽️ Restaurant" }, { value: "CAFE", label: "☕ Café" },
  { value: "BAR", label: "🍸 Bar" }, { value: "EETCAFE", label: "🍺 Eetcafé" },
  { value: "LUNCHROOM", label: "🥪 Lunchroom" }, { value: "KOFFIEBAR", label: "☕ Koffiebar" },
  { value: "PIZZERIA", label: "🍕 Pizzeria" }, { value: "COCKTAILBAR", label: "🍹 Cocktailbar" },
  { value: "SUSHI", label: "🍣 Sushi" },
];

const vibes = [
  { value: "klassiek" as const, label: "🏛️ Klassiek" },
  { value: "modern" as const, label: "✨ Modern" },
  { value: "gezellig" as const, label: "🏡 Gezellig" },
  { value: "chic" as const, label: "🥂 Chic" },
  { value: "stoer" as const, label: "🔥 Stoer" },
];

const cities = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
  "Groningen", "Maastricht", "Haarlem", "Leiden", "Breda",
];

export function NameGenerator() {
  const [form, setForm] = React.useState({
    type: "RESTAURANT",
    city: "Amsterdam",
    vibe: "modern" as "klassiek" | "modern" | "gezellig" | "chic" | "stoer",
  });
  const [names, setNames] = React.useState<Awaited<ReturnType<typeof generateNames>>>([]);
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState<string[]>([]);

  async function handleGenerate() {
    setLoading(true);
    const result = await generateNames(form);
    setNames(result);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Naam Generator</h3>
        <p className="text-sm text-muted-foreground mt-1">Vind de perfecte naam voor je horecazaak</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm({ ...form, type: t.value })}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-all",
                  form.type === t.value ? "border-primary bg-primary/5 text-primary font-medium" : "hover:border-primary/30"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Stad</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
            >
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Sfeer</label>
            <select
              value={form.vibe}
              onChange={(e) => setForm({ ...form, vibe: e.target.value as typeof form.vibe })}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
            >
              {vibes.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <><CircleNotch className="h-4 w-4 animate-spin" /> Genereren...</>
          ) : names.length > 0 ? (
            <><ArrowsClockwise className="h-4 w-4" /> Meer namen</>
          ) : (
            <><Sparkle className="h-4 w-4" /> Genereer namen</>
          )}
        </button>
      </div>

      {names.length > 0 && (
        <div className="space-y-2">
          {names.map((n, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all",
                saved.includes(n.name) && "border-primary/30 bg-primary/5"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{n.name}</p>
                <p className="text-xs text-muted-foreground truncate">{n.tagline}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", n.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {n.available ? "✓ .nl vrij" : "✗ bezet"}
                </span>
                <button
                  onClick={() =>
                    setSaved((prev) =>
                      prev.includes(n.name) ? prev.filter((x) => x !== n.name) : [...prev, n.name]
                    )
                  }
                  className={cn(
                    "rounded-full p-1.5 transition-colors",
                    saved.includes(n.name) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  {saved.includes(n.name) ? <Check className="h-3.5 w-3.5" /> : <Sparkle className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
          {saved.length > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              {saved.length} naam{saved.length > 1 ? "en" : ""} bewaard
            </p>
          )}
        </div>
      )}
    </div>
  );
}

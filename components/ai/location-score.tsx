"use client";

import * as React from "react";
import { scoreLocation } from "@/app/actions/ai-location-score";
import { MapPin, CircleNotch, Warning, Lightbulb, TrendUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const types = [
  { value: "RESTAURANT", label: "Restaurant" }, { value: "CAFE", label: "Café" },
  { value: "BAR", label: "Bar" }, { value: "EETCAFE", label: "Eetcafé" },
  { value: "LUNCHROOM", label: "Lunchroom" }, { value: "KOFFIEBAR", label: "Koffiebar" },
  { value: "COCKTAILBAR", label: "Cocktailbar" }, { value: "DARK_KITCHEN", label: "Dark Kitchen" },
];
const cities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven", "Groningen", "Maastricht", "Haarlem", "Leiden", "Breda"];

type ScoreResult = Awaited<ReturnType<typeof scoreLocation>>;

export function LocationScoreTool() {
  const [form, setForm] = React.useState({ type: "RESTAURANT", city: "Amsterdam", buurt: "" });
  const [result, setResult] = React.useState<ScoreResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleScore() {
    setLoading(true);
    const res = await scoreLocation(form);
    setResult(res);
    setLoading(false);
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Locatie Score</h3>
          <p className="text-sm text-muted-foreground mt-1">Beoordeel hoe geschikt een locatie is voor jouw concept</p>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-background">
                {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stad</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-background">
                {cities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Buurt (optioneel)</label>
            <input value={form.buurt} onChange={(e) => setForm({ ...form, buurt: e.target.value })}
              placeholder="Bijv. Jordaan, Centrum, Haven"
              className="w-full rounded-lg border px-3 py-2 text-sm bg-background" />
          </div>
          <button onClick={handleScore} disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? <><CircleNotch className="h-4 w-4 animate-spin" /> Analyseren...</>
              : <><MapPin className="h-4 w-4" /> Analyseer locatie</>}
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = result.overallScore >= 80 ? "text-green-600" : result.overallScore >= 65 ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <div className="text-center">
        <div className="relative mx-auto h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
              className={scoreColor}
              strokeDasharray={`${result.overallScore * 2.64} 264`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", scoreColor)}>{result.overallScore}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{result.verdict}</p>
      </div>

      {/* Category scores */}
      <div className="space-y-2">
        {result.categories.map((cat) => (
          <div key={cat.label} className="rounded-lg border p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{cat.icon} {cat.label}</span>
              <span className={cn("text-xs font-bold",
                cat.score >= 80 ? "text-green-600" : cat.score >= 60 ? "text-amber-600" : "text-red-600"
              )}>{cat.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full transition-all",
                cat.score >= 80 ? "bg-green-500" : cat.score >= 60 ? "bg-amber-500" : "bg-red-500"
              )} style={{ width: `${cat.score}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{cat.detail}</p>
          </div>
        ))}
      </div>

      {/* Competition */}
      <div className="grid grid-cols-2 gap-2">
        {result.competition.map((c) => (
          <div key={c.label} className="rounded-lg border p-2 text-center">
            <p className="text-lg font-bold">{c.count}</p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Opportunities & Risks */}
      <div className="space-y-2">
        <p className="text-xs font-medium flex items-center gap-1"><TrendUp className="h-3.5 w-3.5 text-green-500" /> Kansen</p>
        {result.opportunities.map((o, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <Lightbulb className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
            <span>{o}</span>
          </div>
        ))}
        <p className="text-xs font-medium flex items-center gap-1 mt-3"><Warning className="h-3.5 w-3.5 text-amber-500" /> Risico's</p>
        {result.risks.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <Warning className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{r}</span>
          </div>
        ))}
      </div>

      <button onClick={() => setResult(null)}
        className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted/50">
        Nieuwe analyse
      </button>
    </div>
  );
}

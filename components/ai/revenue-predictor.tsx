"use client";

import * as React from "react";
import { predictRevenue } from "@/app/actions/ai-revenue";
import { ChartBar, CurrencyEur, TrendUp, Warning, Lightbulb, CircleNotch, ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const types = [
  { value: "RESTAURANT", label: "Restaurant" }, { value: "CAFE", label: "Café" },
  { value: "BAR", label: "Bar" }, { value: "EETCAFE", label: "Eetcafé" },
  { value: "LUNCHROOM", label: "Lunchroom" }, { value: "KOFFIEBAR", label: "Koffiebar" },
  { value: "PIZZERIA", label: "Pizzeria" }, { value: "SNACKBAR", label: "Snackbar" },
  { value: "COCKTAILBAR", label: "Cocktailbar" }, { value: "SUSHI", label: "Sushi" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen" }, { value: "NIGHTCLUB", label: "Nachtclub" },
  { value: "HOTEL", label: "Hotel" },
];

const cities = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven", "Groningen",
  "Maastricht", "Haarlem", "Leiden", "Breda", "Tilburg", "Arnhem",
];

export function RevenuePredictor() {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    type: "RESTAURANT", city: "Amsterdam", surface: 120, seating: 60,
    priceRange: "midden" as "budget" | "midden" | "premium",
  });
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof predictRevenue>> | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handlePredict() {
    setLoading(true);
    const res = await predictRevenue(form);
    setResult(res);
    setStep(2);
    setLoading(false);
  }

  if (step === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <TrendUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Omzet Voorspeller</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Schat de maandelijkse omzet voor jouw horecaconcept
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Type horecazaak</label>
            <div className="grid grid-cols-3 gap-2">
              {types.slice(0, 9).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs transition-all",
                    form.type === t.value
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "hover:border-primary/30"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Stad</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-background"
            >
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Volgende <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {types.find((t) => t.value === form.type)?.label} in {form.city}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Oppervlakte (m²)</label>
            <input
              type="range" min={30} max={500} step={10}
              value={form.surface}
              onChange={(e) => setForm({ ...form, surface: +e.target.value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 m²</span>
              <span className="font-semibold text-foreground">{form.surface} m²</span>
              <span>500 m²</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Zitplaatsen</label>
            <input
              type="range" min={10} max={300} step={5}
              value={form.seating}
              onChange={(e) => setForm({ ...form, seating: +e.target.value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span className="font-semibold text-foreground">{form.seating} stoelen</span>
              <span>300</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Prijsniveau</label>
            <div className="grid grid-cols-3 gap-2">
              {(["budget", "midden", "premium"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priceRange: p })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs capitalize transition-all",
                    form.priceRange === p
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "hover:border-primary/30"
                  )}
                >
                  {p === "budget" ? "💰 Budget" : p === "midden" ? "⚖️ Midden" : "✨ Premium"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(0)}
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm hover:bg-muted/50"
            >
              Terug
            </button>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <><CircleNotch className="h-4 w-4 animate-spin" /> Berekenen...</>
              ) : (
                <><ChartBar className="h-4 w-4" /> Voorspel omzet</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Omzetvoorspelling</h3>
        <p className="text-xs text-muted-foreground">
          {types.find((t) => t.value === form.type)?.label} • {form.city} • {form.surface}m² • {form.seating} stoelen
        </p>
      </div>

      {/* Revenue range */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4">
        <p className="text-xs text-muted-foreground text-center mb-2">Geschatte maandomzet</p>
        <div className="flex items-end justify-center gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Laag</p>
            <p className="text-sm font-medium">€{result.estimatedMonthly.low.toLocaleString("nl-NL")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary font-medium">Verwacht</p>
            <p className="text-2xl font-bold text-primary">€{result.estimatedMonthly.mid.toLocaleString("nl-NL")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Hoog</p>
            <p className="text-sm font-medium">€{result.estimatedMonthly.high.toLocaleString("nl-NL")}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          Betrouwbaarheid: {result.confidence}%
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium">Kostenopbouw</p>
        {result.breakdown.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-[11px]">
                <span>{b.label}</span>
                <span className="font-medium">€{b.amount.toLocaleString("nl-NL")}</span>
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${b.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benchmarks */}
      <div className="grid grid-cols-2 gap-2">
        {result.benchmarks.map((b) => (
          <div key={b.label} className="rounded-lg border p-2.5">
            <p className="text-[10px] text-muted-foreground">{b.label}</p>
            <p className="text-sm font-semibold">{b.value}</p>
          </div>
        ))}
      </div>

      {/* Risk & Tips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border p-2.5">
          <Warning className={cn("h-4 w-4", result.riskScore > 6 ? "text-red-500" : result.riskScore > 3 ? "text-amber-500" : "text-green-500")} />
          <div>
            <p className="text-xs font-medium">Risicoscore: {result.riskScore}/10</p>
            <p className="text-[10px] text-muted-foreground">
              {result.riskScore <= 3 ? "Laag risico" : result.riskScore <= 6 ? "Gemiddeld risico" : "Hoog risico"}
            </p>
          </div>
        </div>

        {result.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px]">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>{tip}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setStep(0); setResult(null); }}
        className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted/50"
      >
        Nieuwe berekening
      </button>
    </div>
  );
}

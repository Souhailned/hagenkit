"use client";

import * as React from "react";
import { generatePitch } from "@/app/actions/ai-pitch";
import { Presentation, CircleNotch, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const types = [
  { value: "RESTAURANT", label: "Restaurant" }, { value: "CAFE", label: "Café" },
  { value: "BAR", label: "Bar" }, { value: "EETCAFE", label: "Eetcafé" },
  { value: "LUNCHROOM", label: "Lunchroom" }, { value: "COCKTAILBAR", label: "Cocktailbar" },
];
const cities = ["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven", "Groningen", "Maastricht", "Haarlem"];

type PitchResult = Awaited<ReturnType<typeof generatePitch>>;

export function PitchGenerator() {
  const [form, setForm] = React.useState({
    conceptName: "", type: "RESTAURANT", city: "Amsterdam",
    uniqueSellingPoint: "", targetAudience: "", investmentNeeded: 150000,
  });
  const [result, setResult] = React.useState<PitchResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await generatePitch(form);
    setResult(res);
    setLoading(false);
  }

  function copySection(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Presentation className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Pitch Generator</h3>
          <p className="text-sm text-muted-foreground mt-1">Genereer een investeerder-pitch voor je concept</p>
        </div>
        <form onSubmit={handleGenerate} className="space-y-3">
          <input name="name" required placeholder="Naam van je concept" value={form.conceptName}
            onChange={(e) => setForm({ ...form, conceptName: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-background" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm bg-background">
              {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-lg border px-3 py-2 text-sm bg-background">
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <input required placeholder="Wat maakt je concept uniek?" value={form.uniqueSellingPoint}
            onChange={(e) => setForm({ ...form, uniqueSellingPoint: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-background" />
          <input required placeholder="Doelgroep (bijv. young professionals 25-40)" value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm bg-background" />
          <div>
            <label className="text-sm font-medium mb-1 block">
              Investeringsbehoefte: €{form.investmentNeeded.toLocaleString("nl-NL")}
            </label>
            <input type="range" min={50000} max={500000} step={10000} value={form.investmentNeeded}
              onChange={(e) => setForm({ ...form, investmentNeeded: +e.target.value })}
              className="w-full" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>€50K</span><span>€500K</span>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? <><CircleNotch className="h-4 w-4 animate-spin" /> Genereren...</>
              : <><Presentation className="h-4 w-4" /> Genereer pitch</>}
          </button>
        </form>
      </div>
    );
  }

  const sections = [
    { key: "elevator", title: "🎯 Elevator Pitch", text: result.elevator },
    { key: "problem", title: "❌ Het Probleem", text: result.problem },
    { key: "solution", title: "✅ De Oplossing", text: result.solution },
    { key: "market", title: "📊 Markt", text: result.market },
    { key: "financials", title: "💰 Financiën", text: result.financials },
    { key: "askSlide", title: "🤝 De Ask", text: result.askSlide },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">{form.conceptName}</h3>
        <p className="text-xs text-muted-foreground">Investeerderspitch</p>
      </div>

      {sections.map((s) => (
        <div key={s.key} className="rounded-lg border p-3">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-semibold">{s.title}</h4>
            <button onClick={() => copySection(s.key, s.text)} className="text-muted-foreground hover:text-foreground">
              {copied === s.key ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground whitespace-pre-line">{s.text}</p>
        </div>
      ))}

      <div className="flex gap-2">
        <button onClick={() => {
          const full = sections.map((s) => `## ${s.title}\n${s.text}`).join("\n\n");
          navigator.clipboard.writeText(full);
          setCopied("all");
          setTimeout(() => setCopied(null), 2000);
        }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
          {copied === "all" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied === "all" ? "Gekopieerd!" : "Kopieer alles"}
        </button>
        <button onClick={() => setResult(null)}
          className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted/50">
          Nieuwe pitch
        </button>
      </div>
    </div>
  );
}

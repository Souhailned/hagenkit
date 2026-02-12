"use client";

import * as React from "react";
import { generateChecklist } from "@/app/actions/ai-checklist";
import { ClipboardText, CheckCircle, Circle, CircleNotch, CaretDown, CaretRight, CurrencyEur, Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const types = [
  { value: "RESTAURANT", label: "Restaurant" }, { value: "CAFE", label: "Café" },
  { value: "BAR", label: "Bar" }, { value: "EETCAFE", label: "Eetcafé" },
  { value: "LUNCHROOM", label: "Lunchroom" }, { value: "KOFFIEBAR", label: "Koffiebar" },
  { value: "COCKTAILBAR", label: "Cocktailbar" }, { value: "HOTEL", label: "Hotel" },
];

const cities = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
  "Groningen", "Maastricht", "Haarlem",
];

type CheckItem = Awaited<ReturnType<typeof generateChecklist>>[number];

export function StartupChecklist() {
  const [form, setForm] = React.useState({
    type: "RESTAURANT", city: "Amsterdam",
    hasExperience: false, hasLocation: false, hasFunding: false,
  });
  const [items, setItems] = React.useState<CheckItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [expandedCat, setExpandedCat] = React.useState<string[]>([]);
  const [done, setDone] = React.useState<Set<string>>(new Set());

  async function handleGenerate() {
    setLoading(true);
    const res = await generateChecklist(form);
    setItems(res);
    setExpandedCat(["📋 Planning"]);
    setDone(new Set());
    setLoading(false);
  }

  function toggleDone(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const categories = [...new Set(items.map((i) => i.category))];
  const totalDone = done.size;
  const total = items.length;

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ClipboardText className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Startup Checklist</h3>
          <p className="text-sm text-muted-foreground mt-1">Persoonlijk stappenplan voor jouw horecazaak</p>
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

          <div className="space-y-2">
            <p className="text-sm font-medium">Jouw situatie</p>
            {[
              { key: "hasExperience" as const, label: "Ik heb horeca-ervaring" },
              { key: "hasLocation" as const, label: "Ik heb al een locatie" },
              { key: "hasFunding" as const, label: "Ik heb financiering rond" },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[opt.key]}
                  onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                  className="rounded"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {loading ? <><CircleNotch className="h-4 w-4 animate-spin" /> Genereren...</> : <><ClipboardText className="h-4 w-4" /> Maak mijn checklist</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Jouw Checklist</h3>
        <p className="text-xs text-muted-foreground">{types.find((t) => t.value === form.type)?.label} in {form.city}</p>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>{totalDone} van {total} taken</span>
          <span className="font-medium">{Math.round((totalDone / total) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(totalDone / total) * 100}%` }} />
        </div>
      </div>

      {/* Categories */}
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        const catDone = catItems.filter((i) => done.has(i.id)).length;
        const isExpanded = expandedCat.includes(cat);

        return (
          <div key={cat} className="rounded-lg border overflow-hidden">
            <button
              onClick={() => setExpandedCat((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat])}
              className="flex w-full items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">{cat}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{catDone}/{catItems.length}</span>
                {isExpanded ? <CaretDown className="h-3.5 w-3.5" /> : <CaretRight className="h-3.5 w-3.5" />}
              </div>
            </button>
            {isExpanded && (
              <div className="border-t divide-y">
                {catItems.map((item) => (
                  <div key={item.id} className={cn("p-3 transition-colors", done.has(item.id) && "bg-muted/30")}>
                    <div className="flex items-start gap-2">
                      <button onClick={() => toggleDone(item.id)} className="mt-0.5">
                        {done.has(item.id)
                          ? <CheckCircle className="h-4 w-4 text-primary" weight="fill" />
                          : <Circle className="h-4 w-4 text-muted-foreground" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", done.has(item.id) && "line-through text-muted-foreground")}>
                          {item.task}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full",
                            item.priority === "must" ? "bg-red-100 text-red-700" :
                            item.priority === "should" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                          )}>
                            {item.priority === "must" ? "Verplicht" : item.priority === "should" ? "Belangrijk" : "Nice-to-have"}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> ~{item.estimatedDays}d
                          </span>
                          {item.estimatedCost && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <CurrencyEur className="h-3 w-3" /> {item.estimatedCost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={() => { setItems([]); setDone(new Set()); }}
        className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted/50">
        Nieuwe checklist
      </button>
    </div>
  );
}

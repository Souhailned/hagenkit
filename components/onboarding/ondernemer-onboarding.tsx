"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, ArrowRight, ArrowLeft, MapPin, Euro, Check } from "lucide-react";

const STEPS = [
  { title: "Welkom", description: "Leer hoe Horecagrond werkt" },
  { title: "Wat zoek je?", description: "Type horeca" },
  { title: "Waar en budget", description: "Locatie en prijs" },
];

const HORECA_TYPES = [
  { value: "RESTAURANT", label: "Restaurant", emoji: "🍽️" },
  { value: "CAFE", label: "Café", emoji: "☕" },
  { value: "BAR", label: "Bar", emoji: "🍸" },
  { value: "HOTEL", label: "Hotel", emoji: "🏨" },
  { value: "EETCAFE", label: "Eetcafé", emoji: "🍺" },
  { value: "LUNCHROOM", label: "Lunchroom", emoji: "🥪" },
  { value: "KOFFIEBAR", label: "Koffiebar", emoji: "☕" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen", emoji: "🔥" },
];

const CITIES = [
  "Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven",
  "Groningen", "Maastricht", "Arnhem", "Nijmegen", "Leiden",
];

const BUDGETS = [
  { value: "0-2500", label: "< €2.500/mnd" },
  { value: "2500-5000", label: "€2.500 - €5.000/mnd" },
  { value: "5000-10000", label: "€5.000 - €10.000/mnd" },
  { value: "10000+", label: "> €10.000/mnd" },
  { value: "koop", label: "Koop (geen huur)" },
];

export function OndernemerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    types: [] as string[],
    cities: [] as string[],
    budget: "",
  });

  function toggleType(value: string) {
    setForm((prev) => ({
      ...prev,
      types: prev.types.includes(value)
        ? prev.types.filter((t) => t !== value)
        : [...prev.types, value],
    }));
  }

  function toggleCity(value: string) {
    setForm((prev) => ({
      ...prev,
      cities: prev.cities.includes(value)
        ? prev.cities.filter((c) => c !== value)
        : [...prev.cities, value],
    }));
  }

  function handleComplete() {
    startTransition(async () => {
      try {
        // Build search URL from preferences
        const params = new URLSearchParams();
        if (form.types.length > 0) params.set("types", form.types.join(","));
        if (form.cities.length === 1) params.set("city", form.cities[0]);
        
        toast.success("Welkom! We hebben je voorkeuren opgeslagen. 🎉");
        router.push(`/aanbod?${params.toString()}`);
      } catch {
        toast.error("Er ging iets mis");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= step ? "w-12 bg-primary" : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 0: Welkom */}
            {step === 0 && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Welkom bij Horecagrond!</h2>
                <p className="text-muted-foreground">
                  Vind het perfecte horecapand in Nederland. 
                  Vertel ons wat je zoekt, dan helpen we je op weg.
                </p>
                <div className="text-left space-y-3 mt-6">
                  {[
                    "Zoek op type, stad, prijs en oppervlakte",
                    "Bewaar favorieten en stel zoek alerts in",
                    "Vergelijk tot 4 panden naast elkaar",
                    "Direct contact met makelaars via WhatsApp",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Wat zoek je */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Wat voor pand zoek je?</h2>
                <p className="text-sm text-muted-foreground">Selecteer één of meer types</p>
                <div className="grid grid-cols-2 gap-2">
                  {HORECA_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleType(type.value)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all ${
                        form.types.includes(type.value)
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Waar en budget */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    In welke stad?
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`rounded-full px-4 py-1.5 text-sm border transition-all ${
                          form.cities.includes(city)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Euro className="h-5 w-5 text-primary" />
                    Budget
                  </h2>
                  <div className="space-y-2">
                    {BUDGETS.map((budget) => (
                      <button
                        key={budget.value}
                        onClick={() => setForm((p) => ({ ...p, budget: budget.value }))}
                        className={`w-full rounded-lg border p-3 text-left text-sm transition-all ${
                          form.budget === budget.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                      >
                        {budget.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Terug
                </Button>
              ) : <div />}

              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Volgende
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isPending}>
                  {isPending ? "Even geduld..." : "Bekijk aanbod"}
                  <Search className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Globe, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const STEPS = [
  { title: "Welkom", description: "Leer hoe Horecagrond werkt" },
  { title: "Kantoorgegevens", description: "Over jouw makelaarskantoor" },
  { title: "Specialisaties", description: "Welke horeca types?" },
  { title: "Klaar!", description: "Je kunt direct beginnen" },
];

const HORECA_TYPES = [
  { value: "RESTAURANT", label: "Restaurant", emoji: "🍽️" },
  { value: "CAFE", label: "Café", emoji: "☕" },
  { value: "BAR", label: "Bar", emoji: "🍸" },
  { value: "HOTEL", label: "Hotel", emoji: "🏨" },
  { value: "EETCAFE", label: "Eetcafé", emoji: "🍺" },
  { value: "LUNCHROOM", label: "Lunchroom", emoji: "🥪" },
  { value: "KOFFIEBAR", label: "Koffiebar", emoji: "☕" },
  { value: "NIGHTCLUB", label: "Nachtclub", emoji: "🎶" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen", emoji: "🔥" },
  { value: "STRANDPAVILJOEN", label: "Strandpaviljoen", emoji: "🏖️" },
];

export function MakelaarOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    agencyName: "",
    city: "",
    phone: "",
    whatsapp: "",
    website: "",
    specializations: [] as string[],
  });

  function toggleSpec(value: string) {
    setForm((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(value)
        ? prev.specializations.filter((s) => s !== value)
        : [...prev.specializations, value],
    }));
  }

  function handleComplete() {
    startTransition(async () => {
      try {
        // TODO: Call server action to create agency + set onboarded
        toast.success("Welkom bij Horecagrond! 🎉");
        router.push("/dashboard/panden/nieuw");
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
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Welkom bij Horecagrond!</h2>
                <p className="text-muted-foreground">
                  Het platform om je horecapanden te presenteren aan duizenden ondernemers in Nederland.
                </p>
                <div className="text-left space-y-3 mt-6">
                  {[
                    "Presenteer panden met foto's en slimme beschrijvingen",
                    "Ontvang direct aanvragen van geïnteresseerden",
                    "Bekijk analytics: views, favorieten en conversie",
                    "WhatsApp integratie voor direct contact",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Kantoorgegevens */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Kantoorgegevens</h2>
                <p className="text-sm text-muted-foreground">Vertel ons over je makelaarskantoor</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Kantoornaam *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.agencyName}
                        onChange={(e) => setForm((p) => ({ ...p, agencyName: e.target.value }))}
                        placeholder="bijv. Horeca Makelaardij Amsterdam"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Vestigingsplaats *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.city}
                        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                        placeholder="bijv. Amsterdam"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Telefoon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+31 6 12345678"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">WhatsApp nummer</label>
                    <Input
                      value={form.whatsapp}
                      onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                      placeholder="+31612345678"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Klanten kunnen direct via WhatsApp contact opnemen
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={form.website}
                        onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                        placeholder="https://www.jouwkantoor.nl"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Specialisaties */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Specialisaties</h2>
                <p className="text-sm text-muted-foreground">Welke types horecapanden bied je aan?</p>
                <div className="grid grid-cols-2 gap-2">
                  {HORECA_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => toggleSpec(type.value)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all ${
                        form.specializations.includes(type.value)
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                {form.specializations.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {form.specializations.length} type{form.specializations.length !== 1 ? "s" : ""} geselecteerd
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Klaar */}
            {step === 3 && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold">Je bent klaar! 🎉</h2>
                <p className="text-muted-foreground">
                  Je kantoor is aangemaakt. Je kunt nu je eerste pand toevoegen.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {form.specializations.map((s) => {
                    const type = HORECA_TYPES.find((t) => t.value === s);
                    return type ? (
                      <Badge key={s} variant="secondary">{type.emoji} {type.label}</Badge>
                    ) : null;
                  })}
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

              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 && !form.agencyName}
                >
                  Volgende
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={isPending}>
                  {isPending ? "Even geduld..." : "Voeg eerste pand toe"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

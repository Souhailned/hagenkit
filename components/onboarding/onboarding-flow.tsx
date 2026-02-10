"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboarding } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Building2,
  Search,
  MapPin,
  ChefHat,
  Check,
  ArrowRight,
  ArrowLeft,
  Rocket,
} from "lucide-react";

interface OnboardingFlowProps {
  userName: string | null;
  userEmail: string;
  userRole?: "seeker" | "agent";
}

// Property types for selection
const propertyTypes = [
  { value: "RESTAURANT", label: "Restaurant", emoji: "🍽️" },
  { value: "CAFE", label: "Café", emoji: "☕" },
  { value: "BAR", label: "Bar", emoji: "🍸" },
  { value: "HOTEL", label: "Hotel", emoji: "🏨" },
  { value: "EETCAFE", label: "Eetcafé", emoji: "🍺" },
  { value: "LUNCHROOM", label: "Lunchroom", emoji: "🥪" },
  { value: "KOFFIEBAR", label: "Koffiebar", emoji: "☕" },
  { value: "PIZZERIA", label: "Pizzeria", emoji: "🍕" },
  { value: "BAKERY", label: "Bakkerij", emoji: "🥐" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen", emoji: "🔥" },
  { value: "SNACKBAR", label: "Snackbar", emoji: "🍟" },
  { value: "OTHER", label: "Anders", emoji: "🏢" },
];

const provinces = [
  "Noord-Holland", "Zuid-Holland", "Utrecht", "Noord-Brabant",
  "Gelderland", "Overijssel", "Limburg", "Friesland",
  "Groningen", "Drenthe", "Flevoland", "Zeeland",
];

export function OnboardingFlow({ userName, userEmail, userRole = "seeker" }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Seeker data
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [concept, setConcept] = useState("");

  // Agent data
  const [agencyName, setAgencyName] = useState("");
  const [agencyCity, setAgencyCity] = useState("");
  const [phone, setPhone] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);

  const seekerSteps = ["Welkom", "Wat zoek je?", "Waar zoek je?", "Klaar!"];
  const agentSteps = ["Welkom", "Je kantoor", "Specialisaties", "Klaar!"];
  const steps = userRole === "agent" ? agentSteps : seekerSteps;
  const totalSteps = steps.length;

  const toggleType = (type: string) => {
    if (userRole === "agent") {
      setSpecializations((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    } else {
      setSelectedTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
  };

  const toggleProvince = (province: string) => {
    setSelectedProvinces((prev) =>
      prev.includes(province) ? prev.filter((p) => p !== province) : [...prev, province]
    );
  };

  async function handleComplete() {
    setLoading(true);
    try {
      const onboardingData = userRole === "agent"
        ? { agencyName, agencyCity, phone, specializations }
        : { selectedTypes, selectedProvinces, budgetMin, budgetMax, concept };

      await completeOnboarding(onboardingData);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      toast.success("Welkom bij Horecagrond! 🎉");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      toast.error("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              {userRole === "agent" ? (
                <Building2 className="h-10 w-10 text-primary" />
              ) : (
                <Search className="h-10 w-10 text-primary" />
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welkom{userName ? `, ${userName.split(" ")[0]}` : ""}! 👋
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {userRole === "agent"
                ? "Laten we je makelaarsprofiel opzetten zodat je panden kunt aanbieden."
                : "Laten we je zoekprofiel instellen zodat we de beste panden voor je vinden."}
            </p>
            <Button
              size="lg"
              className="mt-8"
              onClick={() => setStep(1)}
            >
              Aan de slag <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 1 - Seeker: Type selection */}
        {step === 1 && userRole === "seeker" && (
          <div>
            <h2 className="text-2xl font-bold">Wat voor pand zoek je?</h2>
            <p className="mt-2 text-muted-foreground">
              Selecteer een of meer typen (je kunt dit later aanpassen)
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all",
                    selectedTypes.includes(type.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="mt-1 block text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 - Agent: Office info */}
        {step === 1 && userRole === "agent" && (
          <div>
            <h2 className="text-2xl font-bold">Over je kantoor</h2>
            <p className="mt-2 text-muted-foreground">
              Vertel ons over je makelaarskantoor
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="agency">Kantoornaam *</Label>
                <Input
                  id="agency"
                  placeholder="Bijv. Horeca Makelaardij Amsterdam"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">Vestigingsplaats *</Label>
                <Input
                  id="city"
                  placeholder="Bijv. Amsterdam"
                  value={agencyCity}
                  onChange={(e) => setAgencyCity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefoonnummer</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="06-12345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Seeker: Location */}
        {step === 2 && userRole === "seeker" && (
          <div>
            <h2 className="text-2xl font-bold">Waar zoek je?</h2>
            <p className="mt-2 text-muted-foreground">
              In welke provincies wil je zoeken?
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {provinces.map((province) => (
                <button
                  key={province}
                  onClick={() => toggleProvince(province)}
                  className={cn(
                    "rounded-lg border-2 px-3 py-2 text-sm transition-all",
                    selectedProvinces.includes(province)
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  {province}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <Label>Budget indicatie (optioneel)</Label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Min €"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max €"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Agent: Specializations */}
        {step === 2 && userRole === "agent" && (
          <div>
            <h2 className="text-2xl font-bold">Je specialisaties</h2>
            <p className="mt-2 text-muted-foreground">
              In welk type horecapanden ben je gespecialiseerd?
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all",
                    specializations.includes(type.value)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="mt-1 block text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
              <Rocket className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold">Alles ingesteld! 🎉</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              {userRole === "agent"
                ? "Je kunt nu panden toevoegen en leads ontvangen."
                : "We gaan de beste horecapanden voor je zoeken."}
            </p>
            <Button
              size="lg"
              className="mt-8"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? "Even geduld..." : "Naar mijn dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        {step > 0 && step < totalSteps - 1 && (
          <div className="mt-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Vorige
            </Button>
            <Button onClick={() => setStep(step + 1)}>
              Volgende <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Skip option */}
        {step > 0 && step < totalSteps - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setStep(totalSteps - 1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Overslaan →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

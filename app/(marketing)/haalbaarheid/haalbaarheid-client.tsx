"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generateFeasibilityReport, type FeasibilityReport } from "@/lib/feasibility-check";
import { Calculator, TrendingUp, AlertTriangle, Check, Lightbulb, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const concepts = [
  { value: "RESTAURANT", label: "Restaurant", emoji: "🍽️" },
  { value: "CAFE", label: "Café", emoji: "☕" },
  { value: "KOFFIEBAR", label: "Koffiebar", emoji: "☕" },
  { value: "BAR", label: "Bar", emoji: "🍸" },
  { value: "EETCAFE", label: "Eetcafé", emoji: "🍺" },
  { value: "LUNCHROOM", label: "Lunchroom", emoji: "🥪" },
  { value: "PIZZERIA", label: "Pizzeria", emoji: "🍕" },
  { value: "DARK_KITCHEN", label: "Dark Kitchen", emoji: "🔥" },
  { value: "SNACKBAR", label: "Snackbar", emoji: "🍟" },
  { value: "HOTEL", label: "Hotel", emoji: "🏨" },
];

export function HaalbaarheidClient() {
  const [concept, setConcept] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("");
  const [surface, setSurface] = useState("");
  const [experience, setExperience] = useState("");
  const [hasBusinessPlan, setHasBusinessPlan] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [report, setReport] = useState<FeasibilityReport | null>(null);

  const handleGenerate = () => {
    if (!concept || !budget || !city) return;

    const result = generateFeasibilityReport({
      concept,
      budget: Number(budget),
      city,
      surface: surface ? Number(surface) : undefined,
      experienceYears: experience ? Number(experience) : undefined,
      hasBusinessPlan,
      monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
    });
    setReport(result);
  };

  const handleReset = () => {
    setReport(null);
    setConcept("");
    setBudget("");
    setCity("");
    setSurface("");
    setExperience("");
    setHasBusinessPlan(false);
    setMonthlyRent("");
  };

  const formatEuro = (n: number) => `€${n.toLocaleString("nl-NL")}`;

  if (report) {
    return (
      <div className="space-y-6">
        {/* Verdict */}
        <Card className={cn(
          "border-2",
          report.score >= 8 && "border-green-500/30 bg-green-500/5",
          report.score >= 6 && report.score < 8 && "border-amber-500/30 bg-amber-500/5",
          report.score >= 4 && report.score < 6 && "border-orange-500/30 bg-orange-500/5",
          report.score < 4 && "border-red-500/30 bg-red-500/5",
        )}>
          <CardContent className="p-6 text-center">
            <p className="text-4xl mb-2">{report.verdictEmoji}</p>
            <h2 className="text-2xl font-bold">{report.verdictLabel}</h2>
            <p className="text-muted-foreground mt-1">Haalbaarheidsscore: {report.score}/10</p>
            <div className="flex justify-center mt-3">
              <div className="flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn("h-3 w-6 rounded-sm", {
                      "bg-green-500": i < report.score && report.score >= 8,
                      "bg-amber-500": i < report.score && report.score >= 6 && report.score < 8,
                      "bg-orange-500": i < report.score && report.score >= 4 && report.score < 6,
                      "bg-red-500": i < report.score && report.score < 4,
                      "bg-muted": i >= report.score,
                    })}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatEuro(report.totalStartCost)}</p>
              <p className="text-xs text-muted-foreground">Geschatte startkosten</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatEuro(report.totalMonthlyCost)}</p>
              <p className="text-xs text-muted-foreground">Maandlasten</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {report.breakEvenMonths > 100 ? "n.v.t." : `${report.breakEvenMonths} mnd`}
              </p>
              <p className="text-xs text-muted-foreground">Break-even</p>
            </CardContent>
          </Card>
        </div>

        {/* Start costs breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Geschatte startkosten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.estimatedStartCosts.map((cost) => (
                <div key={cost.item} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cost.item}</span>
                  <span className="font-medium">{formatEuro(cost.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Totaal</span>
                <span>{formatEuro(report.totalStartCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jouw budget</span>
                <span className={cn("font-medium", Number(budget) >= report.totalStartCost ? "text-green-600" : "text-red-600")}>
                  {formatEuro(Number(budget))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Geschatte maandlasten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.estimatedMonthlyCosts.map((cost) => (
                <div key={cost.item} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cost.item}</span>
                  <span className="font-medium">{formatEuro(cost.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t">
                <span>Totaal per maand</span>
                <span>{formatEuro(report.totalMonthlyCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        {report.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                Sterke punten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Risks */}
        {report.riskFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Risicofactoren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.riskFactors.map((r, i) => (
                  <li key={i} className="text-sm flex items-center justify-between">
                    <span>{r.risk}</span>
                    <Badge variant={r.severity === "hoog" ? "destructive" : r.severity === "medium" ? "outline" : "secondary"} className="text-xs ml-2 shrink-0">
                      {r.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Aanbevelingen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.recommendations.map((r, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          Let op: dit rapport is een indicatie op basis van marktgemiddelden. 
          Raadpleeg altijd een financieel adviseur voor een definitieve beoordeling.
        </p>

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Nieuwe berekening
          </Button>
        </div>
      </div>
    );
  }

  // Input form
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Vul je gegevens in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>Concept *</Label>
          <Select value={concept} onValueChange={setConcept}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Kies je concept" />
            </SelectTrigger>
            <SelectContent>
              {concepts.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.emoji} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Beschikbaar budget (€) *</Label>
          <Input
            type="number"
            placeholder="bijv. 80000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Stad *</Label>
          <Input
            placeholder="bijv. Amsterdam"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Oppervlakte (m²)</Label>
            <Input
              type="number"
              placeholder="bijv. 100"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Maandhuur (€)</Label>
            <Input
              type="number"
              placeholder="bijv. 2500"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label>Horeca-ervaring (jaren)</Label>
          <Input
            type="number"
            placeholder="bijv. 3"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={hasBusinessPlan} onCheckedChange={setHasBusinessPlan} />
          <Label>Ik heb een businessplan</Label>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!concept || !budget || !city}
          className="w-full gap-2"
          size="lg"
        >
          <Calculator className="h-4 w-4" />
          Bereken haalbaarheid
        </Button>
      </CardContent>
    </Card>
  );
}

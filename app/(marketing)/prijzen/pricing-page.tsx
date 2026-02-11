"use client";

import { Check, X, Lightning, Crown, Rocket } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    subtitle: "Gratis beginnen",
    price: 0,
    period: "",
    description: "Perfect om Horecagrond te ontdekken",
    icon: Rocket,
    popular: false,
    features: [
      { name: "1 actieve listing", included: true },
      { name: "Basis pandpagina", included: true },
      { name: "Contact formulier", included: true },
      { name: "Basis statistieken", included: true },
      { name: "Automatische beschrijving", included: true },
      { name: "Uitgelichte listing", included: false },
      { name: "Onbeperkte listings", included: false },
      { name: "AI Foto verbetering", included: false },
      { name: "Video tour", included: false },
      { name: "Marktanalyse", included: false },
      { name: "Prioriteit support", included: false },
    ],
    cta: "Gratis starten",
    ctaVariant: "outline" as const,
  },
  {
    name: "Professional",
    subtitle: "Meest gekozen",
    price: 79,
    period: "/maand",
    description: "Voor actieve horeca makelaars",
    icon: Lightning,
    popular: true,
    features: [
      { name: "10 actieve listings", included: true },
      { name: "Professionele pandpagina", included: true },
      { name: "Contact formulier + telefoon", included: true },
      { name: "Uitgebreide statistieken", included: true },
      { name: "Automatische beschrijving", included: true },
      { name: "3x uitgelichte listing/maand", included: true },
      { name: "AI Foto verbetering", included: true },
      { name: "Listing optimizer", included: true },
      { name: "Video tour", included: false },
      { name: "Volledige marktanalyse", included: false },
      { name: "Prioriteit support", included: false },
    ],
    cta: "Start 14 dagen gratis",
    ctaVariant: "default" as const,
  },
  {
    name: "Premium",
    subtitle: "Maximale groei",
    price: 199,
    period: "/maand",
    description: "Alles wat je nodig hebt om te domineren",
    icon: Crown,
    popular: false,
    features: [
      { name: "Onbeperkte listings", included: true },
      { name: "Premium pandpagina", included: true },
      { name: "Contact + telefoon + chat", included: true },
      { name: "Volledige analytics dashboard", included: true },
      { name: "Automatische beschrijving", included: true },
      { name: "Onbeperkt uitgelicht", included: true },
      { name: "AI Foto verbetering", included: true },
      { name: "Listing optimizer + suggesties", included: true },
      { name: "AI Video tour (3/maand)", included: true },
      { name: "Volledige marktanalyse", included: true },
      { name: "Prioriteit support", included: true },
    ],
    cta: "Start 14 dagen gratis",
    ctaVariant: "outline" as const,
  },
];

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">Prijzen</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Transparante prijzen,{" "}
          <span className="text-primary">geen verrassingen</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Start gratis en upgrade wanneer je klaar bent. Geen contracten, geen verborgen kosten.
          Altijd maandelijks opzegbaar.
        </p>
      </section>

      {/* Plans */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-primary shadow-lg scale-[1.02]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3">
                    Populairst
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <plan.icon className="h-6 w-6 text-primary" weight="duotone" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Gratis" : `€${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-500 shrink-0" weight="bold" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40 shrink-0" weight="bold" />
                      )}
                      <span className={cn(!feature.included && "text-muted-foreground/60")}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.ctaVariant}
                  className={cn("w-full mt-6", plan.popular && "bg-primary")}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Vragen? Bekijk onze{" "}
            <a href="/faq" className="text-primary hover:underline">veelgestelde vragen</a>
            {" "}of{" "}
            <a href="/contact" className="text-primary hover:underline">neem contact op</a>.
          </p>
        </div>
      </section>
    </div>
  );
}

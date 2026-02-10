import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2, Sparkles, BarChart3, Users, Zap, Shield,
  ArrowRight, CheckCircle2, Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Voor Makelaars - Horecagrond",
  description: "Bereik duizenden horeca-ondernemers. Presenteer je panden professioneel met slimme tools.",
};

const features = [
  {
    icon: Building2,
    title: "Professionele listings",
    description: "Presenteer je panden met foto galerij, plattegrond, buurtinformatie en alle details die ondernemers willen zien.",
  },
  {
    icon: Sparkles,
    title: "Slimme beschrijvingen",
    description: "Genereer automatisch professionele pandbeschrijvingen. Kies je schrijfstijl en pas aan naar wens.",
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    description: "Zie precies hoeveel views, aanvragen en favorieten je panden krijgen. Optimaliseer je strategie.",
  },
  {
    icon: Users,
    title: "Leads management",
    description: "Alle aanvragen overzichtelijk in je inbox. Contactgegevens, berichten en status per lead.",
  },
  {
    icon: Zap,
    title: "Snelle publicatie",
    description: "In 4 stappen online. Basisgegevens, locatie, details en beschrijving — klaar in 5 minuten.",
  },
  {
    icon: Shield,
    title: "Betrouwbaar platform",
    description: "Veilige data, GDPR-compliant, en een groeiend netwerk van serieuze horeca-ondernemers.",
  },
];

const stats = [
  { value: "100%", label: "Gratis starten" },
  { value: "5 min", label: "Eerste listing online" },
  { value: "24/7", label: "Zichtbaar voor ondernemers" },
];

const testimonials = [
  {
    name: "Marco van den Berg",
    role: "Horeca Makelaar, Amsterdam",
    quote: "Horecagrond heeft onze workflow volledig veranderd. De AI beschrijvingen besparen ons uren per week.",
    stars: 5,
  },
  {
    name: "Lisa de Vries",
    role: "Vastgoed Adviseur, Rotterdam",
    quote: "Eindelijk een platform dat specifiek voor horeca is. De analytics geven ons precies het inzicht dat we nodig hebben.",
    stars: 5,
  },
];

export default function VoorMakelaarsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Voor makelaars
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Bereik duizenden{" "}
              <span className="text-primary">horeca-ondernemers</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Presenteer je horecapanden op het snelst groeiende platform van Nederland.
              Slimme tools, professionele presentatie, meetbare resultaten.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up?role=agent">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Gratis aanmelden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                  Neem contact op
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Alles wat je nodig hebt</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Krachtige tools om je horecapanden te presenteren en leads te beheren
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 shadow-none bg-muted/30">
                  <CardContent className="p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Zo werkt het</h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Registreer", desc: "Maak een gratis account aan als makelaar" },
              { step: "2", title: "Voeg pand toe", desc: "Gebruik onze wizard — in 5 minuten klaar" },
              { step: "3", title: "Ontvang leads", desc: "Ondernemers nemen direct contact op" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Wat makelaars zeggen</h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-8">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 border-t pt-4">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Begin vandaag nog
          </h2>
          <p className="mt-3 text-lg text-primary-foreground/80">
            Je eerste listing is gratis. Geen creditcard nodig.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up?role=agent">
              <Button size="lg" variant="secondary" className="text-base px-8">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Gratis aanmelden
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

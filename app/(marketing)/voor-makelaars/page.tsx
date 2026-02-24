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
    eyebrow: "Presentatie",
    title: "Professionele listings",
    description: "Presenteer je panden met foto galerij, plattegrond, buurtinformatie en alle details die ondernemers willen zien.",
    metric: "HD media + plattegrond",
    points: ["Meer context per listing", "Consistente premium uitstraling"],
    layout: "lg:col-span-4",
    surface: "from-primary/15 via-primary/5 to-transparent",
  },
  {
    icon: Sparkles,
    eyebrow: "AI assistent",
    title: "Slimme beschrijvingen",
    description: "Genereer automatisch professionele pandbeschrijvingen. Kies je schrijfstijl en pas aan naar wens.",
    metric: "Van idee naar tekst in seconden",
    points: ["Tone-of-voice per doelgroep", "Altijd bewerkbaar"],
    layout: "lg:col-span-2",
    surface: "from-sky-500/15 via-sky-500/5 to-transparent",
  },
  {
    icon: BarChart3,
    eyebrow: "Inzicht",
    title: "Analytics dashboard",
    description: "Zie precies hoeveel views, aanvragen en favorieten je panden krijgen. Optimaliseer je strategie.",
    metric: "Realtime performance",
    points: ["Views, leads en favorieten", "Kansen spotten per stad"],
    layout: "lg:col-span-2",
    surface: "from-violet-500/15 via-violet-500/5 to-transparent",
  },
  {
    icon: Users,
    eyebrow: "Sales",
    title: "Leads management",
    description: "Alle aanvragen overzichtelijk in je inbox. Contactgegevens, berichten en status per lead.",
    metric: "Eén overzicht voor je team",
    points: ["Snelle opvolging", "Minder losse tools"],
    layout: "lg:col-span-2",
    surface: "from-emerald-500/15 via-emerald-500/5 to-transparent",
  },
  {
    icon: Zap,
    eyebrow: "Workflow",
    title: "Snelle publicatie",
    description: "In 4 stappen online. Basisgegevens, locatie, details en beschrijving — klaar in 5 minuten.",
    metric: "4 stappen · 5 minuten",
    points: ["Duidelijke invoerflow", "Minder handwerk per pand"],
    layout: "lg:col-span-2",
    surface: "from-amber-500/15 via-amber-500/5 to-transparent",
  },
  {
    icon: Shield,
    eyebrow: "Vertrouwen",
    title: "Betrouwbaar platform",
    description: "Veilige data, GDPR-compliant, en een groeiend netwerk van serieuze horeca-ondernemers.",
    metric: "Privacy & stabiliteit voorop",
    points: ["GDPR-compliant", "Gebouwd voor de NL horecamarkt"],
    layout: "lg:col-span-6",
    surface: "from-slate-500/15 via-slate-500/5 to-transparent",
  },
];

const stats = [
  { value: "100%", label: "Gratis starten" },
  { value: "5 min", label: "Eerste listing online" },
  { value: "24/7", label: "Zichtbaar voor ondernemers" },
];

const processSteps = [
  {
    step: "1",
    title: "Registreer",
    desc: "Maak een gratis account aan als makelaar",
    detail: "Binnen enkele minuten staat je profiel live en kun je direct publiceren.",
    tag: "2 min",
    icon: Users,
    layout: "lg:col-span-2",
    surface: "from-primary/15 via-primary/5 to-transparent",
  },
  {
    step: "2",
    title: "Voeg pand toe",
    desc: "Gebruik onze wizard — in 5 minuten klaar",
    detail: "Upload media, vul kerngegevens in en laat AI een sterke eerste versie schrijven.",
    tag: "5 min",
    icon: Building2,
    layout: "lg:col-span-4",
    surface: "from-sky-500/15 via-sky-500/5 to-transparent",
  },
  {
    step: "3",
    title: "Ontvang leads",
    desc: "Ondernemers nemen direct contact op",
    detail: "Volg elke aanvraag op vanuit één inbox en stuur sneller op kwaliteit en conversie.",
    tag: "24/7",
    icon: BarChart3,
    layout: "lg:col-span-6",
    surface: "from-emerald-500/15 via-emerald-500/5 to-transparent",
  },
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
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 ${feature.layout}`}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.surface} opacity-80`}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-primary/10 blur-2xl transition-transform duration-500 group-hover:scale-125"
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-background/80 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {feature.eyebrow}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>

                    <div className="mt-5 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm font-medium text-foreground/85">
                      {feature.metric}
                    </div>

                    <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span
                            aria-hidden
                            className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/40 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">Zo werkt het</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Een duidelijke flow van onboarding tot concrete aanvragen
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {processSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.step}
                  className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 ${item.layout}`}
                  style={{ animationDelay: `${index * 110}ms` }}
                >
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.surface} opacity-80`}
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        Stap {item.step}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">{item.tag}</span>
                    </div>

                    <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-background/80 text-primary transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.desc}
                    </p>

                    <p className="mt-auto border-t border-border/70 pt-5 text-sm font-medium text-foreground/80">
                      {item.detail}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground">
            Tip: publiceer eerst je drie sterkste panden voor maximale zichtbaarheid in de eerste week.
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

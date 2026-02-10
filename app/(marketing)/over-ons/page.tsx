import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Target, Heart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Over ons - Horecagrond",
  description: "Leer meer over Horecagrond, het platform dat horeca-ondernemers en makelaars verbindt.",
};

const values = [
  {
    icon: Target,
    title: "Missie",
    description: "Wij maken het vinden en aanbieden van horecapanden eenvoudiger, transparanter en professioneler.",
  },
  {
    icon: Heart,
    title: "Passie",
    description: "We geloven in de kracht van de Nederlandse horeca. Elke ondernemer verdient het perfecte pand.",
  },
  {
    icon: Building2,
    title: "Expertise",
    description: "Gebouwd door professionals die de horeca-vastgoedmarkt door en door kennen.",
  },
  {
    icon: Sparkles,
    title: "Innovatie",
    description: "Met slimme technologie helpen we makelaars efficiënter werken en ondernemers beter zoeken.",
  },
];

export default function OverOnsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Het platform voor{" "}
              <span className="text-primary">horecapanden</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Horecagrond verbindt horeca-ondernemers met de beste panden in Nederland.
              Of je nu op zoek bent naar een restaurant in Amsterdam of een café in Maastricht
              — wij helpen je het perfecte pand te vinden.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight mb-16">Onze waarden</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} className="border-0 shadow-none bg-transparent text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4 text-center">
            {[
              { value: "2026", label: "Opgericht" },
              { value: "NL", label: "Markt" },
              { value: "100%", label: "Horeca focus" },
              { value: "Gratis", label: "Voor zoekers" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Klaar om te beginnen?</h2>
          <p className="mt-2 text-muted-foreground">
            Meld je aan en ontdek het aanbod, of neem contact op voor vragen.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/sign-up" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Aanmelden
            </a>
            <a href="/contact" className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Contact
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

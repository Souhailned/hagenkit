import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marco van den Berg",
    role: "Horeca Makelaar, Amsterdam",
    quote: "Horecagrond heeft onze workflow volledig veranderd. De slimme beschrijvingen besparen ons uren per week.",
    stars: 5,
  },
  {
    name: "Lisa de Vries",
    role: "Vastgoed Adviseur, Rotterdam",
    quote: "Eindelijk een platform specifiek voor horeca. De analytics geven ons precies het inzicht dat we nodig hebben.",
    stars: 5,
  },
  {
    name: "Tom Bakker",
    role: "Restaurant Ondernemer, Utrecht",
    quote: "Binnen twee weken mijn droomlocatie gevonden. De filters en kaart maken zoeken super makkelijk.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Wat gebruikers zeggen</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Ontdek waarom makelaars en ondernemers kiezen voor Horecagrond
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-0 shadow-none bg-background">
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

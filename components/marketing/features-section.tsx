import { Card, CardContent } from "@/components/ui/card";
import { Search, Map, Heart, BarChart3, Sparkles, Shield } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Slim zoeken",
    description: "Autocomplete, filters op type, stad, prijs en oppervlakte. Vind je pand in seconden.",
  },
  {
    icon: Map,
    title: "Interactieve kaart",
    description: "Bekijk alle panden op de kaart met clusters. Zoom in op jouw stad.",
  },
  {
    icon: Heart,
    title: "Favorieten & alerts",
    description: "Bewaar panden, stel zoek alerts in en krijg meldingen bij nieuwe matches.",
  },
  {
    icon: Sparkles,
    title: "Slimme tools",
    description: "Automatische beschrijvingen, buurtdata en vergelijk tot 4 panden naast elkaar.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Makelaars zien exact hoeveel views, aanvragen en favorieten hun panden krijgen.",
  },
  {
    icon: Shield,
    title: "Betrouwbaar",
    description: "Veilig, GDPR-compliant en gebouwd voor de Nederlandse horecamarkt.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Waarom Horecagrond?</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Alles wat je nodig hebt om horecapanden te zoeken of aan te bieden
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
  );
}

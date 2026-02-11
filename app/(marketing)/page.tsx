import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchBar } from "@/components/search/search-bar";
import { AiSearchBar } from "@/components/search/ai-search-bar";
import { Testimonials } from "@/components/marketing/testimonials";
import { CtaSection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import Link from "next/link";
import {
  Search,
  Building2,
  Users,
  MapPin,
  ArrowRight,
  Star,
  Coffee,
  Utensils,
  Wine,
  ChefHat,
  UtensilsCrossed,
  Bed,
  Briefcase,
  CheckCircle2,
  Clock,
  Handshake,
  TrendingUp,
  Shield,
  Sparkles,
  Maximize2,
} from "lucide-react";

// Mock featured properties (prepared for Prisma)
const featuredProperties = [
  {
    id: "prop-001",
    slug: "restaurant-de-gouden-leeuw-amsterdam",
    title: "Restaurant De Gouden Leeuw",
    city: "Amsterdam",
    province: "Noord-Holland",
    propertyType: "RESTAURANT" as const,
    priceType: "SALE" as const,
    price: 175000,
    surfaceTotal: 180,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    features: ["TERRACE", "KITCHEN", "ALCOHOL_LICENSE"],
    isFeatured: true,
    isNew: true,
  },
  {
    id: "prop-002",
    slug: "grand-cafe-het-station-utrecht",
    title: "Grand Café Het Station",
    city: "Utrecht",
    province: "Utrecht",
    propertyType: "GRAND_CAFE" as const,
    priceType: "RENT" as const,
    price: 3500,
    surfaceTotal: 250,
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
    features: ["TERRACE", "ALCOHOL_LICENSE", "LIVING_QUARTERS"],
    isFeatured: true,
    isNew: false,
  },
  {
    id: "prop-006",
    slug: "boutique-hotel-de-oranje-nassau-den-haag",
    title: "Boutique Hotel De Oranje Nassau",
    city: "Den Haag",
    province: "Zuid-Holland",
    propertyType: "HOTEL" as const,
    priceType: "SALE" as const,
    price: 890000,
    surfaceTotal: 650,
    image:
      "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
    features: ["KITCHEN", "ALCOHOL_LICENSE", "PARKING"],
    isFeatured: true,
    isNew: false,
  },
  {
    id: "prop-009",
    slug: "partycentrum-de-feestzaal-tilburg",
    title: "Partycentrum De Feestzaal",
    city: "Tilburg",
    province: "Noord-Brabant",
    propertyType: "PARTYCENTRUM" as const,
    priceType: "SALE" as const,
    price: 450000,
    surfaceTotal: 1200,
    image:
      "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=600&fit=crop",
    features: ["KITCHEN", "ALCOHOL_LICENSE", "PARKING"],
    isFeatured: true,
    isNew: false,
  },
];

// Stats loaded dynamically
async function getStats() {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const [propertyCount, cityCount, agentCount] = await Promise.all([
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.property.findMany({ where: { status: "ACTIVE" }, select: { city: true }, distinct: ["city"] }),
      prisma.user.count({ where: { role: "agent" } }),
    ]);
    return {
      properties: Math.max(propertyCount, 18), // Show at least seed count
      agents: Math.max(agentCount, 5),
      cities: Math.max(cityCount.length, 8),
    };
  } catch {
    return { properties: 847, agents: 126, cities: 42 };
  }
}

// Stats will be loaded in the component via getStats()

const propertyTypeLabels: Record<string, string> = {
  RESTAURANT: "Restaurant",
  CAFE: "Café",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
  GRAND_CAFE: "Grand Café",
  LUNCHROOM: "Lunchroom",
  PARTYCENTRUM: "Partycentrum",
  PIZZERIA: "Pizzeria",
  BRASSERIE: "Brasserie",
  SNACKBAR: "Snackbar",
};

const featureLabels: Record<string, string> = {
  TERRACE: "Terras",
  KITCHEN: "Keuken",
  ALCOHOL_LICENSE: "Drank & Horeca",
  PARKING: "Parkeren",
  LIVING_QUARTERS: "Woonruimte",
};

// Categories for the grid
const categories = [
  {
    type: "RESTAURANT",
    label: "Restaurant",
    icon: Utensils,
    count: 312,
    description: "Eetgelegenheden van fine-dining tot casual",
  },
  {
    type: "CAFE",
    label: "Café & Grand Café",
    icon: Coffee,
    count: 189,
    description: "Bruine kroegen tot moderne koffiezaken",
  },
  {
    type: "BAR",
    label: "Bar & Lounge",
    icon: Wine,
    count: 124,
    description: "Cocktailbars, lounges en nachthoreca",
  },
  {
    type: "HOTEL",
    label: "Hotel",
    icon: Bed,
    count: 87,
    description: "Boutique hotels tot conferentielocaties",
  },
  {
    type: "LUNCHROOM",
    label: "Lunchroom",
    icon: UtensilsCrossed,
    count: 156,
    description: "Broodjes-, lunch- en ontbijtzaken",
  },
  {
    type: "DARK_KITCHEN",
    label: "Dark Kitchen",
    icon: ChefHat,
    count: 43,
    description: "Bezorg-only keukens en ghost kitchens",
  },
];

function formatPrice(amount: number, priceType: string): string {
  const formatted = new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
  return priceType === "RENT" ? `${formatted}/mnd` : formatted;
}

function formatPriceLabel(priceType: string): string {
  return priceType === "RENT" ? "Te huur" : "Te koop";
}

export default async function Home() {
  const stats = await getStats();
  return (
    <>
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 sm:pb-20 sm:pt-32 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Zoek een horecapand
          </h1>

          <p className="mt-3 text-muted-foreground">
            {stats.properties}+ panden in {stats.cities} steden
          </p>

          {/* Single search bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar size="lg" placeholder="Zoek op stad, type of pandnaam..." />
              </div>
              <Link
                href="/aanbod?view=map"
                className="flex h-12 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors shrink-0"
              >
                <MapPin className="h-4 w-4" />
                Kaart
              </Link>
            </div>

            {/* Popular cities */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              {["Amsterdam", "Rotterdam", "Utrecht", "Den Haag", "Eindhoven"].map(
                (city) => (
                  <Link
                    key={city}
                    href={`/aanbod?cities=${city}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {city}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── CATEGORIES GRID ──────────────────── */}
      <section className="border-b py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Zoek per categorie
            </h2>
            <p className="mt-3 text-muted-foreground">
              Elk type horecabedrijf heeft unieke eisen. Vind precies wat je
              nodig hebt.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.type}
                  href={`/aanbod?types=${cat.type}`}
                  className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-semibold text-foreground">
                          {cat.label}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {cat.count}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── FEATURED PROPERTIES ──────────────── */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="secondary" className="mb-3">
                <Star className="mr-1 size-3 fill-amber-500 text-amber-500" />
                Uitgelicht
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Populaire locaties
              </h2>
              <p className="mt-2 text-muted-foreground">
                Ontdek de meest bekeken horecapanden van dit moment
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/aanbod">
                Bekijk alle panden
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/aanbod/${property.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.image}
                    alt={property.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {property.isNew && (
                      <Badge className="border-0 bg-primary text-primary-foreground shadow-lg">
                        <Sparkles className="mr-1 size-3" />
                        Nieuw
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="border-0 bg-white/90 shadow-lg backdrop-blur-sm"
                    >
                      {propertyTypeLabels[property.propertyType]}
                    </Badge>
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-3 left-3">
                    <p className="text-lg font-bold text-white">
                      {formatPrice(property.price, property.priceType)}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {property.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span>{property.city}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      <Maximize2 className="size-3" />
                      {property.surfaceTotal} m²
                    </span>
                    {property.features.slice(0, 2).map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {featureLabels[f] || f}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── HOW IT WORKS ────────────────── */}
      <section className="border-b py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Hoe het werkt
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              In 3 stappen naar jouw locatie
            </h2>
            <p className="mt-4 text-muted-foreground">
              Van zoeken tot ondertekenen — wij maken het proces zo eenvoudig
              mogelijk
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Search,
                step: 1,
                title: "Zoek & Filter",
                description:
                  "Gebruik onze geavanceerde zoekfunctie om panden te vinden die perfect aansluiten bij jouw horecaconcept en budget.",
              },
              {
                icon: Clock,
                step: 2,
                title: "Plan Bezichtiging",
                description:
                  "Neem direct contact op met de makelaar en plan een bezichtiging in. Krijg antwoord op al je vragen.",
              },
              {
                icon: Handshake,
                step: 3,
                title: "Onderteken Deal",
                description:
                  "Gevonden wat je zocht? De makelaar begeleidt je door het contractproces tot de sleuteloverdracht.",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                        <Icon className="size-7" />
                      </div>
                      <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {step.step}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {/* Connector line (desktop, not on last item) */}
                  {i < 2 && (
                    <div
                      aria-hidden
                      className="absolute right-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-r from-border to-transparent md:block"
                    />
                  )}
                  {i > 0 && (
                    <div
                      aria-hidden
                      className="absolute left-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-l from-border to-transparent md:block"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────── STATS ────────────────── */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Building2,
                value: stats.properties.toLocaleString("nl-NL") + "+",
                label: "Horecapanden",
              },
              {
                icon: Users,
                value: stats.agents.toLocaleString("nl-NL"),
                label: "Gecertificeerde Makelaars",
              },
              {
                icon: MapPin,
                value: stats.cities.toString(),
                label: "Steden in Nederland",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="group overflow-hidden border bg-card/50 text-center backdrop-blur transition-all hover:bg-card hover:shadow-lg"
                >
                  <CardContent className="p-8">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-7" />
                    </div>
                    <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── WHY HORECAGROND ──────────────── */}
      <section className="border-b py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Waarom Horecagrond?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Het platform dat horeca-ondernemers en makelaars samenbrengt
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                title: "Marktinzichten",
                description:
                  "Locatiescores, voetgangersstroom en concurrentieanalyse per pand.",
              },
              {
                icon: Shield,
                title: "Geverifieerde Makelaars",
                description:
                  "Alle aangesloten makelaars zijn gecertificeerd en beoordeeld.",
              },
              {
                icon: Sparkles,
                title: "AI Foto Verbetering",
                description:
                  "Automatische beeldoptimalisatie voor professionele presentatie.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border bg-card p-6 transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────── CTA BANNER ────────────── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/25 sm:px-16 sm:py-20">
            {/* Pattern */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div
              aria-hidden
              className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 size-64 rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative">
              <Badge
                variant="secondary"
                className="mb-6 border-white/20 bg-white/10 text-white"
              >
                <Briefcase className="mr-1 size-3" />
                Voor Makelaars
              </Badge>
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Bereik duizenden horecaondernemers
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
                Plaats je horecapanden op Horecagrond en krijg toegang tot
                gekwalificeerde leads van ondernemers die actief op zoek zijn.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="h-12 px-8 text-base font-semibold shadow-lg"
                >
                  <Link href="/sign-up?role=agent">
                    Start Gratis
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-12 px-8 text-base text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/makelaars">Meer informatie</Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>Eerste 3 panden gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>Directe lead notificaties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4" />
                  <span>AI foto verbetering</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeaturesSection />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA */}
      <CtaSection />
    </>
  );
}

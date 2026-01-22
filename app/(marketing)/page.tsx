import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Briefcase,
  CheckCircle2,
  Clock,
  Handshake,
} from "lucide-react";

// Mock featured properties until getFeaturedProperties action exists
const featuredProperties = [
  {
    id: "1",
    slug: "grand-cafe-amsterdam-centrum",
    title: "Grand Café Amsterdam Centrum",
    city: "Amsterdam",
    propertyType: "CAFE",
    rentPrice: 450000, // cents
    surfaceTotal: 180,
    image: "/placeholder-property-1.jpg",
    seatingCapacity: 85,
    hasTerrace: true,
  },
  {
    id: "2",
    slug: "restaurant-rotterdam-haven",
    title: "Restaurant aan de Maas",
    city: "Rotterdam",
    propertyType: "RESTAURANT",
    rentPrice: 550000,
    surfaceTotal: 220,
    image: "/placeholder-property-2.jpg",
    seatingCapacity: 120,
    hasTerrace: true,
  },
  {
    id: "3",
    slug: "boutique-hotel-utrecht",
    title: "Boutique Hotel Binnenstad",
    city: "Utrecht",
    propertyType: "HOTEL",
    rentPrice: 850000,
    surfaceTotal: 450,
    image: "/placeholder-property-3.jpg",
    seatingCapacity: 0,
    hasTerrace: false,
  },
  {
    id: "4",
    slug: "dark-kitchen-den-haag",
    title: "Dark Kitchen Premium",
    city: "Den Haag",
    propertyType: "DARK_KITCHEN",
    rentPrice: 280000,
    surfaceTotal: 95,
    image: "/placeholder-property-4.jpg",
    seatingCapacity: 0,
    hasTerrace: false,
  },
];

// Mock stats
const stats = {
  properties: 847,
  agents: 126,
  cities: 42,
};

const propertyTypeIcons: Record<string, React.ReactNode> = {
  CAFE: <Coffee className="size-4" />,
  RESTAURANT: <Utensils className="size-4" />,
  BAR: <Wine className="size-4" />,
  HOTEL: <Building2 className="size-4" />,
  DARK_KITCHEN: <ChefHat className="size-4" />,
};

const propertyTypeLabels: Record<string, string> = {
  CAFE: "Café",
  RESTAURANT: "Restaurant",
  BAR: "Bar",
  HOTEL: "Hotel",
  DARK_KITCHEN: "Dark Kitchen",
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-background via-background to-muted/30">
        {/* Decorative background pattern - Dutch tile inspired */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-32 sm:pb-24 sm:pt-44 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-medium text-primary">
                847+ horecalocaties beschikbaar
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Vind de perfecte{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  horecalocatie
                </span>
                <svg
                  aria-hidden
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 358 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C118.957 3.58687 237.086 2.34387 355 9"
                    stroke="url(#hero-underline)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="hero-underline"
                      x1="3"
                      y1="9"
                      x2="355"
                      y2="9"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="oklch(0.43 0.215 254.5 / 0.3)" />
                      <stop
                        offset="0.5"
                        stopColor="oklch(0.43 0.215 254.5 / 0.6)"
                      />
                      <stop
                        offset="1"
                        stopColor="oklch(0.43 0.215 254.5 / 0.3)"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subtext */}
            <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
              Van restaurant tot dark kitchen, van café tot hotel.
              <br className="hidden sm:block" />
              Ontdek {stats.properties}+ locaties van {stats.agents} makelaars
              in {stats.cities} steden.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group h-12 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href="/aanbod">
                  <Search className="mr-2 size-5" />
                  Bekijk Aanbod
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
                <Link href="/sign-up?role=agent">
                  <Briefcase className="mr-2 size-5" />
                  Ik ben Makelaar
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Gratis zoeken</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Direct contact met makelaars</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Dagelijks nieuwe panden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Featured Listings Section */}
      <section className="border-b bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          {/* Section header */}
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Star className="mr-1 size-3 fill-amber-500 text-amber-500" />
                Uitgelicht
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Populaire locaties
              </h2>
              <p className="mt-2 text-muted-foreground">
                Ontdek onze meest gevraagde horecapanden
              </p>
            </div>
            <Button asChild variant="outline" className="shrink-0">
              <Link href="/aanbod">
                Bekijk alle panden
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          {/* Property cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property, index) => (
              <Link
                key={property.id}
                href={`/aanbod/${property.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    {propertyTypeIcons[property.propertyType] || (
                      <Building2 className="size-12 opacity-20" />
                    )}
                  </div>
                  {/* Type badge */}
                  <Badge
                    variant="secondary"
                    className="absolute left-3 top-3 bg-background/90 backdrop-blur"
                  >
                    {propertyTypeIcons[property.propertyType]}
                    <span className="ml-1">
                      {propertyTypeLabels[property.propertyType]}
                    </span>
                  </Badge>
                  {/* Price on image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-lg font-bold text-white">
                      {formatPrice(property.rentPrice)}
                      <span className="text-sm font-normal opacity-80">
                        /maand
                      </span>
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span>{property.city}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                      {property.surfaceTotal} m²
                    </span>
                    {property.seatingCapacity > 0 && (
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                        {property.seatingCapacity} zitplaatsen
                      </span>
                    )}
                    {property.hasTerrace && (
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                        Terras
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="border-b py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Hoe het werkt
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              In 3 stappen naar jouw locatie
            </h2>
            <p className="mt-4 text-muted-foreground">
              Van zoeken tot ondertekenen - wij maken het proces zo eenvoudig
              mogelijk
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                    <Search className="size-7" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">
                  Zoek &amp; Filter
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Gebruik onze geavanceerde zoekfunctie om panden te vinden die
                  perfect aansluiten bij jouw horecaconcept en budget.
                </p>
              </div>
              {/* Connector line (desktop) */}
              <div
                aria-hidden
                className="absolute right-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-r from-border to-transparent md:block"
              />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                    <Clock className="size-7" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Plan Bezichtiging</h3>
                <p className="mt-3 text-muted-foreground">
                  Neem direct contact op met de makelaar en plan een bezichtiging
                  in. Krijg antwoord op al je vragen.
                </p>
              </div>
              {/* Connector lines (desktop) */}
              <div
                aria-hidden
                className="absolute left-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-l from-border to-transparent md:block"
              />
              <div
                aria-hidden
                className="absolute right-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-r from-border to-transparent md:block"
              />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                    <Handshake className="size-7" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">Onderteken Deal</h3>
                <p className="mt-3 text-muted-foreground">
                  Gevonden wat je zocht? De makelaar begeleidt je door het
                  contractproces tot de sleuteloverdracht.
                </p>
              </div>
              {/* Connector line (desktop) */}
              <div
                aria-hidden
                className="absolute left-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-l from-border to-transparent md:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Stat 1 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card/50 p-8 text-center backdrop-blur transition-all hover:bg-card hover:shadow-lg">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="relative">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-7" />
                </div>
                <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {stats.properties.toLocaleString("nl-NL")}+
                </p>
                <p className="mt-2 text-muted-foreground">Horecapanden</p>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card/50 p-8 text-center backdrop-blur transition-all hover:bg-card hover:shadow-lg">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="relative">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="size-7" />
                </div>
                <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {stats.agents.toLocaleString("nl-NL")}
                </p>
                <p className="mt-2 text-muted-foreground">
                  Gecertificeerde Makelaars
                </p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card/50 p-8 text-center backdrop-blur transition-all hover:bg-card hover:shadow-lg">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
              <div className="relative">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="size-7" />
                </div>
                <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {stats.cities}
                </p>
                <p className="mt-2 text-muted-foreground">Steden in Nederland</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner for Makelaars */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/25 sm:px-16 sm:py-20">
            {/* Decorative elements */}
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

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-primary-foreground/70">
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
    </>
  );
}

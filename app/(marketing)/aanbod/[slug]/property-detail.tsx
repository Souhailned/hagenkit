"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  MapPin,
  Maximize2,
  Users,
  Utensils,
  Coffee,
  Wine,
  ChefHat,
  Building2,
  Bed,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Sparkles,
  Tag,
  ArrowLeft,
  X,
} from "lucide-react";
import type { Property } from "@/types/property";
import {
  PropertyTypeLabels,
  PropertyFeatureLabels,
  PriceTypeLabels,
} from "@/types/property";
import { cn } from "@/lib/utils";

// Property type icons mapping
const propertyTypeIcons: Record<string, React.ReactNode> = {
  RESTAURANT: <Utensils className="size-4" />,
  CAFE: <Coffee className="size-4" />,
  BAR: <Wine className="size-4" />,
  HOTEL: <Bed className="size-4" />,
  DARK_KITCHEN: <ChefHat className="size-4" />,
  GRANDCAFE: <Coffee className="size-4" />,
  LUNCHROOM: <UtensilsCrossed className="size-4" />,
  SNACKBAR: <Utensils className="size-4" />,
  PIZZERIA: <Utensils className="size-4" />,
  BRASSERIE: <Utensils className="size-4" />,
  PARTYCENTRUM: <Building2 className="size-4" />,
};

function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "Op aanvraag";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface PropertyDetailProps {
  property: Property;
}

export function PropertyDetail({ property }: PropertyDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Beste makelaar,\n\nIk heb interesse in "${property.title}" en zou graag meer informatie ontvangen.\n\nMet vriendelijke groet`,
  });

  // Get images from mock data - handle both string[] and PropertyImage[]
  const images: string[] = Array.isArray(property.images)
    ? property.images.map((img: any) =>
        typeof img === "string" ? img : img.originalUrl || img.thumbnailUrl
      )
    : [];

  const currentImage = images[currentImageIndex] || "";

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + images.length) % images.length
    );
  };

  // Get price display
  const price = (property as any).price || property.rentPrice || property.salePrice;
  const priceType = property.priceType;
  const priceDisplay = formatPrice(price);
  const priceSuffix = priceType === "RENT" ? "/maand" : "";

  // Get features
  const features: string[] = property.features || [];

  // Area from mock or real data
  const area = (property as any).area || property.surfaceTotal || 0;

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-4 lg:px-12">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/aanbod">Aanbod</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {property.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12">
        {/* Back link */}
        <Link
          href="/aanbod"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Terug naar aanbod
        </Link>

        {/* ────────── GALLERY ────────── */}
        <div className="mb-8">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            {/* Main image */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted"
              onClick={() => setLightboxOpen(true)}
            >
              <div className="aspect-[16/10]">
                {currentImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImage}
                    alt={property.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Building2 className="size-16 opacity-20" />
                  </div>
                )}
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:bg-white"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:bg-white"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}

              {/* Image count badge */}
              {images.length > 0 && (
                <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Badges */}
              <div className="absolute left-3 top-3 flex gap-2">
                {property.isNew && (
                  <Badge className="border-0 bg-primary text-primary-foreground shadow-lg">
                    <Sparkles className="mr-1 size-3" />
                    Nieuw
                  </Badge>
                )}
                {property.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="border-0 bg-white/90 shadow-lg backdrop-blur-sm"
                  >
                    Uitgelicht
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail grid */}
            <div className="hidden gap-3 md:grid md:grid-rows-3">
              {images.slice(0, 3).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative overflow-hidden rounded-xl bg-muted transition-all",
                    currentImageIndex === index
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:opacity-80"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${property.title} - foto ${index + 1}`}
                    className="size-full object-cover"
                  />
                  {index === 2 && images.length > 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg font-semibold text-white">
                      +{images.length - 3} foto&apos;s
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ────────── CONTENT GRID ────────── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* LEFT: Main content */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="gap-1"
                >
                  {propertyTypeIcons[property.propertyType]}
                  {PropertyTypeLabels[property.propertyType]}
                </Badge>
                <Badge variant="outline">
                  {PriceTypeLabels[priceType] || priceType}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {property.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  <span>
                    {property.address}
                    {property.city ? `, ${property.city}` : ""}
                  </span>
                </div>
                {area > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="size-4" />
                    <span>{area} m²</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {priceDisplay}
                </span>
                {priceSuffix && (
                  <span className="text-lg text-muted-foreground">
                    {priceSuffix}
                  </span>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Quick stats */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border bg-card p-4 text-center">
                <Maximize2 className="mx-auto mb-2 size-5 text-primary" />
                <p className="text-lg font-semibold">{area} m²</p>
                <p className="text-xs text-muted-foreground">Oppervlakte</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <Users className="mx-auto mb-2 size-5 text-primary" />
                <p className="text-lg font-semibold">
                  {(property as any).seatingCapacityInside ||
                    (property as any).seatingCapacity ||
                    "—"}
                </p>
                <p className="text-xs text-muted-foreground">Zitplaatsen</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <Tag className="mx-auto mb-2 size-5 text-primary" />
                <p className="text-lg font-semibold">
                  {PriceTypeLabels[priceType] || "—"}
                </p>
                <p className="text-xs text-muted-foreground">Aanbod type</p>
              </div>
              <div className="rounded-xl border bg-card p-4 text-center">
                <Calendar className="mx-auto mb-2 size-5 text-primary" />
                <p className="text-lg font-semibold">
                  {property.availableFrom
                    ? new Date(property.availableFrom).toLocaleDateString(
                        "nl-NL",
                        { month: "short", year: "numeric" }
                      )
                    : "Direct"}
                </p>
                <p className="text-xs text-muted-foreground">Beschikbaar</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="algemeen" className="w-full">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="algemeen">Algemeen</TabsTrigger>
                <TabsTrigger value="kenmerken">Kenmerken</TabsTrigger>
                <TabsTrigger value="locatie">Locatie</TabsTrigger>
              </TabsList>

              <TabsContent value="algemeen" className="space-y-6">
                {/* Description */}
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Beschrijving</h2>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {property.description ||
                      "Geen beschrijving beschikbaar voor dit pand."}
                  </p>
                </div>

                {/* Key details */}
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Details</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Type", value: PropertyTypeLabels[property.propertyType] },
                      { label: "Oppervlakte", value: `${area} m²` },
                      { label: "Prijs type", value: PriceTypeLabels[priceType] || priceType },
                      { label: "Stad", value: property.city },
                      { label: "Provincie", value: property.province || "—" },
                      {
                        label: "Bouwjaar",
                        value: property.buildYear
                          ? String(property.buildYear)
                          : "Onbekend",
                      },
                      {
                        label: "Energielabel",
                        value: property.energyLabel || "Onbekend",
                      },
                      {
                        label: "Monument",
                        value: property.monumentStatus ? "Ja" : "Nee",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="kenmerken" className="space-y-6">
                <div>
                  <h2 className="mb-3 text-lg font-semibold">
                    Kenmerken &amp; Faciliteiten
                  </h2>
                  {features.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
                        >
                          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                          <span className="text-sm font-medium">
                            {PropertyFeatureLabels[
                              feature as keyof typeof PropertyFeatureLabels
                            ] || feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Geen kenmerken beschikbaar voor dit pand.
                    </p>
                  )}
                </div>

                {/* Horeca specifics */}
                <div>
                  <h2 className="mb-3 text-lg font-semibold">
                    Horeca Specificaties
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        label: "Terras",
                        value: property.hasTerrace ? "Ja" : "Nee",
                      },
                      {
                        label: "Parkeren",
                        value: property.hasParking ? "Ja" : "Nee",
                      },
                      {
                        label: "Kelder",
                        value: property.hasBasement ? "Ja" : "Nee",
                      },
                      {
                        label: "Opslag",
                        value: property.hasStorage ? "Ja" : "Nee",
                      },
                    ]
                      .filter((item) => item.value === "Ja")
                      .map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
                        >
                          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="locatie" className="space-y-6">
                <div>
                  <h2 className="mb-3 text-lg font-semibold">Locatie</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Adres", value: property.address },
                      { label: "Stad", value: property.city },
                      {
                        label: "Postcode",
                        value: property.postalCode || "—",
                      },
                      {
                        label: "Provincie",
                        value: property.province || "—",
                      },
                      {
                        label: "Buurt",
                        value: property.neighborhood || "—",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="overflow-hidden rounded-xl border bg-muted/30">
                  <div className="flex aspect-[16/9] items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="mx-auto mb-3 size-10 opacity-30" />
                      <p className="font-medium">
                        {property.address}, {property.city}
                      </p>
                      <p className="mt-1 text-sm">
                        Kaartweergave binnenkort beschikbaar
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {/* Contact form card */}
            <Card className="overflow-hidden">
              <div className="bg-primary/5 p-6">
                <h3 className="text-lg font-semibold">Interesse?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Laat je gegevens achter en de makelaar neemt contact met je op
                </p>
              </div>
              <CardContent className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // TODO: submit inquiry via server action
                    alert(
                      "Bedankt voor je interesse! De makelaar neemt spoedig contact met je op."
                    );
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Naam *
                    </label>
                    <Input
                      id="name"
                      required
                      placeholder="Je volledige naam"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, name: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      E-mail *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="je@email.nl"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, email: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Telefoonnummer
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06-12345678"
                      value={formState.phone}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Bericht
                    </label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((s) => ({ ...s, message: e.target.value }))
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    <Mail className="mr-2 size-4" />
                    Verstuur interesse
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <Heart className="mr-1.5 size-4" />
                Opslaan
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Share2 className="mr-1.5 size-4" />
                Delen
              </Button>
            </div>

            {/* Agent info placeholder */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Building2 className="size-6" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {property.agency?.name || "Horecagrond Makelaardij"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Makelaar
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>020-1234567</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    <span>info@horecagrond.nl</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ────────── LIGHTBOX ────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <div
            className="max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={`${property.title} - foto ${currentImageIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-4 py-2 text-sm text-white">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

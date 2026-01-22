import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Maximize2,
  Euro,
  Building2,
  Calendar,
  Users,
  UtensilsCrossed,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Shield,
  Zap,
  Accessibility,
  Clock,
  Layers,
  Ruler,
} from "lucide-react";

import { getPropertyBySlug, getSimilarProperties } from "@/app/actions/property";
import { constructMetadata } from "@/lib/constructMetadata";
import {
  generatePropertyStructuredData,
  generatePropertyBreadcrumbStructuredData,
  PropertyStructuredData,
} from "@/lib/property/structured-data";
import {
  formatPrice,
  formatSurface,
  formatAvailability,
  formatLeaseTerm,
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  PRICE_TYPE_LABELS,
  FEATURE_CATEGORY_LABELS,
  FEATURE_KEY_LABELS,
  KITCHEN_TYPE_LABELS,
  ENERGY_LABEL_COLORS,
  getHorecaScoreColor,
} from "@/lib/property/utils";
import { cn } from "@/lib/utils";

import { PropertyImageGallery } from "@/components/property/property-image-gallery";
import { PropertyInquiryForm } from "@/components/property/property-inquiry-form";
import { PropertyViewTracker } from "@/components/property/property-view-tracker";
import { PropertyCard } from "@/components/property/property-card";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPropertyBySlug(slug);

  if (!result.success || !result.data) {
    return constructMetadata({
      title: "Pand niet gevonden – Horecagrond",
      description: "Dit pand bestaat niet of is niet meer beschikbaar.",
      noIndex: true,
    });
  }

  const property = result.data;
  const priceText = property.priceType === "SALE"
    ? formatPrice(property.salePrice)
    : `${formatPrice(property.rentPrice)}/maand`;

  const title = property.metaTitle || `${property.title} – ${property.city} | Horecagrond`;
  const description = property.metaDescription ||
    property.shortDescription ||
    `${PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType} ${PRICE_TYPE_LABELS[property.priceType].toLowerCase()} in ${property.city}. ${property.surfaceTotal} m², ${priceText}. ${property.description?.substring(0, 120)}...`;

  const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
  const ogImage = primaryImage?.largeUrl || primaryImage?.originalUrl;

  return constructMetadata({
    title,
    description,
    image: ogImage,
  });
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await getPropertyBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const property = result.data;

  // Fetch similar properties
  const similarResult = await getSimilarProperties(
    property.id,
    property.propertyType,
    property.city,
    property.priceType,
    3
  );
  const similarProperties = similarResult.success ? similarResult.data || [] : [];

  // Group features by category
  const featuresByCategory = property.features.reduce((acc, feature) => {
    const category = feature.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, typeof property.features>);

  // Generate structured data
  const propertyStructuredData = generatePropertyStructuredData({
    ...property,
    images: property.images,
    agency: property.agency,
  });

  const breadcrumbStructuredData = generatePropertyBreadcrumbStructuredData(
    property.title,
    property.slug,
    property.city
  );

  // Feature category icons
  const categoryIcons: Record<string, React.ReactNode> = {
    LICENSE: <Shield className="size-5" />,
    FACILITY: <Building2 className="size-5" />,
    UTILITY: <Zap className="size-5" />,
    ACCESSIBILITY: <Accessibility className="size-5" />,
  };

  return (
    <>
      {/* Structured Data */}
      <PropertyStructuredData data={propertyStructuredData} />
      <PropertyStructuredData data={breadcrumbStructuredData} />

      {/* View Tracker */}
      <PropertyViewTracker propertyId={property.id} />

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/aanbod">Aanbod</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/aanbod?city=${encodeURIComponent(property.city)}`}>
                      {property.city}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{property.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Hero Section: Image Gallery */}
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <PropertyImageGallery
            images={property.images}
            propertyTitle={property.title}
          />
        </section>

        {/* Key Stats Bar */}
        <section className="border-y bg-muted/30 mt-8">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:flex lg:items-center lg:justify-between">
              {/* Price */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Euro className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {property.priceType === "SALE" ? "Vraagprijs" : "Huurprijs"}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {property.priceType === "SALE"
                      ? formatPrice(property.salePrice)
                      : `${formatPrice(property.rentPrice)}/mnd`}
                    {property.priceNegotiable && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (v.o.n.)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Surface */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Maximize2 className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Oppervlakte</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatSurface(property.surfaceTotal)}
                  </p>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-lg font-semibold text-foreground">
                    {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={PROPERTY_STATUS_COLORS[property.status] || "secondary"}>
                    {PROPERTY_STATUS_LABELS[property.status] || property.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Title & Location */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline">
                    {PRICE_TYPE_LABELS[property.priceType]}
                  </Badge>
                  {property.featured && (
                    <Badge variant="default">Uitgelicht</Badge>
                  )}
                  {property.horecaScore && (
                    <Badge className={cn("text-white", getHorecaScoreColor(property.horecaScore))}>
                      Horeca Score: {property.horecaScore}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {property.title}
                </h1>
                <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-5 flex-shrink-0" />
                  <span>
                    {property.address}
                    {property.addressLine2 && `, ${property.addressLine2}`}
                    {`, ${property.postalCode} ${property.city}`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Beschrijving
                </h2>
                <div className="prose prose-gray max-w-none">
                  {property.description ? (
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {property.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Geen beschrijving beschikbaar.
                    </p>
                  )}
                </div>
              </section>

              {/* Property Details Grid */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Pand details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Surface Areas */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Ruler className="size-4" />
                        Oppervlaktes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Totaal</span>
                        <span className="font-medium">{formatSurface(property.surfaceTotal)}</span>
                      </div>
                      {property.surfaceCommercial && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commercieel</span>
                          <span className="font-medium">{formatSurface(property.surfaceCommercial)}</span>
                        </div>
                      )}
                      {property.surfaceKitchen && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Keuken</span>
                          <span className="font-medium">{formatSurface(property.surfaceKitchen)}</span>
                        </div>
                      )}
                      {property.surfaceTerrace && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Terras</span>
                          <span className="font-medium">{formatSurface(property.surfaceTerrace)}</span>
                        </div>
                      )}
                      {property.surfaceStorage && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Opslag</span>
                          <span className="font-medium">{formatSurface(property.surfaceStorage)}</span>
                        </div>
                      )}
                      {property.surfaceBasement && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kelder</span>
                          <span className="font-medium">{formatSurface(property.surfaceBasement)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Building Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="size-4" />
                        Gebouw
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verdiepingen</span>
                        <span className="font-medium">{property.floors}</span>
                      </div>
                      {property.ceilingHeight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plafondhoogte</span>
                          <span className="font-medium">{property.ceilingHeight}m</span>
                        </div>
                      )}
                      {property.buildYear && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bouwjaar</span>
                          <span className="font-medium">{property.buildYear}</span>
                        </div>
                      )}
                      {property.lastRenovation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Laatste renovatie</span>
                          <span className="font-medium">{property.lastRenovation}</span>
                        </div>
                      )}
                      {property.energyLabel && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Energielabel</span>
                          <Badge className={cn("text-white", ENERGY_LABEL_COLORS[property.energyLabel] || "bg-muted")}>
                            {property.energyLabel}
                          </Badge>
                        </div>
                      )}
                      {property.monumentStatus && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monument</span>
                          <Badge variant="outline">Ja</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Capacity */}
                  {(property.seatingCapacityInside || property.seatingCapacityOutside || property.standingCapacity) && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="size-4" />
                          Capaciteit
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {property.seatingCapacityInside && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Zitplaatsen binnen</span>
                            <span className="font-medium">{property.seatingCapacityInside}</span>
                          </div>
                        )}
                        {property.seatingCapacityOutside && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Zitplaatsen terras</span>
                            <span className="font-medium">{property.seatingCapacityOutside}</span>
                          </div>
                        )}
                        {property.standingCapacity && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Staanplaatsen</span>
                            <span className="font-medium">{property.standingCapacity}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Kitchen & Horeca */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UtensilsCrossed className="size-4" />
                        Horeca
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {property.kitchenType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Keuken</span>
                          <span className="font-medium">
                            {KITCHEN_TYPE_LABELS[property.kitchenType] || property.kitchenType}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Terras</span>
                        <span className="font-medium">{property.hasTerrace ? "Ja" : "Nee"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kelder</span>
                        <span className="font-medium">{property.hasBasement ? "Ja" : "Nee"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Opslag</span>
                        <span className="font-medium">{property.hasStorage ? "Ja" : "Nee"}</span>
                      </div>
                      {property.hasParking && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Parkeren</span>
                          <span className="font-medium">
                            {property.parkingSpaces ? `${property.parkingSpaces} plaatsen` : "Ja"}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Features Grid by Category */}
              {Object.keys(featuresByCategory).length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-6">
                    Kenmerken
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.entries(featuresByCategory).map(([category, features]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            {categoryIcons[category]}
                            {FEATURE_CATEGORY_LABELS[category] || category}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {features.map((feature) => (
                              <li key={feature.id} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="size-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  {FEATURE_KEY_LABELS[feature.key] || feature.key}
                                </span>
                                {feature.verified && (
                                  <Badge variant="outline" className="text-xs ml-auto">
                                    Geverifieerd
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Location Section */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Locatie
                </h2>
                <Card>
                  <CardContent className="p-0">
                    {/* Static Map Image (using OpenStreetMap or placeholder) */}
                    {property.latitude && property.longitude ? (
                      <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg bg-muted">
                        <Image
                          src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-l+3b82f6(${property.longitude},${property.latitude})/${property.longitude},${property.latitude},15,0/800x450@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.placeholder"}`}
                          alt={`Kaart van ${property.address}, ${property.city}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-muted rounded-t-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <MapPin className="size-8 mx-auto mb-2 opacity-50" />
                          <p>Exacte locatie op aanvraag</p>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="font-medium text-foreground">
                        {property.address}
                        {property.addressLine2 && `, ${property.addressLine2}`}
                      </p>
                      <p className="text-muted-foreground">
                        {property.postalCode} {property.city}
                        {property.province && `, ${property.province}`}
                      </p>
                      {property.neighborhood && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Buurt: {property.neighborhood}
                        </p>
                      )}
                      {property.locationScore && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Locatiescore:</span>
                          <Badge variant="secondary">{property.locationScore}/100</Badge>
                        </div>
                      )}
                      {property.footfallEstimate && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Passanten (schatting):</span>
                          <Badge variant="secondary">{property.footfallEstimate.toLocaleString("nl-NL")}/dag</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Agent/Agency Card */}
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Over de makelaar
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-16 border">
                        {property.agency.logoUrl ? (
                          <AvatarImage src={property.agency.logoUrl} alt={property.agency.name} />
                        ) : (
                          <AvatarFallback className="text-lg">
                            {property.agency.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {property.agency.name}
                        </h3>
                        {property.agency.city && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="size-3" />
                            {property.agency.city}
                            {property.agency.province && `, ${property.agency.province}`}
                          </p>
                        )}
                        {property.agency.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {property.agency.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {property.agency.phone && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`tel:${property.agency.phone}`}>
                                <Phone className="size-4 mr-2" />
                                {property.agency.phone}
                              </a>
                            </Button>
                          )}
                          {property.agency.email && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`mailto:${property.agency.email}`}>
                                <Mail className="size-4 mr-2" />
                                E-mail
                              </a>
                            </Button>
                          )}
                          {property.agency.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={property.agency.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="size-4 mr-2" />
                                Website
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact person */}
                    {property.createdBy && (
                      <>
                        <Separator className="my-6" />
                        <div className="flex items-center gap-4">
                          <Avatar className="size-12">
                            {property.createdBy.image ? (
                              <AvatarImage src={property.createdBy.image} alt={property.createdBy.name || ""} />
                            ) : (
                              <AvatarFallback>
                                {(property.createdBy.name || property.createdBy.email).substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm text-muted-foreground">Contactpersoon</p>
                            <p className="font-medium text-foreground">
                              {property.createdBy.name || property.createdBy.email}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Right Column: Sticky Contact Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <PropertyInquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                />

                {/* Quick Info Card */}
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="size-4" />
                      Beschikbaarheid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={PROPERTY_STATUS_COLORS[property.status] || "secondary"}>
                        {PROPERTY_STATUS_LABELS[property.status] || property.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beschikbaar</span>
                      <span className="font-medium">
                        {formatAvailability(property.availableFrom)}
                      </span>
                    </div>
                    {property.minimumLeaseTerm && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min. huurtermijn</span>
                        <span className="font-medium">
                          {formatLeaseTerm(property.minimumLeaseTerm)}
                        </span>
                      </div>
                    )}
                    {property.depositMonths && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Borg</span>
                        <span className="font-medium">
                          {property.depositMonths} maand{property.depositMonths > 1 ? "en" : ""}
                        </span>
                      </div>
                    )}
                    {property.servicesCosts && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Servicekosten</span>
                        <span className="font-medium">
                          {formatPrice(property.servicesCosts)}/mnd
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="mt-6">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-around text-center text-sm">
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{property.viewCount}</p>
                        <p className="text-muted-foreground">Bekeken</p>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{property.inquiryCount}</p>
                        <p className="text-muted-foreground">Aanvragen</p>
                      </div>
                      <Separator orientation="vertical" className="h-10" />
                      <div>
                        <p className="text-2xl font-semibold text-foreground">{property.savedCount}</p>
                        <p className="text-muted-foreground">Bewaard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <section className="border-t bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-foreground">
                  Vergelijkbare panden
                </h2>
                <Button variant="outline" asChild>
                  <Link href="/aanbod">Bekijk alle panden</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarProperties.map((similar) => (
                  <PropertyCard key={similar.id} property={similar} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

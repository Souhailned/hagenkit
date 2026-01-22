import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Clock,
  Calendar,
  Layers,
  Users,
  Heart,
  Share2,
  Printer,
} from "lucide-react";

import { constructMetadata } from "@/lib/constructMetadata";
import { getPropertyBySlug, getSimilarProperties } from "@/app/actions/property";
import {
  generatePropertyStructuredData,
  generatePropertyBreadcrumbStructuredData,
  StructuredData,
} from "@/lib/property/structured-data";
import { formatPrice, formatSurface, PropertyTypeLabels } from "@/lib/types/property";

import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyStatsBar } from "@/components/property/property-stats-bar";
import { PropertyFeatures } from "@/components/property/property-features";
import { PropertyLocation } from "@/components/property/property-location";
import { AgentCard } from "@/components/property/agent-card";
import { InquiryForm } from "@/components/property/inquiry-form";
import { SimilarProperties } from "@/components/property/similar-properties";
import { ViewTracker } from "@/components/property/view-tracker";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const result = await getPropertyBySlug(slug);

  if (!result.success || !result.data) {
    return;
  }

  const property = result.data;
  const primaryImage =
    property.images?.find((img) => img.isPrimary) || property.images?.[0];

  const title = property.metaTitle || `${property.title} - Horecagrond`;
  const description =
    property.metaDescription ||
    property.shortDescription ||
    `${PropertyTypeLabels[property.propertyType]} te ${
      property.priceType === "SALE" ? "koop" : "huur"
    } in ${property.city}. ${formatSurface(property.surfaceTotal)}, ${formatPrice(
      property.priceType === "SALE" ? property.salePrice : property.rentPrice
    )}${property.priceType !== "SALE" ? "/maand" : ""}.`;

  return constructMetadata({
    title,
    description,
    image: primaryImage?.largeUrl || primaryImage?.originalUrl,
  });
}

// Main page component
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
  const similarResult = await getSimilarProperties(property.id, 3);
  const similarProperties = similarResult.success ? similarResult.data || [] : [];

  // Generate structured data
  const propertyStructuredData = generatePropertyStructuredData(property);
  const breadcrumbStructuredData = generatePropertyBreadcrumbStructuredData(property);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={propertyStructuredData} />
      <StructuredData data={breadcrumbStructuredData} />

      {/* View Tracker */}
      <ViewTracker propertyId={property.id} />

      {/* Breadcrumbs */}
      <MaxWidthWrapper className="pt-24 pb-4">
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
      </MaxWidthWrapper>

      {/* Hero Section with Gallery */}
      <MaxWidthWrapper className="pb-6">
        <PropertyGallery
          images={property.images || []}
          title={property.title}
        />
      </MaxWidthWrapper>

      {/* Main Content */}
      <div className="relative pb-16">
        {/* Background decoration */}
        <div className="absolute top-24 h-[calc(100%-6rem)] w-full border-t bg-gradient-to-b from-muted/50 to-background" />

        <MaxWidthWrapper className="relative">
          {/* Title and action buttons */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {PropertyTypeLabels[property.propertyType]}
                </Badge>
                {property.neighborhood && (
                  <Badge variant="outline">{property.neighborhood}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {property.title}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {property.address}, {property.city}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Bewaren
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Delen
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          {/* Key Stats Bar */}
          <PropertyStatsBar property={property} className="mb-8" />

          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              <section>
                <h2 className="mb-4 text-xl font-semibold">Beschrijving</h2>
                <div className="prose prose-gray max-w-none">
                  {property.description ? (
                    property.description.split("\n\n").map((paragraph, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      {property.shortDescription || "Geen beschrijving beschikbaar."}
                    </p>
                  )}
                </div>
              </section>

              <Separator />

              {/* Property Details Grid */}
              <section>
                <h2 className="mb-4 text-xl font-semibold">Details</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <DetailItem
                    icon={<Layers className="h-5 w-5" />}
                    label="Totale oppervlakte"
                    value={formatSurface(property.surfaceTotal)}
                  />
                  {property.surfaceCommercial && (
                    <DetailItem
                      icon={<Building2 className="h-5 w-5" />}
                      label="Commerciële ruimte"
                      value={formatSurface(property.surfaceCommercial)}
                    />
                  )}
                  {property.surfaceKitchen && (
                    <DetailItem
                      icon={<Building2 className="h-5 w-5" />}
                      label="Keuken"
                      value={formatSurface(property.surfaceKitchen)}
                    />
                  )}
                  {property.surfaceTerrace && (
                    <DetailItem
                      icon={<Building2 className="h-5 w-5" />}
                      label="Terras"
                      value={formatSurface(property.surfaceTerrace)}
                    />
                  )}
                  {property.floors > 1 && (
                    <DetailItem
                      icon={<Layers className="h-5 w-5" />}
                      label="Verdiepingen"
                      value={`${property.floors}`}
                    />
                  )}
                  {property.ceilingHeight && (
                    <DetailItem
                      icon={<Layers className="h-5 w-5" />}
                      label="Plafondhoogte"
                      value={`${property.ceilingHeight}m`}
                    />
                  )}
                  {property.seatingCapacityInside && (
                    <DetailItem
                      icon={<Users className="h-5 w-5" />}
                      label="Zitplaatsen binnen"
                      value={`${property.seatingCapacityInside}`}
                    />
                  )}
                  {property.seatingCapacityOutside && (
                    <DetailItem
                      icon={<Users className="h-5 w-5" />}
                      label="Zitplaatsen buiten"
                      value={`${property.seatingCapacityOutside}`}
                    />
                  )}
                  {property.buildYear && (
                    <DetailItem
                      icon={<Calendar className="h-5 w-5" />}
                      label="Bouwjaar"
                      value={`${property.buildYear}`}
                    />
                  )}
                  {property.lastRenovation && (
                    <DetailItem
                      icon={<Clock className="h-5 w-5" />}
                      label="Laatste renovatie"
                      value={`${property.lastRenovation}`}
                    />
                  )}
                  {property.energyLabel && (
                    <DetailItem
                      icon={<Layers className="h-5 w-5" />}
                      label="Energielabel"
                      value={property.energyLabel}
                    />
                  )}
                </div>
              </section>

              <Separator />

              {/* Features */}
              <section>
                <h2 className="mb-4 text-xl font-semibold">Kenmerken</h2>
                <PropertyFeatures features={property.features || []} />
              </section>

              <Separator />

              {/* Location */}
              <section>
                <PropertyLocation property={property} />
              </section>

              <Separator />

              {/* Agent Card - Mobile Only */}
              <div className="lg:hidden">
                <AgentCard agent={property.creator} agency={property.agency} />
              </div>
            </div>

            {/* Right Column - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Contact Card */}
                <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                  <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="text-lg">
                      Interesse in dit pand?
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Laat je gegevens achter en de makelaar neemt binnen 24 uur
                      contact met je op.
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <InquiryForm
                      propertyId={property.id}
                      propertyTitle={property.title}
                      priceType={property.priceType}
                    />
                  </CardContent>
                </Card>

                {/* Agent Card - Desktop Only */}
                <div className="hidden lg:block">
                  <AgentCard agent={property.creator} agency={property.agency} />
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <>
              <Separator className="my-12" />
              <SimilarProperties properties={similarProperties} />
            </>
          )}
        </MaxWidthWrapper>
      </div>
    </>
  );
}

// Helper component for detail items
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

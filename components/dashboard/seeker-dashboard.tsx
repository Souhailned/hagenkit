import Link from "next/link";
import {
  Sparkles,
  Clock,
  Bell,
  ArrowRight,
  Settings,
  Search,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  PropertyCard,
  PropertyCardGrid,
  PropertyCardSkeleton,
} from "@/components/property/property-card";
import { getSeekerRecommendations } from "@/app/actions/seeker-profile";
import { cn } from "@/lib/utils";

/**
 * SeekerDashboard - Server component for seeker homepage
 *
 * Displays:
 * - "Aanbevolen voor jou" section with personalized property cards
 * - "Recent bekeken" section
 * - "Nieuwe matches" section for properties matching alerts
 * - Empty state if no preferences set with link to profile
 *
 * Design: Clean, editorial real estate aesthetic with warm neutrals,
 * generous whitespace, and clear visual hierarchy
 */
export async function SeekerDashboard() {
  const result = await getSeekerRecommendations();

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
        <SeekerErrorState />
      </div>
    );
  }

  const { recommended, recentlyViewed, newMatches, hasPreferences } =
    result.data;

  // Show empty state if no preferences are configured
  if (!hasPreferences) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
        <SeekerEmptyState />
      </div>
    );
  }

  // Check if there's any content to show
  const hasContent =
    recommended.length > 0 ||
    recentlyViewed.length > 0 ||
    newMatches.length > 0;

  if (!hasContent) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-8">
        <SeekerNoResultsState />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Welcome Message */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-background px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Welkom terug
              </h1>
              <p className="mt-1 text-muted-foreground">
                Ontdek horecalocaties die perfect passen bij jouw concept
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/aanbod">
                  <Search className="size-4" />
                  Zoek Aanbod
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings/profile">
                  <Settings className="size-4" />
                  Voorkeuren
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 md:py-10">
        {/* New Matches Section - Most prominent if there are new matches */}
        {newMatches.length > 0 && (
          <DashboardSection
            title="Nieuwe Matches"
            description="Nieuwe panden die voldoen aan jouw zoek alerts"
            icon={<Bell className="size-5" />}
            href="/dashboard/alerts"
            linkText="Beheer Alerts"
            accentColor="primary"
          >
            <PropertyCardGrid>
              {newMatches.slice(0, 4).map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 2}
                />
              ))}
            </PropertyCardGrid>
            {newMatches.length > 4 && (
              <SeeMoreButton
                href="/dashboard/alerts"
                count={newMatches.length - 4}
                label="Bekijk meer matches"
              />
            )}
          </DashboardSection>
        )}

        {/* Recommended Section */}
        {recommended.length > 0 && (
          <DashboardSection
            title="Aanbevolen voor jou"
            description="Geselecteerd op basis van jouw voorkeuren en zoekgedrag"
            icon={<Sparkles className="size-5" />}
            href="/aanbod"
            linkText="Bekijk Alle"
          >
            <PropertyCardGrid>
              {recommended.slice(0, 8).map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={newMatches.length === 0 && index < 2}
                />
              ))}
            </PropertyCardGrid>
            {recommended.length > 8 && (
              <SeeMoreButton
                href="/aanbod"
                count={recommended.length - 8}
                label="Bekijk meer aanbevelingen"
              />
            )}
          </DashboardSection>
        )}

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <DashboardSection
            title="Recent bekeken"
            description="Panden die je recent hebt bezocht"
            icon={<Clock className="size-5" />}
            href="/dashboard/favorieten"
            linkText="Mijn Favorieten"
          >
            <PropertyCardGrid className="lg:grid-cols-3 xl:grid-cols-3">
              {recentlyViewed.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </PropertyCardGrid>
          </DashboardSection>
        )}

        {/* Quick Actions Footer */}
        <section className="rounded-xl border border-border/50 bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                Klaar om verder te zoeken?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verfijn je voorkeuren of bekijk het volledige aanbod
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/aanbod">
                  <Search className="size-4" />
                  Bekijk Aanbod
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/favorieten">
                  <Heart className="size-4" />
                  Favorieten
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * Section wrapper component for dashboard sections
 */
function DashboardSection({
  title,
  description,
  icon,
  href,
  linkText,
  accentColor,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  linkText?: string;
  accentColor?: "primary" | "default";
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Section Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              accentColor === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {href && linkText && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            asChild
          >
            <Link href={href}>
              {linkText}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Section Content */}
      {children}
    </section>
  );
}

/**
 * See more button for sections with more content
 */
function SeeMoreButton({
  href,
  count,
  label,
}: {
  href: string;
  count: number;
  label: string;
}) {
  return (
    <div className="mt-6 flex justify-center">
      <Button variant="outline" asChild>
        <Link href={href}>
          {label}
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            +{count}
          </span>
        </Link>
      </Button>
    </div>
  );
}

/**
 * Empty state when user has no preferences configured
 */
function SeekerEmptyState() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Settings />
        </EmptyMedia>
        <EmptyTitle>Stel je voorkeuren in</EmptyTitle>
        <EmptyDescription>
          Vertel ons wat je zoekt en we helpen je de perfecte horecalocatie te
          vinden. Stel je budget, gewenste locaties en type pand in om
          gepersonaliseerde aanbevelingen te ontvangen.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/settings/profile">
              <Settings className="size-4" />
              Voorkeuren Instellen
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/aanbod">
              <Search className="size-4" />
              Direct Zoeken
            </Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

/**
 * Empty state when there are no results matching preferences
 */
function SeekerNoResultsState() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>Nog geen matches gevonden</EmptyTitle>
        <EmptyDescription>
          We hebben nog geen panden gevonden die aan jouw criteria voldoen.
          Probeer je voorkeuren aan te passen of bekijk het volledige aanbod.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/aanbod">
              <Search className="size-4" />
              Bekijk Aanbod
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/settings/profile">
              <Settings className="size-4" />
              Pas Voorkeuren Aan
            </Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

/**
 * Error state when recommendations fail to load
 */
function SeekerErrorState() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Sparkles />
        </EmptyMedia>
        <EmptyTitle>Er ging iets mis</EmptyTitle>
        <EmptyDescription>
          We konden je aanbevelingen niet laden. Probeer de pagina te verversen
          of neem contact met ons op als het probleem aanhoudt.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <RefreshButton />
      </EmptyContent>
    </Empty>
  );
}

/**
 * Skeleton loader for the seeker dashboard
 */
export function SeekerDashboardSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <section className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-background px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="h-8 w-48 animate-pulse rounded-lg bg-muted md:h-9" />
              <div className="mt-2 h-5 w-72 animate-pulse rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-6 md:py-10">
        {/* Section 1 */}
        <div>
          <div className="mb-6 flex items-start gap-3">
            <div className="size-10 animate-pulse rounded-lg bg-muted" />
            <div>
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="mt-1.5 h-4 w-64 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <PropertyCardGrid>
            {[...Array(4)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </PropertyCardGrid>
        </div>

        {/* Section 2 */}
        <div>
          <div className="mb-6 flex items-start gap-3">
            <div className="size-10 animate-pulse rounded-lg bg-muted" />
            <div>
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-1.5 h-4 w-56 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <PropertyCardGrid className="lg:grid-cols-3 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </PropertyCardGrid>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { SlidersHorizontalIcon, SearchIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Empty state shown when seeker has no preferences set
 * Encourages user to complete their profile for personalized recommendations
 */
export function SeekerNoPreferencesState() {
  return (
    <Empty className="min-h-[400px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SlidersHorizontalIcon />
        </EmptyMedia>
        <EmptyTitle>Stel je voorkeuren in</EmptyTitle>
        <EmptyDescription>
          Vul je zoekprofiel in om gepersonaliseerde aanbevelingen te krijgen.
          We matchen je dan automatisch met de beste horecalocaties.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/dashboard/settings">
              <SlidersHorizontalIcon className="mr-2 h-4 w-4" />
              Profiel instellen
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/aanbod">
              <SearchIcon className="mr-2 h-4 w-4" />
              Direct zoeken
            </Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

/**
 * Empty state for sections without content
 */
export function SeekerSectionEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <SparklesIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="mb-1 font-medium text-foreground">{title}</h4>
      <p className="mb-4 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && (
        <Button variant="outline" size="sm" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

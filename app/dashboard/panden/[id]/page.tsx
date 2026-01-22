import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProperty } from "@/app/actions/property";
import { PropertyDetailContent } from "@/components/property/property-detail-content";
import { PropertyDetailSkeleton } from "@/components/property/property-detail-skeleton";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  const result = await getProperty(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <Suspense fallback={<PropertyDetailSkeleton />}>
      <PropertyDetailContent property={result.data} />
    </Suspense>
  );
}

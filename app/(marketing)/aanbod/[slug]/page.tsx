import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/app/actions/properties";
import { PropertyDetail } from "./property-detail";

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

  return <PropertyDetail property={result.data} />;
}

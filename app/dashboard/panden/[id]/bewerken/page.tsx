import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EditPropertyForm } from "./edit-form";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export default async function BewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const property = await prisma.property.findFirst({
    where: { id, createdById: session.user.id },
  });

  if (!property) notFound();

  return (
    <ContentCard>
      <ContentCardHeader title="Pand Bewerken" />
      <ContentCardBody className="p-4">
        <div className="mx-auto max-w-3xl">
          <EditPropertyForm property={property} />
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}

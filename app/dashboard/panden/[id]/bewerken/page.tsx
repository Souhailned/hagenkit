import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EditPropertyForm } from "./edit-form";

export default async function BewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const property = await prisma.property.findFirst({
    where: { id, createdById: session.user.id },
  });

  if (!property) notFound();

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Pand bewerken</h1>
      <EditPropertyForm property={property} />
    </div>
  );
}

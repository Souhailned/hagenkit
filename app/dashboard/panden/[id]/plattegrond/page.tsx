import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FloorPlanEditorClient } from "./floor-plan-editor-client";
import type { FloorPlanData } from "@/app/actions/floor-plans";

export default async function PlattegrondPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const property = await prisma.property.findFirst({
    where: { id, createdById: session.user.id },
    select: {
      id: true,
      title: true,
      floorPlans: {
        orderBy: { floor: "asc" },
      },
    },
  });

  if (!property) notFound();

  return (
    <ContentCard>
      <ContentCardHeader
        title={`Plattegrond - ${property.title}`}
        actions={
          <Link href={`/dashboard/panden/${property.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Terug
            </Button>
          </Link>
        }
      />
      <ContentCardBody>
        <FloorPlanEditorClient
          propertyId={property.id}
          initialFloorPlans={property.floorPlans as FloorPlanData[]}
        />
      </ContentCardBody>
    </ContentCard>
  );
}

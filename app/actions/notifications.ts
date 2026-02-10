"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getRecentActivity(limit = 10) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const inquiries = await prisma.propertyInquiry.findMany({
    where: {
      property: { createdById: session.user.id },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      property: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return inquiries.map((inq) => ({
    id: inq.id,
    type: "inquiry" as const,
    message: `${inq.name} heeft een aanvraag gedaan voor ${inq.property.title}`,
    slug: inq.property.slug,
    createdAt: inq.createdAt,
  }));
}

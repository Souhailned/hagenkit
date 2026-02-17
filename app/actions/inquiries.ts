"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createInquirySchema } from "@/lib/validations/inquiry";
import type { ActionResult } from "@/types/actions";
import type { z } from "zod";

type CreateInquiryInput = z.infer<typeof createInquirySchema>;

export async function createInquiry(
  input: CreateInquiryInput
): Promise<ActionResult<{ inquiryId: string }>> {
  try {
    // 1. Validate input with Zod (email format, min lengths, etc.)
    const validated = createInquirySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }
    const data = validated.data;

    // 2. Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
      select: { id: true, title: true, agencyId: true },
    });

    if (!property) {
      return { success: false, error: "Pand niet gevonden" };
    }

    // 3. Get user session (optional - can submit without login)
    const session = await auth.api.getSession({ headers: await headers() });

    // 4. Create inquiry
    const inquiry = await prisma.propertyInquiry.create({
      data: {
        propertyId: data.propertyId,
        seekerId: session?.user?.id || null,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        intendedUse: data.intendedUse || null,
        source: "WEBSITE",
        status: "NEW",
      },
    });

    // 5. Update inquiry count on property
    await prisma.property.update({
      where: { id: data.propertyId },
      data: { inquiryCount: { increment: 1 } },
    });

    return { success: true, data: { inquiryId: inquiry.id } };
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return { success: false, error: "Er ging iets mis bij het versturen van je aanvraag" };
  }
}

export async function getPropertyInquiries(
  propertyId: string
): Promise<ActionResult<any>> {
  try {
    // 1. Auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Niet ingelogd" };
    }

    // 2. Ownership check — verify user is a member of the agency that owns this property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { agencyId: true },
    });

    if (!property) {
      return { success: false, error: "Pand niet gevonden" };
    }

    const membership = await prisma.agencyMember.findFirst({
      where: {
        userId: session.user.id,
        agencyId: property.agencyId,
      },
    });

    // Allow admin users to bypass ownership check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!membership && user?.role !== "admin") {
      return { success: false, error: "Je hebt geen toegang tot deze aanvragen" };
    }

    // 3. Fetch inquiries
    const inquiries = await prisma.propertyInquiry.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
      include: {
        seeker: { select: { name: true, email: true, image: true } },
      },
    });

    return { success: true, data: inquiries };
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return { success: false, error: "Er ging iets mis bij het ophalen van aanvragen" };
  }
}

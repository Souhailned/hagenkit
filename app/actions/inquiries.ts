"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface CreateInquiryInput {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function createInquiry(input: CreateInquiryInput) {
  const { propertyId, name, email, phone, message } = input;

  if (!name || !email || !message) {
    return { error: "Vul alle verplichte velden in" };
  }

  // Check if property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, title: true, agencyId: true },
  });

  if (!property) {
    return { error: "Pand niet gevonden" };
  }

  // Get user session (optional - can submit without login)
  const session = await auth.api.getSession({ headers: await headers() });

  const inquiry = await prisma.propertyInquiry.create({
    data: {
      propertyId,
      seekerId: session?.user?.id || null,
      name,
      email,
      phone: phone || null,
      message,
      source: "WEBSITE",
      status: "NEW",
    },
  });

  // Update inquiry count on property
  await prisma.property.update({
    where: { id: propertyId },
    data: { inquiryCount: { increment: 1 } },
  });

  return { success: true, inquiryId: inquiry.id };
}

export async function getPropertyInquiries(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { error: "Niet ingelogd" };
  }

  const inquiries = await prisma.propertyInquiry.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
    include: {
      seeker: { select: { name: true, email: true, image: true } },
    },
  });

  return { success: true, data: inquiries };
}

"use server";

import { createInquirySchema, type CreateInquiryInput } from "@/lib/validations/inquiry";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface InquiryResult {
  inquiryId: string;
  propertyTitle: string;
}

/**
 * Create a new property inquiry
 */
export async function createInquiry(
  input: CreateInquiryInput
): Promise<ActionResult<InquiryResult>> {
  try {
    // Validate input
    const validated = createInquirySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Validatie mislukt",
      };
    }

    const data = validated.data;

    // TODO: Replace with actual Prisma query when models are ready
    // Get property to verify it exists and is active
    // const property = await prisma.property.findUnique({
    //   where: { id: data.propertyId, status: "ACTIVE" },
    //   include: { agency: true, creator: { include: { agentProfile: true } } },
    // });
    // if (!property) return { success: false, error: "Property not found" };

    // Create inquiry
    // const inquiry = await prisma.propertyInquiry.create({
    //   data: {
    //     propertyId: data.propertyId,
    //     name: data.name,
    //     email: data.email,
    //     phone: data.phone,
    //     message: data.message,
    //     intendedUse: data.intendedUse,
    //     budget: data.budget,
    //     source: "WEBSITE",
    //   },
    // });

    // Increment property inquiry count
    // await prisma.property.update({
    //   where: { id: data.propertyId },
    //   data: { inquiryCount: { increment: 1 } },
    // });

    // TODO: Send email notification to agent
    // await sendInquiryNotificationEmail({
    //   agentEmail: property.creator.email,
    //   agentName: property.creator.name,
    //   propertyTitle: property.title,
    //   inquiryName: data.name,
    //   inquiryEmail: data.email,
    //   inquiryPhone: data.phone,
    //   inquiryMessage: data.message,
    // });

    // For now, log and return mock result
    console.log("Creating inquiry:", data);

    return {
      success: true,
      data: {
        inquiryId: `inq_${Date.now()}`,
        propertyTitle: "Property", // Would come from actual query
      },
    };
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return { success: false, error: "Er ging iets mis. Probeer het opnieuw." };
  }
}

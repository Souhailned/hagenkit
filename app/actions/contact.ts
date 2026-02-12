"use server";

import prisma from "@/lib/prisma";

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !subject || !message) {
    return { error: "Alle velden zijn verplicht" };
  }

  if (!email.includes("@")) {
    return { error: "Ongeldig e-mailadres" };
  }

  try {
    // Store in database (using PropertyInquiry as a generic contact form)
    // In production, you'd want a dedicated ContactMessage model
    console.log("[Contact Form]", { name, email, subject, message });
    
    // For now, just log it. In production, send email via Resend
    // await sendEmail({ to: "info@horecagrond.nl", subject: `Contact: ${subject}`, ... })

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return { error: "Er ging iets mis. Probeer het later opnieuw." };
  }
}

"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppContactProps {
  propertyTitle: string;
  propertySlug: string;
  agentName?: string;
  whatsappNumber?: string | null;
  className?: string;
  variant?: "default" | "compact";
}

/**
 * WhatsApp contact button dat automatisch het juiste bericht stuurt
 * naar de juiste makelaar op basis van het pand.
 * 
 * Het bericht bevat:
 * - Pandnaam
 * - Link naar het pand
 * - Naam van de geïnteresseerde (indien ingelogd)
 */
export function WhatsAppContact({
  propertyTitle,
  propertySlug,
  agentName,
  whatsappNumber,
  className,
  variant = "default",
}: WhatsAppContactProps) {
  if (!whatsappNumber) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";
  
  // Clean phone number (remove spaces, dashes)
  const cleanNumber = whatsappNumber.replace(/[\s\-()]/g, "");
  
  // Compose automated message
  const message = [
    `Hallo${agentName ? ` ${agentName}` : ""},`,
    ``,
    `Ik heb interesse in het volgende pand op Horecagrond:`,
    `📍 ${propertyTitle}`,
    `🔗 ${baseUrl}/aanbod/${propertySlug}`,
    ``,
    `Kunt u mij meer informatie sturen?`,
    ``,
    `Met vriendelijke groet`,
  ].join("\n");

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  function handleClick() {
    // Track WhatsApp click (for analytics)
    try {
      fetch("/api/track/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertySlug, agentWhatsapp: cleanNumber }),
      }).catch(() => {}); // Fire and forget
    } catch {}

    window.open(whatsappUrl, "_blank");
  }

  if (variant === "compact") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 ${className || ""}`}
        onClick={handleClick}
      >
        <MessageCircle className="mr-1.5 h-4 w-4" />
        WhatsApp
      </Button>
    );
  }

  return (
    <Button
      className={`bg-green-600 hover:bg-green-700 text-white ${className || ""}`}
      onClick={handleClick}
    >
      <MessageCircle className="mr-2 h-5 w-5" />
      Chat via WhatsApp
    </Button>
  );
}

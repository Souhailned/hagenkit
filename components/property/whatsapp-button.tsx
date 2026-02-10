"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  title: string;
  slug: string;
  className?: string;
}

export function WhatsAppButton({ title, slug, className }: WhatsAppButtonProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";
  const message = encodeURIComponent(
    `Hallo, ik heb interesse in: ${title}\n${baseUrl}/aanbod/${slug}`
  );
  const url = `https://wa.me/?text=${message}`;

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => window.open(url, "_blank")}
    >
      <MessageCircle className="mr-1.5 h-4 w-4 text-green-600" />
      WhatsApp
    </Button>
  );
}

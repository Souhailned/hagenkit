"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface EmailShareButtonProps {
  title: string;
  slug: string;
  className?: string;
}

export function EmailShareButton({ title, slug, className }: EmailShareButtonProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://horecagrond.nl";
  const subject = encodeURIComponent(`Bekijk dit horecapand: ${title}`);
  const body = encodeURIComponent(`Hoi!\n\nBekijk dit pand op Horecagrond:\n${title}\n\n${baseUrl}/aanbod/${slug}\n\nGroet`);

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")}
    >
      <Mail className="mr-1.5 h-4 w-4" />
      E-mail
    </Button>
  );
}

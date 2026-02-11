"use client";

import * as React from "react";
import { Phone } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface RevealPhoneProps {
  phone?: string | null;
  agencyName?: string;
}

export function RevealPhone({ phone, agencyName }: RevealPhoneProps) {
  const [revealed, setRevealed] = React.useState(false);

  if (!phone) return null;

  // Mask phone: show first 4 chars + ****
  const masked = phone.slice(0, 4) + " •••• ••••";

  return (
    <Button
      variant="outline"
      className="w-full gap-2 justify-start"
      onClick={() => {
        setRevealed(true);
        // Track the reveal (analytics)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("phone-revealed", {
              detail: { agencyName },
            })
          );
        }
      }}
    >
      <Phone className="h-4 w-4 shrink-0" weight="duotone" />
      {revealed ? (
        <a
          href={`tel:${phone}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {phone}
        </a>
      ) : (
        <span>
          {masked}{" "}
          <span className="text-primary text-xs font-medium">Toon nummer</span>
        </span>
      )}
    </Button>
  );
}

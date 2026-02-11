"use client";

import * as React from "react";
import { EnvelopeSimple, PaperPlaneTilt, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  className?: string;
  variant?: "inline" | "card";
}

export function NewsletterSignup({ className, variant = "inline" }: NewsletterSignupProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // TODO: Connect to email service (Resend/Mailchimp)
    // For now, simulate success
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  if (variant === "card") {
    return (
      <div className={cn("rounded-xl border bg-card p-6", className)}>
        <div className="flex items-center gap-2 mb-2">
          <EnvelopeSimple className="h-5 w-5 text-primary" weight="duotone" />
          <h3 className="font-semibold">Nieuwsbrief</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Ontvang de nieuwste horeca panden direct in je inbox.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="je@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading" || status === "success"}
          />
          <Button type="submit" className="w-full gap-2" disabled={status === "loading" || status === "success"}>
            {status === "success" ? (
              <>
                <CheckCircle className="h-4 w-4" weight="duotone" />
                Aangemeld!
              </>
            ) : (
              <>
                <PaperPlaneTilt className="h-4 w-4" weight="duotone" />
                {status === "loading" ? "Aanmelden..." : "Aanmelden"}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Inline variant (for footer)
  return (
    <div className={cn("", className)}>
      <p className="text-sm font-medium mb-2">Nieuwsbrief</p>
      <p className="text-xs text-muted-foreground mb-3">
        Ontvang nieuwe panden in je inbox
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="je@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-9 text-sm"
          disabled={status === "loading" || status === "success"}
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5" disabled={status === "loading" || status === "success"}>
          {status === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <PaperPlaneTilt className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

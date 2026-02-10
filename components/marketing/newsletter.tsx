"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Check } from "lucide-react";
import { toast } from "sonner";

export function Newsletter({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      // For now, just store in localStorage (later: API/Resend)
      try {
        const stored = localStorage.getItem("newsletter_emails") || "[]";
        const emails = JSON.parse(stored);
        if (!emails.includes(email)) {
          emails.push(email);
          localStorage.setItem("newsletter_emails", JSON.stringify(emails));
        }
        setSubscribed(true);
        toast.success("Bedankt! Je ontvangt binnenkort onze nieuwsbrief.");
      } catch {
        toast.error("Er ging iets mis. Probeer het opnieuw.");
      }
    });
  }

  if (subscribed) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Check className="h-5 w-5" />
          <span className="font-medium">Ingeschreven! 🎉</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="font-semibold">Nieuwsbrief</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Ontvang nieuwe panden en horeca-inzichten in je inbox.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Input
          type="email"
          placeholder="je@email.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isPending}>
          <Mail className="mr-1.5 h-4 w-4" />
          {isPending ? "..." : "Aanmelden"}
        </Button>
      </form>
    </div>
  );
}

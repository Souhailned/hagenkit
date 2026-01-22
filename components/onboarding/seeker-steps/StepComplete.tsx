"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { IconRocket, IconCheck, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * StepComplete Component
 *
 * Success completion step with celebratory confetti animation,
 * summary message, and navigation to the dashboard.
 *
 * @example
 * ```tsx
 * <StepComplete />
 * ```
 */
export function StepComplete() {
  // Fire confetti celebration on mount
  const fireConfetti = useCallback(() => {
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = fireConfetti();
    return cleanup;
  }, [fireConfetti]);

  return (
    <div className="flex flex-col items-center space-y-8 py-8 text-center">
      {/* Success Icon with Animation */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-primary/20",
            "animate-ping"
          )}
          style={{ animationDuration: "2s" }}
        />

        {/* Inner ring */}
        <div
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-full",
            "bg-gradient-to-br from-primary to-primary/80",
            "shadow-lg shadow-primary/30"
          )}
        >
          <IconCheck className="h-12 w-12 text-primary-foreground" />
        </div>

        {/* Decorative sparkles */}
        <IconSparkles
          className={cn(
            "absolute -right-2 -top-2 h-6 w-6 text-amber-500",
            "animate-pulse"
          )}
        />
        <IconSparkles
          className={cn(
            "absolute -bottom-1 -left-3 h-5 w-5 text-primary",
            "animate-pulse"
          )}
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Je bent helemaal klaar! 🎉
        </h2>
        <p className="mx-auto max-w-sm text-muted-foreground">
          Je profiel is compleet. We gaan direct op zoek naar de perfecte
          horecalocatie voor jou.
        </p>
      </div>

      {/* What Happens Next */}
      <div className="w-full max-w-sm space-y-3 rounded-xl border bg-card p-4 text-left shadow-sm">
        <h3 className="font-semibold text-foreground">Wat nu?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              1
            </span>
            <span>
              We matchen jouw criteria met beschikbare horecalocaties
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              2
            </span>
            <span>Je ontvangt notificaties bij nieuwe matches</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              3
            </span>
            <span>Bekijk en reageer op interessante panden</span>
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <Button asChild size="lg" className="w-full max-w-sm gap-2">
        <Link href="/dashboard">
          <IconRocket className="h-5 w-5" />
          Ga naar Dashboard
        </Link>
      </Button>

      {/* Secondary action */}
      <p className="text-xs text-muted-foreground">
        Of{" "}
        <Link
          href="/dashboard/settings"
          className="font-medium text-primary hover:underline"
        >
          pas je voorkeuren aan
        </Link>{" "}
        in de instellingen
      </p>
    </div>
  );
}

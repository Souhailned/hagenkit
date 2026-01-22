"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import {
  IconCheck,
  IconBuilding,
  IconUser,
  IconRocket,
  IconBuildingStore,
  IconSparkles,
} from "@tabler/icons-react";
import type { AgencyInfoData, AgentProfileData } from "./types";

interface StepCompleteProps {
  agencyName: string;
  agentName: string;
  data?: {
    agency: AgencyInfoData;
    profile: AgentProfileData;
  };
}

export function StepComplete({ agencyName, agentName, data }: StepCompleteProps) {
  // Trigger confetti celebration
  useEffect(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
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

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-500">
          <IconCheck className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Je bent klaar!
          </h2>
          <p className="text-muted-foreground">
            Welkom bij Horecagrond, {agentName}!
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Agency Created */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconBuilding className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Kantoor aangemaakt</h4>
            <p className="text-sm text-muted-foreground truncate">
              {agencyName}
            </p>
          </div>
          <IconCheck className="w-5 h-5 text-primary shrink-0" />
        </div>

        {/* Profile Created */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconUser className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Profiel ingesteld</h4>
            <p className="text-sm text-muted-foreground truncate">
              {data?.profile.title || "Makelaar"} bij {agencyName}
            </p>
          </div>
          <IconCheck className="w-5 h-5 text-primary shrink-0" />
        </div>
      </div>

      {/* What's Next Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Wat kun je nu doen?
        </h3>

        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
            <IconBuildingStore className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Voeg je eerste pand toe</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
            <IconSparkles className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Verbeter foto&apos;s met AI</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors">
            <IconUser className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Nodig collega&apos;s uit</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button asChild size="lg" className="w-full h-12 text-base">
        <Link href="/dashboard">
          <IconRocket className="w-5 h-5 mr-2" />
          Ga naar je dashboard
        </Link>
      </Button>

      {/* Help */}
      <p className="text-center text-xs text-muted-foreground">
        Hulp nodig? Bekijk onze{" "}
        <Link href="/help" className="text-primary hover:underline">
          handleidingen
        </Link>{" "}
        of neem{" "}
        <Link href="/contact" className="text-primary hover:underline">
          contact
        </Link>{" "}
        met ons op.
      </p>
    </div>
  );
}

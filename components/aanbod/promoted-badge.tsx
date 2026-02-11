"use client";

import { Lightning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PromotedBadgeProps {
  className?: string;
  variant?: "default" | "compact";
}

export function PromotedBadge({ className, variant = "default" }: PromotedBadgeProps) {
  if (variant === "compact") {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800",
          className
        )}
      >
        <Lightning className="h-3 w-3 mr-0.5" weight="fill" />
        Uitgelicht
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800",
        className
      )}
    >
      <Lightning className="h-3.5 w-3.5" weight="fill" />
      Uitgelicht pand
    </div>
  );
}

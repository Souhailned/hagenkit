"use client";

import { Building, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type RoleValue = "seeker" | "agent";

interface RoleOption {
  value: RoleValue;
  icon: typeof Building;
  title: string;
  description: string;
}

const roleOptions: RoleOption[] = [
  {
    value: "seeker",
    icon: Building,
    title: "Ik zoek horeca ruimte",
    description: "Vind de perfecte locatie voor jouw horecaconcept",
  },
  {
    value: "agent",
    icon: Briefcase,
    title: "Ik ben makelaar",
    description: "Plaats en beheer horecavastgoed aanbod",
  },
];

interface RoleSelectionProps {
  selectedRole: RoleValue | null;
  onSelect: (role: RoleValue) => void;
}

export function RoleSelection({ selectedRole, onSelect }: RoleSelectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {roleOptions.map((option) => {
        const isSelected = selectedRole === option.value;
        const Icon = option.icon;

        return (
          <Card
            key={option.value}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${option.title}: ${option.description}`}
            onClick={() => onSelect(option.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(option.value);
              }
            }}
            className={cn(
              "group relative cursor-pointer p-6 transition-all duration-200",
              "hover:shadow-md hover:border-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected && "border-2 border-primary bg-primary/5 shadow-md"
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              )}
            >
              {isSelected && (
                <svg
                  className="h-3 w-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            {/* Icon container */}
            <div
              className={cn(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}
            >
              <Icon className="h-7 w-7" strokeWidth={1.5} />
            </div>

            {/* Content */}
            <h3
              className={cn(
                "mb-2 text-lg font-semibold tracking-tight transition-colors duration-200",
                isSelected ? "text-primary" : "text-foreground"
              )}
            >
              {option.title}
            </h3>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {option.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

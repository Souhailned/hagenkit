// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStep } from "./types";
import {
  FileText,
  MapPin,
  Euro,
  Ruler,
  ListChecks,
  Image,
  Check,
} from "lucide-react";

const iconMap = {
  FileText,
  MapPin,
  Euro,
  Ruler,
  ListCheck: ListChecks,
  Image,
  Check,
} as const;

interface WizardStepperProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  completedSteps: Set<number>;
  className?: string;
}

export function WizardStepper({
  currentStep,
  onStepClick,
  completedSteps,
  className,
}: WizardStepperProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Wizard progress">
      {WIZARD_STEPS.map((step) => {
        const Icon = iconMap[step.icon as keyof typeof iconMap];
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isClickable = isCompleted || step.id <= currentStep;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepClick(step.id)}
            disabled={!isClickable}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
              isActive && "bg-primary/10 text-primary",
              !isActive && isCompleted && "text-muted-foreground hover:bg-muted/50",
              !isActive && !isCompleted && "text-muted-foreground/50 cursor-not-allowed",
              isClickable && !isActive && "hover:text-foreground"
            )}
            aria-current={isActive ? "step" : undefined}
          >
            {/* Step number or check mark */}
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                isActive && "border-primary bg-primary text-primary-foreground",
                !isActive && isCompleted && "border-primary/50 bg-primary/10 text-primary",
                !isActive && !isCompleted && "border-muted-foreground/30 bg-transparent"
              )}
            >
              {isCompleted && !isActive ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </span>

            {/* Step title */}
            <span className="flex flex-col">
              <span
                className={cn(
                  "text-sm font-medium leading-tight",
                  isActive && "text-primary",
                  !isActive && isCompleted && "text-foreground",
                  !isActive && !isCompleted && "text-muted-foreground/60"
                )}
              >
                {step.title}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Stap {step.id} van {WIZARD_STEPS.length}
              </span>
            </span>

            {/* Active indicator line */}
            {isActive && (
              <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// Compact mobile version
export function WizardStepperMobile({
  currentStep,
  completedSteps,
  className,
}: Omit<WizardStepperProps, "onStepClick">) {
  const currentStepData = WIZARD_STEPS.find((s) => s.id === currentStep);
  const progress = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Progress bar */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.has(step.id);

          return (
            <div
              key={step.id}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                isActive && "bg-primary text-primary-foreground",
                !isActive && isCompleted && "bg-primary/20 text-primary",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted && !isActive ? <Check className="h-3 w-3" /> : step.id}
            </div>
          );
        })}
      </div>

      {/* Current step title */}
      <p className="text-center text-sm font-medium">
        {currentStepData?.title}
        <span className="ml-2 text-muted-foreground">
          ({currentStep}/{WIZARD_STEPS.length})
        </span>
      </p>
    </div>
  );
}

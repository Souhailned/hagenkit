"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { WIZARD_STEPS } from "./types";

interface WizardStepperProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
  className?: string;
}

export function WizardStepper({
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: WizardStepperProps) {
  return (
    <nav
      aria-label="Wizard voortgang"
      className={cn("w-full", className)}
    >
      {/* Desktop: Vertical stepper */}
      <ol className="hidden md:flex md:flex-col md:gap-1">
        {WIZARD_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = step.id < currentStep;
          const isClickable = isCompleted || isPast || step.id <= currentStep;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                  isClickable && "cursor-pointer hover:bg-accent/50",
                  !isClickable && "cursor-not-allowed opacity-50",
                  isCurrent && "bg-primary/5"
                )}
              >
                {/* Step indicator */}
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && !isCompleted && "border-primary bg-background text-primary",
                    !isCurrent && !isCompleted && "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step content */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      isCurrent && "text-foreground",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
                    {step.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Mobile: Horizontal progress bar with dots */}
      <div className="md:hidden">
        {/* Current step label */}
        <div className="mb-3 text-center">
          <p className="text-sm font-medium text-foreground">
            Stap {currentStep}: {WIZARD_STEPS[currentStep - 1].title}
          </p>
          <p className="text-xs text-muted-foreground">
            {WIZARD_STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => (isCompleted || step.id <= currentStep) && onStepClick?.(step.id)}
                disabled={!isCompleted && step.id > currentStep}
                aria-label={`Stap ${step.id}: ${step.title}`}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "size-2.5 rounded-full transition-all",
                  isCompleted && "bg-primary",
                  isCurrent && !isCompleted && "bg-primary ring-4 ring-primary/20",
                  !isCurrent && !isCompleted && "bg-muted-foreground/30",
                  (isCompleted || step.id <= currentStep) && "cursor-pointer hover:scale-125",
                  !isCompleted && step.id > currentStep && "cursor-not-allowed"
                )}
              />
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}

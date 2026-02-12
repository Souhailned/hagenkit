// @ts-nocheck
"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconArrowLeft,
  IconArrowRight,
  IconUpload,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";

import { WizardStepper } from "./wizard-stepper";
import {
  StepBasicInfo,
  StepLocation,
  StepPricing,
  StepDimensions,
  StepFeatures,
  StepPhotos,
  StepReview,
} from "./steps";
import {
  PropertyWizardData,
  INITIAL_WIZARD_DATA,
  WIZARD_STEPS,
} from "./types";

interface PropertyWizardProps {
  /** Called when the wizard is closed (cancel or outside click) */
  onClose: () => void;
  /** Called when property is created/saved */
  onCreate: (data: PropertyWizardData, publish: boolean) => Promise<void>;
  /** Initial data for editing an existing property */
  initialData?: Partial<PropertyWizardData>;
  /** Whether the wizard is open */
  open?: boolean;
}

export function PropertyWizard({
  onClose,
  onCreate,
  initialData,
  open = true,
}: PropertyWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<PropertyWizardData>(() => ({
    ...INITIAL_WIZARD_DATA,
    ...initialData,
  }));
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update wizard data
  const updateData = useCallback((updates: Partial<PropertyWizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Validate current step
  const isStepValid = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1: // Basic Info
          return Boolean(wizardData.title.trim() && wizardData.propertyType);
        case 2: // Location
          return Boolean(
            wizardData.address.trim() &&
            wizardData.city.trim() &&
            wizardData.postalCode.trim()
          );
        case 3: // Pricing
          if (!wizardData.priceType) return false;
          if (wizardData.priceType === "RENT" && !wizardData.rentPrice) return false;
          if (wizardData.priceType === "SALE" && !wizardData.salePrice) return false;
          if (
            wizardData.priceType === "RENT_OR_SALE" &&
            !wizardData.rentPrice &&
            !wizardData.salePrice
          )
            return false;
          return true;
        case 4: // Dimensions
          return Boolean(wizardData.surfaceTotal && wizardData.surfaceTotal > 0);
        case 5: // Features - optional, always valid
          return true;
        case 6: // Photos
          return wizardData.photos.length > 0;
        case 7: // Review - valid if all previous steps are valid
          return (
            isStepValid(1) &&
            isStepValid(2) &&
            isStepValid(3) &&
            isStepValid(4) &&
            isStepValid(6)
          );
        default:
          return false;
      }
    },
    [wizardData]
  );

  // Check if all required steps are complete
  const canPublish = useMemo(() => {
    return (
      isStepValid(1) &&
      isStepValid(2) &&
      isStepValid(3) &&
      isStepValid(4) &&
      isStepValid(6)
    );
  }, [isStepValid]);

  // Navigate to step
  const goToStep = useCallback((step: number | { id: number }) => {
    const stepNum = typeof step === "number" ? step : step.id;
    if (stepNum >= 1 && stepNum <= WIZARD_STEPS.length) {
      setCurrentStep(stepNum);
    }
  }, []);

  // Go to next step
  const nextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length) {
      // Mark current step as completed if valid
      if (isStepValid(currentStep) && !completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, isStepValid, completedSteps]);

  // Go to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Handle save as draft
  const handleSaveDraft = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onCreate({ ...wizardData, isDraft: true }, false);
      onClose();
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [wizardData, onCreate, onClose]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!canPublish) return;
    setIsSubmitting(true);
    try {
      await onCreate({ ...wizardData, isDraft: false }, true);
      onClose();
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [wizardData, canPublish, onCreate, onClose]);

  // Get current step info
  const currentStepInfo = WIZARD_STEPS[currentStep - 1];

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo data={wizardData} onUpdate={updateData} />;
      case 2:
        return <StepLocation data={wizardData} onUpdate={updateData} />;
      case 3:
        return <StepPricing data={wizardData} onUpdate={updateData} />;
      case 4:
        return <StepDimensions data={wizardData} onUpdate={updateData} />;
      case 5:
        return <StepFeatures data={wizardData} onUpdate={updateData} />;
      case 6:
        return <StepPhotos data={wizardData} onUpdate={updateData} />;
      case 7:
        return (
          <StepReview
            data={wizardData}
            onGoToStep={goToStep}
            isSubmitting={false}
            onPublish={() => {}}
            onSaveDraft={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="flex h-[90vh] max-h-[900px] w-[95vw] max-w-5xl flex-col gap-0 p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Nieuw pand toevoegen
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Stap {currentStep} van {WIZARD_STEPS.length}: {currentStepInfo.title}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8"
            >
              <IconX className="size-4" />
              <span className="sr-only">Sluiten</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Stepper sidebar - hidden on mobile */}
          <aside className="hidden w-64 shrink-0 border-r bg-muted/30 p-4 md:block">
            <WizardStepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={goToStep}
            />
          </aside>

          {/* Step content */}
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Mobile stepper */}
            <div className="border-b p-4 md:hidden">
              <WizardStepper
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={goToStep}
              />
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {/* Step title for desktop */}
                <div className="mb-6 hidden md:block">
                  <h3 className="text-lg font-semibold">{currentStepInfo.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentStepInfo.description}
                  </p>
                </div>

                {/* Step content */}
                {renderStepContent()}
              </div>
            </ScrollArea>
          </main>
        </div>

        {/* Footer with navigation */}
        <footer className="flex flex-shrink-0 items-center justify-between border-t bg-muted/30 px-6 py-4">
          {/* Left side - Back button */}
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="gap-2"
              >
                <IconArrowLeft className="size-4" />
                <span className="hidden sm:inline">Vorige</span>
              </Button>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            {/* Save as draft - always available */}
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="gap-2"
            >
              <IconDeviceFloppy className="size-4" />
              <span className="hidden sm:inline">Bewaar concept</span>
            </Button>

            {/* Next / Publish button */}
            {currentStep < WIZARD_STEPS.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="gap-2"
              >
                <span className="hidden sm:inline">Volgende</span>
                <IconArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting || !canPublish}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <IconUpload className="size-4" />
                Publiceren
              </Button>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

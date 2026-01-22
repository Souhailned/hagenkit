"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  type PropertyWizardProps,
  type PropertyWizardData,
  type WizardStep,
  WizardSteps,
  getDefaultWizardData,
} from "./types";
import { WizardStepper, WizardStepperMobile } from "./WizardStepper";
import {
  StepBasicInfo,
  StepLocation,
  StepPricing,
  StepDimensions,
  StepFeatures,
  StepPhotos,
  StepReview,
} from "./steps";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function PropertyWizard({
  open,
  onClose,
  onCreate,
  initialData,
}: PropertyWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [data, setData] = useState<PropertyWizardData>(() => ({
    ...getDefaultWizardData(),
    ...initialData,
  }));
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update data handler
  const handleUpdate = useCallback((updates: Partial<PropertyWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedKeys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  // Validation functions for each step
  const validateStep = useCallback(
    (step: WizardStep): boolean => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 1:
          if (!data.title || data.title.length < 5) {
            newErrors.title = "Titel moet minimaal 5 karakters bevatten";
          }
          if (!data.propertyType) {
            newErrors.propertyType = "Selecteer een type horecagelegenheid";
          }
          break;
        case 2:
          if (!data.address) {
            newErrors.address = "Vul een adres in";
          }
          if (!data.city) {
            newErrors.city = "Vul een stad in";
          }
          if (!data.postalCode) {
            newErrors.postalCode = "Vul een postcode in";
          }
          break;
        case 3:
          if (!data.priceType) {
            newErrors.priceType = "Selecteer een type aanbieding";
          }
          if (data.priceType === "RENT" && !data.rentPrice) {
            newErrors.rentPrice = "Vul een huurprijs in";
          }
          if (data.priceType === "SALE" && !data.salePrice) {
            newErrors.salePrice = "Vul een verkoopprijs in";
          }
          break;
        case 4:
          if (!data.surfaceTotal) {
            newErrors.surfaceTotal = "Vul de totale oppervlakte in";
          }
          break;
        case 5:
          // Features are optional
          break;
        case 6:
          // Photos validation done in review
          break;
        case 7:
          // Review - all validations combined
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [data]
  );

  // Navigate to step
  const goToStep = useCallback(
    (step: WizardStep) => {
      // Mark current step as completed if valid
      if (validateStep(currentStep)) {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      }
      setCurrentStep(step);
    },
    [currentStep, validateStep]
  );

  // Next step handler
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      const nextStep = Math.min(currentStep + 1, 7) as WizardStep;
      setCurrentStep(nextStep);
    }
  }, [currentStep, validateStep]);

  // Previous step handler
  const handlePrevious = useCallback(() => {
    const prevStep = Math.max(currentStep - 1, 1) as WizardStep;
    setCurrentStep(prevStep);
  }, [currentStep]);

  // Submit handlers
  const handlePublish = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onCreate(data, false);
      onClose();
    } catch (error) {
      console.error("Failed to publish property:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, onCreate, onClose]);

  const handleSaveDraft = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onCreate(data, true);
      onClose();
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, onCreate, onClose]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Current step data for header
  const currentStepData = useMemo(
    () => WizardSteps.find((s) => s.id === currentStep),
    [currentStep]
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepBasicInfo data={data} onUpdate={handleUpdate} errors={errors} />;
      case 2:
        return <StepLocation data={data} onUpdate={handleUpdate} errors={errors} />;
      case 3:
        return <StepPricing data={data} onUpdate={handleUpdate} errors={errors} />;
      case 4:
        return <StepDimensions data={data} onUpdate={handleUpdate} errors={errors} />;
      case 5:
        return <StepFeatures data={data} onUpdate={handleUpdate} />;
      case 6:
        return <StepPhotos data={data} onUpdate={handleUpdate} />;
      case 7:
        return (
          <StepReview
            data={data}
            onGoToStep={goToStep}
            isSubmitting={isSubmitting}
            onPublish={handlePublish}
            onSaveDraft={handleSaveDraft}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex h-[90vh] max-h-[900px] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-lg font-semibold">
              Nieuw Pand Toevoegen
            </DialogTitle>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Sluiten</span>
          </Button>
        </DialogHeader>

        {/* Mobile Stepper */}
        <div className="border-b px-4 py-3 md:hidden">
          <WizardStepperMobile
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar Stepper */}
          <aside className="hidden w-64 shrink-0 border-r bg-muted/30 p-4 md:block">
            <WizardStepper
              currentStep={currentStep}
              onStepClick={goToStep}
              completedSteps={completedSteps}
            />
          </aside>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Step Title (desktop) */}
            <div className="hidden border-b px-6 py-3 md:block">
              <h2 className="text-base font-medium">
                Stap {currentStep}: {currentStepData?.title}
              </h2>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
              <div className="p-6">{renderStepContent()}</div>
            </ScrollArea>

            {/* Navigation Footer - only show for steps 1-6 */}
            {currentStep !== 7 && (
              <div className="flex items-center justify-between border-t bg-background px-6 py-4 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Vorige</span>
                </Button>

                <div className="flex items-center gap-2">
                  {/* Step indicators for mobile */}
                  <span className="text-sm text-muted-foreground sm:hidden">
                    {currentStep}/7
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-1"
                >
                  <span className="hidden sm:inline">
                    {currentStep === 6 ? "Bekijk Overzicht" : "Volgende"}
                  </span>
                  <span className="sm:hidden">
                    {currentStep === 6 ? "Overzicht" : "Volgende"}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PropertyWizard;

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Stepper } from "./Stepper"
import type { ProjectData, ProjectMode } from "./types"
import { StepMode } from "./steps/StepMode"
import { StepIntent } from "./steps/StepIntent"
import { StepOutcome } from "./steps/StepOutcome"
import { StepOwnership } from "./steps/StepOwnership"
import { StepStructure } from "./steps/StepStructure"
import { StepReview } from "./steps/StepReview"
import { StepQuickCreate } from "./steps/StepQuickCreate"
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

const QUICK_CREATE_STEP = 100

export interface ProjectCreateData {
  name: string
  description?: string
  priority?: string
  status?: string
  startDate?: string
  endDate?: string
  clientName?: string
  typeLabel?: string
  intent?: string
  structure?: string
  deadlineType?: string
}

interface ProjectWizardProps {
  onClose: () => void
  onCreate?: (data?: ProjectCreateData) => void
}

export function ProjectWizard({ onClose, onCreate }: ProjectWizardProps) {
  const [step, setStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)
  const [isQuickCreateExpanded, setIsQuickCreateExpanded] = useState(false)
  const [data, setData] = useState<ProjectData>({
    mode: undefined,
    successType: "undefined",
    deliverables: [],
    metrics: [],
    description: "",
    deadlineType: "none",
    contributorIds: [],
    stakeholderIds: [],
    addStarterTasks: false,
  })

  const updateData = (updates: Partial<ProjectData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (step === 0 && data.mode === "quick") {
      setStep(QUICK_CREATE_STEP)
      return
    }

    setStep((prev) => {
      const next = prev + 1
      setMaxStepReached((m) => Math.max(m, next))
      return next
    })
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const jumpToStep = (s: number) => {
    setStep(s + 1)
  }

  const handleEditStepFromReview = (targetStep: number) => {
    setStep(targetStep)
  }

  const isNextDisabled = () => {
    if (step === 3 && !data.ownerId) return true
    return false
  }

  const handleClose = () => {
    onClose()
  }

  const steps = [
    "Project intent",
    "Outcome & success",
    "Ownership",
    "Work structure",
    "Review & create",
  ]

  const stepTitles: Record<number, string> = {
    1: "What is this project mainly about?",
    2: "How do you define success?",
    3: "Who is responsible for this project?",
    4: "How should this project be structured?",
    5: "Review project setup",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          height: step === QUICK_CREATE_STEP ? (isQuickCreateExpanded ? "85vh" : "auto") : "auto",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn("flex w-full max-w-[900px] overflow-hidden rounded-[24px] bg-background shadow-2xl")}
      >
        {step === 0 ? (
          <StepMode
            selected={data.mode}
            onSelect={(m) => updateData({ mode: m })}
            onContinue={nextStep}
            onCancel={handleClose}
            onClose={handleClose}
          />
        ) : step === QUICK_CREATE_STEP ? (
          <StepQuickCreate
            onClose={handleClose}
            onCreate={(quickCreateData) => {
              onCreate?.(quickCreateData)
            }}
            onExpandChange={setIsQuickCreateExpanded}
          />
        ) : (
          <>
            {/* Left Sidebar (Stepper) */}
            <div className="hidden w-64 border-r border-border bg-background px-6 py-7 md:flex md:flex-col md:gap-7">
              <div>
                <p className="text-sm font-semibold text-foreground">New Project</p>
              </div>
              <Stepper
                currentStep={step - 1}
                steps={steps}
                onStepClick={jumpToStep}
                maxStepReached={maxStepReached - 1}
              />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
              {/* Header: Title + Close button */}
              <div className="flex items-start justify-between px-8 pt-6 pb-4">
                <div className="pr-6">
                  {stepTitles[step] && (
                    <h2 className="text-lg font-semibold tracking-tight">{stepTitles[step]}</h2>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto px-8 pb-8 pt-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {step === 1 && (
                      <StepIntent selected={data.intent} onSelect={(i) => updateData({ intent: i })} />
                    )}
                    {step === 2 && <StepOutcome data={data} updateData={updateData} />}
                    {step === 3 && <StepOwnership data={data} updateData={updateData} />}
                    {step === 4 && <StepStructure data={data} updateData={updateData} />}
                    {step === 5 && <StepReview data={data} onEditStep={handleEditStepFromReview} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between bg-background p-6">
                <div>
                  <Button variant="outline" onClick={prevStep}>
                    <CaretLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>

                <div className="flex gap-3">
                  {step === 5 ? (
                    <>
                      <Button variant="outline">Save as template</Button>
                      <Button
                        onClick={() => {
                          // Build project data from wizard state
                          const projectData: ProjectCreateData = {
                            name: data.description || "New Project", // Use description as placeholder
                            description: data.description,
                            intent: data.intent,
                            deadlineType: data.deadlineType,
                            endDate: data.deadlineDate,
                            structure: data.structure,
                          }
                          onCreate?.(projectData)
                        }}
                      >
                        Create project
                      </Button>
                    </>
                  ) : (
                    <Button onClick={nextStep} disabled={isNextDisabled()}>
                      Next
                      <CaretRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

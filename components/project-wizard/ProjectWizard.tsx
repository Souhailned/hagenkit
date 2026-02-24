"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { Stepper } from "./Stepper"
import type { ProjectData } from "./types"
import { StepMode } from "./steps/StepMode"
import { StepTitle } from "./steps/StepTitle"
import { StepIntent } from "./steps/StepIntent"
import { StepOutcome } from "./steps/StepOutcome"
import { StepOwnership } from "./steps/StepOwnership"
import { StepStructure } from "./steps/StepStructure"
import { StepReview } from "./steps/StepReview"
import { StepQuickCreate } from "./steps/StepQuickCreate"
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

const QUICK_CREATE_STEP = 100

// Full wizard data passed to onCreate
export interface ProjectWizardSubmitData {
  name: string
  description?: string
  intent?: string
  deadlineType: string
  deadlineDate?: string
  successType: string
  structure?: string
  ownerId?: string
  wizardMembers?: {
    userId: string
    role: "CONTRIBUTOR" | "STAKEHOLDER"
    access: "CAN_EDIT" | "CAN_VIEW"
  }[]
  wizardDeliverables?: { title: string; dueDate?: string }[]
  wizardMetrics?: { name: string; target?: string }[]
  addStarterTasks: boolean
  // Quick-create extra fields
  priority?: string
  status?: string
  startDate?: string
  endDate?: string
  clientName?: string
  typeLabel?: string
}

interface ProjectWizardProps {
  onClose: () => void
  onCreate?: (data: ProjectWizardSubmitData) => void
}

// Guided steps (shown in left sidebar stepper)
const GUIDED_STEPS = [
  "Project title",
  "Project intent",
  "Outcome & success",
  "Ownership",
  "Work structure",
  "Review & create",
]

// Step 0 = StepMode, Steps 1-6 = guided flow, Step 100 = quick create
const STEP_TITLES: Record<number, string> = {
  1: "What would you like to call this project?",
  2: "What is this project mainly about?",
  3: "How do you define success?",
  4: "Who is responsible for this project?",
  5: "How should this project be structured?",
  6: "Review project setup",
}

export function ProjectWizard({ onClose, onCreate }: ProjectWizardProps) {
  const [step, setStep] = useState(0)
  const [maxStepReached, setMaxStepReached] = useState(0)
  const [isQuickCreateExpanded, setIsQuickCreateExpanded] = useState(false)
  const [data, setData] = useState<ProjectData>({
    mode: undefined,
    title: "",
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

  // Jump to a step when clicking the stepper (offset by 1 because stepper is 0-indexed)
  const jumpToStep = (s: number) => {
    setStep(s + 1)
  }

  const handleEditStepFromReview = (targetStep: number) => {
    setStep(targetStep)
  }

  const isNextDisabled = () => {
    if (step === 1 && !data.title?.trim()) return true // title required
    if (step === 4 && !data.ownerId) return true       // owner required
    return false
  }

  const handleCreate = () => {
    if (!data.title?.trim()) return

    // Map wizard contributor/stakeholder ownerships → DB-ready format
    const wizardMembers: ProjectWizardSubmitData["wizardMembers"] = []

    for (const entry of data.contributorOwnerships ?? []) {
      if (entry.accountId === data.ownerId) continue // owner already handled
      wizardMembers.push({
        userId: entry.accountId,
        role: "CONTRIBUTOR",
        access: entry.access === "can_edit" ? "CAN_EDIT" : "CAN_VIEW",
      })
    }
    for (const entry of data.stakeholderOwnerships ?? []) {
      if (entry.accountId === data.ownerId) continue
      const alreadyAdded = wizardMembers.some((m) => m.userId === entry.accountId)
      if (!alreadyAdded) {
        wizardMembers.push({
          userId: entry.accountId,
          role: "STAKEHOLDER",
          access: "CAN_VIEW",
        })
      }
    }

    const submitData: ProjectWizardSubmitData = {
      name: data.title.trim(),
      description: data.description,
      intent: data.intent,
      deadlineType: data.deadlineType.toUpperCase(),
      deadlineDate: data.deadlineDate,
      successType: data.successType.toUpperCase(),
      structure: data.structure?.toUpperCase(),
      ownerId: data.ownerId,
      wizardMembers: wizardMembers.length > 0 ? wizardMembers : undefined,
      wizardDeliverables:
        data.deliverables.length > 0
          ? data.deliverables.map((d) => ({ title: d.title, dueDate: d.dueDate }))
          : undefined,
      wizardMetrics:
        (data.metrics?.length ?? 0) > 0
          ? data.metrics!.map((m) => ({ name: m.name, target: m.target }))
          : undefined,
      addStarterTasks: data.addStarterTasks,
    }

    onCreate?.(submitData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          height:
            step === QUICK_CREATE_STEP
              ? isQuickCreateExpanded
                ? "85vh"
                : "auto"
              : "auto",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn("flex w-full max-w-[900px] overflow-hidden rounded-[24px] bg-background shadow-2xl")}
      >
        {step === 0 ? (
          <StepMode
            selected={data.mode}
            onSelect={(m) => updateData({ mode: m })}
            onContinue={nextStep}
            onCancel={onClose}
            onClose={onClose}
          />
        ) : step === QUICK_CREATE_STEP ? (
          <StepQuickCreate
            onClose={onClose}
            onCreate={(quickData) => {
              // Map quick create data to the unified submit type
              const submitData: ProjectWizardSubmitData = {
                name: quickData.name,
                description: quickData.description,
                priority: quickData.priority,
                status: quickData.status,
                startDate: quickData.startDate,
                endDate: quickData.endDate,
                clientName: quickData.clientName,
                typeLabel: quickData.typeLabel,
                deadlineType: "NONE",
                successType: "UNDEFINED",
                addStarterTasks: false,
              }
              onCreate?.(submitData)
            }}
            onExpandChange={setIsQuickCreateExpanded}
          />
        ) : (
          <>
            {/* Left Sidebar — Stepper */}
            <div className="hidden w-64 border-r border-border bg-background px-6 py-7 md:flex md:flex-col md:gap-7">
              <div>
                <p className="text-sm font-semibold text-foreground">New Project</p>
              </div>
              <Stepper
                currentStep={step - 1}
                steps={GUIDED_STEPS}
                onStepClick={jumpToStep}
                maxStepReached={maxStepReached - 1}
              />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
              {/* Header */}
              <div className="flex items-start justify-between px-8 pt-6 pb-4">
                <div className="pr-6">
                  {STEP_TITLES[step] && (
                    <h2 className="text-lg font-semibold tracking-tight">{STEP_TITLES[step]}</h2>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
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
                    {step === 1 && <StepTitle data={data} updateData={updateData} />}
                    {step === 2 && <StepIntent selected={data.intent} onSelect={(i) => updateData({ intent: i })} />}
                    {step === 3 && <StepOutcome data={data} updateData={updateData} />}
                    {step === 4 && <StepOwnership data={data} updateData={updateData} />}
                    {step === 5 && <StepStructure data={data} updateData={updateData} />}
                    {step === 6 && <StepReview data={data} onEditStep={handleEditStepFromReview} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between bg-background p-6">
                <Button variant="outline" onClick={prevStep}>
                  <CaretLeft className="h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-3">
                  {step === 6 ? (
                    <>
                      <Button variant="outline" disabled>Save as template</Button>
                      <Button onClick={handleCreate} disabled={!data.title?.trim()}>
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

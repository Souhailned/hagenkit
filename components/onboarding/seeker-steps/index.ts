/**
 * Seeker Onboarding Steps
 *
 * Components for the horeca business seeker onboarding flow.
 * Each step is a controlled component with data and onUpdate props.
 */

// Step Components
export { StepBusinessType } from "./StepBusinessType";
export { StepBudget } from "./StepBudget";
export { StepPreferences } from "./StepPreferences";
export { StepComplete } from "./StepComplete";

// Types and Constants
export {
  // Types
  type BusinessType,
  type City,
  type Feature,
  type BusinessTypeData,
  type BudgetData,
  type PreferencesData,
  type SeekerOnboardingData,
  type StepProps,
  // Constants
  BUSINESS_TYPES,
  DUTCH_CITIES,
  MUST_HAVE_FEATURES,
  BUDGET_CONFIG,
  // Utilities
  formatEuro,
  parseEuro,
} from "./types";

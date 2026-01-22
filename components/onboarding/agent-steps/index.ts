/**
 * Agent Onboarding Steps
 *
 * Components for the agent (makelaar) onboarding flow.
 * Each step component follows a controlled form pattern with data and onUpdate props.
 *
 * Flow:
 * 1. StepAgencyInfo - Collect agency/office information
 * 2. StepAgentProfile - Collect agent personal profile
 * 3. StepFirstProperty - Choice to add first property or skip
 * 4. StepComplete - Success confirmation
 */

export { StepAgencyInfo } from "./StepAgencyInfo";
export { StepAgentProfile } from "./StepAgentProfile";
export { StepFirstProperty } from "./StepFirstProperty";
export { StepComplete } from "./StepComplete";

// Types
export type {
  AgencyInfoData,
  AgentProfileData,
  AgentOnboardingData,
  StepProps,
  PropertyType,
  Region,
} from "./types";

// Constants
export {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  REGIONS,
} from "./types";

// Validation helpers
export {
  isValidKvkNumber,
  isValidPostalCode,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "./types";

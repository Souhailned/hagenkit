# Agent Onboarding Steps

Onboarding flow components for real estate agents (makelaars) on Horecagrond.

## Components

### StepAgencyInfo

Collects agency/office information:
- Kantoornaam (office name) - required
- KvK-nummer (Chamber of Commerce number) - with validation
- Telefoon (phone) - required
- E-mailadres (email) - required
- Website - optional
- Kantooradres (office address): street, postal code, city

### StepAgentProfile

Collects agent personal profile:
- Jouw naam (your name) - required
- Functietitel (job title)
- Telefoonnummer (phone)
- Bio (about text)
- Specialisaties (specializations) - multi-select PropertyType
- Werkgebied (regions) - multi-select Dutch provinces

### StepFirstProperty

Choice screen:
- "Voeg nu je eerste pand toe" - primary CTA button
- "Ik doe dit later" - skip link

### StepComplete

Success confirmation:
- Confetti celebration animation
- Summary of created agency and profile
- "Ga naar je dashboard" CTA
- Links to help and next steps

## Usage

```tsx
import {
  StepAgencyInfo,
  StepAgentProfile,
  StepFirstProperty,
  StepComplete,
  type AgencyInfoData,
  type AgentProfileData,
} from "@/components/onboarding/agent-steps";

// In your onboarding flow:
const [agencyData, setAgencyData] = useState<AgencyInfoData>({
  name: "",
  kvkNumber: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  postalCode: "",
});

// Step 1
<StepAgencyInfo
  data={agencyData}
  onUpdate={(partial) => setAgencyData(prev => ({ ...prev, ...partial }))}
/>

// Step 2
<StepAgentProfile
  data={profileData}
  onUpdate={(partial) => setProfileData(prev => ({ ...prev, ...partial }))}
/>

// Step 3
<StepFirstProperty
  onAddProperty={() => router.push("/dashboard/panden/nieuw")}
  onSkip={() => setCurrentStep(4)}
/>

// Step 4
<StepComplete
  agencyName={agencyData.name}
  agentName={profileData.fullName}
/>
```

## Types

See `types.ts` for:
- `AgencyInfoData` - Agency form data interface
- `AgentProfileData` - Agent profile form data interface
- `PropertyType` - Horeca property type enum
- `Region` - Dutch province type
- Validation helper functions

# Seeker Onboarding Steps

Reusable step components for the horeca business seeker onboarding flow.

## Components

| Component | Description |
|-----------|-------------|
| `StepBusinessType` | Radio group for selecting business type (restaurant, café, bar, hotel, dark kitchen, other) with optional concept description |
| `StepBudget` | Min/max budget inputs with euro formatting and dual-thumb slider |
| `StepPreferences` | Multi-select for Dutch cities and checkboxes for must-have features |
| `StepComplete` | Success message with confetti animation and dashboard navigation |

## Usage

All step components (except `StepComplete`) follow a controlled component pattern with `data` and `onUpdate` props:

```tsx
import {
  StepBusinessType,
  StepBudget,
  StepPreferences,
  StepComplete,
  type SeekerOnboardingData,
} from "@/components/onboarding/seeker-steps";

function SeekerOnboardingFlow() {
  const [data, setData] = useState<SeekerOnboardingData>({
    businessType: { businessType: null, conceptDescription: "" },
    budget: { minBudget: null, maxBudget: null },
    preferences: { cities: [], features: [] },
  });

  return (
    <div>
      {currentStep === 1 && (
        <StepBusinessType
          data={data.businessType}
          onUpdate={(businessType) => setData({ ...data, businessType })}
        />
      )}
      {currentStep === 2 && (
        <StepBudget
          data={data.budget}
          onUpdate={(budget) => setData({ ...data, budget })}
        />
      )}
      {currentStep === 3 && (
        <StepPreferences
          data={data.preferences}
          onUpdate={(preferences) => setData({ ...data, preferences })}
        />
      )}
      {currentStep === 4 && <StepComplete />}
    </div>
  );
}
```

## Types

### BusinessTypeData

```ts
interface BusinessTypeData {
  businessType: BusinessType | null;
  conceptDescription: string;
}
```

### BudgetData

```ts
interface BudgetData {
  minBudget: number | null;
  maxBudget: number | null;
}
```

### PreferencesData

```ts
interface PreferencesData {
  cities: City[];
  features: Feature[];
}
```

## Constants

- `BUSINESS_TYPES` - Available business type options
- `DUTCH_CITIES` - Available Dutch cities with popularity flags
- `MUST_HAVE_FEATURES` - Available feature checkboxes
- `BUDGET_CONFIG` - Min/max/step values for budget slider

## Utilities

- `formatEuro(amount)` - Format number as Dutch euro currency
- `parseEuro(string)` - Parse euro string back to number

## Design

- Uses shadcn/ui components (RadioGroup, Checkbox, Slider, Input)
- Theme tokens from CSS variables (no hardcoded colors)
- Accessible with proper ARIA labels and keyboard navigation
- Responsive grid layouts
- Confetti animation via `canvas-confetti`

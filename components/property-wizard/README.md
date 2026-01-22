# PropertyWizard Component

A multi-step modal wizard for creating horecavastgoed (hospitality real estate) listings.

## Usage

```tsx
import { PropertyWizard } from "@/components/property-wizard";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async (data: PropertyWizardData, isDraft: boolean) => {
    // Handle property creation
    console.log("Creating property:", data, isDraft ? "(draft)" : "(published)");
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Nieuw Pand</Button>
      <PropertyWizard
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
```

## Steps

1. **BasicInfo** - Title, property type, descriptions
2. **Location** - Address, city, postal code, province, optional coordinates
3. **Pricing** - Price type (rent/sale/both), price fields, service costs, deposit
4. **Dimensions** - Total surface (required), optional breakdowns, floors, ceiling height
5. **Features** - Grouped checkboxes for licenses, facilities, utilities
6. **Photos** - Drag-drop upload, set primary photo, AI enhancement checkbox
7. **Review** - Summary of all data with edit links, publish or save as draft

## Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls dialog visibility |
| `onClose` | `() => void` | Called when dialog should close |
| `onCreate` | `(data: PropertyWizardData, isDraft: boolean) => Promise<void>` | Called on publish/save |
| `initialData` | `Partial<PropertyWizardData>` | Optional pre-filled data |

## Features

- Responsive design (mobile stepper + desktop sidebar)
- Step validation with error messages
- Progress tracking with completed steps
- Photo drag-and-drop with reordering
- AI enhancement checkbox for photos
- Dutch language interface
- Keyboard accessible

## File Structure

```
property-wizard/
├── PropertyWizard.tsx    # Main wizard component
├── WizardStepper.tsx     # Step navigation components
├── types.ts              # TypeScript types and constants
├── index.ts              # Public exports
├── README.md             # This file
└── steps/
    ├── StepBasicInfo.tsx
    ├── StepLocation.tsx
    ├── StepPricing.tsx
    ├── StepDimensions.tsx
    ├── StepFeatures.tsx
    ├── StepPhotos.tsx
    ├── StepReview.tsx
    └── index.ts
```

# PropertyWizard Component

A multi-step modal wizard for creating and editing property listings on the Horecagrond platform.

## Features

- 7-step wizard flow: Basic Info → Location → Pricing → Dimensions → Features → Photos → Review
- Vertical stepper navigation (desktop) with mobile-friendly horizontal progress dots
- Form validation with step completion tracking
- Drag-and-drop photo upload with AI enhancement option
- Save as draft or publish functionality
- Mobile responsive design

## Usage

```tsx
import { PropertyWizard } from "@/components/property-wizard";

function PropertyListingPage() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async (data: PropertyWizardData, publish: boolean) => {
    // Call your API to create the property
    await createProperty(data, publish);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Property</Button>

      {isOpen && (
        <PropertyWizard
          open={isOpen}
          onClose={() => setIsOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | No (default: true) | Whether the wizard dialog is open |
| `onClose` | `() => void` | Yes | Called when the wizard is closed |
| `onCreate` | `(data: PropertyWizardData, publish: boolean) => Promise<void>` | Yes | Called when saving/publishing |
| `initialData` | `Partial<PropertyWizardData>` | No | Initial data for editing |

## Steps

1. **BasicInfo**: Title, property type selection, description
2. **Location**: Address with city autocomplete, postal code, optional GPS coordinates
3. **Pricing**: Price type selection (rent/sale/both), conditional price fields
4. **Dimensions**: Total surface (required), room breakdown, floors, ceiling height
5. **Features**: Grouped checkboxes for licenses, facilities, and utilities
6. **Photos**: Drag-drop upload zone, preview grid, primary selection, AI enhance toggle
7. **Review**: Summary of all data with edit links, validation status, publish/draft buttons

## Types

See `types.ts` for all TypeScript definitions including:
- `PropertyWizardData` - Main data structure
- `PropertyType`, `PriceType`, `FeatureCategory` - Enum types
- `FEATURE_DEFINITIONS` - Available features configuration
- `WIZARD_STEPS` - Step definitions

## Customization

The component uses shadcn/ui components and follows the project's design system. Colors and styling can be customized via CSS variables defined in `globals.css`.

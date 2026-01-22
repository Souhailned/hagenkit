# Property Components

Components for displaying and interacting with horeca properties.

## Components

### PropertyCard

Display a property in a card format for listings and grids.

```tsx
import { PropertyCard } from "@/components/property/property-card";

<PropertyCard property={property} priority={false} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `property` | `Property` | required | The property data to display |
| `priority` | `boolean` | `false` | Whether to prioritize image loading (for above-fold content) |
| `className` | `string` | - | Additional CSS classes |

## Types

Properties use types from `@/types/agency`:

- `Property` - Full property data
- `PropertyType` - Property category (RESTAURANT, CAFE, etc.)
- `PropertyStatus` - Listing status
- `PriceType` - RENT, SALE, or RENT_OR_SALE

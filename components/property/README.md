# Property Components

This directory contains components for displaying and filtering property listings on the public search page (`/aanbod`).

## Components

### `PropertyCard`
Displays a single property listing card with image, price, title, location, and key features.

**Props:**
- `property: PropertySearchResult` - The property data to display
- `priority?: boolean` - Whether to priority load the image
- `className?: string` - Additional CSS classes

### `PropertyFilters`
Sidebar filter component with sections for location, type, price, surface area, and features.

**Props:**
- `filters: PropertyFilter` - Current active filters
- `onFilterChange: (filters: PropertyFilter) => void` - Callback when filters change
- `availableCities?: string[]` - List of available cities
- `className?: string` - Additional CSS classes

### `ActiveFilters`
Displays active filter chips with remove buttons.

**Props:**
- `filters: PropertyFilter` - Current active filters
- `onFilterChange: (filters: PropertyFilter) => void` - Callback when a filter is removed
- `className?: string` - Additional CSS classes

### `MobileFiltersSheet`
Mobile-friendly filter drawer using shadcn/ui Sheet component.

**Props:**
- `filters: PropertyFilter` - Current active filters
- `onFilterChange: (filters: PropertyFilter) => void` - Callback when filters are applied
- `activeFilterCount: number` - Number of active filters (for badge)
- `availableCities?: string[]` - List of available cities

### `PropertyEmptyState`
Empty state component shown when no properties match the search criteria.

**Props:**
- `hasFilters?: boolean` - Whether any filters are active
- `searchQuery?: string` - Current search query
- `onClearFilters?: () => void` - Callback to clear all filters
- `onCreateAlert?: () => void` - Callback to create a search alert
- `className?: string` - Additional CSS classes

### `PropertyListingsClient`
Main client component that orchestrates the listings page with URL params sync, sorting, pagination, and filter management.

**Props:**
- `initialData: SearchPropertiesResult` - SSR-loaded initial data
- `availableCities?: string[]` - List of available cities for filters

### Skeleton Components

- `PropertyCardSkeleton` - Loading skeleton for a single card
- `PropertyGridSkeleton` - Loading skeleton for the property grid
- `PropertyFilterSkeleton` - Loading skeleton for the filters sidebar
- `PropertyListingsSkeleton` - Full page loading skeleton

## Usage

```tsx
import { PropertyListingsClient } from "@/components/property";
import { searchProperties } from "@/app/actions/property-search";

// In a server component
const result = await searchProperties({ page: 1, limit: 12 });

return <PropertyListingsClient initialData={result.data} />;
```

## URL Parameters

The listings page supports shareable URLs with filter state:

| Parameter | Type | Description |
|-----------|------|-------------|
| `cities` | string | Comma-separated city names |
| `types` | string | Comma-separated PropertyType values |
| `priceMin` | number | Minimum price in cents |
| `priceMax` | number | Maximum price in cents |
| `surfaceMin` | number | Minimum surface in m² |
| `surfaceMax` | number | Maximum surface in m² |
| `terrace` | "1" | Has terrace filter |
| `kitchen` | "1" | Has kitchen filter |
| `parking` | "1" | Has parking filter |
| `features` | string | Comma-separated feature keys |
| `sortBy` | SortBy | Sort field |
| `sortOrder` | "asc"\|"desc" | Sort direction |
| `page` | number | Current page |

Example URL:
```
/aanbod?cities=Amsterdam,Rotterdam&types=RESTAURANT,CAFE&priceMax=500000&terrace=1
```

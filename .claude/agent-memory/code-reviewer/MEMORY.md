# Code Reviewer Memory

## Project-Specific Patterns

### Map Integration (Property Map)
- Map components are dynamically imported with `ssr: false` to avoid SSR issues
- Map markers use non-null assertions (`!`) for lat/lng after filtering - acceptable pattern
- All map-related components are client components (`"use client"`)
- Loading states should show spinner with proper accessibility labels

### Type Safety Patterns
- `Property` interface is the superset in `types/property.ts`
- Price fields are stored in cents (number | null)
- Coordinates: `latitude` and `longitude` as `number | null`
- Always filter for non-null coordinates before rendering markers
- Use `formatPrice()` helper from `types/property.ts` for price display

### Accessibility Requirements
- Interactive controls need ARIA labels in Dutch
- Map regions need `role="region"` with `aria-label`
- Toggle buttons should use `role="radio"` with `aria-checked`
- Hide text on mobile with `sm:inline` pattern

### React Best Practices (Next.js 16 + React 19)
- Use `useMemo` for expensive filters/transforms
- Wrap filter handlers with `useCallback` when deps are stable
- Dynamic imports for heavy components (maps, charts)
- Use CSS variables for theme colors (never hardcode)

## Common Issues Found

### Missing Accessibility
- Buttons need `aria-label` when text is hidden on mobile
- Interactive regions need ARIA roles
- Focus management for keyboard navigation

### Type Safety Gaps
- Non-null assertions are OK after explicit null checks/filters
- Avoid casting with `as` - use type guards instead

### Performance Concerns
- N+1 queries in property listings (watch for missing includes)
- Unnecessary re-renders when filter state changes
- Missing React.memo for expensive child components

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

## Buurt Analysis Architecture (lib/buurt/)
- `analyze.ts` is the orchestrator: Promise.allSettled for 5 providers, graceful degradation
- OSM is always the base; Google/CBS/BAG/Transport are enhancement layers
- `bruisIndex` is calculated ONLY from OSM data (buurt-intelligence.ts `analyzeBuurt()`); it is NOT recalculated after merging Google competitors — this is a known design limitation
- `stats.horecaCount` = OSM `concurrenten.length + complementair.length` (NOT the merged competitor list length) — these counts diverge when Google is available
- `dataQuality` thresholds: "volledig" >= 4 sources (max 5), "gedeeltelijk" >= 2, "basis" otherwise. OSM is always counted — minimum is always "basis"
- `fetchedAt` is set at the END of the full analysis, not per-provider. If result comes from cache, `fetchedAt` reflects when the cache was originally populated (correct)
- The quality scorer `isDataFresh()` checks `fetchedAt < 24h` — consistent with "full-analysis" cache TTL of 24h
- Dedup in `mergeCompetitors()`: uses `afstand` difference < 50m AND first-word name substring match — both conditions must be true (AND, not OR). This is fragile: name mismatches bypass geo check
- No global timeout on the full `analyzeLocation()` call — only individual providers have AbortSignal timeouts
- CBS sentiment values (-99995 etc.) are handled with `toNum()` guard in cbs.ts

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

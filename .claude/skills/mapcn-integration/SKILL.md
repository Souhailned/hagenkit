---
name: mapcn-integration
description: MapCN (MapLibre + shadcn/ui) integration guide for Horecagrond property map views.
---

# MapCN Integration

## What is MapCN?
- shadcn/ui-compatible map components powered by MapLibre GL
- Single file: `components/ui/map.tsx` (~1200 lines)
- Theme-aware (auto light/dark), zero config
- MIT licensed, 5.7k GitHub stars

## Components Available
| Component | Purpose |
|-----------|---------|
| `Map` | Main map container with viewport control |
| `MapMarker` | Position markers on coordinates |
| `MarkerContent` | Custom marker UI (React nodes) |
| `MarkerPopup` | Click popup on markers |
| `MarkerTooltip` | Hover tooltip on markers |
| `MarkerLabel` | Text label above/below markers |
| `MapControls` | Zoom, compass, locate, fullscreen |
| `MapPopup` | Standalone popup at coordinates |
| `MapRoute` | Draw route lines between points |

## Installation
```bash
# Via shadcn registry (preferred)
bunx shadcn@latest add https://mapcn.vercel.app/r/map.json

# Or manual: copy src/registry/map.tsx → components/ui/map.tsx
# + install dependency
bun add maplibre-gl
```

## Required CSS
Add to globals or tailwind layer:
```css
@layer base {
  .maplibregl-popup-content {
    @apply bg-transparent! shadow-none! p-0! rounded-none!;
  }
  .maplibregl-popup-tip {
    @apply hidden!;
  }
}
```

## Tile Provider
Default: CARTO basemaps (commercial use needs license).
Alternative: OpenStreetMap tiles (free):
```tsx
<Map
  styles={{
    light: "https://tiles.openfreemap.org/styles/liberty",
    dark: "https://tiles.openfreemap.org/styles/dark",
  }}
/>
```

## Usage Pattern for Horecagrond
```tsx
import { Map, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip, MapControls } from "@/components/ui/map"

// Property map with markers
<Map
  center={[5.12, 52.09]} // Netherlands center
  zoom={7}
  className="h-[600px] rounded-xl"
>
  <MapControls showZoom showLocate position="bottom-right" />
  
  {properties.map((p) => (
    <MapMarker key={p.id} longitude={p.longitude} latitude={p.latitude}>
      <MarkerContent>
        <PropertyMapPin type={p.propertyType} price={p.price} />
      </MarkerContent>
      <MarkerTooltip>{p.title}</MarkerTooltip>
      <MarkerPopup closeButton>
        <PropertyMapCard property={p} />
      </MarkerPopup>
    </MapMarker>
  ))}
</Map>
```

## Database Requirements
Property model needs lat/lng:
```prisma
model Property {
  latitude   Float?
  longitude  Float?
}
```
Seed data needs real Dutch coordinates for each property.

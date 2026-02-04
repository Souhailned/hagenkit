# Styling Guidelines

## Theme System

This project uses the **Stone/Mira** theme with OKLCH color space.

## CSS Variables (Never Hardcode Colors)

### Backgrounds
- `--background` - Main background
- `--muted` - Muted/secondary background
- `--card` - Card backgrounds
- `--popover` - Popover/dropdown backgrounds

### Foregrounds
- `--foreground` - Primary text
- `--muted-foreground` - Secondary/muted text
- `--card-foreground` - Card text

### Interactive
- `--primary` - Primary actions
- `--secondary` - Secondary actions
- `--accent` - Accent/highlight
- `--destructive` - Destructive actions

### Borders & Rings
- `--border` - Default borders
- `--ring` - Focus rings
- `--input` - Input borders

## Layout Variables

```css
--sidebar-width: calc(var(--spacing) * 64);
--header-height: calc(var(--spacing) * 14);
--content-padding: calc(var(--spacing) * 4);
--content-margin: calc(var(--spacing) * 1.5);
--content-full-height: calc(100vh - var(--header-height) - ...);
```

## Usage Examples

### ✅ Correct
```tsx
<div className="bg-background text-foreground" />
<div className="bg-muted/50" />
<div className="border-border" />
<div className="min-h-[var(--content-full-height)]" />
```

### ❌ Incorrect
```tsx
<div className="bg-white text-black" />
<div className="bg-[#f5f5f5]" />
<div className="border-gray-200" />
<div className="min-h-[500px]" />
```

## Shadcn Components

All shadcn/ui components automatically follow the theme. When adding new components:

```bash
npx shadcn@latest add [component-name]
```

The `components.json` config ensures:
- `style: "base-mira"`
- `baseColor: "stone"`
- Components use theme tokens

## Responsive Design

Use container queries with `@container/main`:
```tsx
<div className="@container/main">
  <div className="@lg:grid-cols-2 @xl:grid-cols-3">
    {/* Responsive grid based on container width */}
  </div>
</div>
```

## Spacing Scale

Tailwind v4 spacing uses `--spacing` variable. Common values:
- `p-4` = `calc(var(--spacing) * 4)` = 1rem
- `gap-6` = `calc(var(--spacing) * 6)` = 1.5rem
- `space-y-4` = vertical spacing between children

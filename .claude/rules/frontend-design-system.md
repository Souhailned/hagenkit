---
paths: ["app/**/*.tsx", "components/**/*.tsx", "app/globals.css"]
---

# Frontend Design System

This project uses a design system based on the v0-project-workspace reference design.

## Theme Configuration

### Color Scheme (Blue Primary)
The primary color is blue (`oklch(0.43 0.215 254.5)`), NOT black/neutral.

**Key CSS Variables (Light Mode):**
```css
--primary: oklch(0.43 0.215 254.5);        /* Blue */
--ring: oklch(0.43 0.215 254.5);           /* Blue focus rings */
--sidebar-primary: oklch(0.43 0.215 254.5); /* Blue active nav */
--border: oklch(0.91 0 0);                 /* Subtle borders */
--radius: 0.75rem;                         /* Rounded corners */
```

**Dark Mode:**
```css
--primary: oklch(0.56 0.19 254.5);         /* Lighter blue */
--primary-foreground: oklch(0.205 0 0);    /* Dark text on blue */
```

### Font Configuration
- Uses system fonts via Tailwind's `font-sans`
- Geist fonts imported but NOT applied (consistent with reference)
- Root font-size explicitly set to `16px` for rem consistency

```tsx
// layout.tsx - fonts imported but unused (underscore prefix)
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Body uses system fonts
<body className="font-sans antialiased">
```

## Dashboard Layout Architecture

### Simplified Structure
The dashboard layout is minimal - NO extra wrappers:

```tsx
// app/dashboard/layout.tsx
<SidebarProvider>
  <AppSidebar user={user} />
  <SidebarInset>
    {children}  {/* Direct children, no wrappers */}
  </SidebarInset>
</SidebarProvider>
```

**What was REMOVED:**
- ❌ `SiteHeader` component (header is now INSIDE ContentCard)
- ❌ `bg-muted/50` background wrapper
- ❌ Extra `<main>` and `<div>` wrappers
- ❌ `PageContainer` component

### ContentCard Pattern
All dashboard pages use `ContentCard` with header INSIDE the card:

```tsx
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export default function DashboardPage() {
  return (
    <ContentCard>
      <ContentCardHeader
        title="Page Title"
        actions={<Button>Action</Button>}
      />
      <ContentCardBody className="p-4">
        {/* Page content */}
      </ContentCardBody>
    </ContentCard>
  );
}
```

**ContentCard Styling:**
```tsx
// Outer card
"flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden"

// Header includes SidebarTrigger
<SidebarTrigger /> + title + actions
```

## Sidebar Navigation

### Hybrid Navigation Pattern
New design labels pointing to existing routes:

| Sidebar Label | Route | Description |
|---------------|-------|-------------|
| Inbox | `/dashboard` | Dashboard overview |
| My task | `/dashboard/lifecycle` | Lifecycle page |
| Projects | `/dashboard/projects` | Projects page |
| Clients | `/dashboard/team` | Team page |
| Performance | `/dashboard/analytics` | Analytics page |
| Images | `/dashboard/images` | Images page |

### Sidebar Sizing
- Width: `16rem` (256px)
- Nav button height: `h-9`
- Padding: `p-2` on SidebarGroup, `p-4` on SidebarHeader
- Icons: `h-[18px] w-[18px]`

## Anti-Patterns to Avoid

❌ **Don't use PageContainer** - Use ContentCard instead
❌ **Don't add wrapper divs** - Keep layout minimal
❌ **Don't hardcode colors** - Use CSS variables
❌ **Don't use custom fonts** - Stick to font-sans
❌ **Don't add SiteHeader** - Header is inside ContentCard

## File Structure Reference

```
app/
├── globals.css          # Theme variables, base styles
├── layout.tsx           # Root layout (fonts, providers)
└── dashboard/
    ├── layout.tsx       # Sidebar + SidebarInset only
    └── [page]/page.tsx  # Uses ContentCard pattern

components/
├── app-sidebar.tsx      # Main sidebar with navigation
├── dashboard/
│   ├── content-card.tsx # ContentCard, Header, Body
│   └── ...
└── ui/
    └── sidebar.tsx      # Shadcn sidebar primitives
```

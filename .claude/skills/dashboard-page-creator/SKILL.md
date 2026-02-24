---
name: dashboard-page-creator
description: Create or update dashboard pages following the Horecagrond design system. Use when creating dashboard pages, implementing new dashboard features, adding pages under app/dashboard/ or app/(admin)/, building list/table/detail views, or when the user asks to "create a page", "add a page", "make a dashboard page", or wants to standardize existing pages. Design source of truth is docs/design.json.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Dashboard Page Creator Skill

Design source of truth: **`docs/design.json`** — lees dit bestand voor exacte tokens en klassen.

---

## 1. Twee Page Patronen

Er zijn **twee** soorten dashboard pagina's. Kies het juiste patroon.

### Patroon A — ContentCard (admin, data, settings)
Gebruik voor: admin pages, data tables, settings, formulieren, detail views die NIET de projects/tasks UX hoeven te volgen.

```tsx
import {
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
} from "@/components/dashboard/content-card";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export default async function FeaturePage() {
  return (
    <ContentCard>
      <ContentCardHeader
        title="Feature Name"
        actions={
          <Button size="sm" variant="ghost">
            <Plus className="h-4 w-4 mr-1.5" weight="bold" />
            Add Item
          </Button>
        }
      />
      <ContentCardBody className="p-4">
        {/* content */}
      </ContentCardBody>
    </ContentCard>
  );
}
```

### Patroon B — Page Shell (productivity: lijsten, taken, projecten)
Gebruik voor: lijstpagina's met filters + view toggle, taken, projecten — de stijl van `/dashboard/projects` en `/dashboard/tasks`.

```tsx
"use client"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export function FeatureContent() {
  return (
    <div className="flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden">
      {/* Header — altijd twee rijen */}
      <header className="flex flex-col border-b border-border/40">
        {/* Rij 1: navigatie + titel + primaire actie */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground" />
            <p className="text-base font-medium text-foreground">Page Title</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4 mr-1.5" weight="bold" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Rij 2: filters + view opties */}
        <div className="flex items-center justify-between px-4 pb-3 pt-3">
          <div className="flex items-center gap-2">
            {/* FilterPopover + ChipOverflow */}
          </div>
          <div className="flex items-center gap-2">
            {/* ViewOptionsPopover */}
          </div>
        </div>
      </header>

      {/* Content scroll area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {/* items */}
      </div>
    </div>
  );
}
```

---

## 2. Kleur Tokens (nooit hardcoded)

```tsx
// ✅ Altijd CSS variabelen
bg-background          // pagina achtergrond
bg-muted               // sectie/group achtergrond
bg-card                // kaart achtergrond
text-foreground        // primaire tekst
text-muted-foreground  // secundaire/meta tekst
border-border          // standaard border
text-primary           // blauwe accent (oklch(0.43 0.215 254.5))

// ❌ Nooit
bg-white    bg-gray-50    text-black    #3b82f6    oklch(...)
```

### Semantische kleuren
```tsx
// Status
"text-emerald-500"  // DONE
"text-amber-500"    // IN_PROGRESS
"text-muted-foreground"  // TODO

// Status badges
"bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"  // done
"bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-50"           // in progress
"bg-muted text-muted-foreground"                                                  // todo

// Checkbox (altijd teal bij done)
"data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"

// Destructive
"text-destructive"    // rood
```

---

## 3. Icons

**Gebruik altijd Phosphor Icons** (SSR variant), niet Lucide.

```tsx
import { Plus, FolderSimple, CalendarBlank, Trash, PencilSimple, DotsThree } from "@phosphor-icons/react/dist/ssr";

// Maten
<Icon className="h-3 w-3" />   // chip/meta (12px)
<Icon className="h-4 w-4" />   // standaard UI (16px) ← meest gebruikt
<Icon className="h-5 w-5" />   // section header (20px)
<Icon className="h-6 w-6" />   // empty state (24px)

// Weights
weight="regular"   // default (weglaten = regular)
weight="bold"      // actie-icons (Plus, Folder in acties)
weight="duotone"   // decoratief (SquareHalf toggle)
```

### Veelgebruikte icons per context
| Context | Icon |
|---------|------|
| Toevoegen | `Plus` weight="bold" |
| Bewerken | `PencilSimple` |
| Verwijderen | `Trash` |
| Overflow menu | `DotsThree` (board) / `DotsThreeVertical` (rij) |
| Project/folder | `FolderSimple` / `Folder` |
| Datum | `CalendarBlank` |
| Prioriteit | `ChartBar` / `Flag` |
| Filter | `Funnel` |
| Instellingen | `Gear` |
| Gebruikers | `Users` / `User` |
| Notitie | `Note` |
| Bestand | `File` |

**Uitzondering:** `SidebarTrigger` gebruikt intern lucide — dat is OK.

---

## 4. Typografie

```tsx
// Paginatitel (header rij 1)
<p className="text-base font-medium text-foreground">Pagina</p>

// Sectietitel
<h3 className="text-sm font-semibold text-foreground">Sectie</h3>

// Kaarttitel
<p className="text-[15px] font-semibold text-foreground leading-6">Naam</p>

// Body tekst
<span className="text-sm text-foreground">...</span>

// Meta/secundair
<span className="text-xs text-muted-foreground">...</span>

// Meta bold (counts, labels)
<span className="text-xs font-medium text-muted-foreground">3/7</span>

// Chip/badge
<span className="text-[11px] font-medium">...</span>

// Avatar fallback
<AvatarFallback className="text-[10px]">AB</AvatarFallback>
```

---

## 5. Component Patronen

### Kaart (project/item card)
```tsx
<div className="rounded-2xl border border-border bg-background hover:shadow-lg/5 transition-shadow cursor-pointer">
  <div className="p-4">
    {/* content */}
  </div>
</div>
```

### Group/sectie kaart (geneste cards)
```tsx
// Outer: muted achtergrond, workstream shadow
<section className="rounded-3xl border border-border bg-muted shadow-[var(--shadow-workstream)] p-3 space-y-2">

  {/* Header van de groep */}
  <header className="flex items-center justify-between gap-4 px-0 py-1">
    {/* Icon box */}
    <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
      <FolderSimple className="h-5 w-5" weight="regular" />
    </div>
    {/* ... titel, meta, acties */}
  </header>

  {/* Inner: witte kaart met de rijen */}
  <div className="space-y-1 px-2 py-3 bg-background rounded-2xl border border-border">
    {/* item rows */}
  </div>
</section>
```

### Taak/item rij (list view)
```tsx
<div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/60 group">
  {/* Checkbox — altijd rounded-full */}
  <Checkbox
    className="rounded-full border-border bg-background data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 hover:cursor-pointer"
  />

  {/* Naam */}
  <span className={cn("flex-1 truncate", isDone && "line-through text-muted-foreground")}>
    {name}
  </span>

  {/* Meta rechts — verbergen op mobile */}
  <div className="flex items-center gap-3 text-xs shrink-0 ml-2">
    <span className="text-muted-foreground hidden sm:inline">{date}</span>
    {/* priority pill */}
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground hidden sm:inline">
      {priority}
    </span>
    {/* avatar */}
    <Avatar className="size-6" />
    {/* hover-reveal menu */}
    <Button variant="ghost" size="icon"
      className="size-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
      <DotsThreeVertical className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### Avatar
```tsx
// Standaard maten
<Avatar className="size-6">   {/* 24px — in rijen */}
<Avatar className="size-8">   {/* 32px — in activity feed */}

<AvatarImage src={image} alt={name} />
<AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
```

### Status badge (pill)
```tsx
// Inline pill stijl
<div className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
  <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
  Active
</div>

// Badge component
<Badge variant="secondary" className="text-[11px] border-none bg-emerald-100 text-emerald-600">
  Done
</Badge>
```

### Hover-reveal acties
```tsx
// Parent heeft className="group"
<div className="... group">
  {/* Zichtbaar bij hover */}
  <Button
    variant="ghost" size="icon"
    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
  >
    <Trash className="h-4 w-4" />
  </Button>
</div>
```

### Inline toevoegen (ghost input — GEEN shadcn Input)
```tsx
// Ziet eruit als een extra bullet in de lijst
{adding ? (
  <li className="flex items-start gap-2 text-sm">
    <span className="mt-0.5 shrink-0 text-muted-foreground/40">•</span>
    <input
      autoFocus
      placeholder="Type and press Enter…"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleAdd();
        if (e.key === "Escape") cancel();
      }}
      onBlur={() => { if (!content.trim()) cancel(); }}
      className="flex-1 min-w-0 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 text-sm"
    />
    {content.trim() && (
      <button onClick={handleAdd} className="text-xs font-medium text-primary hover:text-primary/70 mt-0.5">
        Save
      </button>
    )}
  </li>
) : (
  <button
    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
    onClick={() => setAdding(true)}
  >
    <Plus className="h-3 w-3" />
    Add item
  </button>
)}
```

### Lege staat
```tsx
// ContentCard pagina
<div className="flex h-60 flex-col items-center justify-center text-center">
  <div className="p-3 bg-muted rounded-md mb-4">
    <FolderSimple className="h-6 w-6 text-foreground" weight="regular" />
  </div>
  <h3 className="mb-2 text-lg font-semibold text-foreground">Geen items</h3>
  <p className="mb-6 text-sm text-muted-foreground">Beschrijving van de lege staat</p>
  <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm hover:bg-accent transition-colors">
    <Plus className="mr-2 inline h-4 w-4" />
    Eerste item aanmaken
  </button>
</div>
```

### Dropdown menu (drie puntjes)
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DotsThree, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity">
      <DotsThree className="h-4 w-4" weight="bold" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={onEdit}>
      <PencilSimple className="h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem variant="destructive" onClick={onDelete}>
      <Trash className="h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Skeleton (laadstaat)
```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Grid van kaarten
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {Array.from({ length: 8 }).map((_, i) => (
    <Skeleton key={i} className="h-40 rounded-2xl" />
  ))}
</div>

// Lijst van rijen
<div className="space-y-3">
  <Skeleton className="h-5 w-48" />  {/* sectie header */}
  <Skeleton className="h-10 w-full" />
  <Skeleton className="h-10 w-full" />
</div>
```

---

## 6. Borders & Radius

```tsx
// Page wrapper
rounded-lg border border-border

// Kaart
rounded-2xl border border-border

// Sectie/groep container
rounded-3xl border border-border

// Button/small element
rounded-md

// Pill/chip/checkbox/avatar
rounded-full

// Icon box
rounded-xl
```

---

## 7. Knoppen

```tsx
// Primaire actie in header (voeg toe)
<Button size="sm" variant="ghost">
  <Plus className="h-4 w-4 mr-1.5" weight="bold" />
  Add Item
</Button>

// Icon button in header
<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
  <LinkIcon className="h-4 w-4" />
</Button>

// Inline add button (in rij, hover-reveal)
<Button variant="ghost" size="icon" className="size-7 rounded-full">
  <Plus className="h-4 w-4" />
</Button>
```

---

## 8. Bestandsstructuur

```
app/
  dashboard/
    [feature]/
      page.tsx          # Server component (async)
      loading.tsx       # Skeleton fallback
components/
  dashboard/
    [feature]-content.tsx    # Client component ("use client")
    [feature]-card.tsx       # Herbruikbare kaart
  [feature]/
    [feature]-row.tsx        # Rij component
    [feature]-section.tsx    # Groep/sectie component
app/
  actions/
    [feature].ts        # Server actions ("use server")
```

---

## 9. Server Action Patroon

```typescript
"use server";

import type { ActionResult } from "@/types/actions";

export async function getItems(): Promise<ActionResult<Item[]>> {
  try {
    // auth check
    // data fetch
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: "Failed to load items" };
  }
}
```

---

## 10. Checklist na aanmaken

### ContentCard pagina (Patroon A)
- [ ] `ContentCard` is de root wrapper
- [ ] `ContentCardHeader` met `title` prop
- [ ] `ContentCardBody` bevat alle content
- [ ] Geen PageContainer (deprecated)

### Page Shell pagina (Patroon B)
- [ ] Wrapper: `flex flex-1 flex-col bg-background mx-2 my-2 border border-border rounded-lg min-w-0 overflow-hidden`
- [ ] Twee-rijen header: rij 1 (SidebarTrigger + titel + acties) + rij 2 (filters + view opties)
- [ ] SidebarTrigger: `h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground`
- [ ] Scroll area: `flex-1 min-h-0 overflow-y-auto px-4 py-4`

### Beide patronen
- [ ] Phosphor icons (niet Lucide) via `@phosphor-icons/react/dist/ssr`
- [ ] Geen hardcoded kleuren — altijd CSS tokens
- [ ] Checkbox op tasks = `rounded-full` + teal-600 bij checked
- [ ] Hover-reveal acties via `opacity-0 group-hover:opacity-100 transition-opacity`
- [ ] Drie-puntjes menu: `DotsThree` (board cards) / `DotsThreeVertical` (lijst rijen)
- [ ] Inline add = ghost input, GEEN shadcn `<Input>` + `<Button>` combinatie
- [ ] Lege staat heeft icon in `p-3 bg-muted rounded-md` box
- [ ] Skeleton gebruikt `rounded-2xl` voor kaart-placeholders
- [ ] Toast: `toast.success()` / `toast.error()` via sonner
- [ ] Semantische kleuren: emerald=done, amber=in-progress, teal=checkbox-done

---

## 11. Anti-Patronen

| ❌ Niet | ✅ In plaats daarvan |
|---------|---------------------|
| `bg-white` / `bg-gray-50` | `bg-background` / `bg-muted` |
| `text-black` / `text-gray-500` | `text-foreground` / `text-muted-foreground` |
| Hardcoded hex `#3b82f6` | `text-primary` |
| `import { Trash } from "lucide-react"` | `import { Trash } from "@phosphor-icons/react/dist/ssr"` |
| `<input className="border rounded px-3 py-2">` voor inline add | Ghost input met `bg-transparent border-none outline-none` |
| `<div className="container mx-auto">` | Page wrapper patroon |
| PageContainer component | ContentCard (Patroon A) of Page Shell (Patroon B) |
| `<h1>` voor paginatitel | `<p className="text-base font-medium">` in header |
| Checkbox `rounded-md` op taken | Checkbox `rounded-full` |
| `shadcn <Input>` + `<Button>` voor lijstitem toevoegen | Ghost inline input patroon |

---

## 12. Design.json Referentie

Volledig design token bestand: **`docs/design.json`**

Bevat:
- Alle OKLCH kleurwaarden (light + dark)
- Exacte Tailwind classes per component
- Gedetailleerde patronen met code
- Do/Don't lijst
- Alle gebruikte icons per pagina

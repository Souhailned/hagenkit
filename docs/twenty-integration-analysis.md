# Twenty CRM Integration Analysis for Horecagrond

## Executive Summary

This document analyzes the [twentyhq/twenty](https://github.com/twentyhq/twenty) CRM codebase and the [Jason-uxui/twenty](https://github.com/Jason-uxui/twenty) fork to identify editable table cell patterns and other features we can integrate into Horecagrond's existing shadcn + @tanstack/react-table setup.

---

## 1. Twenty's Editable Table Architecture

### 1.1 Overall Architecture

Twenty uses a **custom-built record table** (NOT @tanstack/react-table). Their table system is spread across several modules:

```
packages/twenty-front/src/modules/object-record/
├── record-table/           # Table grid layout, rows, columns
│   └── record-table-cell/  # Individual cell logic (35+ components!)
├── record-inline-cell/     # Inline cell editing system
├── record-field/            # Field type system (display + input)
│   └── ui/
│       ├── components/      # FieldDisplay, FieldInput, FieldContextProvider
│       ├── hooks/           # usePersistField, useInitDraftValue, etc.
│       ├── form-types/      # Input components per field type
│       └── meta-types/      # Type guard functions
├── record-board/           # Kanban board view
├── record-filter/          # Advanced filtering
├── record-sort/            # Sorting system
└── record-store/           # Recoil-based state management
```

### 1.2 State Management

Twenty uses **Recoil** for all table state:
- Cell focus position (which cell is active)
- Edit mode state (which cell is being edited)
- Draft values (temporary edit values before persistence)
- Row selection state
- Scroll position for focus tracking

### 1.3 Cell Editing Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks cell                                      │
│    ↓                                                     │
│ 2. useOpenRecordTableCell fires                          │
│    - Disables click-outside listener                     │
│    - Records edit position in Recoil state               │
│    - Deactivates row focus                               │
│    - Activates cell focus                                │
│    ↓                                                     │
│ 3. useInitDraftValue initializes draft                   │
│    - Reads current value from record store               │
│    - computeDraftValueFromFieldValue() converts to draft  │
│    - Stores in recordFieldInputDraftValueComponentState   │
│    ↓                                                     │
│ 4. RecordTableCellEditMode renders                       │
│    - Uses @floating-ui/react for positioning              │
│    - Portal overlay positioned relative to cell           │
│    - Renders FieldInput based on field type               │
│    ↓                                                     │
│ 5. User edits value                                      │
│    ↓                                                     │
│ 6. Event triggers save (Enter/Tab/ClickOutside)          │
│    - usePersistField validates and persists               │
│    - Optimistic update to Recoil store                   │
│    - GraphQL mutation to server                          │
│    - Close edit mode                                     │
│    ↓                                                     │
│ 7. Focus moves to next cell (Tab) or stays (Enter)       │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Field Type System

Twenty has 21+ field types, each with a paired Display/Input component:

| Field Type | Display Component | Input Component |
|-----------|------------------|----------------|
| Text | TextFieldDisplay | TextFieldInput |
| Number | NumberFieldDisplay | NumberFieldInput |
| Currency | CurrencyFieldDisplay | CurrencyFieldInput |
| DateTime | DateTimeFieldDisplay | DateTimeFieldInput |
| Date | DateFieldDisplay | DateFieldInput |
| Boolean | BooleanFieldDisplay | BooleanFieldInput |
| Select | SelectFieldDisplay | SelectFieldInput |
| MultiSelect | MultiSelectFieldDisplay | MultiSelectFieldInput |
| Rating | RatingFieldDisplay | RatingFieldInput |
| Links | LinksFieldDisplay | LinksFieldInput |
| Emails | EmailsFieldDisplay | EmailsFieldInput |
| Phones | PhonesFieldDisplay | PhonesFieldInput |
| FullName | FullNameFieldDisplay | FullNameFieldInput |
| Address | AddressFieldDisplay | AddressFieldInput |
| Currency | CurrencyFieldDisplay | CurrencyFieldInput |
| RichText | RichTextFieldDisplay | RichTextFieldInput |
| JSON | JsonFieldDisplay | RawJsonFieldInput |
| Array | ArrayFieldDisplay | ArrayFieldInput |
| Files | FilesFieldDisplay | FilesFieldInput |
| Relation | RelationToOneFieldDisplay | RelationManyToOneFieldInput |
| UUID | UuidFieldDisplay | (read-only) |

The routing uses **type guard functions**:
```typescript
if (isFieldText(fieldDefinition) && isFieldTextValue(value)) {
  return <TextFieldInput />;
}
if (isFieldNumber(fieldDefinition) && isFieldNumberValue(value)) {
  return <NumberFieldInput />;
}
// ... 20+ more type guards
```

### 1.5 Keyboard Navigation

- **Arrow keys**: Navigate between cells (up/down/left/right)
- **Enter**: Open cell for editing
- **Tab/Shift+Tab**: Move to next/previous cell, persist current value
- **Escape**: Cancel editing, discard changes
- **Click outside**: Persist and close

### 1.6 Cell Edit Mode Positioning

Uses `@floating-ui/react` for edit overlay positioning:
```typescript
const { refs, floatingStyles } = useFloating({
  placement: 'bottom-start',
  middleware: [
    flip(),           // Flip if no space below
    offset({ mainAxis: -33, crossAxis: -3 }),
    setFieldInputLayoutDirectionMiddleware,
  ],
  whileElementsMounted: autoUpdate,
});
```

---

## 2. Jason-uxui/twenty Fork Analysis

The fork at `Jason-uxui/twenty` is an **unmodified mirror** (0 commits ahead, 177 behind upstream). **No unique value.**

### 2.1 Bonus Discovery: Jason-uxui/project-dashboard (951 stars)

The same user has a **highly relevant** project management dashboard at `Jason-uxui/project-dashboard` using **Next.js + shadcn/ui + Tailwind** (same stack as us):

**Useful Patterns to Adopt:**

| Pattern | Description | Our Use Case |
|---------|-------------|-------------|
| **View Switching** | List/Board/Timeline toggle with shared filter state | Projects + Leads pages |
| **Custom Gantt/Timeline** | Draggable bars using Pointer Events API (no library) | Project timeline view |
| **Kanban Board** | Native drag events between status columns with context menu | Lead pipeline, project phases |
| **Quick Create Modal** | Cmd+Enter shortcut for rapid item creation | New lead/property quick-add |
| **Filter Chips + URL Sync** | Active filters shown as dismissible chips synced to URL | Enhance our existing filters |
| **ViewOptionsPopover** | Column toggle, sorting, grouping in one popover | Table view customization |

**NOT useful for editable tables** - project-dashboard uses modal-based editing only, no inline cell editing.

**Conclusion**: Use `twentyhq/twenty` for editable table patterns, `project-dashboard` for view switching and timeline/kanban UI patterns.

---

## 3. Our Current Table Setup (Horecagrond) — Detailed Audit

### 3.1 Stack
- **`@tanstack/react-table` v8.21.3** (latest v8)
- URL state management via **`nuqs`** (query string parsers)
- shadcn table primitives (`components/ui/table.tsx`)

### 3.2 Component Architecture

```
components/data-table/
├── data-table.tsx                   # Main renderer (flexRender headers/rows + pagination)
├── data-table-column-header.tsx     # Sort dropdown (Asc/Desc/Reset/Hide)
├── data-table-toolbar.tsx           # Auto-generated filters per column type
├── data-table-advanced-toolbar.tsx  # Minimal wrapper for advanced layouts
├── data-table-filter-list.tsx       # Notion-style filter builder (Where/And/Or + drag-reorder)
├── data-table-sort-list.tsx         # Multi-column sort with drag-reorder
├── data-table-pagination.tsx        # Page size + navigation
├── data-table-view-options.tsx      # Column visibility toggle (searchable command palette)
├── data-table-action-bar.tsx        # Floating bulk action bar (Framer Motion animated)
├── data-table-skeleton.tsx          # Loading state skeleton
├── data-table-faceted-filter.tsx    # Multi/single select with checkboxes
├── data-table-date-filter.tsx       # Date/range with calendar picker
├── data-table-slider-filter.tsx     # Range slider with min/max
└── data-table-range-filter.tsx      # Numeric range input

Supporting infrastructure:
├── hooks/use-data-table.ts          # Central hook: creates table instance, syncs ALL state
│                                      (pagination, sorting, filters, visibility, selection)
│                                      with URL query params via nuqs
├── lib/data-table.ts                # Column pinning styles, filter operator helpers
├── lib/parsers.ts                   # Zod-based query string parsers
├── config/data-table.ts             # Filter operators (text/numeric/date/select/boolean)
└── types/data-table.ts              # ColumnMeta augmentation (label, variant, options, range, unit, icon)
                                       + TableMeta augmentation (queryKeys)
```

### 3.3 Pages Using Tables

| Page | DataTable Type | Data Pattern |
|------|---------------|-------------|
| Admin Workspaces | Full DataTable + `useDataTable` | Server action → props → URL-synced |
| Admin Impersonate | Full DataTable + `useDataTable` | Server action → props → URL-synced |
| Admin Agencies | Full DataTable + `useDataTable` | Server action → props → URL-synced |
| Admin Users | Raw `<table>` (no TanStack) | Direct Prisma, no sorting/filtering |
| Settings Members | Manual `<Table>` (no TanStack) | Has inline `<Select>` for role editing |
| Panden | Card grid (no table) | — |
| Leads | Custom component (no table) | — |

### 3.4 Current Cell Rendering Patterns

All cells **read-only display** using:
- **Avatar + Text**: User/workspace names
- **Badge**: Role, status, plan, verified state
- **Icon + Text**: Phone, member count
- **Formatted Date**: `date-fns` format/formatDistanceToNow
- **Actions Menu**: DropdownMenu with edit/delete/impersonate
- **Plain Text**: Counts, slugs

### 3.5 Current Editing: Dialog-Based Only

| Pattern | Where Used |
|---------|-----------|
| **Dialog editing** | UserEditDialog, WorkspaceEditDialog (from row action dropdown) |
| **Direct action** | `updateAgencyVerified`, `updateAgencyPlan` (from dropdown) |
| **Inline Select** | MembersDataTable role change (ONLY inline edit example, manual `<Table>`) |

### 3.6 Key Integration Points

1. **`data-table.tsx:66-75`** — `flexRender` cell loop needs editable cell wrapper support
2. **`useDataTable` hook** — needs new state for active editing cell + pending mutations
3. **`types/data-table.ts`** — `ColumnMeta` needs `editable`, `editComponent`, `onCellUpdate`
4. **Column definitions** — each cell renderer needs display/edit mode switching
5. **`components/ui/table.tsx:81-92`** — `TableCell` may need click handlers + focus management

### 3.7 Gaps vs Twenty

| Feature | Horecagrond | Twenty |
|---------|-------------|--------|
| Inline cell editing | None (dialog-based only) | Full inline editing |
| Cell type system | Display-only renderers | Rich editable cell types |
| Click-to-edit | None | Click activates editor |
| Keyboard navigation | Tab through filters only | Full cell-to-cell keyboard nav |
| Optimistic updates | None | Yes (Recoil store) |
| Column reordering | Visibility toggle only | Drag column reorder |
| Bulk operations | Selection + action bar (exists) | Selection + bulk actions |

**Good news**: The existing infrastructure is **well-structured and extensible**. The `ColumnMeta` type augmentation and `useDataTable` hook pattern provide clean integration points without requiring a full rewrite.

---

## 4. Integration Strategy: Editable Cells for shadcn + TanStack Table

### 4.1 Approach: Lightweight Adaptation (NOT a full port)

Twenty's system is massive (35+ components per cell) because it's a full CRM with a custom table. We should take the **core patterns** and adapt them to work with our existing `@tanstack/react-table` + shadcn setup.

### 4.2 Core Components to Build

```
components/
├── data-table/
│   ├── data-table.tsx                    # Enhanced with edit support
│   ├── data-table-editable-cell.tsx      # NEW: Editable cell wrapper
│   ├── data-table-cell-input.tsx         # NEW: Field type input router
│   ├── data-table-cell-display.tsx       # NEW: Field type display router
│   └── hooks/
│       ├── use-editable-table.ts         # NEW: Table edit state management
│       ├── use-cell-editing.ts           # NEW: Cell edit mode hook
│       ├── use-cell-navigation.ts        # NEW: Arrow key navigation
│       └── use-cell-persistence.ts       # NEW: Save changes hook
```

### 4.3 Implementation Plan

#### Phase 1: Editable Cell Infrastructure (Core)

**Step 1: Create `useEditableTable` hook**

Manages which cell is being edited, using TanStack Table's meta:

```typescript
// hooks/use-editable-table.ts
import { useState, useCallback } from 'react';

interface EditingCell {
  rowId: string;
  columnId: string;
  initialValue: unknown;
}

export function useEditableTable() {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [draftValue, setDraftValue] = useState<unknown>(null);

  const openCell = useCallback((rowId: string, columnId: string, value: unknown) => {
    setEditingCell({ rowId, columnId, initialValue: value });
    setDraftValue(value);
  }, []);

  const closeCell = useCallback(() => {
    setEditingCell(null);
    setDraftValue(null);
  }, []);

  return {
    editingCell,
    draftValue,
    setDraftValue,
    openCell,
    closeCell,
    isEditing: (rowId: string, columnId: string) =>
      editingCell?.rowId === rowId && editingCell?.columnId === columnId,
  };
}
```

**Step 2: Create `EditableCell` wrapper component**

Wraps each cell to toggle between display and edit modes:

```typescript
// data-table-editable-cell.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface EditableCellProps<TValue> {
  value: TValue;
  rowId: string;
  columnId: string;
  fieldType: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'currency';
  onSave: (rowId: string, columnId: string, value: TValue) => Promise<void>;
  isEditable?: boolean;
  selectOptions?: { label: string; value: string }[];
  displayComponent?: React.ReactNode;
}

export function EditableCell<TValue>({
  value,
  rowId,
  columnId,
  fieldType,
  onSave,
  isEditable = true,
  selectOptions,
  displayComponent,
}: EditableCellProps<TValue>) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState<TValue>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    if (!isEditable) return;
    setDraftValue(value);
    setIsEditing(true);
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isEditable, value]);

  const save = useCallback(async () => {
    if (draftValue !== value) {
      await onSave(rowId, columnId, draftValue);
    }
    setIsEditing(false);
  }, [draftValue, value, onSave, rowId, columnId]);

  const cancel = useCallback(() => {
    setDraftValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    if (e.key === 'Tab') { save(); } // Let tab propagate
  }, [save, cancel]);

  if (!isEditing) {
    return (
      <div
        className={cn(
          "cursor-pointer rounded px-1 -mx-1 min-h-[28px] flex items-center",
          isEditable && "hover:bg-muted/50 hover:ring-1 hover:ring-border"
        )}
        onClick={startEditing}
      >
        {displayComponent ?? String(value ?? '')}
      </div>
    );
  }

  // Render input based on fieldType
  return (
    <CellInput
      ref={inputRef}
      fieldType={fieldType}
      value={draftValue}
      onChange={setDraftValue}
      onKeyDown={handleKeyDown}
      onBlur={save}
      selectOptions={selectOptions}
    />
  );
}
```

**Step 3: Create `CellInput` component**

Routes to the correct input based on field type (inspired by Twenty's FieldInput):

```typescript
// data-table-cell-input.tsx
'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CellInputProps {
  fieldType: 'text' | 'number' | 'select' | 'date' | 'boolean' | 'currency';
  value: unknown;
  onChange: (value: unknown) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  selectOptions?: { label: string; value: string }[];
}

export const CellInput = forwardRef<HTMLInputElement, CellInputProps>(
  ({ fieldType, value, onChange, onKeyDown, onBlur, selectOptions }, ref) => {
    const baseClass = "h-8 text-sm border-primary/50 focus-visible:ring-primary/20";

    switch (fieldType) {
      case 'text':
        return (
          <Input
            ref={ref}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className={cn(baseClass, "w-full")}
            autoFocus
          />
        );
      case 'number':
        return (
          <Input
            ref={ref}
            type="number"
            value={String(value ?? '')}
            onChange={(e) => onChange(Number(e.target.value))}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className={cn(baseClass, "w-24")}
            autoFocus
          />
        );
      case 'currency':
        return (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">€</span>
            <Input
              ref={ref}
              type="number"
              step="0.01"
              value={String(value ?? '')}
              onChange={(e) => onChange(Number(e.target.value))}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              className={cn(baseClass, "w-28")}
              autoFocus
            />
          </div>
        );
      case 'select':
        return (
          <Select
            value={String(value ?? '')}
            onValueChange={(v) => { onChange(v); onBlur(); }}
          >
            <SelectTrigger className={cn(baseClass, "w-full")} autoFocus>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectOptions?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <Checkbox
            checked={Boolean(value)}
            onCheckedChange={(checked) => { onChange(checked); onBlur(); }}
            className="mx-auto"
          />
        );
      case 'date':
        return (
          <Input
            ref={ref}
            type="date"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className={cn(baseClass, "w-36")}
            autoFocus
          />
        );
      default:
        return null;
    }
  }
);
CellInput.displayName = 'CellInput';
```

**Step 4: Integrate with TanStack Table column definitions**

```typescript
// Example: leads columns with editable cells
import { EditableCell } from '@/components/data-table/data-table-editable-cell';

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Naam',
    cell: ({ row }) => (
      <EditableCell
        value={row.original.name}
        rowId={row.original.id}
        columnId="name"
        fieldType="text"
        onSave={async (rowId, colId, value) => {
          await updateLead(rowId, { [colId]: value });
        }}
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <EditableCell
        value={row.original.status}
        rowId={row.original.id}
        columnId="status"
        fieldType="select"
        selectOptions={[
          { label: 'Nieuw', value: 'NEW' },
          { label: 'Actief', value: 'ACTIVE' },
          { label: 'Gesloten', value: 'CLOSED' },
        ]}
        onSave={async (rowId, colId, value) => {
          await updateLead(rowId, { [colId]: value });
        }}
      />
    ),
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ row }) => (
      <EditableCell
        value={row.original.budget}
        rowId={row.original.id}
        columnId="budget"
        fieldType="currency"
        onSave={async (rowId, colId, value) => {
          await updateLead(rowId, { [colId]: value });
        }}
        displayComponent={
          <span>€ {row.original.budget?.toLocaleString('nl-NL')}</span>
        }
      />
    ),
  },
];
```

**Step 5: Server action for persistence**

```typescript
// app/actions/inline-update.ts
'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function updateLeadField(
  leadId: string,
  field: string,
  value: unknown
): Promise<ActionResult> {
  const session = await requireAuth();

  // Validate field is editable
  const editableFields = ['name', 'email', 'phone', 'status', 'budget', 'notes'];
  if (!editableFields.includes(field)) {
    return { success: false, error: 'Field not editable' };
  }

  await prisma.lead.update({
    where: { id: leadId, workspaceId: session.activeWorkspaceId },
    data: { [field]: value },
  });

  return { success: true };
}
```

#### Phase 2: Keyboard Navigation (Enhanced UX)

Add arrow key cell navigation (inspired by Twenty's `useRecordTableCellFocusHotkeys`):

```typescript
// hooks/use-cell-navigation.ts
'use client';

import { useState, useCallback, useEffect } from 'react';

interface CellPosition {
  row: number;
  column: number;
}

export function useCellNavigation(rowCount: number, columnCount: number) {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setFocusedCell((current) => {
      if (!current) return { row: 0, column: 0 };
      switch (direction) {
        case 'up': return { ...current, row: Math.max(0, current.row - 1) };
        case 'down': return { ...current, row: Math.min(rowCount - 1, current.row + 1) };
        case 'left': return { ...current, column: Math.max(0, current.column - 1) };
        case 'right': return { ...current, column: Math.min(columnCount - 1, current.column + 1) };
      }
    });
  }, [rowCount, columnCount]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!focusedCell) return;
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); moveFocus('up'); break;
        case 'ArrowDown': e.preventDefault(); moveFocus('down'); break;
        case 'ArrowLeft': e.preventDefault(); moveFocus('left'); break;
        case 'ArrowRight': e.preventDefault(); moveFocus('right'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [focusedCell, moveFocus]);

  return { focusedCell, setFocusedCell, moveFocus };
}
```

#### Phase 3: Additional Twenty Features Worth Integrating

### 4.4 Other Integrable Features

| Feature | Twenty Module | Difficulty | Priority | Value for Horecagrond |
|---------|--------------|------------|----------|----------------------|
| **Kanban Board View** | `record-board/` | Medium | HIGH | Project management, lead pipeline |
| **Advanced Filters** | `record-filter/` | Medium | HIGH | Already partially done, can enhance |
| **Saved Views** | `record-index/` | Medium | MEDIUM | Save filter/sort presets per user |
| **Column Reordering** | `record-field/` | Low | LOW | Already possible via TanStack |
| **Column Resizing** | Built into table | Low | MEDIUM | Improve table UX |
| **Row Selection + Bulk Actions** | `record-table/` | Low | HIGH | Already have action bar |
| **Drag & Drop Rows** | `record-drag/` | Medium | LOW | Reorder priority |
| **Record Cards** | `record-card/` | Low | MEDIUM | Alternative list view |
| **Aggregate Footer** | `record-aggregate/` | Medium | MEDIUM | Sum/avg/count per column |

### Kanban Board Pattern (from `record-board/`)

Twenty's kanban uses:
- `RecordBoardColumns` - Column layout (one per status)
- `RecordBoardDragDropContext` - @hello-pangea/dnd for drag
- Status-grouped records with lazy loading per column

We can adapt this for:
- **Lead pipeline**: New → Contact → Viewing → Negotiation → Closed
- **Project phases**: Planning → Active → Review → Completed

### Saved Views Pattern

Twenty stores filter/sort presets as "views" per user:
```
View {
  name: string
  filters: Filter[]
  sorts: Sort[]
  visibleColumns: string[]
}
```

We can implement this with a `DashboardView` Prisma model.

---

## 5. Comparison: Twenty vs Our Approach

| Aspect | Twenty | Our Approach |
|--------|--------|-------------|
| Table library | Custom-built | @tanstack/react-table |
| State management | Recoil (15+ atoms per cell) | React useState/useReducer |
| Edit positioning | @floating-ui/react portal | Inline within cell |
| Field types | 21+ with type guards | 6 core types to start |
| Persistence | GraphQL mutations | Server Actions |
| Keyboard nav | Full spreadsheet-like | Phase 2 enhancement |
| Complexity | ~35 components per cell | ~3-4 components per cell |
| CSS | styled-components | Tailwind + shadcn |

---

## 6. Recommended Roadmap

### Sprint 1 (Week 1-2): Editable Cell Core
- [ ] Build `EditableCell` component with display/edit toggle
- [ ] Build `CellInput` with text, number, select, boolean, currency, date types
- [ ] Build `useEditableTable` hook for state management
- [ ] Create server actions for field-level updates (leads, properties)
- [ ] Add to leads table as first integration point

### Sprint 2 (Week 3-4): Polish + Navigation
- [ ] Add keyboard navigation (arrow keys, Tab, Enter, Escape)
- [ ] Add optimistic updates with revalidation
- [ ] Add cell focus visual indicators
- [ ] Add loading/saving states per cell
- [ ] Add error handling with toast notifications

### Sprint 3 (Week 5-6): Kanban Board
- [ ] Build `KanbanBoard` component using @hello-pangea/dnd
- [ ] Add to projects page (board view toggle)
- [ ] Add to leads page (pipeline view)

### Sprint 4 (Week 7-8): Advanced Features
- [ ] Saved views (filter/sort presets per user)
- [ ] Column resizing
- [ ] Aggregate footer (sum, count, average)
- [ ] Bulk edit from selection

---

## 7. Key Takeaways from Twenty

1. **Type guard pattern** for field routing is elegant - adopt it
2. **Draft value concept** (edit without immediately persisting) - adopt it
3. **Portal-based edit overlay** is overkill for us - use inline inputs instead
4. **Recoil atoms per cell** is too complex - React state is sufficient for our scale
5. **Keyboard navigation** is a major UX win - implement in Phase 2
6. **FieldContext pattern** (wrapping each cell with context) - useful for complex cells
7. **Optimistic updates** before server response - critical for good UX

---

## 8. Files to Create (Implementation Checklist)

```
components/data-table/
├── data-table-editable-cell.tsx     # EditableCell component
├── data-table-cell-input.tsx        # CellInput type router
├── hooks/
│   ├── use-editable-table.ts        # Edit state management
│   ├── use-cell-navigation.ts       # Keyboard navigation
│   └── use-cell-persistence.ts      # Optimistic update + server action
app/actions/
├── inline-update.ts                 # Generic field update action

# Phase 3
components/dashboard/
├── kanban-board.tsx                  # Kanban board component
├── kanban-column.tsx                 # Single kanban column
├── kanban-card.tsx                   # Draggable card
```

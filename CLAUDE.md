# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
bun dev              # Start dev server with Turbopack
bun run build        # Production build with Turbopack
bun run lint         # Run ESLint
bun run email        # Launch React Email preview server

# Database
bun run prisma:generate  # Generate Prisma client (outputs to generated/prisma/)
bun run prisma:push      # Push schema changes to database
bun run prisma:migrate   # Create and apply migrations

# Trigger.dev
bun run trigger          # Start Trigger.dev dev server
bun run trigger:deploy   # Deploy to Trigger.dev
```

## Architecture Overview

### App Router Segmentation
- `app/(marketing)/` - Public landing pages, blog, help center, team page
- `app/(auth)/` - Sign-in, sign-up, password reset flows
- `app/(admin)/admin/` - Admin panel (users, workspaces, impersonation)
- `app/(onboarding)/` - Post-signup onboarding flow
- `app/dashboard/` - Authenticated product surface with settings, team, analytics

### Server Actions Pattern
Business logic lives in `app/actions/` with typed inputs and consistent `ActionResult<T>` return type:
```typescript
type ActionResult<T = void> = { success: boolean; data?: T; error?: string }
```
Actions use Zod schemas from `lib/validations/` for input validation.

### Authentication (Better Auth)
- Server: `lib/auth.ts` - Better Auth config with Prisma adapter, Google OAuth, admin plugin
- Client: `lib/auth-client.ts` - React hooks (`useSession`, `signIn`, `signOut`)
- First user automatically gets `admin` role via database hook
- Workspace roles: `OWNER | ADMIN | MEMBER | VIEWER`
- User roles: `user | admin` (app-wide permissions)

### Database (Prisma + PostgreSQL)
- Schema: `prisma/schema.prisma`
- Generated client: `generated/prisma/` (import from `@/generated/prisma/client`)
- Uses `@prisma/adapter-pg` for direct TCP connections
- Singleton pattern in `lib/prisma.ts`

### Multi-Tenancy Model
- Users belong to Workspaces via `WorkspaceMember` junction table
- Session tracks `activeWorkspaceId` for workspace context
- Invitations expire and track acceptance state
- Admin users can impersonate other users

### Content Collections
MDX content in `content/` with `content-collections.ts` config:
- `content/blog/` - Blog posts with categories, reading time, TOC
- `content/help/` - Help articles with categories
- `content/authors/`, `content/team/` - Author/team member profiles
- `content/legal/`, `content/customers/`, `content/integrations/`

Generated types available via `content-collections` import alias.

### UI System
- Shadcn UI components in `components/ui/`
- Data tables with `@tanstack/react-table` in `components/data-table/`
- Marketing layout helpers in `components/marketing/`
- Dashboard components in `components/dashboard/`
- Admin components in `components/admin/`

### Email System
- Templates in `emails/templates/` using React Email
- Shared layout in `emails/templates/components/email-layout.tsx`
- Sent via Resend (or logged to console in dev without API key)
- Branding config in `lib/config.ts` under `siteConfig.email`

### Path Aliases
```typescript
@/*              -> ./*
content-collections -> .content-collections/generated
```

## Key Configuration Files

- `lib/config.ts` - Site metadata, SEO, email branding (siteConfig)
- `content-collections.ts` - MDX collection schemas and transforms
- `components.json` - Shadcn UI configuration

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Auth callback URL
- `NEXT_PUBLIC_APP_URL` - Public app URL

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `RESEND_API_KEY` - Email delivery (logs to console if missing in dev)

---

## Dashboard Design System

### Theme (Blue Primary)
The design uses a **blue primary color** theme customized in `app/globals.css`.

**Configuration:**
- `components.json`: `baseColor: "neutral"` (shadcn default base)
- `app/globals.css`: **Source of truth** - customized with blue primary

**Key Colors (from CSS):**
- Primary: `oklch(0.43 0.215 254.5)` (blue)
- Active nav items: Blue background
- Focus rings: Blue
- Borders: `oklch(0.91 0 0)`

> **Note:** When adding new shadcn components, they use the neutral base but inherit the blue primary from CSS variables.

### Font Configuration
- System fonts via `font-sans` (NOT custom Geist)
- Root font-size: `16px` (explicit)
- Geist fonts imported but unused (for consistency)

### Dashboard Layout Structure
The layout is **minimal** - NO extra wrappers:

```tsx
// app/dashboard/layout.tsx
<SidebarProvider>
  <AppSidebar user={user} />
  <SidebarInset>
    {children}  {/* Direct - no wrappers */}
  </SidebarInset>
</SidebarProvider>
```

### ContentCard Pattern (Required)
All dashboard pages MUST use ContentCard with header INSIDE:

```tsx
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/dashboard/content-card";

export default function FeaturePage() {
  return (
    <ContentCard>
      <ContentCardHeader
        title="Page Title"
        actions={<Button>Action</Button>}
      />
      <ContentCardBody className="p-4">
        {/* Content */}
      </ContentCardBody>
    </ContentCard>
  );
}
```

### ContentCard Components
| Component | Purpose |
|-----------|---------|
| `ContentCard` | Card wrapper with border, margin, rounded corners |
| `ContentCardHeader` | Title bar with SidebarTrigger + optional actions |
| `ContentCardBody` | Scrollable content area |

### Sidebar Navigation (Hybrid)
New design labels → existing routes:

| Label | Route |
|-------|-------|
| Inbox | `/dashboard` |
| My task | `/dashboard/lifecycle` |
| Projects | `/dashboard/projects` |
| Clients | `/dashboard/team` |
| Performance | `/dashboard/analytics` |
| Images | `/dashboard/images` |

### Empty States
- Dashboard: `DashboardProEmptyState` from `@/components/dashboard/empty-state-pro`
- Admin: `AdminEmptyState` from `@/components/admin/empty-state`

### Anti-Patterns
❌ Don't use `PageContainer` - Use `ContentCard` instead
❌ Don't add wrapper divs in layout
❌ Don't use `SiteHeader` - Header is inside ContentCard
❌ Don't hardcode colors - Use CSS variables
❌ Don't apply custom fonts to body

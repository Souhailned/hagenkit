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

---

## Skill Auto-Activation (VERPLICHT)

**Bij ELKE opdracht (toevoegen, aanpassen, verwijderen, bouwen, debuggen) MOET Claude EERST de relevante skill(s) activeren via de Skill tool voordat er code wordt geschreven.**

### Mapping: opdracht → skill

| Opdracht gaat over... | Activeer skill |
|------------------------|----------------|
| UI componenten, styling, layout | `shadcn-ui` + `frontend-design` |
| Dashboard pagina's maken/aanpassen | `dashboard-page-creator` |
| UI review, accessibility, UX audit | `web-design-guidelines` |
| React performance, rendering | `react-best-practices` |
| Next.js routing, SSR, app router | `nextjs16-skills` |
| Project structuur, folders | `nextjs-saas-structure` |
| Authenticatie, sessies, rollen | `better-auth-best-practices` |
| API endpoints, server actions | `backend-development:api-design-principles` |
| Architectuur, refactoring | `backend-development:architecture-patterns` |
| Prisma schema, database changes | `prisma-orm-v7-skills` |
| Data fetching, caching, queries | `tanstack-query` |
| Email templates, Resend | `resend-integration-skills` |
| AI features, SDK integratie | `ai-sdk-6-skills` |
| Workflows, background jobs | `backend-development:workflow-orchestration-patterns` |

### Regels
1. **Altijd activeren VOOR implementatie** — de skill geeft context en best practices
2. **Meerdere skills combineren** als de opdracht meerdere domeinen raakt (bijv. nieuwe dashboard pagina = `dashboard-page-creator` + `shadcn-ui`)
3. **Bij twijfel: activeer** — liever een skill te veel dan te weinig
4. **Planning skill** — bij complexe taken met >5 stappen, activeer ook `planning-with-files`

---

## Future AI Features Roadmap

Gebaseerd op de AI-first horeca makelaardij strategie (zie `docs/Makelaardij software AI.pdf`).

### Phase 1 - Core Platform (HIGH priority)
- **Public Marketplace** (`/aanbod`): Upgrade naar interactieve marktplaats met smart search
- **Semantic Search**: Vector DB integratie (Upstash/Pinecone) voor natural language property search
- **Location Intelligence Widget**: Per-property data (voetgangersstroom, demografie, concurrentie)

### Phase 2 - AI Generation (MEDIUM priority)
- **Virtual Staging ("Droom" Slider)**: AI-gegenereerde interieur concepten via fal.ai (infra klaar)
- **One-Click Listing Generator**: Auto-genereer listings voor 3 doelgroepen + SWOT + social posts
- **Automated Valuation Model (AVM)**: Goodwill/inventaris pricing model op historische data
- **AI Pre-qualification Chatbot**: 24/7 lead kwalificatie op publieke site

### Phase 3 - Advanced (LOW priority)
- **Deal Room**: NDA-gated document room met AI Q&A chatbot
- **Matching Engine**: Actief user profiling + proactieve push notificaties
- **AI Document Analysis**: OCR + LLM contract risico scanning
- **Financial Health Check**: AI analyse van jaarcijfers voor trend detectie

### Technical Stack voor AI Features
- Text & Analysis: OpenAI API via Trigger.dev background tasks
- Image Generation: fal.ai (al geintegreerd)
- Vector Search: Upstash Vector DB
- Embeddings: PostgreSQL met pgvector of Upstash

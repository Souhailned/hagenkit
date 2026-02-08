---
name: horecagrond-conventions
description: Project conventions and architecture for Horecagrond. Loaded automatically for context.
user-invocable: false
---

# Horecagrond Conventions

## Tech Stack
- **Framework**: Next.js 16.1.4 + React 19.1
- **Runtime**: Bun (not npm/pnpm!)
- **Database**: PostgreSQL + Prisma 5.22
- **Auth**: Better Auth (Google OAuth, workspace roles)
- **Background Jobs**: Trigger.dev 4.x
- **Image AI**: fal.ai
- **Storage**: Supabase
- **Email**: Resend + React Email
- **UI**: Shadcn UI + Radix + Tailwind 4

## File Structure
```
app/
├── (auth)/           # Auth routes
├── (dashboard)/      # Protected dashboard
├── actions/          # Server actions
└── api/              # API routes

components/
├── ui/               # Shadcn components
├── dashboard/        # Dashboard-specific
├── property/         # Property components
└── property-wizard/  # Multi-step wizard

lib/
├── prisma.ts         # Prisma client
├── auth.ts           # Better Auth setup
├── supabase.ts       # Storage client
└── validations/      # Zod schemas

trigger/              # Trigger.dev jobs
```

## Naming Conventions
- **Components**: PascalCase (`PropertyCard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Server Actions**: camelCase, verb-first (`createProperty.ts`)
- **API Routes**: lowercase (`/api/properties/route.ts`)

## Commands
```bash
bun run dev          # Development server
bun run build        # Production build
bun run lint         # ESLint check
bun run prisma:generate  # Generate Prisma client
bun run trigger:dev  # Start Trigger.dev
```

## Important Notes
1. **Always use Bun** - Never npm or pnpm
2. **Build after changes** - `bun run build` to verify
3. **Type safety** - Use explicit types, avoid `any`
4. **Server actions** - Prefer over API routes
5. **Zod validation** - All user input must be validated
